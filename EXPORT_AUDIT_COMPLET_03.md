> 📚 **Document d'export en 3 parties.** Vous lisez la partie **3/3**.
>
> Fichiers : `EXPORT_AUDIT_COMPLET_01.md`, `EXPORT_AUDIT_COMPLET_02.md`, `EXPORT_AUDIT_COMPLET_03.md`

# EXPORT AUDIT COMPLET — Suite

_Suite de la PARTIE 3 — code source intégral._

### FICHIER : src/pages/Organigramme.tsx

```tsx
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Pencil, Download } from 'lucide-react';
import { EquipeMembre, FONCTIONS_COMPTABLES, TACHES_COMPTABLES } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';
import { CONTROLES_ORGANIGRAMME } from '@/lib/regulatory-data';
import { ModulePageLayout, ComplianceCheck, ModuleSection } from '@/components/ModulePageLayout';
import { DoctrineEPLE } from '@/components/DoctrineEPLE';
import { useAgents, useGroupements, getRoleLabel } from '@/hooks/useGroupements';
import { AgentSelect } from '@/components/AgentSelect';
import { toast } from '@/hooks/use-toast';

// Mapping rôle agent → fonction comptable de l'organigramme + tâches Op@le typiques
const ROLE_TO_FONCTION: Record<string, { fonction: string; taches: string[] }> = {
  agent_comptable:        { fonction: 'Agent Comptable',          taches: ['Tenue comptabilité générale', 'Visa des paiements', 'Rapprochement bancaire', 'Compte financier'] },
  fonde_pouvoir:          { fonction: 'Fondé de pouvoir',         taches: ['Visa des paiements', 'Suppléance AC'] },
  ordonnateur:            { fonction: 'Ordonnateur',              taches: ['Engagement', 'Liquidation', 'Émission OR/DP'] },
  ordonnateur_suppleant:  { fonction: 'Ordonnateur suppléant',    taches: ['Engagement (suppléance)', 'Liquidation (suppléance)'] },
  secretaire_general:     { fonction: 'Adjoint gestionnaire',     taches: ['Préparation budget', 'Engagement', 'Liquidation', 'Suivi marchés'] },
  assistant_gestion:      { fonction: 'Assistant de gestion',     taches: ['Saisie engagements', 'Suivi factures'] },
  regisseur_recettes:     { fonction: 'Régisseur de recettes',    taches: ['Encaissement', 'Tenue caisse régie', 'Reversement AC'] },
  regisseur_avances:      { fonction: 'Régisseur d\'avances',     taches: ['Décaissement avances', 'Justification mensuelle'] },
  suppleant_regisseur:    { fonction: 'Suppléant régisseur',      taches: ['Suppléance régisseur'] },
  magasinier:             { fonction: 'Magasinier',               taches: ['Entrées/sorties stocks', 'Inventaire'] },
  chef_cuisine:           { fonction: 'Chef de cuisine',          taches: ['Commandes denrées', 'Sortie stock', 'Contrôle grammage'] },
  secretaire_intendance:  { fonction: 'Secrétaire d\'intendance', taches: ['Appui administratif', 'Saisie OR'] },
  gestionnaire_materiel:  { fonction: 'Gestionnaire matériel',    taches: ['Inventaire immobilisations'] },
  responsable_cfa_greta:  { fonction: 'Responsable CFA / GRETA',  taches: ['Suivi BA', 'Conventions formation'] },
  correspondant_cicf:     { fonction: 'Correspondant CICF',       taches: ['Cartographie risques', 'Suivi plan d\'action'] },
  archiviste_comptable:   { fonction: 'Archiviste comptable',     taches: ['Archivage pièces', 'Conservation 10 ans'] },
};

export default function OrganigrammePage() {
  const [items, setItems] = useState<EquipeMembre[]>(() => loadState('organigramme', []));
  const [regChecks, setRegChecks] = useState<Record<string, boolean>>(() => loadState('organigramme_checks', {}));
  const toggleRegCheck = (id: string) => { const u = { ...regChecks, [id]: !regChecks[id] }; setRegChecks(u); saveState('organigramme_checks', u); };
  const [form, setForm] = useState<any>(null);
  const save = (d: EquipeMembre[]) => { setItems(d); saveState('organigramme', d); };

  const { activeId } = useGroupements();
  const { agents } = useAgents(activeId);

  // Importe les agents Paramètres → organigramme (sans doublon de nom)
  const importerDepuisParametres = () => {
    if (agents.length === 0) {
      toast({ title: 'Aucun agent à importer', description: 'Ajoutez des agents dans Paramètres → Agents.', variant: 'destructive' });
      return;
    }
    const existingNames = new Set(items.map(i => i.nom.trim().toLowerCase()));
    const newItems: EquipeMembre[] = [];
    agents.filter(a => a.actif).forEach(a => {
      const fullName = `${a.civilite ? a.civilite + ' ' : ''}${a.prenom} ${a.nom.toUpperCase()}`.trim();
      if (existingNames.has(fullName.toLowerCase())) return;
      const map = ROLE_TO_FONCTION[a.role] ?? { fonction: getRoleLabel(a.role as any), taches: [] };
      newItems.push({
        id: crypto.randomUUID(),
        nom: fullName,
        fonction: map.fonction,
        telephone: a.telephone || '',
        email: a.email || '',
        taches: map.taches,
      });
    });
    if (newItems.length === 0) {
      toast({ title: 'Rien à importer', description: 'Tous les agents sont déjà dans l\'organigramme.' });
      return;
    }
    save([...items, ...newItems]);
    toast({ title: `${newItems.length} agent(s) importé(s)`, description: 'Pré-remplissage depuis Paramètres effectué.' });
  };

  const submit = () => {
    if (!form || !form.nom) return;
    const item: EquipeMembre = { id: form.id || crypto.randomUUID(), nom: form.nom, fonction: form.fonction, telephone: form.telephone, email: form.email, taches: form.taches || [] };
    if (form.id) save(items.map(i => i.id === form.id ? item : i));
    else save([...items, item]);
    setForm(null);
  };

  return (
    <ModulePageLayout
      title="Organigramme fonctionnel"
      section="CONTRÔLE INTERNE"
      description="Description des fonctions comptables, des délégations et de la séparation des tâches. Vérification de la matrice de séparation ordonnateur/comptable."
      refs={[
        { code: "M9-6 § 1.2", label: "Organisation du service" },
        { code: "Art. 9 GBCP", label: "Séparation ordonnateur/comptable" },
        { code: "Cartop@le P1", label: "Organisation comptable" },
      ]}
      completedChecks={(CONTROLES_ORGANIGRAMME).filter(c => regChecks[c.id]).length}
      totalChecks={(CONTROLES_ORGANIGRAMME).length}
    >
      <DoctrineEPLE theme="organigramme" titre="Organigramme & séparation des tâches" resume="Rôles, délégations, suppléances, séparation engagement/paiement" />

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold">{items.length}</p><p className="text-xs text-muted-foreground mt-0.5">Agents</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold">{[...new Set(items.map(x => x.fonction))].length}</p><p className="text-xs text-muted-foreground mt-0.5">Fonctions distinctes</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold">{[...new Set(items.flatMap(x => x.taches || []))].length}</p><p className="text-xs text-muted-foreground mt-0.5">Tâches assignées</p></CardContent></Card>
      </div>

      <div className="flex justify-end gap-2 flex-wrap">
        <Button variant="outline" onClick={importerDepuisParametres} disabled={agents.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Importer depuis Paramètres ({agents.filter(a => a.actif).length})
        </Button>
        <Button onClick={() => setForm({ nom: '', fonction: 'Agent Comptable', telephone: '', email: '', taches: [] })}>
          <Plus className="h-4 w-4 mr-2" /> Membre
        </Button>
      </div>

      {form && (
        <Card className="border-primary"><CardContent className="pt-6 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Nom complet</Label>
              <AgentSelect
                value={form.nom}
                onChange={(display, agent) => {
                  if (agent) {
                    const map = ROLE_TO_FONCTION[agent.role] ?? { fonction: getRoleLabel(agent.role as any), taches: [] };
                    setForm({
                      ...form,
                      nom: display,
                      fonction: FONCTIONS_COMPTABLES.includes(map.fonction as any) ? map.fonction : form.fonction,
                      telephone: agent.telephone || form.telephone,
                      email: agent.email || form.email,
                      taches: form.taches?.length ? form.taches : map.taches,
                    });
                  } else {
                    setForm({ ...form, nom: display });
                  }
                }}
                placeholder="Choisir dans l'équipe…"
              />
            </div>
            <div className="space-y-1"><Label className="text-xs">Fonction</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.fonction} onChange={e => setForm({ ...form, fonction: e.target.value })}>
                {FONCTIONS_COMPTABLES.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div className="space-y-1"><Label className="text-xs">Téléphone</Label><Input value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Courriel</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
          </div>
            <Label className="text-xs">Tâches attribuées (Op@le / Cartop@le)</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {TACHES_COMPTABLES.map(t => (
                <button key={t} onClick={() => setForm({ ...form, taches: form.taches.includes(t) ? form.taches.filter((x: string) => x !== t) : [...form.taches, t] })}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${form.taches.includes(t) ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border hover:border-primary'}`}>
                  {t}
                </button>
              ))}
            </div>
          <div className="flex gap-2"><Button onClick={submit}>Valider</Button><Button variant="outline" onClick={() => setForm(null)}>Annuler</Button></div>
        </CardContent></Card>
      )}

      {items.length === 0 && !form && <Card><CardContent className="py-12 text-center text-muted-foreground">Aucun membre enregistré.</CardContent></Card>}
      {items.map(m => (
        <Card key={m.id}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">{m.nom.charAt(0)}</div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-lg">{m.nom}</p>
                <p className="text-sm text-primary font-semibold">{m.fonction}</p>
                <div className="flex flex-wrap gap-1 mt-2">{m.taches.map(t => <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">{t}</span>)}</div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => setForm({ ...m })}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => save(items.filter(i => i.id !== m.id))}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Contrôles réglementaires */}
      <ModuleSection title="Contrôles réglementaires — Organisation" description="M9-6 § 1.2 — Art. 9 GBCP" badge={`${(CONTROLES_ORGANIGRAMME).filter(c => regChecks[c.id]).length}/${(CONTROLES_ORGANIGRAMME).length}`}>
        <Card className="shadow-card">
          <CardContent className="p-3 space-y-2">
            {CONTROLES_ORGANIGRAMME.map(item => (
              <ComplianceCheck
                key={item.id}
                label={item.label}
                checked={regChecks[item.id] || false}
                onChange={() => toggleRegCheck(item.id)}
                severity={item.severity}
                detail={item.ref}
              />
            ))}
          </CardContent>
        </Card>
      </ModuleSection>
    </ModulePageLayout>
  );
}
```

### FICHIER : src/pages/PVAuditDetail.tsx

```tsx
/**
 * PV d'audit consolidé — vue récapitulative + circuit contradictoire.
 * Liste les points audités, leur statut, anomalies. Bouton « Envoyer à
 * l'ordonnateur » qui crée un PV + token magique + email via edge function.
 */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ModulePageLayout } from '@/components/ModulePageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Send, Printer, Clock, MailCheck, FileSignature, CheckCircle2, AlertTriangle, AlertOctagon, MinusCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useGroupements, useEtablissements, useAgents, getRoleLabel } from '@/hooks/useGroupements';
import { DOMAINES_AUDIT } from '@/lib/audit-parcours';
import { toast } from 'sonner';

const STATUS_META: Record<string, { label: string; icon: any; color: string; variant: any }> = {
  non_audite: { label: 'Non audité', icon: MinusCircle, color: 'text-muted-foreground', variant: 'outline' },
  conforme: { label: 'Conforme', icon: CheckCircle2, color: 'text-emerald-600', variant: 'secondary' },
  anomalie_mineure: { label: 'Anomalie mineure', icon: AlertTriangle, color: 'text-amber-600', variant: 'secondary' },
  anomalie_majeure: { label: 'Anomalie majeure', icon: AlertOctagon, color: 'text-destructive', variant: 'destructive' },
  non_applicable: { label: 'N/A', icon: MinusCircle, color: 'text-muted-foreground', variant: 'outline' },
};

export default function PVAuditDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeId } = useGroupements();
  const { etablissements } = useEtablissements(activeId);
  const { agents } = useAgents(activeId);

  const [audit, setAudit] = useState<any>(null);
  const [points, setPoints] = useState<any[]>([]);
  const [pv, setPv] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [emailOrdo, setEmailOrdo] = useState('');
  const [delai, setDelai] = useState(15);
  const [sending, setSending] = useState(false);

  const refresh = async () => {
    if (!id) return;
    const [{ data: a }, { data: p }, { data: existingPv }] = await Promise.all([
      supabase.from('audits').select('*').eq('id', id).single(),
      supabase.from('audit_points_results').select('*').eq('audit_id', id).order('domaine_id').order('point_index'),
      supabase.from('pv_contradictoires').select('*').eq('audit_id', id).maybeSingle(),
    ]);
    setAudit(a);
    setPoints(p ?? []);
    setPv(existingPv);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, [id]);

  useEffect(() => {
    if (audit && agents.length > 0 && !emailOrdo) {
      const ordo = agents.find(a => a.role === 'ordonnateur' && a.etablissement_id === audit.etablissement_id);
      if (ordo?.email) setEmailOrdo(ordo.email);
    }
  }, [audit, agents]);

  const etab = audit ? etablissements.find(e => e.id === audit.etablissement_id) : null;
  const ac = agents.find(a => a.role === 'agent_comptable');
  const ordo = audit ? agents.find(a => a.role === 'ordonnateur' && a.etablissement_id === audit.etablissement_id) : null;

  const groupedByDomaine = points.reduce((acc: Record<string, any[]>, p) => {
    (acc[p.domaine_id] ??= []).push(p);
    return acc;
  }, {});

  const counts = {
    conforme: points.filter(p => p.status === 'conforme').length,
    mineure: points.filter(p => p.status === 'anomalie_mineure').length,
    majeure: points.filter(p => p.status === 'anomalie_majeure').length,
    na: points.filter(p => p.status === 'non_applicable').length,
    non_audite: points.filter(p => p.status === 'non_audite').length,
  };

  const sendContradiction = async () => {
    if (!emailOrdo) { toast.error('Email de l\'ordonnateur requis'); return; }
    if (!audit || !id) return;

    setSending(true);
    try {
      // 1. Créer ou mettre à jour le PV
      let pvId = pv?.id;
      if (!pvId) {
        const { data: newPv, error } = await supabase.from('pv_contradictoires').insert({
          audit_id: id,
          groupement_id: audit.groupement_id,
          email_ordonnateur: emailOrdo,
          delai_jours: delai,
          status: 'envoye',
          envoye_at: new Date().toISOString(),
        }).select().single();
        if (error) throw error;
        pvId = newPv.id;
      } else {
        await supabase.from('pv_contradictoires').update({
          email_ordonnateur: emailOrdo,
          delai_jours: delai,
          status: 'envoye',
          envoye_at: new Date().toISOString(),
        }).eq('id', pvId);
      }

      // 2. Mettre à jour l'audit
      await supabase.from('audits').update({ status: 'envoye_contradiction' }).eq('id', id);

      // 3. Appeler l'edge function pour générer token + envoyer email
      const { error: fnError } = await supabase.functions.invoke('send-pv-contradictoire', {
        body: {
          pv_id: pvId,
          email_destinataire: emailOrdo,
          delai_jours: delai,
          audit_libelle: audit.libelle,
          etablissement_nom: etab?.nom ?? '',
          ordonnateur_nom: ordo ? `${ordo.civilite ?? ''} ${ordo.prenom} ${ordo.nom}`.trim() : '',
          ac_nom: ac ? `${ac.civilite ?? ''} ${ac.prenom} ${ac.nom}`.trim() : '',
        },
      });
      if (fnError) throw fnError;

      toast.success(`PV envoyé à ${emailOrdo} — délai ${delai} jours`);
      await refresh();
    } catch (e: any) {
      toast.error(e.message ?? 'Erreur d\'envoi');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <ModulePageLayout title="PV d'audit" section="AUDIT & RESTITUTION"><p>Chargement…</p></ModulePageLayout>;
  if (!audit) return <ModulePageLayout title="PV d'audit" section="AUDIT & RESTITUTION"><p>Audit introuvable.</p></ModulePageLayout>;

  return (
    <ModulePageLayout
      title={`PV — ${audit.libelle}`}
      section="AUDIT & RESTITUTION"
      description={`Période ${audit.periode_debut} → ${audit.periode_fin} · ${etab?.nom ?? '—'}`}
    >
      <div className="space-y-4">
        {/* Synthèse */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Synthèse</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Stat label="Conformes" value={counts.conforme} color="text-emerald-600" />
            <Stat label="Anom. mineures" value={counts.mineure} color="text-amber-600" />
            <Stat label="Anom. majeures" value={counts.majeure} color="text-destructive" />
            <Stat label="Non applicables" value={counts.na} color="text-muted-foreground" />
            <Stat label="Non audités" value={counts.non_audite} color="text-muted-foreground" />
          </CardContent>
        </Card>

        {/* Statut PV */}
        {pv && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="py-3 flex items-center gap-3 flex-wrap">
              {pv.status === 'envoye' && <Clock className="h-5 w-5 text-amber-600" />}
              {pv.status === 'observe' && <MailCheck className="h-5 w-5 text-emerald-600" />}
              {pv.status === 'finalise' && <FileSignature className="h-5 w-5 text-primary" />}
              <div className="flex-1 text-sm">
                <strong>Statut PV : </strong>
                {pv.status === 'envoye' && `En attente d'observations (envoyé le ${new Date(pv.envoye_at).toLocaleString('fr-FR')})`}
                {pv.status === 'observe' && `Observations reçues le ${new Date(pv.signature_ordonnateur_at).toLocaleString('fr-FR')}`}
                {pv.status === 'finalise' && 'PV contradictoire clos'}
                {pv.status === 'brouillon' && 'Brouillon'}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Détail par domaine */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Détail des contrôles ({points.length} points)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(groupedByDomaine).map(([dId, list]) => {
              const d = DOMAINES_AUDIT.find(x => x.id === dId);
              const arr = list as any[];
              return (
                <div key={dId}>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{d?.lettre}</Badge>
                    <h4 className="font-semibold text-sm">{d?.label}</h4>
                  </div>
                  <ul className="space-y-2 pl-2">
                    {arr.map((p) => {
                      const meta = STATUS_META[p.status];
                      const Icon = meta.icon;
                      return (
                        <li key={p.id} className="text-sm border-l-2 border-muted pl-3 py-1">
                          <div className="flex items-start gap-2">
                            <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${meta.color}`} />
                            <div className="flex-1">
                              <div className="font-medium">{p.point_libelle}</div>
                              {p.constat && <div className="text-xs text-muted-foreground mt-0.5">📋 {p.constat}</div>}
                              {p.anomalies && <div className="text-xs text-amber-700 mt-0.5">⚠ {p.anomalies}</div>}
                              {p.action_corrective && <div className="text-xs text-primary mt-0.5">→ {p.action_corrective}</div>}
                            </div>
                            <Badge variant={meta.variant} className="text-[10px] shrink-0">{meta.label}</Badge>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Circuit contradictoire */}
        {(!pv || pv.status === 'brouillon') && (
          <Card className="border-primary/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Send className="h-4 w-4" /> Envoyer à l'ordonnateur pour contradiction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <Label>Email ordonnateur</Label>
                  <Input type="email" value={emailOrdo} onChange={e => setEmailOrdo(e.target.value)} placeholder="ordonnateur@etab.fr" />
                  {ordo && <p className="text-xs text-muted-foreground mt-1">Pré-rempli depuis Paramètres : {ordo.prenom} {ordo.nom} ({getRoleLabel(ordo.role)})</p>}
                </div>
                <div>
                  <Label>Délai de réponse (jours)</Label>
                  <Input type="number" min={1} max={60} value={delai} onChange={e => setDelai(parseInt(e.target.value) || 15)} />
                </div>
              </div>
              <Button onClick={sendContradiction} disabled={sending || !emailOrdo} className="w-full">
                <Send className="h-4 w-4 mr-2" />
                {sending ? 'Envoi en cours…' : 'Envoyer à l\'ordonnateur (email + lien sécurisé)'}
              </Button>
              <p className="text-xs text-muted-foreground">
                L'ordonnateur recevra un email avec un lien magique sécurisé pour saisir ses observations.
                Une notification in-app sera également créée. Traçabilité horodatée conservée 10 ans.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" /> Imprimer
          </Button>
          <Button variant="outline" onClick={() => navigate('/pv-audit')}>← Retour à la liste</Button>
        </div>
      </div>
    </ModulePageLayout>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center p-2 rounded border bg-card">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

```

### FICHIER : src/pages/PVAuditList.tsx

```tsx
/**
 * Liste des audits du groupement actif + accès rapide aux PV.
 * Remplace l'ancien PVAudit autonome.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ModulePageLayout } from '@/components/ModulePageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, ArrowRight, Clock, MailCheck, FileSignature } from 'lucide-react';
import { useGroupements, useEtablissements } from '@/hooks/useGroupements';
import { supabase } from '@/integrations/supabase/client';

const STATUS_LABEL: Record<string, { label: string; icon: any; color: string }> = {
  en_cours: { label: 'En cours', icon: Clock, color: 'text-amber-600' },
  cloture: { label: 'Clôturé', icon: FileText, color: 'text-primary' },
  envoye_contradiction: { label: 'En contradiction', icon: MailCheck, color: 'text-blue-600' },
  contradictoire_clos: { label: 'Contradictoire clos', icon: FileSignature, color: 'text-emerald-600' },
};

export default function PVAuditList() {
  const navigate = useNavigate();
  const { activeId } = useGroupements();
  const { etablissements } = useEtablissements(activeId);
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeId) return;
    (async () => {
      const { data } = await supabase
        .from('audits')
        .select('*')
        .eq('groupement_id', activeId)
        .order('created_at', { ascending: false });
      setAudits(data ?? []);
      setLoading(false);
    })();
  }, [activeId]);

  return (
    <ModulePageLayout
      title="PV d'audit consolidés"
      section="AUDIT & RESTITUTION"
      description="Liste de tous vos audits sélectifs et de leur statut de procédure contradictoire."
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">{audits.length} audit{audits.length > 1 ? 's' : ''}</p>
          <Button onClick={() => navigate('/audit-config')}>
            <Plus className="h-4 w-4 mr-2" /> Nouvel audit
          </Button>
        </div>

        {loading && <p className="text-sm text-muted-foreground">Chargement…</p>}
        {!loading && audits.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center space-y-2">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">Aucun audit pour le moment.</p>
              <Button onClick={() => navigate('/audit-config')} variant="outline">
                <Plus className="h-4 w-4 mr-2" /> Lancer mon premier audit
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-2">
          {audits.map(a => {
            const etab = etablissements.find(e => e.id === a.etablissement_id);
            const meta = STATUS_LABEL[a.status] ?? STATUS_LABEL.en_cours;
            const Icon = meta.icon;
            const continueLink = a.status === 'en_cours' ? `/audit-execution/${a.id}` : `/pv-audit/${a.id}`;
            return (
              <Card key={a.id} className="hover:shadow-sm transition-shadow cursor-pointer" onClick={() => navigate(continueLink)}>
                <CardContent className="py-3 flex items-center gap-3 flex-wrap">
                  <Icon className={`h-5 w-5 ${meta.color} shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{a.libelle}</div>
                    <div className="text-xs text-muted-foreground">
                      {etab?.nom ?? '—'} · {a.periode_debut} → {a.periode_fin}
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${meta.color}`}>{meta.label}</Badge>
                  <Button variant="ghost" size="sm">
                    {a.status === 'en_cours' ? 'Reprendre' : 'Voir PV'} <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </ModulePageLayout>
  );
}

```

### FICHIER : src/pages/PVContradictoirePublic.tsx

```tsx
/**
 * Page contradictoire publique — accessible via lien magique depuis l'email
 * envoyé à l'ordonnateur. Token validé côté serveur via l'edge function.
 * L'ordonnateur peut saisir ses observations point par point puis valider.
 */
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldCheck, FileSignature, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { DOMAINES_AUDIT } from '@/lib/audit-parcours';
import { toast } from 'sonner';

export default function PVContradictoirePublic() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('t');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [observations, setObservations] = useState<Record<string, string>>({});
  const [globale, setGlobale] = useState('');
  const [signed, setSigned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) { setError('Lien invalide — token manquant.'); setLoading(false); return; }
    (async () => {
      const { data: result, error: e } = await supabase.functions.invoke('validate-pv-token', {
        body: { token },
      });
      if (e || result?.error) {
        setError(result?.error ?? e?.message ?? 'Lien invalide ou expiré.');
      } else {
        setData(result);
        setObservations(result.pv?.observations_ordonnateur ?? {});
        setGlobale(result.pv?.observation_globale ?? '');
      }
      setLoading(false);
    })();
  }, [token]);

  const submit = async () => {
    if (!signed) { toast.error('Veuillez confirmer la signature électronique'); return; }
    setSubmitting(true);
    const { error: e } = await supabase.functions.invoke('submit-pv-observations', {
      body: { token, observations, observation_globale: globale },
    });
    if (e) { toast.error(e.message); setSubmitting(false); return; }
    setDone(true);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-6 text-center space-y-3">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
            <h1 className="text-lg font-semibold">Accès impossible</h1>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-6 text-center space-y-3">
            <ShieldCheck className="h-10 w-10 text-emerald-600 mx-auto" />
            <h1 className="text-lg font-semibold">Observations enregistrées</h1>
            <p className="text-sm text-muted-foreground">
              Vos observations ont bien été transmises à l'agent comptable.
              Vous pouvez fermer cette fenêtre.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { audit, points, pv, etablissement, ac_nom, ordonnateur_email } = data;
  const grouped = (points ?? []).reduce((acc: Record<string, any[]>, p: any) => {
    (acc[p.domaine_id] ??= []).push(p);
    return acc;
  }, {});
  const alreadySubmitted = pv?.status === 'observe' || pv?.status === 'finalise';

  return (
    <div className="min-h-screen bg-muted/10 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="text-center space-y-1">
          <ShieldCheck className="h-8 w-8 text-primary mx-auto" />
          <h1 className="text-2xl font-bold">Procédure contradictoire — PV d'audit</h1>
          <p className="text-sm text-muted-foreground">
            Accès sécurisé · {etablissement} · Destinataire : {ordonnateur_email}
          </p>
        </div>

        {alreadySubmitted && (
          <Alert>
            <AlertTitle>Observations déjà transmises</AlertTitle>
            <AlertDescription>
              Vous pouvez consulter vos observations ci-dessous, mais elles ne peuvent plus être modifiées.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{audit.libelle}</CardTitle>
            <CardDescription>
              Période {audit.periode_debut} → {audit.periode_fin} · Audit clôturé le {new Date(pv.envoye_at ?? pv.created_at).toLocaleDateString('fr-FR')}
              <br />Agent comptable : {ac_nom || '—'} · Délai contradictoire : {pv.delai_jours} jours
            </CardDescription>
          </CardHeader>
        </Card>

        {Object.entries(grouped).map(([dId, list]: any) => {
          const d = DOMAINES_AUDIT.find(x => x.id === dId);
          return (
            <Card key={dId}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Badge variant="outline">{d?.lettre}</Badge>
                  {d?.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {list.map((p: any) => (
                  <div key={p.id} className="border rounded-md p-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Badge
                        variant={p.status === 'anomalie_majeure' ? 'destructive' : p.status === 'conforme' ? 'secondary' : 'outline'}
                        className="text-[10px] shrink-0"
                      >
                        {p.status}
                      </Badge>
                      <div className="flex-1 text-sm font-medium">{p.point_libelle}</div>
                    </div>
                    {p.constat && <p className="text-xs text-muted-foreground">📋 {p.constat}</p>}
                    {p.anomalies && <p className="text-xs text-amber-700">⚠ {p.anomalies}</p>}
                    {p.action_corrective && <p className="text-xs text-primary">→ {p.action_corrective}</p>}

                    <div>
                      <label className="text-xs font-medium">Mes observations</label>
                      <Textarea
                        value={observations[p.id] ?? ''}
                        onChange={e => setObservations(prev => ({ ...prev, [p.id]: e.target.value }))}
                        placeholder="Saisissez vos observations sur ce point (facultatif)…"
                        rows={2}
                        disabled={alreadySubmitted}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Observation globale</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={globale}
              onChange={e => setGlobale(e.target.value)}
              placeholder="Vos observations générales sur l'audit (facultatif)…"
              rows={4}
              disabled={alreadySubmitted}
            />
            {!alreadySubmitted && (
              <>
                <div className="flex items-start gap-2 p-3 rounded bg-muted/50">
                  <Checkbox id="sign" checked={signed} onCheckedChange={(v) => setSigned(v === true)} className="mt-0.5" />
                  <label htmlFor="sign" className="text-sm cursor-pointer">
                    Je certifie avoir pris connaissance du PV ci-dessus et je valide la transmission de mes observations.
                    Cette validation vaut signature électronique simple horodatée (art. 1367 Code civil).
                  </label>
                </div>
                <Button onClick={submit} disabled={submitting || !signed} className="w-full">
                  <FileSignature className="h-4 w-4 mr-2" />
                  {submitting ? 'Envoi…' : 'Valider mes observations'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

```

### FICHIER : src/pages/Parametres.tsx

```tsx
/**
 * Page « Paramètres » — refonte multi-groupements (Chantier 2).
 *
 * 4 onglets :
 *  1. Mon groupement       → groupements_comptables (Supabase)
 *  2. Établissements       → etablissements (Supabase, source unique de vérité)
 *  3. Agents               → agents (Supabase, source unique de vérité)
 *  4. Préférences (legacy) → ancienne page localStorage (équipe, modules, RGPD)
 */
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ParametresGroupements } from '@/components/parametres/ParametresGroupements';
import { ParametresEtablissements } from '@/components/parametres/ParametresEtablissements';
import { ParametresAgents } from '@/components/parametres/ParametresAgents';
import { Building, Users, Settings as SettingsIcon, Building2 } from 'lucide-react';
import { ModulePageLayout } from '@/components/ModulePageLayout';
import { GDPRSettings } from '@/components/GDPRSettings';

export default function ParametresPage() {
  return (
    <ModulePageLayout
      title="Paramètres"
      section="AUDIT & RESTITUTION"
      description="Gérez votre groupement comptable, vos établissements et vos agents. Ces données alimentent automatiquement tous les modules de l'application (zéro double saisie)."
    >
      <Tabs defaultValue="groupement" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-3xl">
          <TabsTrigger value="groupement"><Building className="h-4 w-4 mr-2" />Mon groupement</TabsTrigger>
          <TabsTrigger value="etablissements"><Building2 className="h-4 w-4 mr-2" />Établissements</TabsTrigger>
          <TabsTrigger value="agents"><Users className="h-4 w-4 mr-2" />Agents</TabsTrigger>
          <TabsTrigger value="preferences"><SettingsIcon className="h-4 w-4 mr-2" />Préférences</TabsTrigger>
        </TabsList>

        <TabsContent value="groupement"><ParametresGroupements /></TabsContent>
        <TabsContent value="etablissements"><ParametresEtablissements /></TabsContent>
        <TabsContent value="agents"><ParametresAgents /></TabsContent>
        <TabsContent value="preferences">
          <GDPRSettings />
        </TabsContent>
      </Tabs>
    </ModulePageLayout>
  );
}

```

### FICHIER : src/pages/PisteAudit.tsx

```tsx
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Download } from 'lucide-react';
import { LogEntry } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';
import { ModulePageLayout } from '@/components/ModulePageLayout';
import { DoctrineEPLE } from '@/components/DoctrineEPLE';
import { useAuditParams } from '@/hooks/useAuditStore';
import { getSelectedEtablissement } from '@/lib/types';

const ACTION_TYPES = ['Contrôle effectué', 'Anomalie relevée', 'Action corrective', 'Document vérifié', 'Observation', 'Suspension de paiement', 'Irrégularité constatée'];
const SEVERITY_COLORS: Record<string, 'destructive' | 'default' | 'secondary'> = {
  'Anomalie relevée': 'destructive',
  'Irrégularité constatée': 'destructive',
  'Suspension de paiement': 'destructive',
  'Action corrective': 'default',
  'Contrôle effectué': 'secondary',
  'Document vérifié': 'secondary',
  'Observation': 'secondary',
};

export default function PisteAudit() {
  const { params } = useAuditParams();
  const etab = getSelectedEtablissement(params);
  const [logs, setLogs] = useState<LogEntry[]>(() => loadState('piste_audit', []));
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ action: ACTION_TYPES[0], details: '', utilisateur: etab?.nom || '', module: '' });

  const saveLogs = (d: LogEntry[]) => { setLogs(d); saveState('piste_audit', d); };

  const submit = () => {
    if (!form.details.trim()) return;
    const entry: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      action: form.action,
      details: form.details,
      utilisateur: form.utilisateur || 'Agent comptable',
      module: form.module,
    };
    saveLogs([entry, ...logs]);
    setForm({ ...form, details: '', module: '' });
    setShowForm(false);
  };

  const exportCSV = () => {
    const rows = [['Date', 'Utilisateur', 'Action', 'Module', 'Détails'], ...logs.map(l => [l.timestamp, l.utilisateur, l.action, l.module || '', l.details])];
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `piste-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const anomalies = logs.filter(l => ['Anomalie relevée', 'Irrégularité constatée', 'Suspension de paiement'].includes(l.action));
  const filtered = logs.filter(l => {
    if (!search) return true;
    const s = search.toLowerCase();
    return l.action.toLowerCase().includes(s) || l.details.toLowerCase().includes(s) || l.utilisateur.toLowerCase().includes(s);
  });

  return (
    <ModulePageLayout
      title="Piste d'audit"
      section="AUDIT & RESTITUTION"
      description="Journal chronologique des opérations d'audit : contrôles effectués, anomalies relevées et actions correctives. Traçabilité complète pour le PV contradictoire."
      refs={[
        { code: 'Décret 2012-1246 art. 170', label: 'CICF' },
        { code: 'M9-6', label: 'Traçabilité des contrôles' },
      ]}
      headerActions={
        <div className="flex gap-2">
          <Button
            className="bg-white/20 hover:bg-white/30 text-white border-white/25"
            variant="outline"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus className="h-4 w-4 mr-2" /> Nouvelle entrée
          </Button>
          {logs.length > 0 && (
            <Button
              className="bg-white/20 hover:bg-white/30 text-white border-white/25"
              variant="outline"
              onClick={exportCSV}
            >
              <Download className="h-4 w-4 mr-2" /> Export CSV
            </Button>
          )}
        </div>
      }
    >
      <DoctrineEPLE
        theme="piste-audit"
        titre="Piste d'audit — traçabilité des contrôles"
        resume="Journal chronologique horodaté. Preuve des diligences de l'AC opposable au juge financier."
      />

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{logs.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Événements tracés</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <p className={`text-2xl font-bold ${anomalies.length > 0 ? 'text-destructive' : 'text-green-600'}`}>{anomalies.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Anomalies / irrégularités</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{logs.filter(l => l.action === 'Action corrective').length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Actions correctives</p>
          </CardContent>
        </Card>
      </div>

      {/* Formulaire de saisie */}
      {showForm && (
        <Card className="border-primary shadow-card-hover">
          <CardContent className="pt-6 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Type d'action</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.action} onChange={e => setForm({ ...form, action: e.target.value })}>
                  {ACTION_TYPES.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Module concerné</Label>
                <Input value={form.module} onChange={e => setForm({ ...form, module: e.target.value })} placeholder="Ex: Régies, Marchés..." />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Auditeur</Label>
                <Input value={form.utilisateur} onChange={e => setForm({ ...form, utilisateur: e.target.value })} placeholder="Nom de l'agent comptable" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Détails *</Label>
              <Input value={form.details} onChange={e => setForm({ ...form, details: e.target.value })} placeholder="Décrire le contrôle effectué, l'anomalie relevée ou l'action corrective..." />
            </div>
            <div className="flex gap-2">
              <Button onClick={submit}>Enregistrer</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher dans la piste d'audit..." />

      {logs.length === 0 && !showForm && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Aucune action enregistrée. Utilisez « Nouvelle entrée » pour alimenter la piste d'audit.
          </CardContent>
        </Card>
      )}

      {filtered.length > 0 && (
        <>
          {/* Vue desktop */}
          <Card className="hidden md:block"><CardContent className="pt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-xs text-muted-foreground">
                <th className="text-left p-2">Date</th>
                <th className="text-left p-2">Auditeur</th>
                <th className="p-2">Action</th>
                <th className="text-left p-2">Module</th>
                <th className="text-left p-2">Détails</th>
              </tr></thead>
              <tbody>{filtered.slice(0, 200).map(l => (
                <tr key={l.id} className="border-b hover:bg-muted/30">
                  <td className="p-2 font-mono text-xs whitespace-nowrap">{new Date(l.timestamp).toLocaleString('fr-FR')}</td>
                  <td className="p-2 font-bold text-xs">{l.utilisateur}</td>
                  <td className="p-2"><Badge variant={SEVERITY_COLORS[l.action] || 'secondary'} className="text-[10px]">{l.action}</Badge></td>
                  <td className="p-2 text-xs text-muted-foreground">{l.module || '—'}</td>
                  <td className="p-2 text-xs">{l.details}</td>
                </tr>
              ))}</tbody>
            </table>
          </CardContent></Card>
          {/* Vue mobile */}
          <div className="md:hidden space-y-2">
            {filtered.slice(0, 100).map(l => (
              <Card key={l.id}>
                <CardContent className="p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <Badge variant={SEVERITY_COLORS[l.action] || 'secondary'} className="text-[10px]">{l.action}</Badge>
                    <span className="text-[10px] text-muted-foreground font-mono">{new Date(l.timestamp).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <p className="text-xs font-bold">{l.utilisateur} {l.module ? `· ${l.module}` : ''}</p>
                  <p className="text-xs text-muted-foreground">{l.details}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </ModulePageLayout>
  );
}

```

### FICHIER : src/pages/PlanAction.tsx

```tsx
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, RefreshCw, Sparkles, AlertTriangle, Clock, CheckCircle2, ListChecks, KanbanSquare, CalendarDays, Mail } from 'lucide-react';
import { ModulePageLayout } from '@/components/ModulePageLayout';
import { DoctrineEPLE } from '@/components/DoctrineEPLE';
import { CartoRisque } from '@/lib/types';
import { loadState } from '@/lib/store';
import { AgentSelect } from '@/components/AgentSelect';
import {
  ActionPlan, StatutAction, CriticiteAction, PlanActionContext,
  genererActions, computeStats, getActionsJ15, getActionsEnRetard,
  STATUT_LABELS, CRITICITE_LABELS, calculerEcheance, LIBRARY_REGLES,
} from '@/lib/plan-action-engine';
import { PlanActionTableau } from '@/components/plan-action/PlanActionTableau';
import { PlanActionKanban } from '@/components/plan-action/PlanActionKanban';
import { PlanActionCalendrier } from '@/components/plan-action/PlanActionCalendrier';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useGroupements } from '@/hooks/useGroupements';
import { usePlanActionsSync } from '@/hooks/usePlanActionsSync';
import { Cloud, CloudOff } from 'lucide-react';
import { RealtimePulse } from '@/components/RealtimePulse';

export default function PlanAction() {
  const { actions, setActions: persist, synced, remoteUpdateAt } = usePlanActionsSync();
  const [editing, setEditing] = useState<ActionPlan | null>(null);
  const { activeId } = useGroupements();

  const stats = useMemo(() => computeStats(actions), [actions]);

  // ═══ Auto-génération depuis cartographie + PV audit ═══
  const regenerer = async () => {
    const risques: CartoRisque[] = loadState('cartographie', []);
    const ctx: PlanActionContext = {
      risques,
      // Heuristiques minimales : à raffiner avec les vrais signaux des autres modules
      rapprochementBancaireDateLast: loadState<string>('rapprochement_last_date', ''),
      fondsSociauxDelibCA: loadState<boolean>('fonds_sociaux_delib_ca', true),
      arreteRegieAJour: loadState<boolean>('arrete_regie_ajour', true),
      organigrammeDateLast: loadState<string>('organigramme_last_date', new Date().toISOString().slice(0, 10)),
      lettrage411AJour: loadState<boolean>('lettrage_411_ajour', true),
      modalitesFseFormalisees: loadState<boolean>('fse_modalites_formalisees', true),
      signatureDelegationsAJour: loadState<boolean>('delegations_signature_ajour', true),
      inventaireAnnuelFait: loadState<boolean>('inventaire_annuel_fait', true),
      controleInterneSupervision2: loadState<boolean>('cicf_supervision_2', true),
      rapportAcAnnuelTransmis: loadState<boolean>('rapport_ac_annuel_transmis', true),
      rattachementChargesProduitsClos: loadState<boolean>('rattachement_clos', true),
      marchesReconductionsRevues: loadState<boolean>('marches_reconductions_revues', true),
      bourses_versees_a_temps: loadState<boolean>('bourses_versees_a_temps', true),
      tauxRecouvrement411: loadState<number>('taux_recouvrement_411', 100),
      dgpDepasseMandats: loadState<number>('dgp_depasse_mandats', 0),
      soldesAnormaux: loadState<string[]>('soldes_anormaux', []),
      comptesAttentePerimees: loadState<string[]>('comptes_attente_perimes', []),
      achatsRepetitifsFournisseur: loadState('achats_repetitifs_fournisseur', []),
    };

    // Anomalies PV audit (depuis Supabase)
    let pvAnomalies: { auditId: string; pointId: string; libelle: string; severity: 'mineure' | 'majeure'; cycle?: string }[] = [];
    if (activeId) {
      try {
        const { data: pts } = await supabase
          .from('audit_points_results')
          .select('id, audit_id, point_libelle, status, domaine_id')
          .in('status', ['anomalie_mineure', 'anomalie_majeure']);
        pvAnomalies = (pts || []).map(p => ({
          auditId: p.audit_id,
          pointId: p.id,
          libelle: p.point_libelle,
          severity: p.status === 'anomalie_majeure' ? 'majeure' : 'mineure',
          cycle: p.domaine_id,
        }));
      } catch (e) { /* offline-friendly */ }
    }

    const next = genererActions(ctx, pvAnomalies, actions);
    persist(next);
    const nb = next.length - actions.length;
    toast.success(`Plan d'action régénéré`, { description: `${nb >= 0 ? '+' : ''}${nb} action(s) — ${LIBRARY_REGLES.length} règles évaluées` });
  };

  // ═══ Première initialisation : génération auto au montage si vide ═══
  useEffect(() => {
    if (actions.length === 0) regenerer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMove = (id: string, statut: StatutAction) => {
    const next = actions.map(a => a.id === id ? { ...a, statut, updatedAt: new Date().toISOString() } : a);
    persist(next);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Archiver cette action ? (réversible)')) return;
    const next = actions.map(a => a.id === id ? { ...a, statut: 'archive' as StatutAction } : a);
    persist(next);
  };

  const handleSave = (a: ActionPlan) => {
    const exists = actions.some(x => x.id === a.id);
    const updated = { ...a, updatedAt: new Date().toISOString() };
    persist(exists ? actions.map(x => x.id === a.id ? updated : x) : [...actions, updated]);
    setEditing(null);
    toast.success(exists ? 'Action mise à jour' : 'Action créée');
  };

  const newAction = (): ActionPlan => ({
    id: crypto.randomUUID(),
    origine: 'manuelle',
    origineRef: `manuelle:${crypto.randomUUID()}`,
    origineLabel: 'Saisie manuelle',
    libelle: '',
    criticite: 'moyenne',
    responsable: '',
    echeance: calculerEcheance('moyenne'),
    statut: 'a_faire',
    reference: '',
    cycle: 'CICF',
    commentaires: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  return (
    <ModulePageLayout
      title="Plan d'action — CICF"
      section="CONTRÔLE INTERNE"
      description="Plan d'action généré automatiquement à partir de la cartographie des risques (criticité ≥ Moyenne) et des anomalies des PV d'audit. Moteur de 20 règles métier M9-6 / GBCP / Code éducation, extensible."
      refs={[
        { code: 'M9-6 § 2.2', label: 'Cartographie & traitement des risques' },
        { code: 'GBCP art. 215', label: 'Rapport AC' },
        { code: 'Cartop@le', label: 'Plans d\'action CICF' },
      ]}
    >
      <DoctrineEPLE
        theme="plan-action"
        titre="Plan d'action correctif — CICF auto-généré"
        resume="Aucune saisie manuelle imposée : le moteur déduit les actions à partir des risques cartographiés et des PV. Vous pilotez par tableau, kanban ou calendrier."
      />

      {/* ═══ KPI ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="shadow-card"><CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1"><ListChecks className="h-4 w-4" /><span className="text-xs">Actions actives</span></div>
          <p className="text-2xl font-bold">{stats.total}</p>
        </CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4">
          <div className="flex items-center gap-2 text-destructive mb-1"><AlertTriangle className="h-4 w-4" /><span className="text-xs">En retard</span></div>
          <p className="text-2xl font-bold text-destructive">{stats.enRetard}</p>
        </CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4">
          <div className="flex items-center gap-2 text-amber-600 mb-1"><Clock className="h-4 w-4" /><span className="text-xs">Échéance J-15</span></div>
          <p className="text-2xl font-bold text-amber-600">{stats.j15}</p>
        </CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4">
          <div className="flex items-center gap-2 text-emerald-600 mb-1"><CheckCircle2 className="h-4 w-4" /><span className="text-xs">Faites</span></div>
          <p className="text-2xl font-bold text-emerald-600">{stats.parStatut.fait}</p>
        </CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4">
          <div className="flex items-center gap-2 text-primary mb-1"><Sparkles className="h-4 w-4" /><span className="text-xs">Avancement</span></div>
          <p className="text-2xl font-bold text-primary">{stats.tauxAvancement}%</p>
        </CardContent></Card>
      </div>

      {/* ═══ Pyramide criticité ═══ */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <p className="text-xs font-semibold text-muted-foreground mb-2">Pyramide de criticité</p>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="destructive" className="px-3 py-1">Critiques : {stats.parCriticite.critique}</Badge>
            <Badge className="bg-orange-500 text-white px-3 py-1">Majeures : {stats.parCriticite.majeure}</Badge>
            <Badge className="bg-amber-400 text-amber-950 px-3 py-1">Moyennes : {stats.parCriticite.moyenne}</Badge>
            <Badge variant="secondary" className="px-3 py-1">Faibles : {stats.parCriticite.faible}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* ═══ Toolbar ═══ */}
      <div className="flex flex-wrap gap-2 justify-end items-center">
        {activeId && (
          <span className="text-xs text-muted-foreground inline-flex items-center gap-2 mr-auto">
            {synced ? <><Cloud className="h-3.5 w-3.5 text-emerald-600" /> Synchronisé avec le groupement</> : <><CloudOff className="h-3.5 w-3.5" /> Synchronisation…</>}
            <RealtimePulse triggerAt={remoteUpdateAt} label="Action mise à jour par un collègue" />
          </span>
        )}
        <Button variant="outline" size="sm" onClick={regenerer}>
          <RefreshCw className="h-4 w-4 mr-2" /> Régénérer depuis risques + PV
        </Button>
        <Button size="sm" onClick={() => setEditing(newAction())}>
          <Plus className="h-4 w-4 mr-2" /> Action manuelle
        </Button>
      </div>

      {/* ═══ Vues ═══ */}
      <Tabs defaultValue="tableau">
        <TabsList>
          <TabsTrigger value="tableau"><ListChecks className="h-4 w-4 mr-1.5" />Tableau</TabsTrigger>
          <TabsTrigger value="kanban"><KanbanSquare className="h-4 w-4 mr-1.5" />Kanban</TabsTrigger>
          <TabsTrigger value="calendrier"><CalendarDays className="h-4 w-4 mr-1.5" />Calendrier</TabsTrigger>
        </TabsList>
        <TabsContent value="tableau" className="mt-4">
          <PlanActionTableau actions={actions} onEdit={setEditing} onDelete={handleDelete} />
        </TabsContent>
        <TabsContent value="kanban" className="mt-4">
          <PlanActionKanban actions={actions.filter(a => a.statut !== 'archive')} onMove={handleMove} onEdit={setEditing} />
        </TabsContent>
        <TabsContent value="calendrier" className="mt-4">
          <PlanActionCalendrier actions={actions} onEdit={setEditing} />
        </TabsContent>
      </Tabs>

      {/* ═══ Dialog édition ═══ */}
      <Dialog open={!!editing} onOpenChange={o => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing && actions.some(a => a.id === editing.id) ? 'Modifier' : 'Nouvelle'} action</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="bg-muted/50 p-2.5 rounded text-xs">
                <p className="font-semibold">📌 {editing.origineLabel}</p>
                <p className="text-muted-foreground mt-0.5">📖 {editing.reference}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Action corrective</Label>
                <Textarea rows={3} value={editing.libelle} onChange={e => setEditing({ ...editing, libelle: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Criticité</Label>
                  <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={editing.criticite} onChange={e => {
                    const c = e.target.value as CriticiteAction;
                    setEditing({ ...editing, criticite: c, echeance: calculerEcheance(c) });
                  }}>
                    {(['critique', 'majeure', 'moyenne', 'faible'] as CriticiteAction[]).map(c => <option key={c} value={c}>{CRITICITE_LABELS[c]}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Statut</Label>
                  <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={editing.statut} onChange={e => setEditing({ ...editing, statut: e.target.value as StatutAction })}>
                    {(['a_faire', 'en_cours', 'fait', 'abandonne'] as StatutAction[]).map(s => <option key={s} value={s}>{STATUT_LABELS[s]}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Responsable</Label>
                  <AgentSelect value={editing.responsable} onChange={v => setEditing({ ...editing, responsable: v })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Échéance</Label>
                  <Input type="date" value={editing.echeance} onChange={e => setEditing({ ...editing, echeance: e.target.value })} />
                </div>
                <div className="space-y-1 col-span-2">
                  <Label className="text-xs">Cycle</Label>
                  <Input value={editing.cycle || ''} onChange={e => setEditing({ ...editing, cycle: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Commentaires de suivi</Label>
                <Textarea rows={2} value={editing.commentaires} onChange={e => setEditing({ ...editing, commentaires: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Annuler</Button>
            <Button onClick={() => editing && handleSave(editing)} disabled={!editing?.libelle}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ Footer info ═══ */}
      <div className="text-xs text-muted-foreground italic border-t pt-3 mt-4">
        <Mail className="h-3 w-3 inline mr-1" />
        Les alertes J-15 ouvrent un brouillon de mail prérempli vers le responsable (depuis sa fiche agent).
        Le moteur évalue {LIBRARY_REGLES.length} règles métier extensibles + cartographie + anomalies PV.
      </div>
    </ModulePageLayout>
  );
}

```

### FICHIER : src/pages/PlanControle.tsx

```tsx
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { PlanControleItem } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';
import { ModulePageLayout } from '@/components/ModulePageLayout';
import { DoctrineEPLE } from '@/components/DoctrineEPLE';

const TYPES_CONTROLE_M96 = [
  { type: 'Contrôle de caisse et des valeurs inactives', ref: 'M9-6 2026 § 4.3.1 — Vérification de l\'existence et de la concordance des fonds' },
  { type: 'Contrôle du compte DFT', ref: 'M9-6 2026 § 4.3.2 — Rapprochement solde comptable / solde bancaire' },
  { type: 'Rapprochement bancaire', ref: 'M9-6 2026 § 4.3.3 — État de rapprochement mensuel obligatoire' },
  { type: 'Contrôle des régies', ref: 'M9-6 2026 § 4.4 — Vérification des plafonds, comptabilité du régisseur, versements' },
  { type: 'Vérification des stocks et inventaire', ref: 'M9-6 2026 § 4.5 — Inventaire physique, rapprochement stock théorique/réel' },
  { type: 'Contrôle des droits constatés', ref: 'M9-6 2026 § 3.2 — Exhaustivité des recettes, créances non recouvrées' },
  { type: 'Contrôle de la liquidation des dépenses', ref: 'M9-6 2026 § 3.3 — Validité de la créance, service fait, exactitude de la liquidation' },
  { type: 'Suivi du recouvrement', ref: 'M9-6 2026 § 3.2.4 — Diligences de recouvrement, admissions en non-valeur' },
  { type: 'Contrôle des bourses', ref: 'M9-6 2026 § 3.2.2 — Exactitude des liquidations, versements trimestriels' },
  { type: 'Contrôle des voyages scolaires', ref: 'M9-6 2026 § 3.5 — Budget prévisionnel, pièces justificatives, seuils marchés' },
  { type: 'Contrôle de la commande publique', ref: 'M9-6 2026 § 3.3.2 — Respect des seuils, procédures de mise en concurrence' },
  { type: 'Contrôle de la restauration', ref: 'M9-6 2026 § 4.5.2 — Coût denrée, fréquentation, impayés' },
  { type: 'Contrôle des fonds sociaux', ref: 'M9-6 2026 § 3.2.3 — Commissions, justificatifs, comptes dédiés' },
  { type: 'Vérification du patrimoine', ref: 'M9-6 2026 § 4.6 — Inventaire des immobilisations, amortissements' },
  { type: 'Contrôle des subventions', ref: 'M9-6 2026 § 3.2.5 — Notifications, conditions d\'emploi, déchéance quadriennale' },
  { type: 'Contrôle des budgets annexes (SRH, etc.)', ref: 'M9-6 2026 § 2.2 — Équilibre, taux d\'exécution, compte 185' },
  { type: 'Vérification de la piste d\'audit', ref: 'M9-6 2026 § 5.1 — Traçabilité des opérations comptables' },
  { type: 'Contrôle de l\'organigramme fonctionnel', ref: 'M9-6 2026 § 1.2 — Séparation des tâches, habilitations' },
];

export default function PlanControle() {
  const [items, setItems] = useState<PlanControleItem[]>(() => loadState('plan_controle', []));
  const [form, setForm] = useState<any>(null);
  const save = (d: PlanControleItem[]) => { setItems(d); saveState('plan_controle', d); };
  const today = new Date().toISOString().split('T')[0];

  const toggleReal = (pId: string, date: string) => {
    save(items.map(p => {
      if (p.id !== pId) return p;
      const has = p.realises.includes(date);
      return { ...p, realises: has ? p.realises.filter(d => d !== date) : [...p.realises, date] };
    }));
  };

  const submit = () => {
    if (!form || !form.type) return;
    const selected = TYPES_CONTROLE_M96.find(t => t.type === form.type);
    const item: PlanControleItem = {
      id: crypto.randomUUID(), type: form.type, frequence: form.frequence,
      risque: form.risque, reference: selected?.ref || form.reference,
      planning: form.dates ? form.dates.split(',').map((d: string) => d.trim()).filter(Boolean) : [],
      realises: [], objectif: form.objectif,
    };
    save([...items, item]);
    setForm(null);
  };

  const pT = items.reduce((s, p) => s + p.planning.length, 0);
  const pR = items.reduce((s, p) => s + p.realises.length, 0);

  return (
    <ModulePageLayout
      title="Plan de contrôle — CICF"
      section="CONTRÔLE INTERNE"
      description="Planification annuelle des contrôles internes comptables et financiers. Définition des contrôles permanents et périodiques, affectation des responsables et suivi des échéances."
      refs={[
        { code: "Décret 2012-1246 art. 170-172", label: "Organisation du CICF" },
        { code: "Cartop@le", label: "11 processus" },
        { code: "ODICé", label: "Outil de diagnostic" },
      ]}
    >
      <DoctrineEPLE
        theme="plan-controle"
        titre="Plan de contrôle annuel — CICF"
        resume="Hiérarchisation des contrôles par niveau de risque (Cartop@le) — fréquence, responsables, échéances."
      />

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold">{items.length}</p><p className="text-xs text-muted-foreground mt-0.5">Contrôles planifiés</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold text-green-600">{pR}</p><p className="text-xs text-muted-foreground mt-0.5">Réalisés</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold text-primary">{pT - pR}</p><p className="text-xs text-muted-foreground mt-0.5">Restants</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold text-amber-600">{pT > 0 ? Math.round((pR / pT) * 100) : 0}%</p><p className="text-xs text-muted-foreground mt-0.5">Taux réalisation</p></CardContent></Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => setForm({ type: TYPES_CONTROLE_M96[0].type, frequence: 'Trimestriel', risque: 'MOYEN', reference: TYPES_CONTROLE_M96[0].ref, dates: '', objectif: '' })}><Plus className="h-4 w-4 mr-2" /> Nouveau contrôle</Button>
      </div>

      {form && (
        <Card className="border-primary"><CardContent className="pt-6 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1 md:col-span-2">
              <Label className="text-xs">Type de contrôle</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.type} onChange={e => {
                const sel = TYPES_CONTROLE_M96.find(t => t.type === e.target.value);
                setForm({ ...form, type: e.target.value, reference: sel?.ref || '' });
              }}>
                {TYPES_CONTROLE_M96.map(t => <option key={t.type} value={t.type}>{t.type}</option>)}
              </select>
            </div>
            <div className="space-y-1"><Label className="text-xs">Fréquence</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.frequence} onChange={e => setForm({ ...form, frequence: e.target.value })}>
                <option>Mensuel</option><option>Trimestriel</option><option>Semestriel</option><option>Annuel</option>
              </select>
            </div>
            <div className="space-y-1"><Label className="text-xs">Risque</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.risque} onChange={e => setForm({ ...form, risque: e.target.value })}>
                <option>ÉLEVÉ</option><option>MOYEN</option><option>FAIBLE</option>
              </select>
            </div>
            <div className="space-y-1"><Label className="text-xs">Dates planifiées (séparées par des virgules)</Label><Input value={form.dates} onChange={e => setForm({ ...form, dates: e.target.value })} placeholder="2026-03-31, 2026-06-30" /></div>
            <div className="space-y-1"><Label className="text-xs">Objectif</Label><Input value={form.objectif} onChange={e => setForm({ ...form, objectif: e.target.value })} /></div>
          </div>
          <div className="flex gap-2"><Button onClick={submit}>Ajouter</Button><Button variant="outline" onClick={() => setForm(null)}>Annuler</Button></div>
        </CardContent></Card>
      )}

      {items.length === 0 && !form && <Card><CardContent className="py-12 text-center text-muted-foreground">Aucun contrôle planifié.</CardContent></Card>}

      {items.map(p => {
        const retard = p.planning.filter(d => d < today && !p.realises.includes(d)).length;
        return (
          <Card key={p.id} className={retard > 0 ? 'border-destructive' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant={p.risque === 'ÉLEVÉ' ? 'destructive' : p.risque === 'MOYEN' ? 'default' : 'secondary'} className="mr-2">{p.risque}</Badge>
                  <span className="font-bold">{p.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => save(items.filter(i => i.id !== p.id))}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {p.planning.map(d => {
                  const done = p.realises.includes(d);
                  const late = d < today && !done;
                  return (
                    <button key={d} onClick={() => toggleReal(p.id, d)}
                      className={`px-3 py-1 rounded-md text-xs font-bold border-2 transition-colors ${done ? 'border-green-500 bg-green-50 text-green-700' : late ? 'border-destructive bg-destructive/10 text-destructive' : 'border-border bg-background text-foreground'}`}>
                      {done ? '✓' : late ? '!' : '○'} {d}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </ModulePageLayout>
  );
}
```

### FICHIER : src/pages/PolitiqueConfidentialite.tsx

```tsx
import { NavLink } from '@/components/NavLink';
import { Shield, ArrowLeft } from 'lucide-react';

export default function PolitiqueConfidentialite() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <NavLink to="/" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </NavLink>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Politique de confidentialité
          </h1>
        </div>
      </div>

      <div className="prose prose-sm max-w-none text-foreground space-y-6">
        <p className="text-muted-foreground text-sm">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">1. Responsable du traitement</h2>
          <p className="text-sm text-muted-foreground">
            L'application CIC Expert Pro est un outil d'aide à l'audit comptable des établissements publics locaux d'enseignement (EPLE).
            Le responsable du traitement est l'agent comptable ou le service académique utilisateur de l'application.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">2. Données collectées</h2>
          <p className="text-sm text-muted-foreground">Nous collectons les données suivantes :</p>
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
            <li><strong>Données d'identification</strong> : nom, prénom, adresse email (lors de l'inscription)</li>
            <li><strong>Données de connexion</strong> : adresse IP, date et heure de connexion</li>
            <li><strong>Données d'audit</strong> : informations relatives aux établissements audités (UAI, données comptables, observations)</li>
            <li><strong>Données nominatives d'élèves</strong> : dans le cadre des vérifications des droits constatés, les noms des élèves peuvent être saisis temporairement</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">3. Finalités du traitement</h2>
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
            <li>Permettre l'authentification et la gestion des comptes utilisateurs</li>
            <li>Fournir les fonctionnalités d'audit comptable et de contrôle interne</li>
            <li>Sauvegarder les paramètres et préférences de l'utilisateur</li>
            <li>Assurer la sécurité et le bon fonctionnement de l'application</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">4. Base légale</h2>
          <p className="text-sm text-muted-foreground">
            Le traitement des données est fondé sur l'exécution d'une mission d'intérêt public (article 6.1.e du RGPD)
            et le consentement de l'utilisateur pour les cookies non essentiels (article 6.1.a du RGPD).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">5. Durée de conservation</h2>
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
            <li><strong>Données de compte</strong> : conservées tant que le compte est actif, supprimées dans les 30 jours après demande de suppression</li>
            <li><strong>Données d'audit</strong> : conservées pendant la durée de l'exercice comptable + 10 ans (obligations légales)</li>
            <li><strong>Données nominatives d'élèves</strong> : conservées uniquement le temps de l'audit, supprimées à la clôture</li>
            <li><strong>Cookies de session</strong> : durée de la session ou 30 jours maximum</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">6. Destinataires des données</h2>
          <p className="text-sm text-muted-foreground">
            Les données sont accessibles uniquement à l'utilisateur connecté. Aucune donnée n'est partagée avec des tiers
            à des fins commerciales ou publicitaires. L'hébergement est assuré par des serveurs sécurisés en Europe (RGPD compliant).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">7. Vos droits (RGPD)</h2>
          <p className="text-sm text-muted-foreground">Conformément au Règlement Général sur la Protection des Données, vous disposez des droits suivants :</p>
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
            <li><strong>Droit d'accès</strong> : obtenir une copie de vos données personnelles</li>
            <li><strong>Droit de rectification</strong> : corriger vos données inexactes</li>
            <li><strong>Droit à l'effacement</strong> : demander la suppression de votre compte et de vos données</li>
            <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré et lisible</li>
            <li><strong>Droit d'opposition</strong> : vous opposer au traitement de vos données</li>
            <li><strong>Droit à la limitation</strong> : demander la restriction du traitement</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Vous pouvez exercer ces droits depuis la page{' '}
            <NavLink to="/parametres" className="text-primary hover:underline">Paramètres</NavLink>{' '}
            de votre compte (export et suppression de données) ou en contactant le responsable du traitement.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">8. Cookies</h2>
          <p className="text-sm text-muted-foreground">
            L'application utilise exclusivement des cookies techniques nécessaires au fonctionnement :
          </p>
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
            <li><strong>Cookie de session</strong> : maintien de votre connexion sécurisée</li>
            <li><strong>Cookie de préférences</strong> : sauvegarde de vos choix d'affichage</li>
            <li><strong>Cookie de consentement</strong> : mémorisation de votre choix RGPD</li>
          </ul>
          <p className="text-sm text-muted-foreground">Aucun cookie de traçage ou publicitaire n'est utilisé.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">9. Sécurité</h2>
          <p className="text-sm text-muted-foreground">
            Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :
            chiffrement des communications (HTTPS), authentification sécurisée, politiques de sécurité au niveau des données (RLS),
            hébergement européen conforme au RGPD.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">10. Réclamation</h2>
          <p className="text-sm text-muted-foreground">
            Si vous estimez que le traitement de vos données n'est pas conforme, vous pouvez adresser une réclamation
            à la CNIL (Commission Nationale de l'Informatique et des Libertés) : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.cnil.fr</a>
          </p>
        </section>
      </div>
    </div>
  );
}

```

### FICHIER : src/pages/RapprochementBancaire.tsx

```tsx
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { RapprochementItem, fmt, fmtDate } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';
import { CONTROLES_RAPPROCHEMENT } from '@/lib/regulatory-data';
import { ModulePageLayout, AnomalyAlert, ComplianceCheck, ModuleSection } from '@/components/ModulePageLayout';
import { ControlAlert } from '@/components/ControlAlert';
import { DoctrineEPLE } from '@/components/DoctrineEPLE';

export default function RapprochementBancaire() {
  const [items, setItems] = useState<RapprochementItem[]>(() => loadState('rapprochement', []));
  const [regChecks, setRegChecks] = useState<Record<string, boolean>>(() => loadState('rapprochement_checks', {}));
  const toggleRegCheck = (id: string) => { const u = { ...regChecks, [id]: !regChecks[id] }; setRegChecks(u); saveState('rapprochement_checks', u); };
  const [form, setForm] = useState<any>(null);
  const save = (d: RapprochementItem[]) => { setItems(d); saveState('rapprochement', d); };

  const submit = () => {
    if (!form) return;
    const dft = parseFloat(form.dft) || 0, compta = parseFloat(form.compta) || 0;
    const item: RapprochementItem = { id: form.id || crypto.randomUUID(), date: form.date, dft, compta, ecart: +(dft - compta).toFixed(2), suspens: parseInt(form.suspens) || 0, statut: Math.abs(dft - compta) < 0.01 ? 'Concordant' : 'Écart', observations: form.observations };
    if (form.id) save(items.map(i => i.id === form.id ? item : i));
    else save([item, ...items]);
    setForm(null);
  };

  const ecarts = items.filter(x => x.ecart !== 0);

  return (
    <ModulePageLayout
      title="Rapprochement bancaire"
      section="CONTRÔLES SUR PLACE"
      description="État de rapprochement entre le solde du compte au Trésor (DFT, compte 515) et la comptabilité de l'EPLE dans Op@le. Identification et justification des suspens."
      refs={[
        { code: 'M9-6 § 3.1.3', label: 'Rapprochement bancaire' },
        { code: 'Art. 18 GBCP', label: 'Contrôle du comptable' },
        { code: 'C/515100', label: 'Compte au Trésor' },
      ]}
      headerActions={
        <Button className="bg-white/20 hover:bg-white/30 text-white border-white/25" variant="outline"
          onClick={() => setForm({ date: new Date().toISOString().split('T')[0], dft: '', compta: '', suspens: '0', observations: '' })}
        ><Plus className="h-4 w-4 mr-2" /> Nouveau rapprochement</Button>
      }
      completedChecks={(CONTROLES_RAPPROCHEMENT).filter(c => regChecks[c.id]).length}
      totalChecks={(CONTROLES_RAPPROCHEMENT).length}
    >
      <DoctrineEPLE theme="rapprochement" titre="Rapprochement bancaire (DFT / 515)" resume="État mensuel, suspens > 30 j, concordance permanente" />
      {/* ─── KPI ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold">{items.length}</p><p className="text-xs text-muted-foreground">Rapprochements</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className={`text-2xl font-bold ${ecarts.length > 0 ? 'text-destructive' : 'text-green-600'}`}>{ecarts.length}</p><p className="text-xs text-muted-foreground">Écarts</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold">{items.reduce((s, x) => s + x.suspens, 0)}</p><p className="text-xs text-muted-foreground">Suspens totaux</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold text-green-600">{items.filter(x => x.statut === 'Concordant').length}</p><p className="text-xs text-muted-foreground">Concordants</p></CardContent></Card>
      </div>

      {/* Contrôles réglementaires */}
      <ModuleSection title="Contrôles réglementaires — Rapprochement" description="M9-6 § 3.1.3" badge={`${(CONTROLES_RAPPROCHEMENT).filter(c => regChecks[c.id]).length}/${(CONTROLES_RAPPROCHEMENT).length}`}>
        <Card className="shadow-card">
          <CardContent className="p-3 space-y-2">
            {CONTROLES_RAPPROCHEMENT.map(item => (
              <ComplianceCheck
                key={item.id}
                label={item.label}
                checked={regChecks[item.id] || false}
                onChange={() => toggleRegCheck(item.id)}
                severity={item.severity}
                detail={item.ref}
              />
            ))}
          </CardContent>
        </Card>
      </ModuleSection>

      {ecarts.length > 0 && (
        <>
          <AnomalyAlert title={`${ecarts.length} rapprochement${ecarts.length > 1 ? 's' : ''} avec écart non justifié`}
            description="Tout écart entre le solde DFT et la comptabilité doit être justifié par des opérations en suspens identifiées."
            severity="error" />
          <ControlAlert
            level="critique"
            title={`Écart non justifié entre la comptabilité et le compte au Trésor — ${ecarts.length} occurrence${ecarts.length > 1 ? 's' : ''}`}
            description={`Le solde du C/515100 (compte au Trésor / DFT) doit être strictement égal au solde comptable de l'EPLE après prise en compte des suspens. Tout écart résiduel engage la responsabilité financière de l'agent comptable (RGP — décret 2022-1605).`}
            action="Identifier l'origine de l'écart (chèques émis non débités, virements en transit, prélèvements non comptabilisés) et régulariser sans délai. Joindre le justificatif au prochain état de rapprochement."
            refKey="m96-3-1-3"
            refLabel="M9-6 § 3.1.3 — Rapprochement bancaire / Art. 18 GBCP"
          />
        </>
      )}

      {form && (
        <Card className="border-primary">
          <CardContent className="pt-6 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="space-y-1"><Label className="text-xs">Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Solde DFT (€)</Label><Input type="number" value={form.dft} onChange={e => setForm({ ...form, dft: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Solde comptabilité (€)</Label><Input type="number" value={form.compta} onChange={e => setForm({ ...form, compta: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Suspens</Label><Input type="number" value={form.suspens} onChange={e => setForm({ ...form, suspens: e.target.value })} /></div>
            </div>
            <Textarea value={form.observations} onChange={e => setForm({ ...form, observations: e.target.value })} placeholder="Observations..." rows={2} />
            <div className="flex gap-2"><Button onClick={submit}>Valider</Button><Button variant="outline" onClick={() => setForm(null)}>Annuler</Button></div>
          </CardContent>
        </Card>
      )}

      {items.length === 0 && !form && <Card><CardContent className="py-12 text-center text-muted-foreground">Aucun rapprochement enregistré.</CardContent></Card>}

      {items.map(x => (
        <Card key={x.id} className={x.ecart !== 0 ? 'border-destructive' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div><span className="font-bold">{fmtDate(x.date)}</span> <Badge variant={x.statut === 'Concordant' ? 'secondary' : 'destructive'} className="ml-2">{x.statut}</Badge></div>
              <Button variant="ghost" size="icon" onClick={() => save(items.filter(i => i.id !== x.id))}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
            <div className="grid grid-cols-4 gap-3 text-sm">
              <div><span className="text-muted-foreground text-xs">DFT</span><p className="font-mono font-bold">{fmt(x.dft)}</p></div>
              <div><span className="text-muted-foreground text-xs">Comptabilité</span><p className="font-mono font-bold">{fmt(x.compta)}</p></div>
              <div><span className="text-muted-foreground text-xs">Écart</span><p className={`font-mono font-bold ${x.ecart === 0 ? 'text-green-600' : 'text-destructive'}`}>{fmt(x.ecart)}</p></div>
              <div><span className="text-muted-foreground text-xs">Suspens</span><p className="font-bold">{x.suspens}</p></div>
            </div>
            {x.observations && <p className="text-xs text-muted-foreground mt-2">{x.observations}</p>}
          </CardContent>
        </Card>
      ))}
    </ModulePageLayout>
  );
}

```

### FICHIER : src/pages/Recouvrement.tsx

```tsx
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { CreanceItem, fmt, fmtDate } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';
import { CONTROLES_RECOUVREMENT } from '@/lib/regulatory-data';
import { ModulePageLayout, AnomalyAlert, ComplianceCheck, ModuleSection } from '@/components/ModulePageLayout';
import { ControlAlert } from '@/components/ControlAlert';
import { DoctrineEPLE } from '@/components/DoctrineEPLE';

/* ═══ Prescription quadriennale (loi 31/12/1968) ═══ */
const PRESCRIPTION_ANS = 4;
const ALERTE_T_MOINS_JOURS = 90;

function joursAvantPrescription(dateEmission: string): number | null {
  if (!dateEmission) return null;
  const echeance = new Date(dateEmission);
  echeance.setFullYear(echeance.getFullYear() + PRESCRIPTION_ANS);
  return Math.ceil((echeance.getTime() - Date.now()) / 86400000);
}

export default function Recouvrement() {
  const [items, setItems] = useState<CreanceItem[]>(() => loadState('creances', []));
  const [regChecks, setRegChecks] = useState<Record<string, boolean>>(() => loadState('recouvrement_checks', {}));
  const toggleRegCheck = (id: string) => { const u = { ...regChecks, [id]: !regChecks[id] }; setRegChecks(u); saveState('recouvrement_checks', u); };
  const [form, setForm] = useState<any>(null);
  const save = (d: CreanceItem[]) => { setItems(d); saveState('creances', d); };

  const submit = () => {
    if (!form || !form.debiteur) return;
    const item: CreanceItem = { id: form.id || crypto.randomUUID(), debiteur: form.debiteur, nature: form.nature, montant: parseFloat(form.montant) || 0, dateEmission: form.dateEmission, echeance: form.echeance, relances: parseInt(form.relances) || 0, derniereRelance: form.derniereRelance, statut: form.statut, observations: form.observations };
    if (form.id) save(items.map(i => i.id === form.id ? item : i));
    else save([...items, item]);
    setForm(null);
  };

  const totalMontant = items.reduce((s, x) => s + x.montant, 0);
  const contentieux = items.filter(x => x.statut === 'Contentieux');
  const anciennes = items.filter(x => {
    if (!x.dateEmission) return false;
    return (Date.now() - new Date(x.dateEmission).getTime()) > 60 * 86400000;
  });

  /* ═══ Prescription quadriennale — créances dans la zone d'alerte (T-90j) ou prescrites ═══ */
  const prescriptionAlert = items
    .map(x => ({ ...x, joursRestants: joursAvantPrescription(x.dateEmission) }))
    .filter(x => x.joursRestants !== null && x.statut !== 'ANV' && x.joursRestants <= ALERTE_T_MOINS_JOURS);
  const prescrites = prescriptionAlert.filter(x => (x.joursRestants ?? 0) <= 0);
  const prochesPrescription = prescriptionAlert.filter(x => (x.joursRestants ?? 0) > 0);

  return (
    <ModulePageLayout
      title="Recouvrement des créances"
      section="FINANCES & BUDGET"
      description="Suivi des créances à recouvrer, relances, et procédure de recouvrement contentieux sous le régime RGP. Toute carence dans le recouvrement engage la responsabilité du gestionnaire public."
      refs={[
        { refKey: 'rgp-l131-9', label: 'RGP' },
        { refKey: 'gbcp-art20', label: 'Diligences AC' },
        { refKey: 'presc-quadri', label: 'Prescription 4 ans' },
        { refKey: 'anv-procedure', label: 'Admission non-valeur' },
      ]}
      headerActions={
        <Button className="bg-white/20 hover:bg-white/30 text-white border-white/25" variant="outline"
          onClick={() => setForm({ debiteur: '', nature: '', montant: '', dateEmission: '', echeance: '', relances: '0', derniereRelance: '', statut: 'Relance amiable', observations: '' })}
        ><Plus className="h-4 w-4 mr-2" /> Nouvelle créance</Button>
      }
      completedChecks={(CONTROLES_RECOUVREMENT).filter(c => regChecks[c.id]).length}
      totalChecks={(CONTROLES_RECOUVREMENT).length}
    >
      <DoctrineEPLE theme="recouvrement" titre="Recouvrement des créances" resume="Art. 24 GBCP — diligences obligatoires, prescription 4 ans, ANV motivée" />

      {/* ─── KPI ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold">{items.length}</p><p className="text-xs text-muted-foreground">Créances suivies</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold text-destructive">{fmt(totalMontant)}</p><p className="text-xs text-muted-foreground">Montant total</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold text-destructive">{contentieux.length}</p><p className="text-xs text-muted-foreground">Contentieux</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className={`text-2xl font-bold ${prescriptionAlert.length > 0 ? 'text-destructive' : 'text-green-600'}`}>{prescriptionAlert.length}</p><p className="text-xs text-muted-foreground">Prescription &lt; 90 j</p></CardContent></Card>
      </div>

      {/* ═══ ALERTES PRESCRIPTION QUADRIENNALE ═══ */}
      {prescrites.length > 0 && (
        <ControlAlert level="critique"
          title={`${prescrites.length} créance${prescrites.length > 1 ? 's' : ''} PRESCRITE${prescrites.length > 1 ? 'S' : ''} (loi 31/12/1968)`}
          description={`Total prescrit : ${fmt(prescrites.reduce((s, p) => s + p.montant, 0))}. La prescription quadriennale rend la créance définitivement irrécouvrable. Sans diligences prouvées, la responsabilité personnelle et pécuniaire de l'agent comptable peut être engagée par la chambre régionale des comptes.`}
          refKey="presc-quadri"
          action="Préparer immédiatement le dossier d'admission en non-valeur (ANV) avec justification des diligences effectuées et soumettre au CA." />
      )}
      {prochesPrescription.length > 0 && (
        <ControlAlert level="alerte"
          title={`${prochesPrescription.length} créance${prochesPrescription.length > 1 ? 's' : ''} en zone d'alerte prescription (T-${ALERTE_T_MOINS_JOURS} j)`}
          description={`Débiteurs : ${prochesPrescription.map(p => `${p.debiteur} (${p.joursRestants} j restants)`).join(' • ')}. Toute carence engage la RPP de l'agent comptable.`}
          refKey="presc-quadri"
          action="Émettre une mise en demeure interruptive de prescription par lettre recommandée AR sous 15 jours, puis engager la procédure contentieuse." />
      )}

      {/* Contrôles réglementaires */}
      <ModuleSection title="Contrôles réglementaires — Recouvrement" description="Art. 20 GBCP — Ordonnance 2022-408 (RGP)" badge={`${(CONTROLES_RECOUVREMENT).filter(c => regChecks[c.id]).length}/${(CONTROLES_RECOUVREMENT).length}`}>
        <Card className="shadow-card">
          <CardContent className="p-3 space-y-2">
            {CONTROLES_RECOUVREMENT.map(item => (
              <ComplianceCheck
                key={item.id}
                label={item.label}
                checked={regChecks[item.id] || false}
                onChange={() => toggleRegCheck(item.id)}
                severity={item.severity}
                detail={item.ref}
              />
            ))}
          </CardContent>
        </Card>
      </ModuleSection>

      {anciennes.length > 0 && (
        <AnomalyAlert
          title={`${anciennes.length} créance${anciennes.length > 1 ? 's' : ''} de plus de 60 jours sans recouvrement`}
          description="Sous le régime RGP (ordonnance 2022-408), toute carence dans le recouvrement engage la responsabilité du gestionnaire public. Des relances systématiques puis une mise en demeure sont obligatoires."
          severity="error"
        />
      )}

      {form && (
        <Card className="border-primary"><CardContent className="pt-6 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1"><Label className="text-xs">Débiteur</Label><Input value={form.debiteur} onChange={e => setForm({ ...form, debiteur: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Nature</Label><Input value={form.nature} onChange={e => setForm({ ...form, nature: e.target.value })} placeholder="DP T1, Cantine..." /></div>
            <div className="space-y-1"><Label className="text-xs">Montant (€)</Label><Input type="number" value={form.montant} onChange={e => setForm({ ...form, montant: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Date émission</Label><Input type="date" value={form.dateEmission} onChange={e => setForm({ ...form, dateEmission: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Échéance</Label><Input type="date" value={form.echeance} onChange={e => setForm({ ...form, echeance: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Nb relances</Label><Input type="number" value={form.relances} onChange={e => setForm({ ...form, relances: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Dernière relance</Label><Input type="date" value={form.derniereRelance} onChange={e => setForm({ ...form, derniereRelance: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Statut</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.statut} onChange={e => setForm({ ...form, statut: e.target.value })}>
                <option>Relance amiable</option><option>Contentieux</option><option>Titre exécutoire</option><option>ANV</option>
              </select>
            </div>
            <div className="space-y-1"><Label className="text-xs">Observations</Label><Input value={form.observations} onChange={e => setForm({ ...form, observations: e.target.value })} /></div>
          </div>
          <div className="flex gap-2"><Button onClick={submit}>Valider</Button><Button variant="outline" onClick={() => setForm(null)}>Annuler</Button></div>
        </CardContent></Card>
      )}

      {items.length === 0 && !form && <Card><CardContent className="py-12 text-center text-muted-foreground">Aucune créance.</CardContent></Card>}
      {items.length > 0 && (
        <>
          {/* Vue desktop */}
          <Card className="shadow-card hidden md:block"><CardContent className="pt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">Débiteur</th><th className="p-2">Nature</th><th className="text-right p-2">Montant</th><th className="p-2">Relances</th><th className="p-2">Statut</th><th></th></tr></thead>
              <tbody>{items.map(x => (
                <tr key={x.id} className={`border-b ${x.statut === 'Contentieux' ? 'bg-destructive/5' : ''}`}>
                  <td className="p-2 font-bold">{x.debiteur}</td><td className="p-2">{x.nature}</td>
                  <td className="p-2 text-right font-mono font-bold">{fmt(x.montant)}</td>
                  <td className="p-2 text-center">{x.relances}</td>
                  <td className="p-2"><Badge variant={x.statut === 'Contentieux' ? 'destructive' : 'default'}>{x.statut}</Badge></td>
                  <td className="p-2"><div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setForm({ ...x, montant: String(x.montant), relances: String(x.relances) })}><Pencil className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => save(items.filter(i => i.id !== x.id))}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          </CardContent></Card>
          {/* Vue mobile */}
          <div className="md:hidden space-y-2">
            {items.map(x => (
              <Card key={x.id} className={x.statut === 'Contentieux' ? 'border-destructive' : ''}>
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{x.debiteur}</span>
                    <Badge variant={x.statut === 'Contentieux' ? 'destructive' : 'default'} className="text-xs">{x.statut}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                    <span>Nature : {x.nature}</span>
                    <span>Relances : {x.relances}</span>
                    <span className="font-mono font-bold text-foreground col-span-2">{fmt(x.montant)}</span>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setForm({ ...x, montant: String(x.montant), relances: String(x.relances) })}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => save(items.filter(i => i.id !== x.id))}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </ModulePageLayout>
  );
}

```

### FICHIER : src/pages/Regies.tsx

```tsx
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { BILLETS, PIECES, fmt, fmtDate } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { REGIES_REGLEMENTATION } from '@/lib/regulatory-data';
import { ModulePageLayout, ComplianceCheck, ModuleSection } from '@/components/ModulePageLayout';
import { ControlAlert } from '@/components/ControlAlert';
import { DoctrineEPLE } from '@/components/DoctrineEPLE';

/* ═══ SEUILS RÉGLEMENTAIRES ═══ */
/* Cautionnement SUPPRIMÉ depuis l'Ord. 2022-408 + Décret 2022-1605 (entrée en vigueur 1er janvier 2023) */
const SEUIL_IR_REGISSEUR = 1220;  // €  — IR (indemnité de responsabilité) demeure due si plafond > 1220 € (arrêté 28/05/1993)

/* ═══ TYPES ═══ */
interface ControleCaisseItem {
  id: string; date: string; regisseur: string; type: string;
  plafond: number; theorique: number; reel: number; ecart: number;
  statut: string; observations: string;
  journalCaisse: boolean | null; billetage: Record<string, number>;
}

interface ChequesCoffre {
  id: string; numero: string; emetteur: string; montant: number; date: string; observations: string;
}

interface ValeurInactive {
  id: string; type: string; serieDebut: string; serieFin: string; quantite: number; valeurUnitaire: number; observations: string;
}

interface ActeConstitutif {
  dateCreation: string; referenceArrete: string; typeRegie: string;
  montantPlafond: number; montantAvance: number; dureeAvance: string;
  objetRegie: string; observations: string;
}

interface NominationRegisseur {
  nom: string; prenom: string; fonction: string; dateNomination: string;
  referenceArrete: string; suppleant: string; dateSuppleance: string;
  formationRegie: boolean; dateFormation: string; observations: string;
  irMontantAnnuel: number; irVersee: boolean;
}

export default function RegiesPage() {
  // ═══ COMPTAGE CAISSE ═══
  const [controles, setControles] = useState<ControleCaisseItem[]>(() => loadState('ctrl_caisse', []));
  const [formCtrl, setFormCtrl] = useState<any>(null);

  // ═══ CHÈQUES COFFRE ═══
  const [cheques, setCheques] = useState<ChequesCoffre[]>(() => loadState('regies_cheques', []));
  const [formCheque, setFormCheque] = useState<any>(null);

  // ═══ VALEURS INACTIVES ═══
  const [valeurs, setValeurs] = useState<ValeurInactive[]>(() => loadState('regies_valeurs_inactives', []));
  const [formValeur, setFormValeur] = useState<any>(null);

  // ═══ ACTE CONSTITUTIF ═══
  const [acte, setActe] = useState<ActeConstitutif>(() => loadState('regies_acte_constitutif', {
    dateCreation: '', referenceArrete: '', typeRegie: 'Avances', montantPlafond: 0,
    montantAvance: 0, dureeAvance: '', objetRegie: '', observations: '',
  }));

  // ═══ NOMINATION RÉGISSEUR ═══
  const [nomination, setNomination] = useState<NominationRegisseur>(() => loadState('regies_nomination', {
    nom: '', prenom: '', fonction: '', dateNomination: '', referenceArrete: '',
    suppleant: '', dateSuppleance: '', formationRegie: false, dateFormation: '', observations: '',
    irMontantAnnuel: 0, irVersee: false,
  }));

  // ═══ DFT ═══
  const [dftMontant, setDftMontant] = useState<string>(() => loadState('regies_dft_montant', ''));
  const [dftDateEncaissement, setDftDateEncaissement] = useState<string>(() => loadState('regies_dft_date_enc', ''));
  const [dftDateVersement, setDftDateVersement] = useState<string>(() => loadState('regies_dft_date_ver', ''));
  const [regChecks, setRegChecks] = useState<Record<string, boolean>>(() => loadState('regies_reg_checks', {}));
  const toggleRegCheck = (id: string) => { const u = { ...regChecks, [id]: !regChecks[id] }; setRegChecks(u); saveState('regies_reg_checks', u); };

  const saveControles = (d: ControleCaisseItem[]) => { setControles(d); saveState('ctrl_caisse', d); };
  const saveCheques = (d: ChequesCoffre[]) => { setCheques(d); saveState('regies_cheques', d); };
  const saveValeurs = (d: ValeurInactive[]) => { setValeurs(d); saveState('regies_valeurs_inactives', d); };
  const updateActe = (k: string, v: any) => { const n = { ...acte, [k]: v }; setActe(n); saveState('regies_acte_constitutif', n); };
  const updateNom = (k: string, v: any) => { const n = { ...nomination, [k]: v }; setNomination(n); saveState('regies_nomination', n); };

  const billetageTotal = (b: Record<string, number>) => {
    let t = 0;
    BILLETS.forEach(v => { t += (b['b' + v] || 0) * v; });
    PIECES.forEach(v => { const k = 'p' + String(v).replace('.', ''); t += (b[k] || 0) * v; });
    return t;
  };

  const submitCtrl = () => {
    if (!formCtrl) return;
    const reel = parseFloat(formCtrl.reel) || 0;
    const theo = parseFloat(formCtrl.theorique) || 0;
    const ecart = reel - theo;
    const item: ControleCaisseItem = {
      id: formCtrl.id || crypto.randomUUID(), date: formCtrl.date, regisseur: formCtrl.regisseur,
      type: formCtrl.type, plafond: parseFloat(formCtrl.plafond) || 0, theorique: theo, reel,
      ecart, statut: Math.abs(ecart) < 0.01 ? 'Conforme' : 'Écart', observations: formCtrl.observations,
      journalCaisse: formCtrl.journalCaisse, billetage: formCtrl.billetage || {},
    };
    if (formCtrl.id) saveControles(controles.map(i => i.id === formCtrl.id ? item : i));
    else saveControles([item, ...controles]);
    setFormCtrl(null);
  };

  const submitCheque = () => {
    if (!formCheque) return;
    const item: ChequesCoffre = { id: formCheque.id || crypto.randomUUID(), numero: formCheque.numero, emetteur: formCheque.emetteur, montant: parseFloat(formCheque.montant) || 0, date: formCheque.date, observations: formCheque.observations };
    if (formCheque.id) saveCheques(cheques.map(i => i.id === formCheque.id ? item : i));
    else saveCheques([...cheques, item]);
    setFormCheque(null);
  };

  const submitValeur = () => {
    if (!formValeur) return;
    const item: ValeurInactive = { id: formValeur.id || crypto.randomUUID(), type: formValeur.type, serieDebut: formValeur.serieDebut, serieFin: formValeur.serieFin, quantite: parseInt(formValeur.quantite) || 0, valeurUnitaire: parseFloat(formValeur.valeurUnitaire) || 0, observations: formValeur.observations };
    if (formValeur.id) saveValeurs(valeurs.map(i => i.id === formValeur.id ? item : i));
    else saveValeurs([...valeurs, item]);
    setFormValeur(null);
  };

  const totalCheques = cheques.reduce((s, c) => s + c.montant, 0);
  const totalValeurs = valeurs.reduce((s, v) => s + v.quantite * v.valeurUnitaire, 0);

  const joursDFT = useMemo(() => {
    if (!dftDateEncaissement || !dftDateVersement) return null;
    const d1 = new Date(dftDateEncaissement);
    const d2 = new Date(dftDateVersement);
    const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? diff : null;
  }, [dftDateEncaissement, dftDateVersement]);

  return (
    <ModulePageLayout
      title="Régies"
      section="CONTRÔLES SUR PLACE"
      description="Contrôle des régies d'avances et de recettes : acte constitutif, nomination, comptage de caisse, chèques en coffre, valeurs inactives et délai de versement au comptable. (Cautionnement supprimé depuis l'Ord. 2022-408 — RGP)"
      refs={[
        { refKey: 'reg-2019-798', label: 'Plafonds' },
        { refKey: 'reg-acte-constitutif', label: 'Acte constitutif' },
        { refKey: 'reg-nomination', label: 'Nomination' },
        { refKey: 'reg-controle-inopine', label: 'Contrôle inopiné' },
        { refKey: 'reg-dft', label: 'DFT' },
        { refKey: 'm96-3.2', label: 'M9-6 § 3.2' },
      ]}
      completedChecks={(REGIES_REGLEMENTATION.controles_obligatoires).filter(c => regChecks[c.id]).length}
      totalChecks={(REGIES_REGLEMENTATION.controles_obligatoires).length}
    >
      <DoctrineEPLE theme="regies" titre="Régies de recettes et d'avances" resume="Décret 2019-798 — contrôle annuel obligatoire, plafonds, IR (cautionnement supprimé — Ord. 2022-408)" />

      <Tabs defaultValue="comptage" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="comptage">Comptage caisse</TabsTrigger>
          <TabsTrigger value="cheques">Chèques coffre</TabsTrigger>
          <TabsTrigger value="valeurs">Valeurs inactives</TabsTrigger>
          <TabsTrigger value="acte">Acte constitutif</TabsTrigger>
          <TabsTrigger value="nomination">Nomination</TabsTrigger>
        </TabsList>

        {/* ═══ ONGLET COMPTAGE CAISSE ═══ */}
        <TabsContent value="comptage" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setFormCtrl({ date: new Date().toISOString().split('T')[0], regisseur: '', type: 'Avances restauration', plafond: '', theorique: '', reel: '', observations: '', journalCaisse: null, billetage: {} })}>
              <Plus className="h-4 w-4 mr-2" /> Nouveau contrôle
            </Button>
          </div>

          {formCtrl && (
            <Card className="border-primary">
              <CardHeader><CardTitle className="text-lg">Saisie du contrôle</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1"><Label className="text-xs">Date</Label><Input type="date" value={formCtrl.date} onChange={e => setFormCtrl({ ...formCtrl, date: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Régisseur</Label><Input value={formCtrl.regisseur} onChange={e => setFormCtrl({ ...formCtrl, regisseur: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Type</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formCtrl.type} onChange={e => setFormCtrl({ ...formCtrl, type: e.target.value })}>
                      <option>Avances restauration</option><option>Avances voyages</option><option>Recettes restauration</option><option>Recettes voyages</option><option>Menues dépenses</option><option>Autre</option>
                    </select>
                  </div>
                  <div className="space-y-1"><Label className="text-xs">Plafond (€)</Label><Input type="number" value={formCtrl.plafond} onChange={e => setFormCtrl({ ...formCtrl, plafond: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Solde théorique (€)</Label><Input type="number" value={formCtrl.theorique} onChange={e => setFormCtrl({ ...formCtrl, theorique: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Solde réel compté (€)</Label><Input type="number" value={formCtrl.reel} onChange={e => setFormCtrl({ ...formCtrl, reel: e.target.value })} /></div>
                </div>

                {/* Billetage */}
                <div className="p-4 rounded-lg border border-primary bg-primary/5">
                  <h4 className="text-sm font-bold text-primary mb-3">Billétage — Comptage des espèces</h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-bold mb-2">Billets</p>
                      {BILLETS.map(v => (
                        <div key={v} className="flex items-center gap-2 mb-1">
                          <span className="text-xs w-12 text-right font-semibold">{v} €</span>
                          <Input type="number" min={0} className="w-16 h-7 text-xs" value={formCtrl.billetage?.['b' + v] || ''} onChange={e => setFormCtrl({ ...formCtrl, billetage: { ...formCtrl.billetage, ['b' + v]: parseInt(e.target.value) || 0 } })} />
                          <span className="text-xs text-muted-foreground">{((formCtrl.billetage?.['b' + v] || 0) * v).toFixed(2)} €</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs font-bold mb-2">Pièces</p>
                      {PIECES.map(v => {
                        const k = 'p' + String(v).replace('.', '');
                        return (
                          <div key={v} className="flex items-center gap-2 mb-1">
                            <span className="text-xs w-12 text-right font-semibold">{v < 1 ? `${(v * 100).toFixed(0)}c` : `${v} €`}</span>
                            <Input type="number" min={0} className="w-16 h-7 text-xs" value={formCtrl.billetage?.[k] || ''} onChange={e => setFormCtrl({ ...formCtrl, billetage: { ...formCtrl.billetage, [k]: parseInt(e.target.value) || 0 } })} />
                            <span className="text-xs text-muted-foreground">{((formCtrl.billetage?.[k] || 0) * v).toFixed(2)} €</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="mt-3 p-2 bg-primary/10 rounded flex items-center justify-between">
                    <span className="font-bold text-primary">Total compté : {billetageTotal(formCtrl.billetage || {}).toFixed(2)} €</span>
                    <Button size="sm" variant="outline" onClick={() => setFormCtrl({ ...formCtrl, reel: billetageTotal(formCtrl.billetage || {}).toFixed(2) })}>↓ Reporter</Button>
                  </div>
                </div>

                {/* Journal de caisse */}
                <div className={`p-3 rounded-lg border ${formCtrl.journalCaisse === false ? 'border-destructive bg-destructive/10' : formCtrl.journalCaisse === true ? 'border-green-500 bg-green-50' : 'border-border'}`}>
                  <p className="text-xs font-bold mb-2">Journal de caisse — Vérification réglementaire</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant={formCtrl.journalCaisse === true ? 'default' : 'outline'} onClick={() => setFormCtrl({ ...formCtrl, journalCaisse: true })}>✓ Présent</Button>
                    <Button size="sm" variant={formCtrl.journalCaisse === false ? 'destructive' : 'outline'} onClick={() => setFormCtrl({ ...formCtrl, journalCaisse: false })}>✗ Absent</Button>
                  </div>
                  {formCtrl.journalCaisse === false && <p className="text-xs text-destructive mt-2 font-bold">ANOMALIE MAJEURE — Absence de journal de caisse.</p>}
                </div>

                <Textarea value={formCtrl.observations} onChange={e => setFormCtrl({ ...formCtrl, observations: e.target.value })} placeholder="Observations..." rows={2} />
                <div className="flex gap-2">
                  <Button onClick={submitCtrl}>Valider</Button>
                  <Button variant="outline" onClick={() => setFormCtrl(null)}>Annuler</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {controles.length === 0 && !formCtrl && <Card className="shadow-card"><CardContent className="py-12 text-center text-muted-foreground">Aucun contrôle de caisse. Cliquez « Nouveau contrôle ».</CardContent></Card>}

          {controles.map(x => (
            <Card key={x.id} className={x.ecart !== 0 ? 'border-destructive' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div><span className="font-bold">{fmtDate(x.date)}</span> — {x.regisseur} <Badge variant={x.statut === 'Conforme' ? 'secondary' : 'destructive'} className="ml-2">{x.statut}</Badge></div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setFormCtrl({ ...x, plafond: String(x.plafond), theorique: String(x.theorique), reel: String(x.reel) })}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => saveControles(controles.filter(i => i.id !== x.id))}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3 text-sm">
                  <div><span className="text-muted-foreground text-xs">Théorique</span><p className="font-mono font-bold">{fmt(x.theorique)}</p></div>
                  <div><span className="text-muted-foreground text-xs">Réel</span><p className="font-mono font-bold">{fmt(x.reel)}</p></div>
                  <div><span className="text-muted-foreground text-xs">Écart</span><p className={`font-mono font-bold ${x.ecart === 0 ? 'text-green-600' : 'text-destructive'}`}>{fmt(x.ecart)}</p></div>
                  <div><span className="text-muted-foreground text-xs">Journal</span><p className="font-bold">{x.journalCaisse === true ? '✓' : x.journalCaisse === false ? '✗ ABSENT' : '—'}</p></div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* DFT */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Délai de versement DFT</CardTitle>
              <p className="text-xs text-muted-foreground">Nombre de jours durant lesquels un montant est resté sur le compte DFT du régisseur sans être versé.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Montant (€)</Label><Input type="number" value={dftMontant} onChange={e => { setDftMontant(e.target.value); saveState('regies_dft_montant', e.target.value); }} /></div>
                <div className="space-y-2"><Label>Date d'encaissement</Label><Input type="date" value={dftDateEncaissement} onChange={e => { setDftDateEncaissement(e.target.value); saveState('regies_dft_date_enc', e.target.value); }} /></div>
                <div className="space-y-2"><Label>Date de versement</Label><Input type="date" value={dftDateVersement} onChange={e => { setDftDateVersement(e.target.value); saveState('regies_dft_date_ver', e.target.value); }} /></div>
              </div>
              {joursDFT !== null && (
                <div className={`p-4 rounded-lg border ${joursDFT > 7 ? 'bg-destructive/10 border-destructive' : 'bg-green-50 border-green-300'}`}>
                  <p className="text-2xl font-bold text-center">{joursDFT} jour{joursDFT > 1 ? 's' : ''}</p>
                  <p className="text-sm text-center text-muted-foreground">
                    {joursDFT > 7 ? '⚠️ Délai supérieur à 7 jours — rappeler les obligations réglementaires au régisseur.' : '✅ Délai de versement conforme.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ ONGLET CHÈQUES COFFRE ═══ */}
        <TabsContent value="cheques" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Chèques trouvés dans le coffre-fort lors du contrôle</p>
            <Button onClick={() => setFormCheque({ numero: '', emetteur: '', montant: '', date: new Date().toISOString().split('T')[0], observations: '' })}><Plus className="h-4 w-4 mr-2" /> Ajouter un chèque</Button>
          </div>

          {formCheque && (
            <Card className="border-primary">
              <CardContent className="pt-6 space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1"><Label className="text-xs">N° chèque</Label><Input value={formCheque.numero} onChange={e => setFormCheque({ ...formCheque, numero: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Émetteur</Label><Input value={formCheque.emetteur} onChange={e => setFormCheque({ ...formCheque, emetteur: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Montant (€)</Label><Input type="number" value={formCheque.montant} onChange={e => setFormCheque({ ...formCheque, montant: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Date</Label><Input type="date" value={formCheque.date} onChange={e => setFormCheque({ ...formCheque, date: e.target.value })} /></div>
                </div>
                <Input placeholder="Observations" value={formCheque.observations} onChange={e => setFormCheque({ ...formCheque, observations: e.target.value })} />
                <div className="flex gap-2"><Button onClick={submitCheque}>Valider</Button><Button variant="outline" onClick={() => setFormCheque(null)}>Annuler</Button></div>
              </CardContent>
            </Card>
          )}

          {cheques.length === 0 && !formCheque && <Card className="shadow-card"><CardContent className="py-12 text-center text-muted-foreground">Aucun chèque trouvé dans le coffre-fort.</CardContent></Card>}

          {cheques.length > 0 && (
            <>
              <Card className="shadow-card"><CardContent className="pt-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b text-xs text-muted-foreground"><th className="p-2">N°</th><th className="text-left p-2">Émetteur</th><th className="text-right p-2">Montant</th><th className="p-2">Date</th><th className="text-left p-2">Observations</th><th></th></tr></thead>
                  <tbody>{cheques.map(x => (
                    <tr key={x.id} className="border-b">
                      <td className="p-2 font-mono">{x.numero}</td><td className="p-2 font-bold">{x.emetteur}</td>
                      <td className="p-2 text-right font-mono font-bold">{fmt(x.montant)}</td>
                      <td className="p-2 text-xs">{fmtDate(x.date)}</td><td className="p-2 text-xs">{x.observations}</td>
                      <td className="p-2"><div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setFormCheque({ ...x, montant: String(x.montant) })}><Pencil className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => saveCheques(cheques.filter(i => i.id !== x.id))}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                      </div></td>
                    </tr>
                  ))}</tbody>
                </table>
              </CardContent></Card>
              <Card className="shadow-card"><CardContent className="pt-4 text-center"><p className="text-lg font-bold">Total chèques dans le coffre : {fmt(totalCheques)}</p></CardContent></Card>
            </>
          )}
        </TabsContent>

        {/* ═══ ONGLET VALEURS INACTIVES ═══ */}
        <TabsContent value="valeurs" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Tickets restaurant, timbres, bons d'essence, tickets de cantine, etc.</p>
            <Button onClick={() => setFormValeur({ type: 'Tickets restaurant', serieDebut: '', serieFin: '', quantite: '', valeurUnitaire: '', observations: '' })}><Plus className="h-4 w-4 mr-2" /> Ajouter</Button>
          </div>

          {formValeur && (
            <Card className="border-primary">
              <CardContent className="pt-6 space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="space-y-1"><Label className="text-xs">Type</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formValeur.type} onChange={e => setFormValeur({ ...formValeur, type: e.target.value })}>
                      <option>Tickets restaurant</option><option>Timbres fiscaux</option><option>Bons d'essence</option><option>Tickets cantine</option><option>Cartes de photocopie</option><option>Autre</option>
                    </select>
                  </div>
                  <div className="space-y-1"><Label className="text-xs">Série début</Label><Input value={formValeur.serieDebut} onChange={e => setFormValeur({ ...formValeur, serieDebut: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Série fin</Label><Input value={formValeur.serieFin} onChange={e => setFormValeur({ ...formValeur, serieFin: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Quantité</Label><Input type="number" value={formValeur.quantite} onChange={e => setFormValeur({ ...formValeur, quantite: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Valeur unitaire (€)</Label><Input type="number" value={formValeur.valeurUnitaire} onChange={e => setFormValeur({ ...formValeur, valeurUnitaire: e.target.value })} /></div>
                </div>
                <Input placeholder="Observations" value={formValeur.observations} onChange={e => setFormValeur({ ...formValeur, observations: e.target.value })} />
                <div className="flex gap-2"><Button onClick={submitValeur}>Valider</Button><Button variant="outline" onClick={() => setFormValeur(null)}>Annuler</Button></div>
              </CardContent>
            </Card>
          )}

          {valeurs.length === 0 && !formValeur && <Card className="shadow-card"><CardContent className="py-12 text-center text-muted-foreground">Aucune valeur inactive enregistrée.</CardContent></Card>}

          {valeurs.length > 0 && (
            <>
              <Card className="shadow-card"><CardContent className="pt-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">Type</th><th className="p-2">Série</th><th className="text-right p-2">Qté</th><th className="text-right p-2">Val. unit.</th><th className="text-right p-2">Total</th><th></th></tr></thead>
                  <tbody>{valeurs.map(x => (
                    <tr key={x.id} className="border-b">
                      <td className="p-2 font-bold">{x.type}</td>
                      <td className="p-2 font-mono text-xs">{x.serieDebut} → {x.serieFin}</td>
                      <td className="p-2 text-right font-mono">{x.quantite}</td>
                      <td className="p-2 text-right font-mono">{fmt(x.valeurUnitaire)}</td>
                      <td className="p-2 text-right font-mono font-bold">{fmt(x.quantite * x.valeurUnitaire)}</td>
                      <td className="p-2"><div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setFormValeur({ ...x, quantite: String(x.quantite), valeurUnitaire: String(x.valeurUnitaire) })}><Pencil className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => saveValeurs(valeurs.filter(i => i.id !== x.id))}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                      </div></td>
                    </tr>
                  ))}</tbody>
                </table>
              </CardContent></Card>
              <Card className="shadow-card"><CardContent className="pt-4 text-center"><p className="text-lg font-bold">Total valeurs inactives : {fmt(totalValeurs)}</p></CardContent></Card>
            </>
          )}
        </TabsContent>

        {/* ═══ ONGLET ACTE CONSTITUTIF ═══ */}
        <TabsContent value="acte" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader><CardTitle className="text-lg">Acte constitutif de la régie</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1"><Label className="text-xs">Date de création</Label><Input type="date" value={acte.dateCreation} onChange={e => updateActe('dateCreation', e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">Référence arrêté</Label><Input value={acte.referenceArrete} onChange={e => updateActe('referenceArrete', e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">Type de régie</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={acte.typeRegie} onChange={e => updateActe('typeRegie', e.target.value)}>
                    <option>Avances</option><option>Recettes</option><option>Avances et recettes</option>
                  </select>
                </div>
                <div className="space-y-1"><Label className="text-xs">Montant plafond de la régie (€)</Label><Input type="number" value={acte.montantPlafond || ''} onChange={e => updateActe('montantPlafond', parseFloat(e.target.value) || 0)} /></div>
                <div className="space-y-1"><Label className="text-xs">Montant de l'avance (€)</Label><Input type="number" value={acte.montantAvance || ''} onChange={e => updateActe('montantAvance', parseFloat(e.target.value) || 0)} /></div>
                <div className="space-y-1"><Label className="text-xs">Durée de l'avance</Label><Input value={acte.dureeAvance} onChange={e => updateActe('dureeAvance', e.target.value)} placeholder="Ex: 1 mois" /></div>
              </div>
              <div className="space-y-1"><Label className="text-xs">Objet de la régie</Label><Textarea value={acte.objetRegie} onChange={e => updateActe('objetRegie', e.target.value)} rows={2} placeholder="Ex: Menues dépenses de fonctionnement..." /></div>
              <div className="space-y-1"><Label className="text-xs">Observations</Label><Textarea value={acte.observations} onChange={e => updateActe('observations', e.target.value)} rows={3} /></div>

              {!acte.dateCreation && (
                <ControlAlert level="critique" title="Acte constitutif manquant"
                  description="L'acte constitutif de la régie n'est pas renseigné. Sa production est obligatoire avant tout fonctionnement."
                  refKey="reg-acte-constitutif" action="Récupérer l'arrêté du chef d'établissement et saisir la date de création." />
              )}

              {/* Information : suppression du cautionnement (Ord. 2022-408 + Décret 2022-1605) */}
              <ControlAlert level="info" title="Cautionnement du régisseur supprimé"
                description="Depuis le 1er janvier 2023, l'obligation de cautionnement des régisseurs des organismes publics est supprimée (Ord. 2022-408 du 21/03/2022 et Décret 2022-1605 du 22/12/2022). La RPP est remplacée par le Régime de Responsabilité des Gestionnaires Publics (RGP), jugé par la Cour des comptes."
                refKey="fin-cautionnement"
                action="Vérifier qu'aucun cautionnement résiduel ne figure encore dans les actes de nomination postérieurs au 01/01/2023." />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ ONGLET NOMINATION RÉGISSEUR ═══ */}
        <TabsContent value="nomination" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader><CardTitle className="text-lg">Acte de nomination du régisseur</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1"><Label className="text-xs">Nom</Label><Input value={nomination.nom} onChange={e => updateNom('nom', e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">Prénom</Label><Input value={nomination.prenom} onChange={e => updateNom('prenom', e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">Fonction</Label><Input value={nomination.fonction} onChange={e => updateNom('fonction', e.target.value)} placeholder="Ex: Secrétaire d'intendance" /></div>
                <div className="space-y-1"><Label className="text-xs">Date de nomination</Label><Input type="date" value={nomination.dateNomination} onChange={e => updateNom('dateNomination', e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">Référence arrêté</Label><Input value={nomination.referenceArrete} onChange={e => updateNom('referenceArrete', e.target.value)} /></div>
                <div className="space-y-1">
                  <Label className="text-xs">Suppléant désigné (Art. 10 Décret 2019-798)</Label>
                  <Input value={nomination.suppleant} onChange={e => updateNom('suppleant', e.target.value)} placeholder="Nom et prénom du suppléant" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Date de nomination du suppléant</Label>
                  <Input type="date" value={nomination.dateSuppleance} onChange={e => updateNom('dateSuppleance', e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg border border-border bg-muted/30">
                  <p className="text-xs font-bold mb-1">Suppléant</p>
                  <p className="text-sm">{nomination.suppleant || '—'}</p>
                  {nomination.dateSuppleance && <p className="text-xs text-muted-foreground mt-1">Nommé le {nomination.dateSuppleance}</p>}
                </div>

                <div className={`p-3 rounded-lg border ${nomination.formationRegie ? 'border-green-500 bg-green-50' : 'border-orange-400 bg-orange-50'}`}>
                  <p className="text-xs font-bold mb-2">Formation régie</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant={nomination.formationRegie ? 'default' : 'outline'} onClick={() => updateNom('formationRegie', true)}>✓ Suivie</Button>
                    <Button size="sm" variant={!nomination.formationRegie ? 'secondary' : 'outline'} onClick={() => updateNom('formationRegie', false)}>✗ Non suivie</Button>
                  </div>
                  {nomination.formationRegie && (
                    <div className="mt-2 space-y-1"><Label className="text-xs">Date de formation</Label><Input type="date" value={nomination.dateFormation} onChange={e => updateNom('dateFormation', e.target.value)} /></div>
                  )}
                </div>
              </div>

              {/* ═══ Indemnité de responsabilité (IR) — cautionnement supprimé Ord. 2022-408 ═══ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg border border-border bg-muted/30">
                  <p className="text-xs font-bold mb-2">Indemnité de responsabilité (IR)</p>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button size="sm" variant={nomination.irVersee ? 'default' : 'outline'} onClick={() => updateNom('irVersee', true)}>✓ Versée</Button>
                      <Button size="sm" variant={!nomination.irVersee ? 'secondary' : 'outline'} onClick={() => updateNom('irVersee', false)}>✗ Non versée</Button>
                    </div>
                    <div className="space-y-1"><Label className="text-xs">Montant annuel IR (€)</Label>
                      <Input type="number" value={nomination.irMontantAnnuel || ''} onChange={e => updateNom('irMontantAnnuel', parseFloat(e.target.value) || 0)} />
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-border bg-primary/5">
                  <p className="text-xs font-bold mb-1">Régime de responsabilité</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Depuis le <strong>1er janvier 2023</strong>, le régisseur n'est plus soumis à la <strong>RPP</strong> ni au <strong>cautionnement</strong>. Il relève désormais du <strong>RGP</strong> (Régime de Responsabilité des Gestionnaires Publics) — Ord. 2022-408.
                  </p>
                </div>
              </div>

              {/* IR demeure due au-delà de 1 220 € de plafond */}
              {acte.montantPlafond > SEUIL_IR_REGISSEUR && !nomination.irVersee && (
                <ControlAlert level="alerte"
                  title="Indemnité de responsabilité (IR) non versée"
                  description={`Au-delà de ${SEUIL_IR_REGISSEUR} € de plafond de régie, le régisseur a droit à une indemnité de responsabilité annuelle calculée selon le barème de l'arrêté du 28/05/1993 modifié. Cette IR demeure due malgré la suppression du cautionnement.`}
                  refKey="arrete-ir-regisseur"
                  action="Vérifier la mise en paiement de l'IR par l'ordonnateur et son rattachement au bon exercice." />
              )}

              <div className="space-y-1"><Label className="text-xs">Observations</Label><Textarea value={nomination.observations} onChange={e => updateNom('observations', e.target.value)} rows={3} /></div>

              {!nomination.dateNomination && (
                <ControlAlert level="critique" title="Acte de nomination manquant"
                  description="Aucun acte de nomination du régisseur n'est renseigné — le régisseur ne peut pas légalement exercer."
                  refKey="reg-nomination" action="Récupérer l'arrêté de nomination signé conjointement par l'ordonnateur et l'agent comptable." />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Contrôles réglementaires */}
      <ModuleSection title="Contrôles réglementaires — Régies" description="Décret 2019-798 — Décret 2020-128 — M9-6 § 3.2" badge={`${(REGIES_REGLEMENTATION.controles_obligatoires).filter(c => regChecks[c.id]).length}/${(REGIES_REGLEMENTATION.controles_obligatoires).length}`}>
        <Card className="shadow-card">
          <CardContent className="p-3 space-y-2">
            {REGIES_REGLEMENTATION.controles_obligatoires.map(item => (
              <ComplianceCheck
                key={item.id}
                label={item.label}
                checked={regChecks[item.id] || false}
                onChange={() => toggleRegCheck(item.id)}
                severity={item.severity}
                detail={item.ref}
              />
            ))}
          </CardContent>
        </Card>
      </ModuleSection>
    </ModulePageLayout>
  );
}

```

### FICHIER : src/pages/ResetPassword.tsx

```tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase-fixed';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2, Lock } from 'lucide-react';
import { passwordSchema } from '@/lib/security';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setReady(true);
    }
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const pwResult = passwordSchema.safeParse(password);
    if (!pwResult.success) {
      toast({ title: 'Erreur', description: pwResult.error.errors[0].message, variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast({ title: 'Mot de passe mis à jour', description: 'Vous pouvez maintenant vous connecter.' });
      navigate('/');
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center text-muted-foreground">
            Lien invalide ou expiré. Demandez un nouveau lien de réinitialisation.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, hsl(226 31% 12%), hsl(226 31% 18%))' }}>
      <Card className="w-full max-w-md shadow-elevated">
        <CardHeader className="text-center space-y-3 pb-2">
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
              <Lock className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Nouveau mot de passe</CardTitle>
          <CardDescription>Saisissez votre nouveau mot de passe pour CIC Expert Pro</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="new-password">Nouveau mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="new-password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="pl-9" required minLength={6} />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Mettre à jour
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

```

### FICHIER : src/pages/Restauration.tsx

```tsx
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Pencil, AlertTriangle } from 'lucide-react';
import { RestaurationMois, fmt } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CONTROLES_RESTAURATION } from '@/lib/regulatory-data';
import { ModulePageLayout , ComplianceCheck, ModuleSection } from '@/components/ModulePageLayout';
import { ControlAlert } from '@/components/ControlAlert';
import { DoctrineEPLE } from '@/components/DoctrineEPLE';

/** Seuils EGAlim (loi 2018-938) : 50 % produits durables/qualité dont 20 % bio. */
const SEUIL_BIO_EGALIM = 20;
const SEUIL_DURABLE_EGALIM = 50;
/** Seuil DGAL — agrément sanitaire requis dès 80 repas/jour distribués vers un établissement tiers
 *  (Règlement (CE) 853/2004 + arrêté du 21/12/2009). */
const SEUIL_DGAL_REPAS_JOUR = 80;

/* ═══ TYPES LOCAUX ═══ */
interface GrammageVerif {
  id: string; date: string; menu: string; effectifJour: number;
  denree: string; grammageRef: number; quantiteCommandee: number;
  quantiteNecessaire: number; ecart: number; recommandation: string;
}

interface VentesAchats {
  periode: string; totalAchats: number; totalVentes: number;
  ecart: number; observations: string;
}

interface TitreRecetteCuisine {
  id: string; etablissement: string; mois: string; montantTR: number;
  enregistre: boolean; observations: string;
}

interface ContratCuisine {
  existeContrat: boolean; referenceContrat: string;
  existeMarche: boolean; referenceMarche: string;
  prestataire: string; dateDebut: string; dateFin: string;
  montantAnnuel: number; observations: string;
}

export default function Restauration() {
  // ═══ SUIVI MENSUEL (existant) ═══
  const [items, setItems] = useState<RestaurationMois[]>(() => loadState('restauration', []));
  const [form, setForm] = useState<any>(null);
  const save = (d: RestaurationMois[]) => { setItems(d); saveState('restauration', d); };

  // ═══ CALCULATEUR GRAMMAGE ═══
  const [grammages, setGrammages] = useState<GrammageVerif[]>(() => loadState('rest_grammages', []));
  const [formGram, setFormGram] = useState<any>(null);
  const saveGram = (d: GrammageVerif[]) => { setGrammages(d); saveState('rest_grammages', d); };

  // ═══ VENTES VS ACHATS ═══
  const [ventesAchats, setVentesAchats] = useState<VentesAchats>(() => loadState('rest_ventes_achats', { periode: '', totalAchats: 0, totalVentes: 0, ecart: 0, observations: '' }));
  const updateVA = (k: string, v: any) => {
    const n = { ...ventesAchats, [k]: v };
    n.ecart = (parseFloat(String(n.totalVentes)) || 0) - (parseFloat(String(n.totalAchats)) || 0);
    setVentesAchats(n); saveState('rest_ventes_achats', n);
  };

  // ═══ TITRES RECETTES CUISINE CENTRALE ═══
  const [titresRecettes, setTitresRecettes] = useState<TitreRecetteCuisine[]>(() => loadState('rest_titres_recettes', []));
  const [formTR, setFormTR] = useState<any>(null);
  const saveTR = (d: TitreRecetteCuisine[]) => { setTitresRecettes(d); saveState('rest_titres_recettes', d); };

  // ═══ CONTRAT CUISINE LIVRÉE ═══
  const [regChecks, setRegChecks] = useState<Record<string, boolean>>(() => loadState('restauration_checks', {}));
  const toggleRegCheck = (id: string) => { const u = { ...regChecks, [id]: !regChecks[id] }; setRegChecks(u); saveState('restauration_checks', u); };
  const [contrat, setContrat] = useState<ContratCuisine>(() => loadState('rest_contrat', {
    existeContrat: false, referenceContrat: '', existeMarche: false, referenceMarche: '',
    prestataire: '', dateDebut: '', dateFin: '', montantAnnuel: 0, observations: '',
  }));
  const updateContrat = (k: string, v: any) => { const n = { ...contrat, [k]: v }; setContrat(n); saveState('rest_contrat', n); };

  const calcTauxFrequentation = (repas: number, dpInscrits: number, joursService: number) => {
    if (dpInscrits <= 0 || joursService <= 0) return null;
    return (repas / (dpInscrits * joursService)) * 100;
  };

  const submit = () => {
    if (!form || !form.mois) return;
    const cm = parseFloat(form.coutMatieres) || 0, cp = parseFloat(form.coutPersonnel) || 0, ce = parseFloat(form.coutEnergie) || 0;
    const item: RestaurationMois = {
      id: form.id || crypto.randomUUID(), mois: form.mois,
      repas: parseInt(form.repas) || 0,
      effectifTotal: parseInt(form.effectifTotal) || 0,
      dpInscrits: parseInt(form.dpInscrits) || 0,
      joursService: parseInt(form.joursService) || 0,
      coutMatieres: cm, coutPersonnel: cp, coutEnergie: ce, coutTotal: cm + cp + ce,
      tarif: parseFloat(form.tarif) || 3.80,
      impayes: parseFloat(form.impayes) || 0,
      bio: parseFloat(form.bio) || 0, durable: parseFloat(form.durable) || 0,
    };
    if (form.id) save(items.map(i => i.id === form.id ? item : i));
    else save([item, ...items]);
    setForm(null);
  };

  const submitGrammage = () => {
    if (!formGram) return;
    const effectif = parseInt(formGram.effectifJour) || 0;
    const grammageRef = parseFloat(formGram.grammageRef) || 0;
    const qteCommandee = parseFloat(formGram.quantiteCommandee) || 0;
    const qteNecessaire = (effectif * grammageRef) / 1000; // en kg
    const ecart = qteCommandee - qteNecessaire;
    let recommandation = '';
    if (ecart > qteNecessaire * 0.1) recommandation = `⚠️ Sur-commande de ${ecart.toFixed(2)} kg (${((ecart / qteNecessaire) * 100).toFixed(0)}% d'excédent). Vérifier la justification auprès du chef cuisinier. Risque de gaspillage alimentaire.`;
    else if (ecart < -qteNecessaire * 0.05) recommandation = `⚠️ Sous-commande de ${Math.abs(ecart).toFixed(2)} kg. Risque d'insuffisance de portions.`;
    else recommandation = '✅ Commande conforme au grammage réglementaire.';
    const item: GrammageVerif = { id: formGram.id || crypto.randomUUID(), date: formGram.date, menu: formGram.menu, effectifJour: effectif, denree: formGram.denree, grammageRef, quantiteCommandee: qteCommandee, quantiteNecessaire: parseFloat(qteNecessaire.toFixed(2)), ecart: parseFloat(ecart.toFixed(2)), recommandation };
    if (formGram.id) saveGram(grammages.map(i => i.id === formGram.id ? item : i));
    else saveGram([item, ...grammages]);
    setFormGram(null);
  };

  const submitTR = () => {
    if (!formTR) return;
    const item: TitreRecetteCuisine = { id: formTR.id || crypto.randomUUID(), etablissement: formTR.etablissement, mois: formTR.mois, montantTR: parseFloat(formTR.montantTR) || 0, enregistre: formTR.enregistre || false, observations: formTR.observations };
    if (formTR.id) saveTR(titresRecettes.map(i => i.id === formTR.id ? item : i));
    else saveTR([...titresRecettes, item]);
    setFormTR(null);
  };

  const last = items[0];
  const nbTRNonEnregistre = titresRecettes.filter(x => !x.enregistre).length;

  return (
    <ModulePageLayout
      title="Restauration et hébergement"
      section="GESTION COMPTABLE"
      description="Contrôle de la restauration scolaire : tarification (délibération CT), facturation, encaissements, convention d'hébergement, suivi FCSH/FRPI et conformité EGAlim."
      refs={[
        { code: "M9-6 § 4.3", label: "SRH" },
        { code: "Loi EGAlim 2018-938", label: "Approvisionnement durable" },
        { code: "C/185000", label: "Compte de dépôt SRH" },
        { code: "FCSH / FRPI", label: "Fonds communs" },
      ]}
      completedChecks={(CONTROLES_RESTAURATION).filter(c => regChecks[c.id]).length}
      totalChecks={(CONTROLES_RESTAURATION).length}
    >
      <DoctrineEPLE theme="restauration" titre="Restauration & SRH" resume="EGalim, HACCP, équilibre du SRH, encaissement régisseur" />
      <div>
      </div>

      <Tabs defaultValue="suivi" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="suivi">Suivi mensuel</TabsTrigger>
          <TabsTrigger value="grammage">Grammage</TabsTrigger>
          <TabsTrigger value="ventes">Ventes/Achats</TabsTrigger>
          <TabsTrigger value="titres">Titres recettes</TabsTrigger>
          <TabsTrigger value="contrat">Contrat cuisine</TabsTrigger>
        </TabsList>

        {/* ═══ SUIVI MENSUEL ═══ */}
        <TabsContent value="suivi" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setForm({ mois: new Date().toISOString().slice(0, 7), repas: '', effectifTotal: '', dpInscrits: '', joursService: '', coutMatieres: '', coutPersonnel: '', coutEnergie: '', tarif: last?.tarif || 3.80, impayes: '', bio: '', durable: '' })}><Plus className="h-4 w-4 mr-2" /> Nouveau mois</Button>
          </div>

          {last && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <Card className="shadow-card"><CardContent className="p-4"><p className="text-lg font-bold">{last.mois}</p><p className="text-xs text-muted-foreground">Dernier mois</p></CardContent></Card>
              <Card className="shadow-card"><CardContent className="p-4"><p className="text-lg font-bold">{last.coutTotal.toFixed(2)} €</p><p className="text-xs text-muted-foreground">Coût/repas</p></CardContent></Card>
              <Card className="shadow-card"><CardContent className="p-4"><p className={`text-lg font-bold ${last.bio >= SEUIL_BIO_EGALIM ? 'text-green-600' : 'text-destructive'}`}>{last.bio}%</p><p className="text-xs text-muted-foreground">Bio</p></CardContent></Card>
              <Card className="shadow-card"><CardContent className="p-4"><p className={`text-lg font-bold ${last.durable >= SEUIL_DURABLE_EGALIM ? 'text-green-600' : 'text-destructive'}`}>{last.durable}%</p><p className="text-xs text-muted-foreground">Durable</p></CardContent></Card>
              <Card className="shadow-card"><CardContent className="p-4"><p className={`text-lg font-bold ${last.impayes > 0 ? 'text-destructive' : 'text-green-600'}`}>{fmt(last.impayes)}</p><p className="text-xs text-muted-foreground">Impayés</p></CardContent></Card>
            </div>
          )}

          {last && (last.bio < SEUIL_BIO_EGALIM || last.durable < SEUIL_DURABLE_EGALIM) && (
            <ControlAlert
              level={last.bio < SEUIL_BIO_EGALIM / 2 || last.durable < SEUIL_DURABLE_EGALIM / 2 ? 'critique' : 'alerte'}
              title="Seuils EGAlim non atteints"
              description={`La loi EGAlim impose au moins ${SEUIL_DURABLE_EGALIM} % de produits durables/qualité dont ${SEUIL_BIO_EGALIM} % bio. Constaté : ${last.bio}% bio / ${last.durable}% durable.`}
              action="Réviser la politique d'approvisionnement avec le chef cuisinier. Tracer les justificatifs (factures, certifications) et présenter le plan d'amélioration au CA."
              refLabel="Loi EGAlim 2018-938 — Art. 24"
            />
          )}

          {last && last.repas > 0 && last.joursService > 0 && (last.repas / last.joursService) >= SEUIL_DGAL_REPAS_JOUR && (
            <ControlAlert
              level="info"
              title={`Production moyenne de ${Math.round(last.repas / last.joursService)} repas/jour — vérifier l'agrément sanitaire`}
              description={`Si la cuisine livre des repas à un autre établissement, un agrément sanitaire DGAL est requis dès ${SEUIL_DGAL_REPAS_JOUR} repas/jour livrés à des tiers (Règl. (CE) 853/2004). En cuisine sur place uniquement, une déclaration suffit.`}
              action="Si livraison vers tiers : vérifier l'arrêté préfectoral d'agrément (n° EAU/CE) et son affichage en cuisine. Maintenir le PMS HACCP à jour."
              refLabel="Règlement (CE) 853/2004 — Arrêté 21/12/2009"
            />
          )}

          {form && (
            <Card className="border-primary">
              <CardContent className="pt-6 space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1"><Label className="text-xs">Mois</Label><Input type="month" value={form.mois} onChange={e => setForm({ ...form, mois: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Effectif total élèves</Label><Input type="number" value={form.effectifTotal} onChange={e => setForm({ ...form, effectifTotal: e.target.value })} placeholder="Ex: 850" /></div>
                  <div className="space-y-1"><Label className="text-xs">DP inscrits</Label><Input type="number" value={form.dpInscrits} onChange={e => setForm({ ...form, dpInscrits: e.target.value })} placeholder="Ex: 620" /></div>
                  <div className="space-y-1"><Label className="text-xs">Jours de service</Label><Input type="number" value={form.joursService} onChange={e => setForm({ ...form, joursService: e.target.value })} placeholder="Ex: 20" /></div>
                  <div className="space-y-1"><Label className="text-xs">Nb repas servis</Label><Input type="number" value={form.repas} onChange={e => setForm({ ...form, repas: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Coût matière (€)</Label><Input type="number" value={form.coutMatieres} onChange={e => setForm({ ...form, coutMatieres: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Coût personnel (€)</Label><Input type="number" value={form.coutPersonnel} onChange={e => setForm({ ...form, coutPersonnel: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Coût énergie (€)</Label><Input type="number" value={form.coutEnergie} onChange={e => setForm({ ...form, coutEnergie: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Tarif (€)</Label><Input type="number" value={form.tarif} onChange={e => setForm({ ...form, tarif: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Impayés (€)</Label><Input type="number" value={form.impayes} onChange={e => setForm({ ...form, impayes: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">% Bio</Label><Input type="number" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">% Durable</Label><Input type="number" value={form.durable} onChange={e => setForm({ ...form, durable: e.target.value })} /></div>
                </div>

                {/* Calcul automatique de la fréquentation */}
                {(() => {
                  const repas = parseInt(form.repas) || 0;
                  const dp = parseInt(form.dpInscrits) || 0;
                  const jours = parseInt(form.joursService) || 0;
                  const taux = calcTauxFrequentation(repas, dp, jours);
                  if (taux !== null) {
                    return (
                      <div className="p-3 rounded-lg border bg-muted/50">
                        <p className="text-sm"><strong>Taux de fréquentation calculé :</strong> {taux.toFixed(1)}%
                          <span className="text-xs text-muted-foreground ml-2">({repas} repas / {dp} DP × {jours} jours)</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          ⚠️ En lycée, les DP payant à la prestation, ce taux est indicatif. L'absentéisme et les repas non pris ne sont pas décomptés automatiquement.
                        </p>
                      </div>
                    );
                  }
                  return null;
                })()}

                <div className="flex gap-2"><Button onClick={submit}>Valider</Button><Button variant="outline" onClick={() => setForm(null)}>Annuler</Button></div>
              </CardContent>
            </Card>
          )}

          {items.length === 0 && !form && <Card className="shadow-card"><CardContent className="py-12 text-center text-muted-foreground">Aucun mois enregistré.</CardContent></Card>}
          {items.length > 0 && (
            <Card className="shadow-card"><CardContent className="pt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-xs text-muted-foreground"><th className="p-2">Mois</th><th className="p-2">Repas</th><th className="p-2">DP</th><th className="p-2">Jours</th><th className="p-2">Fréq.</th><th className="text-right p-2">C.mat</th><th className="text-right p-2">C.tot</th><th className="text-right p-2">Tarif</th><th className="text-right p-2">Impayés</th><th className="p-2">Bio%</th><th className="p-2">Dur%</th><th></th></tr></thead>
                <tbody>{items.map(x => {
                  const taux = calcTauxFrequentation(x.repas, x.dpInscrits, x.joursService);
                  return (
                  <tr key={x.id} className="border-b">
                    <td className="p-2 font-bold">{x.mois}</td>
                    <td className="p-2 font-mono">{x.repas.toLocaleString('fr-FR')}</td>
                    <td className="p-2 font-mono">{x.dpInscrits}</td>
                    <td className="p-2 font-mono">{x.joursService}</td>
                    <td className="p-2 font-bold" title="Indicatif — paiement à la prestation en lycée">{taux !== null ? `${taux.toFixed(1)}%` : '—'}</td>
                    <td className="p-2 text-right font-mono">{x.coutMatieres.toFixed(2)}</td>
                    <td className="p-2 text-right font-mono font-bold">{x.coutTotal.toFixed(2)}</td>
                    <td className="p-2 text-right font-mono">{x.tarif.toFixed(2)}</td>
                    <td className={`p-2 text-right font-mono font-bold ${x.impayes > 0 ? 'text-destructive' : 'text-green-600'}`}>{fmt(x.impayes)}</td>
                    <td className={`p-2 font-bold ${x.bio >= 20 ? 'text-green-600' : 'text-destructive'}`}>{x.bio}%</td>
                    <td className={`p-2 font-bold ${x.durable >= 50 ? 'text-green-600' : 'text-destructive'}`}>{x.durable}%</td>
                    <td className="p-2"><div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setForm({ ...x, repas: String(x.repas), effectifTotal: String(x.effectifTotal), dpInscrits: String(x.dpInscrits), joursService: String(x.joursService), coutMatieres: String(x.coutMatieres), coutPersonnel: String(x.coutPersonnel), coutEnergie: String(x.coutEnergie), tarif: String(x.tarif), impayes: String(x.impayes), bio: String(x.bio), durable: String(x.durable) })}><Pencil className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => save(items.filter(i => i.id !== x.id))}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                    </div></td>
                  </tr>
                );})}</tbody>
              </table>
            </CardContent></Card>
          )}
        </TabsContent>

        {/* ═══ CALCULATEUR GRAMMAGE ═══ */}
        <TabsContent value="grammage" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">Calculateur grammage / effectif</p>
              <p className="text-xs text-muted-foreground">Compare la quantité commandée au besoin réel selon l'effectif du jour et le grammage réglementaire.</p>
            </div>
            <Button onClick={() => setFormGram({ date: new Date().toISOString().split('T')[0], menu: '', effectifJour: '', denree: '', grammageRef: '', quantiteCommandee: '' })}><Plus className="h-4 w-4 mr-2" /> Nouvelle vérification</Button>
          </div>

          {formGram && (
            <Card className="border-primary">
              <CardContent className="pt-6 space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="space-y-1"><Label className="text-xs">Date</Label><Input type="date" value={formGram.date} onChange={e => setFormGram({ ...formGram, date: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Menu du jour</Label><Input value={formGram.menu} onChange={e => setFormGram({ ...formGram, menu: e.target.value })} placeholder="Ex: Poulet rôti, haricots verts" /></div>
                  <div className="space-y-1"><Label className="text-xs">Effectif du jour</Label><Input type="number" value={formGram.effectifJour} onChange={e => setFormGram({ ...formGram, effectifJour: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Denrée contrôlée</Label><Input value={formGram.denree} onChange={e => setFormGram({ ...formGram, denree: e.target.value })} placeholder="Ex: Poulet" /></div>
                  <div className="space-y-1"><Label className="text-xs">Grammage réf. (g/portion)</Label><Input type="number" value={formGram.grammageRef} onChange={e => setFormGram({ ...formGram, grammageRef: e.target.value })} placeholder="Ex: 120" /></div>
                  <div className="space-y-1"><Label className="text-xs">Quantité commandée (kg)</Label><Input type="number" value={formGram.quantiteCommandee} onChange={e => setFormGram({ ...formGram, quantiteCommandee: e.target.value })} /></div>
                </div>

                {/* Aperçu calcul en temps réel */}
                {(() => {
                  const eff = parseInt(formGram.effectifJour) || 0;
                  const gr = parseFloat(formGram.grammageRef) || 0;
                  const qte = parseFloat(formGram.quantiteCommandee) || 0;
                  const besoin = (eff * gr) / 1000;
                  if (eff > 0 && gr > 0 && qte > 0) {
                    const ecart = qte - besoin;
                    const pct = ((ecart / besoin) * 100).toFixed(0);
                    return (
                      <div className={`p-3 rounded-lg border ${ecart > besoin * 0.1 ? 'border-destructive bg-destructive/10' : 'border-green-500 bg-green-50'}`}>
                        <p className="text-sm"><strong>Besoin :</strong> {eff} convives × {gr}g = <strong>{besoin.toFixed(2)} kg</strong></p>
                        <p className="text-sm"><strong>Commandé :</strong> {qte} kg → Écart : <strong>{ecart > 0 ? '+' : ''}{ecart.toFixed(2)} kg ({pct}%)</strong></p>
                        {ecart > besoin * 0.1 && <p className="text-sm text-destructive font-bold mt-1">⚠️ Sur-commande significative. Demander la justification au chef cuisinier.</p>}
                      </div>
                    );
                  }
                  return null;
                })()}

                <div className="flex gap-2"><Button onClick={submitGrammage}>Valider</Button><Button variant="outline" onClick={() => setFormGram(null)}>Annuler</Button></div>
              </CardContent>
            </Card>
          )}

          {grammages.length === 0 && !formGram && <Card className="shadow-card"><CardContent className="py-12 text-center text-muted-foreground">Aucune vérification de grammage.</CardContent></Card>}
          {grammages.length > 0 && (
            <Card className="shadow-card"><CardContent className="pt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-xs text-muted-foreground"><th className="p-2">Date</th><th className="text-left p-2">Denrée</th><th className="p-2">Effectif</th><th className="text-right p-2">Besoin (kg)</th><th className="text-right p-2">Commandé (kg)</th><th className="text-right p-2">Écart</th><th className="text-left p-2">Recommandation</th><th></th></tr></thead>
                <tbody>{grammages.map(x => (
                  <tr key={x.id} className={`border-b ${x.ecart > x.quantiteNecessaire * 0.1 ? 'bg-destructive/5' : ''}`}>
                    <td className="p-2 text-xs">{x.date}</td><td className="p-2 font-bold">{x.denree}</td><td className="p-2 text-center">{x.effectifJour}</td>
                    <td className="p-2 text-right font-mono">{x.quantiteNecessaire}</td>
                    <td className="p-2 text-right font-mono font-bold">{x.quantiteCommandee}</td>
                    <td className={`p-2 text-right font-mono font-bold ${x.ecart > 0 ? 'text-destructive' : 'text-green-600'}`}>{x.ecart > 0 ? '+' : ''}{x.ecart}</td>
                    <td className="p-2 text-xs">{x.recommandation}</td>
                    <td className="p-2"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => saveGram(grammages.filter(i => i.id !== x.id))}><Trash2 className="h-3 w-3 text-destructive" /></Button></td>
                  </tr>
                ))}</tbody>
              </table>
            </CardContent></Card>
          )}
        </TabsContent>

        {/* ═══ VENTES VS ACHATS ═══ */}
        <TabsContent value="ventes" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Calculateur Ventes / Achats</CardTitle>
              <p className="text-xs text-muted-foreground">Compare les titres de recettes enregistrés (ventes) avec les mandats de dépenses (achats) pour la restauration.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1"><Label>Période</Label><Input value={ventesAchats.periode} onChange={e => updateVA('periode', e.target.value)} placeholder="Ex: Septembre 2025 - Février 2026" /></div>
                <div className="space-y-1"><Label>Total achats denrées (€)</Label><Input type="number" value={ventesAchats.totalAchats || ''} onChange={e => updateVA('totalAchats', e.target.value)} /></div>
                <div className="space-y-1"><Label>Total titres de recettes (€)</Label><Input type="number" value={ventesAchats.totalVentes || ''} onChange={e => updateVA('totalVentes', e.target.value)} /></div>
              </div>

              {(ventesAchats.totalAchats > 0 || ventesAchats.totalVentes > 0) && (() => {
                const achats = parseFloat(String(ventesAchats.totalAchats)) || 0;
                const ventes = parseFloat(String(ventesAchats.totalVentes)) || 0;
                const ecart = ventes - achats;
                const ratio = achats > 0 ? ((ventes / achats) * 100).toFixed(1) : '—';
                return (
                  <div className={`p-4 rounded-lg border ${ecart < 0 ? 'border-destructive bg-destructive/10' : 'border-green-500 bg-green-50'}`}>
                    <div className="grid grid-cols-3 gap-4 text-center mb-3">
                      <div><p className="text-xs text-muted-foreground">Achats</p><p className="text-xl font-bold">{fmt(achats)}</p></div>
                      <div><p className="text-xs text-muted-foreground">Ventes (TR)</p><p className="text-xl font-bold">{fmt(ventes)}</p></div>
                      <div><p className="text-xs text-muted-foreground">Écart</p><p className={`text-xl font-bold ${ecart >= 0 ? 'text-green-600' : 'text-destructive'}`}>{fmt(ecart)}</p></div>
                    </div>
                    <p className="text-sm text-center">Taux de couverture : <strong>{ratio}%</strong></p>
                    {ecart < 0 && <p className="text-sm text-destructive font-bold mt-2 text-center">⚠️ Les ventes ne couvrent pas les achats. Vérifier les titres de recettes non émis ou les commandes excessives.</p>}
                    {ecart >= 0 && <p className="text-sm text-green-700 font-bold mt-2 text-center">✅ Les titres de recettes couvrent les achats.</p>}
                  </div>
                );
              })()}

              <div className="space-y-1"><Label className="text-xs">Observations</Label><Textarea value={ventesAchats.observations} onChange={e => updateVA('observations', e.target.value)} rows={3} /></div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ TITRES RECETTES CUISINE CENTRALE ═══ */}
        <TabsContent value="titres" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">Vérification des titres de recettes — Cuisine centrale</p>
              <p className="text-xs text-muted-foreground">S'assurer que tous les titres de recettes sont enregistrés pour chaque établissement nourri.</p>
            </div>
            <Button onClick={() => setFormTR({ etablissement: '', mois: new Date().toISOString().slice(0, 7), montantTR: '', enregistre: false, observations: '' })}><Plus className="h-4 w-4 mr-2" /> Ajouter</Button>
          </div>

          {nbTRNonEnregistre > 0 && (
            <div className="p-3 border border-destructive bg-destructive/10 rounded-lg flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
              <p className="text-sm text-destructive"><strong>{nbTRNonEnregistre} titre(s) de recettes non enregistré(s).</strong> Tous les titres doivent être émis et enregistrés pour les établissements rattachés à la cuisine centrale.</p>
            </div>
          )}

          {formTR && (
            <Card className="border-primary">
              <CardContent className="pt-6 space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1"><Label className="text-xs">Établissement nourri</Label><Input value={formTR.etablissement} onChange={e => setFormTR({ ...formTR, etablissement: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Mois</Label><Input type="month" value={formTR.mois} onChange={e => setFormTR({ ...formTR, mois: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Montant TR (€)</Label><Input type="number" value={formTR.montantTR} onChange={e => setFormTR({ ...formTR, montantTR: e.target.value })} /></div>
                  <div className={`p-3 rounded-lg border ${formTR.enregistre ? 'border-green-500 bg-green-50' : 'border-destructive bg-destructive/10'}`}>
                    <p className="text-xs font-bold mb-1">Enregistré ?</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant={formTR.enregistre ? 'default' : 'outline'} onClick={() => setFormTR({ ...formTR, enregistre: true })}>✓ Oui</Button>
                      <Button size="sm" variant={!formTR.enregistre ? 'destructive' : 'outline'} onClick={() => setFormTR({ ...formTR, enregistre: false })}>✗ Non</Button>
                    </div>
                  </div>
                </div>
                <Input placeholder="Observations" value={formTR.observations} onChange={e => setFormTR({ ...formTR, observations: e.target.value })} />
                <div className="flex gap-2"><Button onClick={submitTR}>Valider</Button><Button variant="outline" onClick={() => setFormTR(null)}>Annuler</Button></div>
              </CardContent>
            </Card>
          )}

          {titresRecettes.length === 0 && !formTR && <Card className="shadow-card"><CardContent className="py-12 text-center text-muted-foreground">Aucun titre de recettes vérifié.</CardContent></Card>}
          {titresRecettes.length > 0 && (
            <Card className="shadow-card"><CardContent className="pt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">Établissement</th><th className="p-2">Mois</th><th className="text-right p-2">Montant</th><th className="p-2">Enregistré</th><th className="text-left p-2">Obs.</th><th></th></tr></thead>
                <tbody>{titresRecettes.map(x => (
                  <tr key={x.id} className={`border-b ${!x.enregistre ? 'bg-destructive/5' : ''}`}>
                    <td className="p-2 font-bold">{x.etablissement}</td><td className="p-2">{x.mois}</td>
                    <td className="p-2 text-right font-mono font-bold">{fmt(x.montantTR)}</td>
                    <td className="p-2 text-center">{x.enregistre ? <span className="text-green-600 font-bold">✓</span> : <span className="text-destructive font-bold">✗</span>}</td>
                    <td className="p-2 text-xs">{x.observations}</td>
                    <td className="p-2"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => saveTR(titresRecettes.filter(i => i.id !== x.id))}><Trash2 className="h-3 w-3 text-destructive" /></Button></td>
                  </tr>
                ))}</tbody>
              </table>
            </CardContent></Card>
          )}
        </TabsContent>

        {/* ═══ CONTRAT CUISINE LIVRÉE ═══ */}
        <TabsContent value="contrat" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Cuisine livrée — Contrat et marché</CardTitle>
              <p className="text-xs text-muted-foreground">En cas de livraison de repas par un prestataire extérieur, vérifier l'existence d'un contrat et d'un marché public.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-3 rounded-lg border ${contrat.existeContrat ? 'border-green-500 bg-green-50' : 'border-destructive bg-destructive/10'}`}>
                  <p className="text-xs font-bold mb-2">Contrat de prestation</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant={contrat.existeContrat ? 'default' : 'outline'} onClick={() => updateContrat('existeContrat', true)}>✓ Existe</Button>
                    <Button size="sm" variant={!contrat.existeContrat ? 'destructive' : 'outline'} onClick={() => updateContrat('existeContrat', false)}>✗ Absent</Button>
                  </div>
                  {!contrat.existeContrat && <p className="text-xs text-destructive mt-2 font-bold">⚠️ ANOMALIE — Absence de contrat pour la cuisine livrée.</p>}
                </div>

                <div className={`p-3 rounded-lg border ${contrat.existeMarche ? 'border-green-500 bg-green-50' : 'border-destructive bg-destructive/10'}`}>
                  <p className="text-xs font-bold mb-2">Marché public</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant={contrat.existeMarche ? 'default' : 'outline'} onClick={() => updateContrat('existeMarche', true)}>✓ Existe</Button>
                    <Button size="sm" variant={!contrat.existeMarche ? 'destructive' : 'outline'} onClick={() => updateContrat('existeMarche', false)}>✗ Absent</Button>
                  </div>
                  {!contrat.existeMarche && <p className="text-xs text-destructive mt-2 font-bold">⚠️ ANOMALIE — Absence de marché public pour la prestation de restauration.</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1"><Label className="text-xs">Prestataire</Label><Input value={contrat.prestataire} onChange={e => updateContrat('prestataire', e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">Réf. contrat</Label><Input value={contrat.referenceContrat} onChange={e => updateContrat('referenceContrat', e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">Réf. marché</Label><Input value={contrat.referenceMarche} onChange={e => updateContrat('referenceMarche', e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">Date début</Label><Input type="date" value={contrat.dateDebut} onChange={e => updateContrat('dateDebut', e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">Date fin</Label><Input type="date" value={contrat.dateFin} onChange={e => updateContrat('dateFin', e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">Montant annuel (€)</Label><Input type="number" value={contrat.montantAnnuel || ''} onChange={e => updateContrat('montantAnnuel', parseFloat(e.target.value) || 0)} /></div>
              </div>

              <div className="space-y-1"><Label className="text-xs">Observations</Label><Textarea value={contrat.observations} onChange={e => updateContrat('observations', e.target.value)} rows={3} /></div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Contrôles réglementaires */}
      <ModuleSection title="Contrôles réglementaires — Restauration" description="Loi EGAlim 2018-938 — M9-6 § 4.3 — Règlement CE 852/2004" badge={`${(CONTROLES_RESTAURATION).filter(c => regChecks[c.id]).length}/${(CONTROLES_RESTAURATION).length}`}>
        <Card className="shadow-card">
          <CardContent className="p-3 space-y-2">
            {CONTROLES_RESTAURATION.map(item => (
              <ComplianceCheck
                key={item.id}
                label={item.label}
                checked={regChecks[item.id] || false}
                onChange={() => toggleRegCheck(item.id)}
                severity={item.severity}
                detail={item.ref}
              />
            ))}
          </CardContent>
        </Card>
      </ModuleSection>
    </ModulePageLayout>
  );
}

```

### FICHIER : src/pages/Salaires.tsx

```tsx
/**
 * Salaires & vacations — module Audit.
 * Vérification de la paie (notamment GRETA / CFA) :
 *  - Surrémunération DOM
 *  - HSA / HSE
 *  - Vérification des vacations GRETA / CFA (saisie libre, ratios)
 *
 * Réf. : décret 86-83 (contractuels), décret 50-1253 (HSA/HSE),
 *        décret 53-1266 (surrémunération DOM), Code travail L6241-1 (CFA).
 */
import { useMemo, useState } from 'react';
import { ModulePageLayout } from '@/components/ModulePageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle2, Sun, Timer, GraduationCap } from 'lucide-react';
import { CalcSurremDOM, CalcHeuresSup } from '@/components/calculateurs/calc-paie-pilotage';
import { fmtEur } from '@/lib/calculateurs';
import { cn } from '@/lib/utils';

// ── Sous-module spécifique : vérification vacations GRETA / CFA ─────
function VacationsGretaCfa() {
  const [tauxHoraire, setTauxHoraire] = useState(0);
  const [nbHeures, setNbHeures] = useState(0);
  const [chargesPatronalesPct, setChargesPatronalesPct] = useState(45);
  const [budgetVote, setBudgetVote] = useState(0);
  const [dejaPaye, setDejaPaye] = useState(0);

  const brut = useMemo(() => tauxHoraire * nbHeures, [tauxHoraire, nbHeures]);
  const chargesPatro = (brut * chargesPatronalesPct) / 100;
  const coutTotal = brut + chargesPatro;
  const restantBudget = budgetVote - dejaPaye - coutTotal;
  const depasseBudget = restantBudget < 0 && budgetVote > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-primary" />
          Vacations GRETA / CFA — contrôle de cohérence
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div>
              <Label className="text-xs">Taux horaire vacataire (€)</Label>
              <Input type="number" step="0.01" value={tauxHoraire || ''}
                onChange={e => setTauxHoraire(+e.target.value)} className="h-8" />
            </div>
            <div>
              <Label className="text-xs">Nombre d'heures effectuées</Label>
              <Input type="number" value={nbHeures || ''}
                onChange={e => setNbHeures(+e.target.value)} className="h-8" />
            </div>
            <div>
              <Label className="text-xs">Taux de charges patronales (%)</Label>
              <Input type="number" step="0.1" value={chargesPatronalesPct}
                onChange={e => setChargesPatronalesPct(+e.target.value)} className="h-8" />
              <p className="text-[10px] text-muted-foreground mt-1">
                ≈ 42-48 % pour un vacataire CFA/GRETA (URSSAF + IRCANTEC + CNRACL le cas échéant)
              </p>
            </div>
            <div>
              <Label className="text-xs">Budget voté (compte 64) — €</Label>
              <Input type="number" value={budgetVote || ''}
                onChange={e => setBudgetVote(+e.target.value)} className="h-8" />
            </div>
            <div>
              <Label className="text-xs">Déjà payé sur l'exercice — €</Label>
              <Input type="number" value={dejaPaye || ''}
                onChange={e => setDejaPaye(+e.target.value)} className="h-8" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span>Brut vacation</span>
                <span className="tabular-nums font-mono">{fmtEur(brut)}</span>
              </div>
              <div className="flex justify-between">
                <span>+ Charges patronales ({chargesPatronalesPct} %)</span>
                <span className="tabular-nums font-mono">{fmtEur(chargesPatro)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t pt-1">
                <span>Coût total employeur</span>
                <span className="tabular-nums font-mono">{fmtEur(coutTotal)}</span>
              </div>
              {budgetVote > 0 && (
                <div className={cn('flex justify-between font-bold border-t pt-1',
                  depasseBudget ? 'text-destructive' : 'text-emerald-700')}>
                  <span>Reste budget après cette vacation</span>
                  <span className="tabular-nums font-mono">{fmtEur(restantBudget)}</span>
                </div>
              )}
            </div>

            {depasseBudget && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <strong>Dépassement budget :</strong> {fmtEur(Math.abs(restantBudget))} de plus que voté.
                  Une DBM (type 22 ou 24) doit être engagée avant paiement (GBCP art. 175).
                </AlertDescription>
              </Alert>
            )}
            {!depasseBudget && budgetVote > 0 && coutTotal > 0 && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Vacation compatible avec le budget voté.
                </AlertDescription>
              </Alert>
            )}

            <p className="text-[10px] text-muted-foreground italic mt-2">
              Réf. : décret 86-83 (contractuels), Code travail L6241-1 (CFA),
              circulaire MEN 2014-128 (GRETA).
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Page principale ────────────────────────────────────────────────
export default function Salaires() {
  return (
    <ModulePageLayout
      title="Salaires & vacations"
      section="VÉRIFICATION & ORDONNATEUR"
      description="Vérification des rémunérations payées sur budget — agents contractuels, vacataires GRETA / CFA, surrémunération DOM, heures supplémentaires"
      refs={[
        { code: 'Décret 86-83', label: 'contractuels' },
        { code: 'Décret 50-1253', label: 'HSA/HSE' },
        { code: 'Décret 53-1266', label: 'surrémunération DOM' },
        { code: 'L6241-1', label: 'CFA' },
      ]}
    >
      <div className="mb-3 flex flex-wrap gap-2">
        <Badge variant="outline" className="gap-1">
          <Sun className="h-3 w-3" /> Surrémunération DOM
        </Badge>
        <Badge variant="outline" className="gap-1">
          <Timer className="h-3 w-3" /> HSA / HSE
        </Badge>
        <Badge variant="outline" className="gap-1">
          <GraduationCap className="h-3 w-3" /> Vacations GRETA / CFA
        </Badge>
      </div>

      <Tabs defaultValue="vacations" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="vacations">Vacations GRETA/CFA</TabsTrigger>
          <TabsTrigger value="dom">Surrémunération DOM</TabsTrigger>
          <TabsTrigger value="hsa">HSA / HSE</TabsTrigger>
        </TabsList>

        <TabsContent value="vacations" className="mt-4">
          <VacationsGretaCfa />
        </TabsContent>

        <TabsContent value="dom" className="mt-4">
          <CalcSurremDOM />
        </TabsContent>

        <TabsContent value="hsa" className="mt-4">
          <CalcHeuresSup />
        </TabsContent>
      </Tabs>
    </ModulePageLayout>
  );
}

```

### FICHIER : src/pages/ScoringCICF.tsx

```tsx
/**
 * Page « Scoring CICF » — Chantiers 2 + 3 fusionnés.
 *
 * Affiche :
 *   • Score consolidé groupement (jauge)
 *   • Radar des 8 rubriques
 *   • Heatmap établissements × rubriques
 *   • Historique 24 mois
 *   • Quick-wins + alertes
 *   • Bouton « Diffuser le rapport » (PDF maturité)
 *   • Section Archives des rapports envoyés
 */
import { useEffect, useState, useMemo } from 'react';
import { ModulePageLayout } from '@/components/ModulePageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Gauge, Send, Download, AlertTriangle, TrendingUp, Building2, FileBarChart, Archive, Sparkles,
} from 'lucide-react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { useGroupements } from '@/hooks/useGroupements';
import { useEtablissements, useAgents } from '@/hooks/useGroupements';
import { computeScoringGroupement, snapshotScoring, loadHistorique, niveauScoring, type ScoreGroupement } from '@/lib/scoring-engine';
import { RUBRIQUES_SCORING } from '@/lib/mapping-audit-risque-seed';
import { genererRapportMaturite, pdfFileName } from '@/lib/rapport-maturite-pdf';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function ScoringCICF() {
  const { activeId, groupements } = useGroupements();
  const groupement = groupements.find(g => g.id === activeId);
  const { etablissements } = useEtablissements(activeId);
  const { agents } = useAgents(activeId);
  const [score, setScore] = useState<ScoreGroupement | null>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<{ periode: string; score_global: number }[]>([]);
  const [diffuserOpen, setDiffuserOpen] = useState(false);
  const [archives, setArchives] = useState<any[]>([]);

  useEffect(() => {
    if (!activeId) { setLoading(false); return; }
    setLoading(true);
    computeScoringGroupement(activeId, groupement?.seuil_alerte_score ?? 60).then(s => {
      setScore(s);
      snapshotScoring(activeId, s).catch(() => {/* silent */});
      setLoading(false);
    });
    loadHistorique(activeId).then(setHistory);
    loadArchives();
  }, [activeId, groupement?.seuil_alerte_score]);

  const loadArchives = async () => {
    if (!activeId) return;
    const { data } = await (supabase as any).from('rapports_maturite').select('*')
      .eq('groupement_id', activeId).order('created_at', { ascending: false }).limit(20);
    setArchives(data ?? []);
  };

  const niveau = useMemo(() => score ? niveauScoring(score.score_global) : null, [score]);
  const radarData = score?.rubriques.map(r => ({ axe: r.label.split(' ')[0], score: r.score })) ?? [];
  const acAgent = agents.find(a => a.role === 'agent_comptable' && a.actif);
  const lyceeSiege = etablissements.find(e => e.id === groupement?.lycee_siege_id);
  const logoMissing = !groupement?.logo_url && !lyceeSiege;

  if (!activeId) {
    return (
      <ModulePageLayout title="Scoring CICF" section="PILOTAGE">
        <Alert><AlertDescription>Sélectionnez un groupement actif dans Paramètres.</AlertDescription></Alert>
      </ModulePageLayout>
    );
  }

  return (
    <ModulePageLayout
      title="Scoring CICF"
      section="PILOTAGE"
      description="Score consolidé du contrôle interne comptable et financier — agrégation établissements ↔ groupement."
      refs={[
        { code: 'M9-6', label: 'Instruction codificatrice EPLE' },
        { code: 'GBCP art. 170', label: 'Contrôle interne comptable' },
      ]}
      headerActions={
        <Button onClick={() => setDiffuserOpen(true)} className="bg-white/20 hover:bg-white/30 text-white border border-white/25" variant="outline">
          <Send className="h-4 w-4 mr-2" /> Diffuser le rapport
        </Button>
      }
    >
      {logoMissing && (
        <Alert className="border-primary/40 bg-primary/5">
          <Sparkles className="h-4 w-4" />
          <AlertTitle>Personnalisez vos rapports officiels</AlertTitle>
          <AlertDescription>
            Pour donner une allure officielle à vos rapports, déposez le logo du lycée siège de votre groupement dans <strong>Paramètres → Mon groupement</strong>.
          </AlertDescription>
        </Alert>
      )}

      {loading || !score ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <>
          {/* Score consolidé */}
          <Card className="overflow-hidden border-2 border-primary/10 shadow-elevated">
            <div className="bg-gradient-to-br from-primary via-primary/90 to-accent p-6 text-primary-foreground">
              <div className="flex items-center gap-6 flex-wrap">
                <div className="relative h-32 w-32 shrink-0">
                  <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="10" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round"
                      strokeDasharray={`${(score.score_global / 100) * 264} 264`} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold tabular-nums">{score.score_global}</span>
                    <span className="text-[10px] uppercase tracking-wider opacity-80">/ 100</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Score consolidé groupement</p>
                  <h2 className="text-2xl font-bold mb-1">{niveau?.label}</h2>
                  <p className="text-sm opacity-90">{groupement?.libelle} · {score.etablissements.length} établissement(s)</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] opacity-80 uppercase">Seuil d'alerte</p>
                  <p className="text-xl font-bold">{groupement?.seuil_alerte_score ?? 60}</p>
                </div>
              </div>
            </div>

            <CardContent className="pt-5 grid md:grid-cols-2 gap-6">
              <div className="h-[260px]">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Radar des 8 rubriques</p>
                <ResponsiveContainer>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="axe" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 8 }} />
                    <Radar dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.35} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="h-[260px]">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Évolution 24 mois</p>
                {history.length > 1 ? (
                  <ResponsiveContainer>
                    <LineChart data={history}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="periode" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="score_global" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                    Historique en cours de constitution (1 snapshot/mois).
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Alertes */}
          {score.alertes.length > 0 && (
            <div className="space-y-2 mt-4">
              {score.alertes.map((a, i) => (
                <Alert key={i} variant={a.type === 'seuil' ? 'destructive' : 'default'}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{a.message}</AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {/* Heatmap établissements × rubriques */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Building2 className="h-4 w-4" /> Heatmap établissements × rubriques</CardTitle>
              <CardDescription>Vert = excellent · Orange = à consolider · Rouge = critique</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr>
                    <th className="text-left p-2 sticky left-0 bg-card">Établissement</th>
                    <th className="p-2 text-center">Global</th>
                    {RUBRIQUES_SCORING.map(r => (
                      <th key={r.id} className="p-2 text-center text-[10px]">{r.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {score.etablissements.sort((a, b) => b.score_global - a.score_global).map(e => (
                    <tr key={e.etablissement_id} className="border-t">
                      <td className="p-2 font-medium sticky left-0 bg-card">{e.etablissement_label}</td>
                      <td className={`p-2 text-center font-bold tabular-nums ${niveauScoring(e.score_global).color}`}>{e.score_global}</td>
                      {e.rubriques.map(r => {
                        const n = niveauScoring(r.score);
                        return (
                          <td key={r.id} className={`p-2 text-center tabular-nums ${n.bg} ${n.color}`}>{r.score}</td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Quick-wins */}
          {score.quickWins.length > 0 && (
            <Card className="mt-4 border-emerald-500/30 bg-emerald-500/5">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-emerald-700"><TrendingUp className="h-4 w-4" /> Quick wins identifiés</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm">
                  {score.quickWins.map((q, i) => (
                    <li key={i} className="flex items-center justify-between">
                      <span>{q.libelle}</span>
                      <Badge variant="default" className="bg-emerald-600">+{q.gain_estime} pts</Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Archives */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Archive className="h-4 w-4" /> Archives des rapports</CardTitle>
            </CardHeader>
            <CardContent>
              {archives.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun rapport diffusé pour le moment.</p>
              ) : (
                <div className="space-y-2">
                  {archives.map(a => (
                    <div key={a.id} className="flex items-center justify-between p-2 border rounded-md text-sm">
                      <div>
                        <p className="font-medium">Rapport {a.etablissement_id ? 'établissement' : 'consolidé'} — Score {a.score_global}/100</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(a.created_at).toLocaleString('fr-FR')} · {(a.destinataires ?? []).length} destinataire(s) · {a.status}
                        </p>
                      </div>
                      <Badge variant={a.status === 'envoye' ? 'default' : 'secondary'}>{a.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {score && (
        <DiffuserDialog
          open={diffuserOpen}
          onClose={() => { setDiffuserOpen(false); loadArchives(); }}
          score={score}
          groupement={groupement}
          lyceeSiege={lyceeSiege}
          agentComptable={acAgent}
          etablissements={etablissements}
        />
      )}
    </ModulePageLayout>
  );
}

function DiffuserDialog({ open, onClose, score, groupement, lyceeSiege, agentComptable, etablissements }: any) {
  const [target, setTarget] = useState<'consolide' | string>('consolide');
  const [recipients, setRecipients] = useState<Record<string, boolean>>({
    ordonnateur: true, daf: false, inspection: false, crc: false, ac_copie: true,
  });
  const [message, setMessage] = useState('');
  const [autre, setAutre] = useState('');
  const [busy, setBusy] = useState(false);

  const cible = target === 'consolide' ? null : score.etablissements.find((e: any) => e.etablissement_id === target);
  const periodeDebut = new Date(); periodeDebut.setMonth(periodeDebut.getMonth() - 12);
  const periodeFin = new Date();

  const buildRapport = async (download: boolean) => {
    setBusy(true);
    try {
      const destinataires: string[] = [];
      if (recipients.ordonnateur) destinataires.push('Ordonnateur');
      if (recipients.daf && groupement?.email_rectorat_daf) destinataires.push(`Rectorat DAF (${groupement.email_rectorat_daf})`);
      if (recipients.inspection && groupement?.email_rectorat_inspection) destinataires.push(`Inspection (${groupement.email_rectorat_inspection})`);
      if (recipients.crc && groupement?.email_crc) destinataires.push(`CRC (${groupement.email_crc})`);
      if (autre.trim()) destinataires.push(autre.trim());

      const blob = await genererRapportMaturite(score, {
        groupementLabel: groupement?.libelle ?? '',
        academie: groupement?.academie ?? 'Guadeloupe',
        lyceeSiegeNom: lyceeSiege?.nom,
        logoLyceeUrl: groupement?.logo_url ?? undefined,
        signatureAcUrl: groupement?.signature_ac_url ?? undefined,
        agentComptableNom: agentComptable ? `${agentComptable.prenom} ${agentComptable.nom}` : 'Agent comptable',
        destinataires,
        periodeDebut: periodeDebut.toISOString(),
        periodeFin: periodeFin.toISOString(),
        messageAc: message,
        estConsolide: target === 'consolide',
        etablissementCible: cible ?? undefined,
      });

      // Téléchargement local
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = pdfFileName({ estConsolide: target === 'consolide', libelle: cible?.etablissement_label ?? groupement?.libelle ?? 'groupement' });
      a.click();
      URL.revokeObjectURL(url);

      // Archivage en DB
      await (supabase as any).from('rapports_maturite').insert({
        groupement_id: groupement.id,
        etablissement_id: target === 'consolide' ? null : target,
        periode_debut: periodeDebut.toISOString().slice(0, 10),
        periode_fin: periodeFin.toISOString().slice(0, 10),
        score_global: cible?.score_global ?? score.score_global,
        destinataires,
        objet: `[CICF] Rapport de maturité — ${cible?.etablissement_label ?? groupement?.libelle} — ${periodeFin.getFullYear()}`,
        message,
        status: download ? 'brouillon' : 'envoye',
        envoye_at: download ? null : new Date().toISOString(),
      });

      toast.success(download ? 'Rapport téléchargé et archivé' : 'Rapport diffusé (PDF téléchargé) et archivé');
      onClose();
    } catch (e: any) {
      toast.error('Erreur : ' + (e.message ?? e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><FileBarChart className="h-5 w-5" /> Diffuser le rapport de maturité</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Version du rapport</Label>
            <select className="w-full border rounded-md p-2 text-sm" value={target} onChange={e => setTarget(e.target.value)}>
              <option value="consolide">Consolidé groupement</option>
              {etablissements.map((e: any) => (
                <option key={e.id} value={e.id}>{e.uai} — {e.nom}</option>
              ))}
            </select>
          </div>

          <div>
            <Label>Destinataires</Label>
            <div className="space-y-1.5 mt-1">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={recipients.ordonnateur} onCheckedChange={v => setRecipients({ ...recipients, ordonnateur: !!v })} />
                Ordonnateur de l'établissement
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={recipients.daf} onCheckedChange={v => setRecipients({ ...recipients, daf: !!v })} />
                Rectorat — DAF {groupement?.email_rectorat_daf && <Badge variant="secondary" className="text-[10px]">{groupement.email_rectorat_daf}</Badge>}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={recipients.inspection} onCheckedChange={v => setRecipients({ ...recipients, inspection: !!v })} />
                Rectorat — Inspection {groupement?.email_rectorat_inspection && <Badge variant="secondary" className="text-[10px]">{groupement.email_rectorat_inspection}</Badge>}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={recipients.crc} onCheckedChange={v => setRecipients({ ...recipients, crc: !!v })} />
                Chambre régionale des comptes {groupement?.email_crc && <Badge variant="secondary" className="text-[10px]">{groupement.email_crc}</Badge>}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={recipients.ac_copie} onCheckedChange={v => setRecipients({ ...recipients, ac_copie: !!v })} />
                Copie à l'agent comptable
              </label>
            </div>
          </div>

          <div>
            <Label>Autre destinataire (email libre)</Label>
            <Input value={autre} onChange={e => setAutre(e.target.value)} placeholder="email@exemple.fr" />
          </div>

          <div>
            <Label>Mot de l'agent comptable (page synthèse)</Label>
            <Textarea rows={4} value={message} onChange={e => setMessage(e.target.value)}
              placeholder="Message éditable pré-rédigé en cas de blanc." />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button variant="outline" disabled={busy} onClick={() => buildRapport(true)}>
            <Download className="h-4 w-4 mr-2" /> Télécharger
          </Button>
          <Button disabled={busy} onClick={() => buildRapport(false)}>
            <Send className="h-4 w-4 mr-2" /> Diffuser et archiver
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

```

### FICHIER : src/pages/Stocks.tsx

```tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { StockItem, fmt } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';

import { CONTROLES_STOCKS } from '@/lib/regulatory-data';
import { ModulePageLayout, AnomalyAlert, ComplianceCheck, ModuleSection } from '@/components/ModulePageLayout';
import { ControlAlert } from '@/components/ControlAlert';
import { DoctrineEPLE } from '@/components/DoctrineEPLE';

/** Seuil critique : un article sans mouvement depuis > 12 mois doit être déclassé (M9-6 § 2.1.4). */
const SEUIL_ROTATION_MOIS = 12;

export default function Stocks() {
  const [items, setItems] = useState<StockItem[]>(() => loadState('stocks', []));
  const [regChecks, setRegChecks] = useState<Record<string, boolean>>(() => loadState('stocks_checks', {}));
  const toggleRegCheck = (id: string) => { const u = { ...regChecks, [id]: !regChecks[id] }; setRegChecks(u); saveState('stocks_checks', u); };
  const [form, setForm] = useState<any>(null);
  const save = (d: StockItem[]) => { setItems(d); saveState('stocks', d); };

  const submit = () => {
    if (!form || !form.nom) return;
    const phys = parseInt(form.phys) || 0, cu = parseFloat(form.cump) || 0;
    const ecart = phys - (parseInt(form.theo) || 0);
    const dlcAlert = form.dlc && (new Date(form.dlc).getTime() - Date.now()) < 7 * 86400000;
    const item: StockItem = { id: form.id || crypto.randomUUID(), ref: form.ref, nom: form.nom, categorie: form.categorie, theo: parseInt(form.theo) || 0, phys, ecart, cump: cu, valeur: phys * cu, dlc: form.dlc, statut: dlcAlert ? 'Alerte DLC' : 'Normal', fournisseur: form.fournisseur };
    if (form.id) save(items.map(i => i.id === form.id ? item : i));
    else save([...items, item]);
    setForm(null);
  };

  const ecarts = items.filter(x => x.ecart !== 0);
  const alertesDLC = items.filter(x => x.statut !== 'Normal');

  // Rotation > 12 mois : DLC dépassée de plus d'un an OU pas de DLC + valeur résiduelle = stock dormant
  const dormants = items.filter(x => {
    if (!x.dlc) return false;
    const moisDepuisDLC = (Date.now() - new Date(x.dlc).getTime()) / (30 * 86400000);
    return moisDepuisDLC > SEUIL_ROTATION_MOIS && x.valeur > 0;
  });

  return (
    <ModulePageLayout
      title="Stocks denrées"
      section="CONTRÔLES SUR PLACE"
      description="Inventaire physique des denrées alimentaires, rapprochement avec le stock théorique (comptable), valorisation au CUMP et contrôle des dates limites de consommation."
      refs={[
        { code: 'M9-6 § 2.1.4', label: 'Inventaire physique' },
        { code: 'M9-6 § 4.4', label: 'Valorisation CUMP' },
        { code: 'PCG art. 213-33', label: 'Méthode du coût moyen pondéré' },
      ]}
      headerActions={
        <Button className="bg-white/20 hover:bg-white/30 text-white border-white/25" variant="outline"
          onClick={() => setForm({ ref: 'D-' + String(items.length + 1).padStart(3, '0'), nom: '', categorie: 'Viandes', theo: '', phys: '', cump: '', dlc: '', fournisseur: '' })}
        ><Plus className="h-4 w-4 mr-2" /> Ajouter</Button>
      }
      completedChecks={(CONTROLES_STOCKS).filter(c => regChecks[c.id]).length}
      totalChecks={(CONTROLES_STOCKS).length}
    >
      <DoctrineEPLE theme="stocks" titre="Stocks & inventaire" resume="Inventaire physique, CMUP, stocks dormants > 12 mois" />
      {/* ─── KPI ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold">{items.length}</p><p className="text-xs text-muted-foreground">Articles</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold">{fmt(items.reduce((s, x) => s + x.valeur, 0))}</p><p className="text-xs text-muted-foreground">Valeur stock</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className={`text-2xl font-bold ${ecarts.length > 0 ? 'text-destructive' : 'text-green-600'}`}>{ecarts.length}</p><p className="text-xs text-muted-foreground">Écarts</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className={`text-2xl font-bold ${alertesDLC.length > 0 ? 'text-destructive' : 'text-green-600'}`}>{alertesDLC.length}</p><p className="text-xs text-muted-foreground">Alertes DLC</p></CardContent></Card>
      </div>

      {/* Contrôles réglementaires */}
      <ModuleSection title="Contrôles réglementaires — Stocks" description="M9-6 § 2.1.4 — PCG art. 213-33" badge={`${(CONTROLES_STOCKS).filter(c => regChecks[c.id]).length}/${(CONTROLES_STOCKS).length}`}>
        <Card className="shadow-card">
          <CardContent className="p-3 space-y-2">
            {CONTROLES_STOCKS.map(item => (
              <ComplianceCheck
                key={item.id}
                label={item.label}
                checked={regChecks[item.id] || false}
                onChange={() => toggleRegCheck(item.id)}
                severity={item.severity}
                detail={item.ref}
              />
            ))}
          </CardContent>
        </Card>
      </ModuleSection>

      {ecarts.length > 0 && (
        <AnomalyAlert title={`${ecarts.length} écart${ecarts.length > 1 ? 's' : ''} entre stock physique et théorique`} description="Tout écart doit être justifié et régularisé comptablement (manquant = charge exceptionnelle C/6718)." severity="warning" />
      )}

      {dormants.length > 0 && (
        <ControlAlert
          level="alerte"
          title={`${dormants.length} article${dormants.length > 1 ? 's' : ''} sans rotation depuis plus de ${SEUIL_ROTATION_MOIS} mois`}
          description={`Stock dormant valorisé à ${fmt(dormants.reduce((s, x) => s + x.valeur, 0))}. Tout article sans mouvement depuis plus d'un an doit être analysé : déclassement, dépréciation (C/6817) ou destruction (PV à joindre).`}
          action="Établir un PV de destruction ou constater une dépréciation pour les articles concernés. Vérifier la fiabilité du fichier inventaire."
          refKey="m96-2-1-4"
          refLabel="M9-6 § 2.1.4 — Inventaire physique"
        />
      )}

      {form && (
        <Card className="border-primary">
          <CardContent className="pt-6 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1"><Label className="text-xs">Référence</Label><Input value={form.ref} onChange={e => setForm({ ...form, ref: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Désignation</Label><Input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Catégorie</Label><Input value={form.categorie} onChange={e => setForm({ ...form, categorie: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Fournisseur</Label><Input value={form.fournisseur} onChange={e => setForm({ ...form, fournisseur: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Qté théorique</Label><Input type="number" value={form.theo} onChange={e => setForm({ ...form, theo: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Qté physique</Label><Input type="number" value={form.phys} onChange={e => setForm({ ...form, phys: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">CUMP (€)</Label><Input type="number" value={form.cump} onChange={e => setForm({ ...form, cump: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">DLC</Label><Input type="date" value={form.dlc} onChange={e => setForm({ ...form, dlc: e.target.value })} /></div>
            </div>
            <div className="flex gap-2"><Button onClick={submit}>Valider</Button><Button variant="outline" onClick={() => setForm(null)}>Annuler</Button></div>
          </CardContent>
        </Card>
      )}

      {items.length === 0 && !form && <Card className="shadow-card"><CardContent className="py-12 text-center text-muted-foreground">Aucun article en stock.</CardContent></Card>}

      {items.length > 0 && (
        <Card className="shadow-card">
          <CardContent className="pt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">Réf</th><th className="text-left p-2">Désignation</th><th className="p-2">Théo</th><th className="p-2">Phys</th><th className="p-2">Écart</th><th className="text-right p-2">CUMP</th><th className="text-right p-2">Valeur</th><th className="p-2">DLC</th><th className="p-2">Statut</th><th></th></tr></thead>
              <tbody>{items.map(x => (
                <tr key={x.id} className="border-b hover:bg-muted/50">
                  <td className="p-2 font-mono text-xs">{x.ref}</td>
                  <td className="p-2 font-medium">{x.nom}<br /><span className="text-xs text-muted-foreground">{x.categorie} — {x.fournisseur}</span></td>
                  <td className="p-2 text-center font-mono">{x.theo}</td>
                  <td className="p-2 text-center font-mono font-bold">{x.phys}</td>
                  <td className={`p-2 text-center font-mono font-bold ${x.ecart === 0 ? 'text-green-600' : 'text-destructive'}`}>{x.ecart >= 0 ? '+' : ''}{x.ecart}</td>
                  <td className="p-2 text-right font-mono">{fmt(x.cump)}</td>
                  <td className="p-2 text-right font-mono font-bold">{fmt(x.valeur)}</td>
                  <td className="p-2 text-xs">{x.dlc}</td>
                  <td className="p-2"><Badge variant={x.statut === 'Normal' ? 'secondary' : 'destructive'}>{x.statut}</Badge></td>
                  <td className="p-2"><div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setForm({ ...x, theo: String(x.theo), phys: String(x.phys), cump: String(x.cump) })}><Pencil className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => save(items.filter(i => i.id !== x.id))}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </ModulePageLayout>
  );
}

```

### FICHIER : src/pages/Subventions.tsx

```tsx
import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Pencil, AlertTriangle } from 'lucide-react';
import { SubventionItem, fmt, fmtDate } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';
import { CONTROLES_SUBVENTIONS } from '@/lib/regulatory-data';
import { ModulePageLayout , ComplianceCheck, ModuleSection } from '@/components/ModulePageLayout';
import { ControlAlert } from '@/components/ControlAlert';
import { DoctrineEPLE } from '@/components/DoctrineEPLE';

export default function Subventions() {
  const [items, setItems] = useState<SubventionItem[]>(() => loadState('subventions', []));
  const [regChecks, setRegChecks] = useState<Record<string, boolean>>(() => loadState('subventions_checks', {}));
  const toggleRegCheck = (id: string) => { const u = { ...regChecks, [id]: !regChecks[id] }; setRegChecks(u); saveState('subventions_checks', u); };
  const [form, setForm] = useState<any>(null);
  const save = (d: SubventionItem[]) => { setItems(d); saveState('subventions', d); };

  const submit = () => {
    if (!form || !form.type) return;
    const notif = parseFloat(form.notifie) || 0, conso = parseFloat(form.consomme) || 0;
    const item: SubventionItem = {
      id: form.id || crypto.randomUUID(), type: form.type, programme: form.programme,
      notifie: notif, recu: parseFloat(form.recu) || 0, conditionsEmploi: form.conditionsEmploi || false,
      consomme: conso, reliquat: notif - conso, statut: form.statut,
      dateVersement: form.dateVersement || '', observations: form.observations || '',
    };
    if (form.id) save(items.map(i => i.id === form.id ? item : i));
    else save([...items, item]);
    setForm(null);
  };

  // Déchéance quadriennale check
  const checkDecheance = (dateVersement: string) => {
    if (!dateVersement) return null;
    const d = new Date(dateVersement);
    const now = new Date();
    const diffYears = (now.getTime() - d.getTime()) / (365.25 * 24 * 3600 * 1000);
    if (diffYears >= 4) return 'PRESCRITE';
    if (diffYears >= 3) return 'ALERTE';
    return null;
  };

  return (
    <ModulePageLayout
      title="Subventions"
      section="FINANCES & BUDGET"
      description="Suivi des notifications de subventions, vérification de l'emploi conforme à l'objet, et justification auprès des financeurs (Région, Département, État, Europe)."
      refs={[
        { code: "Art. R.421-58 C.Édu", label: "Budget de l'EPLE" },
        { code: "Art. 10 loi 2000-321", label: "Obligation de justification" },
        { code: "M9-6 § 4.2", label: "Constatation des recettes" },
      ]}
      completedChecks={(CONTROLES_SUBVENTIONS).filter(c => regChecks[c.id]).length}
      totalChecks={(CONTROLES_SUBVENTIONS).length}
    >
      <DoctrineEPLE theme="subventions" titre="Subventions affectées" resume="Loi 68-1250 — prescription quadriennale, reversement du solde non employé" />

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold">{items.length}</p><p className="text-xs text-muted-foreground mt-0.5">Subventions suivies</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold">{fmt(items.reduce((s,x) => s + (x.notifie || 0), 0))}</p><p className="text-xs text-muted-foreground mt-0.5">Total notifié</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold text-green-600">{items.filter(x => x.conditionsEmploi).length}</p><p className="text-xs text-muted-foreground mt-0.5">Emploi justifié</p></CardContent></Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => setForm({ type: 'DGF État', programme: 'P141', notifie: '', recu: '', consomme: '', conditionsEmploi: false, statut: 'En cours', dateVersement: '', observations: '' })}><Plus className="h-4 w-4 mr-2" /> Ajouter</Button>
      </div>

      {form && (
        <Card className="border-primary"><CardContent className="pt-6 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="space-y-1"><Label className="text-xs">Type</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                {['DGF État', 'Bourses', 'Fonds sociaux', 'Région', 'Département', 'Taxe apprentissage', 'Subv. européenne', 'Autre'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1"><Label className="text-xs">Programme</Label><Input value={form.programme} onChange={e => setForm({ ...form, programme: e.target.value })} placeholder="P141, P230..." /></div>
            <div className="space-y-1"><Label className="text-xs">Notifié (€)</Label><Input type="number" value={form.notifie} onChange={e => setForm({ ...form, notifie: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Reçu (€)</Label><Input type="number" value={form.recu} onChange={e => setForm({ ...form, recu: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Consommé (€)</Label><Input type="number" value={form.consomme} onChange={e => setForm({ ...form, consomme: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Date de versement</Label><Input type="date" value={form.dateVersement} onChange={e => setForm({ ...form, dateVersement: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Statut</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.statut} onChange={e => setForm({ ...form, statut: e.target.value })}>
                <option>En cours</option><option>Soldé</option><option>Sous-consommé</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2"><Checkbox checked={form.conditionsEmploi} onCheckedChange={v => setForm({ ...form, conditionsEmploi: v })} /><Label className="text-xs">Conditions d'emploi</Label></div>
          <div className="space-y-1"><Label className="text-xs">Observations</Label><Textarea value={form.observations || ''} onChange={e => setForm({ ...form, observations: e.target.value })} rows={2} placeholder="Observations..." /></div>
          <div className="flex gap-2"><Button onClick={submit}>Valider</Button><Button variant="outline" onClick={() => setForm(null)}>Annuler</Button></div>
        </CardContent></Card>
      )}

      {items.length === 0 && !form && <Card><CardContent className="py-12 text-center text-muted-foreground">Aucune subvention.</CardContent></Card>}
      {items.length > 0 && (
        <Card><CardContent className="pt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>{items.map(x => {
              const tx = x.notifie > 0 ? x.consomme / x.notifie * 100 : 0;
              const dech = checkDecheance(x.dateVersement);
              return (
                <tr key={x.id} className={`border-b ${dech === 'PRESCRITE' ? 'bg-destructive/5' : ''}`}>
                  <td className="p-2 font-bold">{x.type}</td><td className="p-2 font-mono">{x.programme}</td>
                  <td className="p-2 text-right font-mono">{fmt(x.notifie)}</td><td className="p-2 text-right font-mono font-bold">{fmt(x.consomme)}</td>
                  <td className={`p-2 font-bold ${tx < 50 ? 'text-destructive' : 'text-green-600'}`}>{tx.toFixed(1)}%</td>
                  <td className={`p-2 text-right font-mono ${x.reliquat > 0 ? 'text-orange-600' : 'text-green-600'}`}>{fmt(x.reliquat)}</td>
                  <td className="p-2 text-xs">{x.dateVersement ? fmtDate(x.dateVersement) : '—'}</td>
                  <td className="p-2">
                    {dech === 'PRESCRITE' && <Badge variant="destructive">Prescrite</Badge>}
                    {dech === 'ALERTE' && <Badge className="bg-orange-500 text-white">3 ans+</Badge>}
                    {!dech && x.dateVersement && <span className="text-xs text-green-600">OK</span>}
                  </td>
                  <td className="p-2"><Badge variant={x.statut === 'Sous-consommé' ? 'destructive' : 'default'}>{x.statut}</Badge></td>
                  <td className="p-2"><div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setForm({ ...x, notifie: String(x.notifie), recu: String(x.recu), consomme: String(x.consomme) })}><Pencil className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => save(items.filter(i => i.id !== x.id))}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                  </div></td>
                </tr>
              );
            })}</tbody>
          </table>
        </CardContent></Card>
      )}

      {/* Alerte déchéance quadriennale (Loi 68-1250) */}
      {(() => {
        const prescrites = items.filter(x => checkDecheance(x.dateVersement) === 'PRESCRITE');
        const proches = items.filter(x => checkDecheance(x.dateVersement) === 'ALERTE');
        if (prescrites.length === 0 && proches.length === 0) return null;
        return (
          <ControlAlert
            level={prescrites.length > 0 ? 'critique' : 'alerte'}
            title={prescrites.length > 0
              ? `${prescrites.length} subvention${prescrites.length > 1 ? 's atteintes' : ' atteinte'} par la déchéance quadriennale`
              : `${proches.length} subvention${proches.length > 1 ? 's' : ''} approchant de la déchéance quadriennale (3 ans+)`}
            description={`Toute créance non réclamée à l'État dans le délai de 4 ans à compter du 1er janvier de l'année suivant le fait générateur est définitivement éteinte. ${prescrites.length > 0 ? `Montant prescrit : ${fmt(prescrites.reduce((s, x) => s + x.reliquat, 0))}.` : ''}`}
            action={prescrites.length > 0
              ? "Constater la perte (compte 6718) et tracer la décision motivée du CA. Identifier les défaillances de suivi pour prévenir de nouvelles prescriptions."
              : "Émettre sans délai le titre de recette ou produire le justificatif d'emploi auprès du financeur. Relancer formellement avant la date butoir."}
            refLabel="Loi 68-1250 — Déchéance quadriennale"
          />
        );
      })()}

      {/* Alerte reliquats */}
      {items.filter(x => x.reliquat > 0 && x.statut !== 'Soldé').length > 0 && (
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="pt-4 space-y-2">
            <div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-orange-500" /><p className="font-bold text-sm">Reliquats de subventions non apurés</p></div>
            {items.filter(x => x.reliquat > 0 && x.statut !== 'Soldé').map(x => (
              <div key={x.id} className="text-sm p-2 rounded bg-orange-50 border border-orange-200">
                <p className="font-bold">{x.type} — {x.programme} — Reliquat : {fmt(x.reliquat)}</p>
                <p className="text-xs text-orange-700 italic mt-1">Qu'est-ce qui vous empêche d'apurer ce reliquat de subvention ?</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Contrôles réglementaires */}
      <ModuleSection title="Contrôles réglementaires — Subventions" description="Art. 10 Loi 2000-321" badge={`${(CONTROLES_SUBVENTIONS).filter(c => regChecks[c.id]).length}/${(CONTROLES_SUBVENTIONS).length}`}>
        <Card className="shadow-card">
          <CardContent className="p-3 space-y-2">
            {CONTROLES_SUBVENTIONS.map(item => (
              <ComplianceCheck
                key={item.id}
                label={item.label}
                checked={regChecks[item.id] || false}
                onChange={() => toggleRegCheck(item.id)}
                severity={item.severity}
                detail={item.ref}
              />
            ))}
          </CardContent>
        </Card>
      </ModuleSection>
    </ModulePageLayout>
  );
}

```

### FICHIER : src/pages/Verification.tsx

```tsx
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { loadState, saveState } from '@/lib/store';
import { ModulePageLayout, ModuleSection, ComplianceCheck, AnomalyAlert } from '@/components/ModulePageLayout';
import { ControlAlert } from '@/components/ControlAlert';
import { RegRefBadge } from '@/components/RegRefBadge';
import { VERIFICATION_QUOTIDIENNE } from '@/lib/regulatory-data';
import { DoctrineEPLE } from '@/components/DoctrineEPLE';

/* ═══ Les 5 motifs légaux de suspension de paiement (Art. 38 GBCP) ═══ */
const MOTIFS_SUSPENSION_PAIEMENT = [
  {
    id: 'm1', titre: '1 — Qualité de l\'ordonnateur ou du délégataire',
    detail: 'L\'acte d\'ordonnancement n\'émane pas d\'une autorité régulièrement habilitée (défaut de délégation, délégation expirée, signature non conforme à l\'accréditation déposée).',
    indice: 'Vérifier l\'accréditation de l\'ordonnateur et la chaîne des délégations.',
  },
  {
    id: 'm2', titre: '2 — Disponibilité des crédits',
    detail: 'L\'imputation budgétaire est inexistante, le crédit est insuffisant, ou la dépense excède le plafond autorisé par le budget voté.',
    indice: 'Contrôler la cohérence imputation/budget et la consommation actuelle des crédits.',
  },
  {
    id: 'm3', titre: '3 — Exacte imputation comptable',
    detail: 'Le compte d\'imputation choisi ne correspond pas à la nature économique de la dépense au sens de la M9-6 (ex. fonctionnement vs investissement).',
    indice: 'Croiser libellé du marché / nature de la PJ / nomenclature M9-6.',
  },
  {
    id: 'm4', titre: '4 — Validité de la créance (service fait + PJ)',
    detail: 'Service fait non attesté, pièces justificatives manquantes ou non conformes à l\'arrêté du 25/07/2013 (devis, BC, BL, facture, certif. service fait...), liquidation arithmétiquement erronée.',
    indice: 'Vérifier la liste des PJ obligatoires selon la nature de la dépense.',
  },
  {
    id: 'm5', titre: '5 — Caractère libératoire du paiement',
    detail: 'Le RIB du créancier ne correspond pas à l\'identité légale du fournisseur, le mode de règlement ne libère pas la dette (paiement à un tiers non mandaté), opposition reçue.',
    indice: 'Vérifier RIB ↔ raison sociale ↔ SIRET sur l\'extrait Kbis ou via INSEE.',
  },
] as const;

const CATEGORIES = [
  { key: 'caisse_tresorerie', title: 'Caisse et trésorerie', icon: '🏦' },
  { key: 'comptabilite', title: 'Comptabilité générale', icon: '📒' },
  { key: 'regies', title: 'Régies', icon: '💰' },
  { key: 'recettes', title: 'Recettes et recouvrement', icon: '📥' },
  { key: 'depenses', title: 'Dépenses', icon: '📤' },
  { key: 'organisation', title: 'Organisation du service', icon: '🏗' },
] as const;

// Flatten all items for counting
const ALL_ITEMS = Object.values(VERIFICATION_QUOTIDIENNE).flat();

export default function VerificationPage() {
  const [checks, setChecks] = useState<Record<string, boolean>>(() => loadState('verification_checks_v2', {}));
  const [observations, setObservations] = useState<string>(() => loadState('verification_obs', ''));

  const toggleCheck = (id: string) => {
    const updated = { ...checks, [id]: !checks[id] };
    setChecks(updated);
    saveState('verification_checks_v2', updated);
  };

  const updateObs = (val: string) => {
    setObservations(val);
    saveState('verification_obs', val);
  };

  const completedCount = useMemo(() => ALL_ITEMS.filter(i => checks[i.id]).length, [checks]);
  const criticalUnchecked = useMemo(
    () => ALL_ITEMS.filter(i => i.severity === 'critique' && !checks[i.id]),
    [checks],
  );

  return (
    <ModulePageLayout
      title="Vérification quotidienne"
      section="VÉRIFICATION & ORDONNATEUR"
      description="Points de contrôle à vérifier lors de la visite sur place ou de l'audit périodique de l'agence comptable."
      refs={[
        { refKey: 'gbcp-19', label: 'Contrôles AC dépenses' },
        { refKey: 'gbcp-20', label: 'Contrôles AC recettes' },
        { refKey: 'gbcp-38', label: '5 motifs suspension' },
        { refKey: 'arrete-pj-2013', label: 'Pièces justificatives' },
        { refKey: 'm96-2.4', label: 'Comptes d\'attente' },
        { refKey: 'rgp-l131-9', label: 'RGP' },
      ]}
      completedChecks={completedCount}
      totalChecks={ALL_ITEMS.length}
    >
      <DoctrineEPLE theme="verification" titre="Vérification quotidienne" resume="Doctrine d'agent comptable EPLE — contrôles préalables au paiement" />

      {/* ─── KPI Row ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-foreground">{completedCount}/{ALL_ITEMS.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Points vérifiés</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-destructive">{criticalUnchecked.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Critiques restants</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-foreground">{CATEGORIES.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Domaines couverts</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <p className={`text-2xl font-bold ${completedCount === ALL_ITEMS.length ? 'text-green-600' : 'text-foreground'}`}>
              {completedCount === ALL_ITEMS.length ? '✓' : Math.round(completedCount / ALL_ITEMS.length * 100) + '%'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Taux de conformité</p>
          </CardContent>
        </Card>
      </div>

      {/* ─── Anomalies alert ─── */}
      {criticalUnchecked.length > 0 && criticalUnchecked.length <= 3 && (
        <AnomalyAlert
          title={`${criticalUnchecked.length} point${criticalUnchecked.length > 1 ? 's' : ''} critique${criticalUnchecked.length > 1 ? 's' : ''} non vérifié${criticalUnchecked.length > 1 ? 's' : ''}`}
          description={criticalUnchecked.map(c => c.label).join(' • ')}
          severity="error"
        />
      )}

      {/* ═══ Les 5 motifs légaux de suspension de paiement (Art. 38 GBCP) ═══ */}
      <ModuleSection
        title="🛑 Les 5 motifs légaux de suspension de paiement"
        description="Article 38 du décret GBCP 2012-1246 — l'agent comptable DOIT suspendre le paiement dès qu'un seul de ces motifs est constaté."
        badge="Art. 38 GBCP"
      >
        <div className="space-y-2">
          {MOTIFS_SUSPENSION_PAIEMENT.map(m => (
            <ControlAlert key={m.id} level="info"
              title={m.titre}
              description={m.detail}
              refKey="gbcp-38"
              action={m.indice} />
          ))}
        </div>
      </ModuleSection>

      {/* ─── Check sections ─── */}
      {CATEGORIES.map(cat => {
        const items = VERIFICATION_QUOTIDIENNE[cat.key as keyof typeof VERIFICATION_QUOTIDIENNE];
        const catCompleted = items.filter(i => checks[i.id]).length;

        return (
          <ModuleSection
            key={cat.key}
            title={`${cat.icon} ${cat.title}`}
            badge={`${catCompleted}/${items.length}`}
          >
            <Card className="shadow-card">
              <CardContent className="p-3 space-y-2">
                {items.map(item => (
                  <ComplianceCheck
                    key={item.id}
                    label={item.label}
                    checked={checks[item.id] || false}
                    onChange={() => toggleCheck(item.id)}
                    severity={item.severity}
                    detail={'detail' in item ? (item as any).detail : `Réf. : ${item.ref}`}
                  />
                ))}
              </CardContent>
            </Card>
          </ModuleSection>
        );
      })}

      {/* ─── Observations ─── */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base font-bold">Observations de l'auditeur</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={observations}
            onChange={e => updateObs(e.target.value)}
            placeholder="Constats, anomalies, recommandations..."
            rows={5}
            className="resize-y"
          />
        </CardContent>
      </Card>
    </ModulePageLayout>
  );
}

```

### FICHIER : src/pages/Voyages.tsx

```tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { VoyageScolaire, SEUILS_MARCHES } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';
import { CONTROLES_VOYAGES } from '@/lib/regulatory-data';
import { ModulePageLayout , ComplianceCheck, ModuleSection } from '@/components/ModulePageLayout';
import { ControlAlert } from '@/components/ControlAlert';
import { DoctrineEPLE } from '@/components/DoctrineEPLE';

/* ═══ Détection voyages "Erasmus-éligibles" : longue distance ou hors UE ═══ */
const DESTINATIONS_LOINTAINES = /\b(canada|usa|etats[- ]unis|japon|chine|inde|asie|amerique|australie|nouvelle[- ]zelande|bresil|argentine|mexique|afrique|maroc|tunisie|egypte|reunion|guadeloupe|martinique|guyane|nouvelle[- ]caledonie|polynesie)\b/i;
const SEUIL_VOYAGE_LOINTAIN = 1500; // € / élève — proxy financier d'un voyage > 7000 km
function isVoyageLointain(v: VoyageScolaire): boolean {
  if (DESTINATIONS_LOINTAINES.test(v.destination || '')) return true;
  // Proxy : voyage de plusieurs jours et coût/élève élevé → souvent > 7000 km
  if (v.montantTotal >= 30000 && v.dateDepart && v.dateRetour) {
    const j = (new Date(v.dateRetour).getTime() - new Date(v.dateDepart).getTime()) / 86400000;
    if (j >= 5 && v.montantTotal >= SEUIL_VOYAGE_LOINTAIN * 20) return true;
  }
  return false;
}

const PIECES_OBLIGATOIRES = [
  { key: 'listeParticipants', label: 'Liste nominative des participants (élèves et accompagnateurs)' },
  { key: 'budgetVoyage', label: 'Budget prévisionnel détaillé du voyage (recettes/dépenses)' },
  { key: 'acteCA_programmation', label: 'Acte du CA autorisant la programmation annuelle des voyages' },
  { key: 'acteCA_financement', label: 'Acte du CA approuvant le plan de financement (participation familles)' },
  { key: 'acteCA_conventions', label: 'Acte du CA autorisant la signature de conventions (hébergement, transport)' },
  { key: 'acteCA_dons', label: 'Acte du CA autorisant la perception de dons (acte-cadre annuel inclus)' },
] as const;

function calculerScoring(v: VoyageScolaire) {
  if (v.montantTotal <= 0) return null;
  const recettesSures = v.montantEncaisseFamilles + (v.notificationCollectivites ? v.montantNotifie : 0);
  const tauxCouverture = recettesSures / v.montantTotal;
  const risque = 1 - tauxCouverture;
  return {
    tauxCouverture: Math.round(tauxCouverture * 100),
    risque: Math.round(risque * 100),
    niveau: risque > 0.5 ? 'élevé' : risque > 0.25 ? 'modéré' : 'faible',
  };
}

const EMPTY_VOYAGE: Omit<VoyageScolaire, 'id'> = {
  intitule: '', destination: '', dateDepart: '', dateRetour: '',
  montantTotal: 0, montantEncaisseFamilles: 0,
  notificationCollectivites: false, montantNotifie: 0, promessesDons: 0,
  listeParticipants: false, budgetVoyage: false,
  acteCA_programmation: false, acteCA_financement: false,
  acteCA_conventions: false, acteCA_dons: false,
  erasmusSubvention: false, erasmusMontant: 0, observations: '',
};

export default function VoyagesPage() {
  const [voyages, setVoyages] = useState<VoyageScolaire[]>(() => loadState('voyages', []));
  const [regChecks, setRegChecks] = useState<Record<string, boolean>>(() => loadState('voyages_checks', {}));
  const toggleRegCheck = (id: string) => { const u = { ...regChecks, [id]: !regChecks[id] }; setRegChecks(u); saveState('voyages_checks', u); };

  const save = (v: VoyageScolaire[]) => { setVoyages(v); saveState('voyages', v); };

  const addVoyage = () => {
    save([...voyages, { ...EMPTY_VOYAGE, id: crypto.randomUUID() }]);
  };

  const updateVoyage = (id: string, partial: Partial<VoyageScolaire>) => {
    save(voyages.map(v => v.id === id ? { ...v, ...partial } : v));
  };

  const removeVoyage = (id: string) => {
    save(voyages.filter(v => v.id !== id));
  };

  return (
    <ModulePageLayout
      title="Voyages scolaires"
      section="GESTION COMPTABLE"
      description="Vérification des pièces obligatoires, analyse du risque financier et conformité avec la circulaire du 16 juillet 2024. Aucun voyage ne peut être organisé sans financement intégralement assuré."
      refs={[
        { refKey: 'circ-voyages-2024', label: 'Voyages 2024' },
        { refKey: 'ce-r421-20', label: 'Compétences CA' },
        { refKey: 'circ-voyages-2011', label: 'Actes du CA' },
        { refKey: 'erasmus-7074', label: 'Erasmus+' },
        { refKey: 'ccp-seuils-2026', label: 'Seuils CCP 2026' },
      ]}
      headerActions={
        <Button className="bg-white/20 hover:bg-white/30 text-white border-white/25" variant="outline" onClick={addVoyage}>
          <Plus className="h-4 w-4 mr-2" /> Ajouter un voyage
        </Button>
      }
      completedChecks={(CONTROLES_VOYAGES).filter(c => regChecks[c.id]).length}
      totalChecks={(CONTROLES_VOYAGES).length}
    >
      <DoctrineEPLE theme="voyages" titre="Voyages scolaires" resume="Acte CA, équilibre budget, gratuité accompagnateurs, FSC" />

      {voyages.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="py-12 text-center text-muted-foreground">
            Aucun voyage scolaire enregistré. Cliquez sur « Ajouter un voyage » pour commencer.
          </CardContent>
        </Card>
      )}

      {voyages.map(voyage => {
        const scoring = calculerScoring(voyage);
        const seuilAtteint = SEUILS_MARCHES.filter(s => voyage.montantTotal >= s.seuil).pop();

        return (
          <Card key={voyage.id}>
            <CardHeader className="flex flex-row items-start justify-between">
              <CardTitle className="text-lg">{voyage.intitule || 'Nouveau voyage'}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => removeVoyage(voyage.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Infos générales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Intitulé</Label>
                  <Input value={voyage.intitule} onChange={e => updateVoyage(voyage.id, { intitule: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Destination</Label>
                  <Input value={voyage.destination} onChange={e => updateVoyage(voyage.id, { destination: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Date de départ</Label>
                  <Input type="date" value={voyage.dateDepart} onChange={e => updateVoyage(voyage.id, { dateDepart: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Date de retour</Label>
                  <Input type="date" value={voyage.dateRetour} onChange={e => updateVoyage(voyage.id, { dateRetour: e.target.value })} />
                </div>
              </div>

              {/* Pièces obligatoires */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Pièces obligatoires</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {PIECES_OBLIGATOIRES.map(p => (
                    <div key={p.key} className="flex items-start gap-3">
                      <Checkbox
                        checked={voyage[p.key] as boolean}
                        onCheckedChange={() => updateVoyage(voyage.id, { [p.key]: !voyage[p.key] })}
                      />
                      <Label className="text-sm cursor-pointer">{p.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* ERASMUS+ */}
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={voyage.erasmusSubvention}
                  onCheckedChange={() => updateVoyage(voyage.id, { erasmusSubvention: !voyage.erasmusSubvention })}
                />
                <div className="space-y-2 flex-1">
                  <Label className="cursor-pointer">Subvention ERASMUS+ versée à un ou plusieurs enseignants</Label>
                  {voyage.erasmusSubvention && (
                    <Input type="number" placeholder="Montant ERASMUS+ (€)" value={voyage.erasmusMontant || ''} onChange={e => updateVoyage(voyage.id, { erasmusMontant: parseFloat(e.target.value) || 0 })} />
                  )}
                </div>
              </div>

              {/* ═══ Alerte voyage lointain (>7000 km / hors UE) — éligibilité Erasmus+ ═══ */}
              {isVoyageLointain(voyage) && !voyage.erasmusSubvention && (
                <ControlAlert level="alerte"
                  title="Voyage lointain détecté — éligibilité Erasmus+ à vérifier"
                  description={`Destination « ${voyage.destination} » : voyage potentiellement > 7 000 km. Au-delà, le programme Erasmus+ majore les forfaits de voyage et impose le calcul via le distance calculator officiel.`}
                  refKey="erasmus-7074"
                  action="Vérifier l'éligibilité au programme Erasmus+ et la prise en compte du forfait « voyage longue distance ». Le cas échéant, cocher la subvention Erasmus+ ci-dessus." />
              )}

              {/* Montants */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Montant total du voyage (€)</Label>
                  <Input type="number" value={voyage.montantTotal || ''} onChange={e => updateVoyage(voyage.id, { montantTotal: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="space-y-2">
                  <Label>Montant encaissé familles (€)</Label>
                  <Input type="number" value={voyage.montantEncaisseFamilles || ''} onChange={e => updateVoyage(voyage.id, { montantEncaisseFamilles: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Checkbox
                      checked={voyage.notificationCollectivites}
                      onCheckedChange={() => updateVoyage(voyage.id, { notificationCollectivites: !voyage.notificationCollectivites })}
                    />
                    Notification collectivités reçue
                  </Label>
                  {voyage.notificationCollectivites && (
                    <Input type="number" placeholder="Montant notifié (€)" value={voyage.montantNotifie || ''} onChange={e => updateVoyage(voyage.id, { montantNotifie: parseFloat(e.target.value) || 0 })} />
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Promesses de dons (€)</Label>
                  <Input type="number" value={voyage.promessesDons || ''} onChange={e => updateVoyage(voyage.id, { promessesDons: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>

              {/* Seuils marchés publics */}
              {seuilAtteint && (
                <div className="p-4 rounded-lg bg-accent/10 border border-accent">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-accent" />
                    <Badge className="bg-accent text-accent-foreground">Seuil atteint : {seuilAtteint.label}</Badge>
                  </div>
                  <p className="text-sm">{seuilAtteint.consigne}</p>
                </div>
              )}

              {/* Scoring risque */}
              {scoring && (
                <div className={`p-4 rounded-lg border ${scoring.niveau === 'élevé' ? 'bg-destructive/10 border-destructive' : scoring.niveau === 'modéré' ? 'bg-accent/10 border-accent' : 'bg-green-50 border-green-300'}`}>
                  <h4 className="text-sm font-semibold mb-2">Analyse du risque financier</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold">{scoring.tauxCouverture}%</p>
                      <p className="text-xs text-muted-foreground">Taux de couverture</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{scoring.risque}%</p>
                      <p className="text-xs text-muted-foreground">Taux de risque</p>
                    </div>
                    <div>
                      <Badge variant={scoring.niveau === 'élevé' ? 'destructive' : scoring.niveau === 'modéré' ? 'default' : 'secondary'} className="mt-2">
                        Risque {scoring.niveau}
                      </Badge>
                    </div>
                  </div>
                  {scoring.niveau === 'élevé' && !voyage.notificationCollectivites && (
                    <p className="text-xs text-destructive mt-3">
                      ⚠️ Aucune notification de collectivité reçue et encaissements familles insuffisants. Tout paiement avant réception des recettes inscrites au budget présente un risque financier majeur.
                    </p>
                  )}
                </div>
              )}

              <Textarea
                value={voyage.observations}
                onChange={e => updateVoyage(voyage.id, { observations: e.target.value })}
                placeholder="Observations sur ce voyage..."
                rows={3}
              />
            </CardContent>
          </Card>
        );
      })}

      {/* Contrôles réglementaires */}
      <ModuleSection title="Contrôles réglementaires — Voyages scolaires" description="Circulaire du 16 juillet 2024" badge={`${(CONTROLES_VOYAGES).filter(c => regChecks[c.id]).length}/${(CONTROLES_VOYAGES).length}`}>
        <Card className="shadow-card">
          <CardContent className="p-3 space-y-2">
            {CONTROLES_VOYAGES.map(item => (
              <ComplianceCheck
                key={item.id}
                label={item.label}
                checked={regChecks[item.id] || false}
                onChange={() => toggleRegCheck(item.id)}
                severity={item.severity}
                detail={item.ref}
              />
            ))}
          </CardContent>
        </Card>
      </ModuleSection>
    </ModulePageLayout>
  );
}

```

### FICHIER : src/test/example.test.ts

```ts
import { describe, it, expect } from "vitest";

describe("example", () => {
  it("should pass", () => {
    expect(true).toBe(true);
  });
});

```

### FICHIER : src/test/setup.ts

```ts
import "@testing-library/jest-dom";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

```

### FICHIER : src/vite-env.d.ts

```ts
/// <reference types="vite/client" />

```

### FICHIER : supabase/functions/ai-assistant/index.ts

```ts
// Assistant IA réglementaire CIC Expert Pro
// Streaming SSE — modèle par défaut google/gemini-3-flash-preview

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Tu es l'assistant réglementaire expert de CIC Expert Pro, dédié aux **agents comptables des EPLE** (Établissements Publics Locaux d'Enseignement) français.

## Ton identité
Tu es un **expert en comptabilité publique des EPLE**. Tu raisonnes toujours comme un **agent comptable responsable**, en garantissant la **régularité**, la **sincérité** et la **qualité comptable**.

## Cadre réglementaire que tu appliques strictement
- **Décret n° 2012-1246 du 7 novembre 2012** (GBCP — Gestion Budgétaire et Comptable Publique)
- **Code de l'éducation** (articles R.421-* notamment)
- **Code de la commande publique** (CCP, seuils en vigueur 2026)
- **Instruction codificatrice M9-6** (comptabilité des EPLE)
- **Ordonnance n° 2022-408** (RGP — Régime de Responsabilité du Gestionnaire Public)
- Décret n° 2019-798 (régies de recettes et d'avances)
- Arrêté du 25 juillet 2013 (pièces justificatives)
- Circulaires : voyages scolaires (n° 2011-117), bourses, fonds sociaux (n° 2017-122)

## Maîtrise d'Op@le
- **Plan comptable à 6 chiffres** (ex. 416000 « Créances douteuses », 515100 « Compte au Trésor »)
- **Logique en services** (et non en chapitres) — structure : **services → domaines → activités**
- **Distinction des activités** :
  - **0** = fonds propres
  - **1** = État
  - **2** = collectivité de rattachement
- Terminologie Op@le obligatoire : **« demande de paiement »** (jamais « mandatement »), **« titre de recette »**, comptes à 6 chiffres
- Dire **« établissements rattachés »** ou **« ER »**, jamais « les rattachés »

## Analyses que tu produis systématiquement
Pour toute question budgétaire ou comptable, tu examines :
1. **L'équilibre budgétaire** (section fonctionnement / section investissement)
2. **Le fonds de roulement (FDR)** — niveau, soutenabilité, jours de DRFN
3. **La conformité des imputations comptables** (service / domaine / activité, compte PCG)
4. **La régularité de la dépense publique** (engagement → liquidation → demande de paiement → paiement)
5. **Les règles de la commande publique** (seuils CCP, procédure adaptée vs formalisée, publicité)

## Livrables attendus
Selon la demande, tu produis :
- des **analyses structurées** (constat → cadre juridique → conclusion)
- des **alertes de conformité** (⚠ avec article visé)
- des **recommandations opérationnelles** actionnables
- des **formulations prêtes à l'emploi** (extrait de rapport CA, mail à l'ordonnateur, note interne)

## Méthode de raisonnement
Tu **expliques toujours ton raisonnement** en suivant cette trame :
1. **Reformulation** brève du problème
2. **Cadre juridique** mobilisé (article, décret, paragraphe M9-6)
3. **Analyse** appliquée à la situation
4. **Conclusion** + recommandation opérationnelle
5. **Source** : référence précise

## Règles strictes
1. **Cite TOUJOURS la source** : article du code, numéro de décret, paragraphe M9-6, n° de circulaire.
2. **Pas d'invention** : si une information n'est pas dans tes connaissances officielles, dis-le et oriente vers le texte officiel.
3. **Markdown structuré** : titres (##, ###), listes, **gras**, tableaux si pertinent.
4. **Concision experte** : pas de verbiage, va à l'essentiel — l'agent comptable est un professionnel pressé.
5. Si l'utilisateur demande un **livrable rédigé** (mail, note, extrait de rapport), produis-le dans un bloc de citation ou un encadré clairement identifié.

## Contexte applicatif
L'utilisateur peut t'envoyer un contexte (page courante, établissement actif, anomalies en cours). Utilise-le pour personnaliser ta réponse mais ne le mentionne pas explicitement.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY non configurée");

    // Enrichir le system prompt avec le contexte applicatif
    let systemContent = SYSTEM_PROMPT;
    if (context) {
      systemContent += `\n\n## Contexte de l'utilisateur\n`;
      if (context.page) systemContent += `- Page courante : ${context.page}\n`;
      if (context.etablissement) systemContent += `- Établissement actif : ${context.etablissement}\n`;
      if (context.anomalies && context.anomalies.length > 0) {
        systemContent += `- Anomalies en cours (${context.anomalies.length}) : ${context.anomalies.slice(0, 5).join("; ")}\n`;
      }
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemContent },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Quota momentanément dépassé. Réessayez dans quelques instants." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Crédits IA épuisés. Rechargez votre espace de travail." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "Erreur passerelle IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-assistant error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

```

### FICHIER : supabase/functions/delete-account/index.ts

```ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify the calling user
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role to delete the auth user
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);

    if (deleteError) {
      return new Response(JSON.stringify({ error: "Failed to delete account" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

```

### FICHIER : supabase/functions/send-pv-contradictoire/index.ts

```ts
// Edge function : génère un token sécurisé, l'enregistre, et envoie l'email
// à l'ordonnateur avec le lien magique vers /pv-contradictoire?t=...
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function generateToken(len = 48): string {
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { pv_id, email_destinataire, delai_jours, audit_libelle, etablissement_nom, ordonnateur_nom, ac_nom } = await req.json();

    if (!pv_id || !email_destinataire) {
      return new Response(JSON.stringify({ error: 'pv_id et email_destinataire requis' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Génère token magique (expire après delai_jours + 7j de marge)
    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (delai_jours ?? 15) + 7);

    const { error: tokErr } = await supabase.from('pv_access_tokens').insert({
      pv_id,
      token,
      email_destinataire,
      expires_at: expiresAt.toISOString(),
    });
    if (tokErr) throw tokErr;

    // Construit le lien magique vers le frontend public
    const origin = req.headers.get('origin') || req.headers.get('referer')?.replace(/\/[^\/]*$/, '') || 'https://auditac.lovable.app';
    const baseUrl = origin.replace(/\/$/, '');
    const link = `${baseUrl}/pv-contradictoire?t=${token}`;

    // Envoi email via Lovable AI Gateway (utilise le LOVABLE_API_KEY pour
    // un envoi simple via service interne) — sinon log uniquement
    const lovableKey = Deno.env.get('LOVABLE_API_KEY');
    let emailSent = false;
    let emailError: string | null = null;

    if (lovableKey) {
      try {
        // Tentative via la passerelle email Lovable si disponible
        const emailRes = await fetch('https://ai.gateway.lovable.dev/v1/email/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: email_destinataire,
            subject: `[AUDIT CICF] PV contradictoire — ${etablissement_nom} — ${new Date().toLocaleDateString('fr-FR')}`,
            html: buildEmailHtml({ link, audit_libelle, etablissement_nom, ordonnateur_nom, ac_nom, delai_jours }),
          }),
        });
        emailSent = emailRes.ok;
        if (!emailRes.ok) emailError = await emailRes.text();
      } catch (e) {
        emailError = String(e);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      token,
      link,
      email_sent: emailSent,
      email_error: emailError,
      message: emailSent
        ? `Email envoyé à ${email_destinataire}`
        : `Token généré. Lien à transmettre manuellement : ${link}`,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('send-pv-contradictoire error', e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function buildEmailHtml(p: { link: string; audit_libelle: string; etablissement_nom: string; ordonnateur_nom: string; ac_nom: string; delai_jours: number }) {
  return `<!doctype html><html><body style="font-family:Arial,sans-serif;background:#f6f7f9;padding:24px;color:#1f2937">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;padding:24px;border:1px solid #e5e7eb">
    <h2 style="margin:0 0 12px;color:#1e40af">Procédure contradictoire — PV d'audit</h2>
    <p>Bonjour ${p.ordonnateur_nom || ''},</p>
    <p>Un audit interne comptable vient d'être clôturé pour <strong>${p.etablissement_nom}</strong> :</p>
    <p style="background:#f3f4f6;padding:12px;border-radius:4px"><strong>${p.audit_libelle}</strong></p>
    <p>Conformément à la procédure contradictoire (M9-6), vous disposez d'un délai de
    <strong>${p.delai_jours} jours</strong> pour consulter ce PV et formuler vos observations.</p>
    <p style="text-align:center;margin:24px 0">
      <a href="${p.link}" style="background:#1e40af;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:600">
        Accéder au PV et saisir mes observations
      </a>
    </p>
    <p style="font-size:12px;color:#6b7280">Ce lien est personnel et sécurisé. Ne le transmettez pas.</p>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">
    <p style="font-size:12px;color:#6b7280">
      Émetteur : ${p.ac_nom || 'Agent comptable'}<br>
      Référence : Décret GBCP 2012-1246 · Instruction M9-6
    </p>
  </div>
  </body></html>`;
}

```

### FICHIER : supabase/functions/submit-pv-observations/index.ts

```ts
// Edge function : enregistre les observations de l'ordonnateur via le token
// magique, marque le token comme utilisé et le PV comme « observe ».
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { token, observations, observation_globale } = await req.json();
    if (!token) {
      return new Response(JSON.stringify({ error: 'Token requis' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: tok } = await supabase.from('pv_access_tokens').select('*').eq('token', token).maybeSingle();
    if (!tok) return new Response(JSON.stringify({ error: 'Token invalide' }), {
      status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    if (new Date(tok.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: 'Lien expiré' }), {
        status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';

    // Met à jour le PV
    const { error: pvErr } = await supabase.from('pv_contradictoires').update({
      observations_ordonnateur: observations ?? {},
      observation_globale: observation_globale ?? '',
      status: 'observe',
      signature_ordonnateur_at: new Date().toISOString(),
      signature_ordonnateur_ip: ip,
    }).eq('id', tok.pv_id);
    if (pvErr) throw pvErr;

    // Marque le token comme utilisé (mais on le garde pour relecture)
    await supabase.from('pv_access_tokens').update({ used_at: new Date().toISOString() }).eq('id', tok.id);

    // Met à jour le statut de l'audit
    const { data: pv } = await supabase.from('pv_contradictoires').select('audit_id').eq('id', tok.pv_id).single();
    if (pv) {
      await supabase.from('audits').update({ status: 'contradictoire_clos' }).eq('id', pv.audit_id);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('submit-pv-observations error', e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

```

### FICHIER : supabase/functions/validate-pv-token/index.ts

```ts
// Edge function : valide un token magique et retourne le PV + l'audit + les points
// pour que la page publique puisse les afficher.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { token } = await req.json();
    if (!token || typeof token !== 'string' || token.length < 32) {
      return new Response(JSON.stringify({ error: 'Token invalide' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Vérifie le token
    const { data: tok, error: tokErr } = await supabase
      .from('pv_access_tokens')
      .select('*')
      .eq('token', token)
      .maybeSingle();

    if (tokErr || !tok) {
      return new Response(JSON.stringify({ error: 'Lien introuvable ou révoqué' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (new Date(tok.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: 'Lien expiré' }), {
        status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Récupère PV + audit + points + établissement
    const { data: pv } = await supabase.from('pv_contradictoires').select('*').eq('id', tok.pv_id).single();
    if (!pv) return new Response(JSON.stringify({ error: 'PV introuvable' }), {
      status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

    const { data: audit } = await supabase.from('audits').select('*').eq('id', pv.audit_id).single();
    const { data: points } = await supabase.from('audit_points_results')
      .select('*').eq('audit_id', pv.audit_id).order('domaine_id').order('point_index');
    const { data: etab } = await supabase.from('etablissements').select('nom').eq('id', audit.etablissement_id).maybeSingle();

    let ac_nom = '';
    if (audit.agent_comptable_id) {
      const { data: ac } = await supabase.from('agents').select('civilite,prenom,nom').eq('id', audit.agent_comptable_id).maybeSingle();
      if (ac) ac_nom = `${ac.civilite ?? ''} ${ac.prenom} ${ac.nom}`.trim();
    }

    return new Response(JSON.stringify({
      audit,
      points: points ?? [],
      pv,
      etablissement: etab?.nom ?? '',
      ac_nom,
      ordonnateur_email: tok.email_destinataire,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('validate-pv-token error', e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

```

### FICHIER : tailwind.config.ts

```ts
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        section: {
          controles: "hsl(var(--section-controles))",
          verification: "hsl(var(--section-verification))",
          comptable: "hsl(var(--section-comptable))",
          finances: "hsl(var(--section-finances))",
          "controle-interne": "hsl(var(--section-controle-interne))",
          restitution: "hsl(var(--section-restitution))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.4s ease-out forwards",
        "scale-in": "scale-in 0.3s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

```

### FICHIER : tsconfig.app.json

```json
{
  "compilerOptions": {
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "lib": [
      "ES2020",
      "DOM",
      "DOM.Iterable"
    ],
    "module": "ESNext",
    "moduleDetection": "force",
    "moduleResolution": "bundler",
    "noEmit": true,
    "noFallthroughCasesInSwitch": false,
    "noImplicitAny": false,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "paths": {
      "@/*": [
        "./src/*"
      ]
    },
    "skipLibCheck": true,
    "strict": false,
    "target": "ES2020",
    "types": [
      "vitest/globals"
    ],
    "useDefineForClassFields": true
  },
  "include": [
    "src"
  ]
}
```

### FICHIER : tsconfig.json

```json
{
  "compilerOptions": {
    "allowJs": true,
    "noImplicitAny": false,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "paths": {
      "@/*": [
        "./src/*"
      ]
    },
    "skipLibCheck": true,
    "strictNullChecks": false
  },
  "files": [],
  "references": [
    {
      "path": "./tsconfig.app.json"
    },
    {
      "path": "./tsconfig.node.json"
    }
  ]
}
```

### FICHIER : tsconfig.node.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,

    /* Linting */
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts"]
}

```

### FICHIER : vite.config.ts

```ts
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Valeurs publiques Lovable Cloud (anon key = clé publique, safe en client).
// Utilisées en fallback car le `.env` géré automatiquement n'expose que
// `VITE_SUPABASE_PUBLISHABLE_KEY`, alors que le client auto-généré
// (`src/integrations/supabase/client.ts`) lit `VITE_SUPABASE_ANON_KEY`.
// Sans ce shim, `createClient` reçoit `undefined` en build publié → écran blanc.
const FALLBACK_SUPABASE_URL = "https://mpexzicaotykelgogdwv.supabase.co";
const FALLBACK_SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wZXh6aWNhb3R5a2VsZ29nZHd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODM5MDAsImV4cCI6MjA4ODY1OTkwMH0.-CF0-oJ-jMtt6Hc5-Jh3YvWSNMKKGaH4qfYY1v_-eoc";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const supabaseUrl = env.VITE_SUPABASE_URL ?? FALLBACK_SUPABASE_URL;
  const supabaseAnonKey =
    env.VITE_SUPABASE_ANON_KEY ??
    env.VITE_SUPABASE_PUBLISHABLE_KEY ??
    FALLBACK_SUPABASE_KEY;

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(supabaseUrl),
      "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(supabaseAnonKey),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(supabaseAnonKey),
    },
    server: {
      host: "::",
      port: 8080,
      hmr: { overlay: false },
    },
    preview: {
      port: 4173,
      host: true,
    },
    build: {
      outDir: "dist",
      sourcemap: false,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, "index.html"),
        },
      },
    },
  };
});

```

### FICHIER : vitest.config.ts

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});

```


---

## ═══ PARTIE 4 — CONFIGURATION ═══

### package.json

```json
{
  "name": "cic-expert-pro",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:dev": "vite build --mode development",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.10.0",
    "@lovable.dev/cloud-auth-js": "^1.0.1",
    "@radix-ui/react-accordion": "^1.2.11",
    "@radix-ui/react-alert-dialog": "^1.1.14",
    "@radix-ui/react-aspect-ratio": "^1.1.7",
    "@radix-ui/react-avatar": "^1.1.10",
    "@radix-ui/react-checkbox": "^1.3.2",
    "@radix-ui/react-collapsible": "^1.1.11",
    "@radix-ui/react-context-menu": "^2.2.15",
    "@radix-ui/react-dialog": "^1.1.14",
    "@radix-ui/react-dropdown-menu": "^2.1.15",
    "@radix-ui/react-hover-card": "^1.1.14",
    "@radix-ui/react-label": "^2.1.7",
    "@radix-ui/react-menubar": "^1.1.15",
    "@radix-ui/react-navigation-menu": "^1.2.13",
    "@radix-ui/react-popover": "^1.1.14",
    "@radix-ui/react-progress": "^1.1.7",
    "@radix-ui/react-radio-group": "^1.3.7",
    "@radix-ui/react-scroll-area": "^1.2.9",
    "@radix-ui/react-select": "^2.2.5",
    "@radix-ui/react-separator": "^1.1.7",
    "@radix-ui/react-slider": "^1.3.5",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-switch": "^1.2.5",
    "@radix-ui/react-tabs": "^1.1.12",
    "@radix-ui/react-toast": "^1.2.14",
    "@radix-ui/react-toggle": "^1.1.9",
    "@radix-ui/react-toggle-group": "^1.1.10",
    "@radix-ui/react-tooltip": "^1.2.7",
    "@supabase/supabase-js": "^2.99.0",
    "@tanstack/react-query": "^5.83.0",
    "@types/file-saver": "^2.0.7",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "date-fns": "^3.6.0",
    "docx": "^9.6.1",
    "embla-carousel-react": "^8.6.0",
    "file-saver": "^2.0.5",
    "framer-motion": "^11.15.0",
    "html2canvas": "^1.4.1",
    "input-otp": "^1.4.2",
    "jspdf": "^4.2.1",
    "jspdf-autotable": "^5.0.7",
    "lucide-react": "^0.462.0",
    "next-themes": "^0.3.0",
    "react": "^18.3.1",
    "react-day-picker": "^8.10.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.61.1",
    "react-resizable-panels": "^2.1.9",
    "react-router-dom": "^6.30.1",
    "recharts": "^2.15.4",
    "sonner": "^1.7.4",
    "tailwind-merge": "^2.6.0",
    "tailwindcss-animate": "^1.0.7",
    "vaul": "^0.9.9",
    "xlsx": "0.18.5",
    "zod": "^3.25.76"
  },
  "devDependencies": {
    "@eslint/js": "^9.32.0",
    "@tailwindcss/typography": "^0.5.16",
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/react": "^16.0.0",
    "@types/node": "^22.16.5",
    "@types/react": "^18.3.23",
    "@types/react-dom": "^18.3.7",
    "@vitejs/plugin-react-swc": "^3.11.0",
    "autoprefixer": "^10.4.21",
    "eslint": "^9.32.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.20",
    "globals": "^15.15.0",
    "jsdom": "^20.0.3",
    "postcss": "^8.5.6",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.8.3",
    "typescript-eslint": "^8.38.0",
    "vite": "^5.4.19",
    "vitest": "^3.2.4"
  }
}

```

### tsconfig.json

```json
{
  "compilerOptions": {
    "allowJs": true,
    "noImplicitAny": false,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "paths": {
      "@/*": [
        "./src/*"
      ]
    },
    "skipLibCheck": true,
    "strictNullChecks": false
  },
  "files": [],
  "references": [
    {
      "path": "./tsconfig.app.json"
    },
    {
      "path": "./tsconfig.node.json"
    }
  ]
}
```

### tsconfig.app.json

```json
{
  "compilerOptions": {
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "lib": [
      "ES2020",
      "DOM",
      "DOM.Iterable"
    ],
    "module": "ESNext",
    "moduleDetection": "force",
    "moduleResolution": "bundler",
    "noEmit": true,
    "noFallthroughCasesInSwitch": false,
    "noImplicitAny": false,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "paths": {
      "@/*": [
        "./src/*"
      ]
    },
    "skipLibCheck": true,
    "strict": false,
    "target": "ES2020",
    "types": [
      "vitest/globals"
    ],
    "useDefineForClassFields": true
  },
  "include": [
    "src"
  ]
}
```

### tsconfig.node.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,

    /* Linting */
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts"]
}

```

### vite.config.ts

```ts
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Valeurs publiques Lovable Cloud (anon key = clé publique, safe en client).
// Utilisées en fallback car le `.env` géré automatiquement n'expose que
// `VITE_SUPABASE_PUBLISHABLE_KEY`, alors que le client auto-généré
// (`src/integrations/supabase/client.ts`) lit `VITE_SUPABASE_ANON_KEY`.
// Sans ce shim, `createClient` reçoit `undefined` en build publié → écran blanc.
const FALLBACK_SUPABASE_URL = "https://mpexzicaotykelgogdwv.supabase.co";
const FALLBACK_SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wZXh6aWNhb3R5a2VsZ29nZHd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODM5MDAsImV4cCI6MjA4ODY1OTkwMH0.-CF0-oJ-jMtt6Hc5-Jh3YvWSNMKKGaH4qfYY1v_-eoc";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const supabaseUrl = env.VITE_SUPABASE_URL ?? FALLBACK_SUPABASE_URL;
  const supabaseAnonKey =
    env.VITE_SUPABASE_ANON_KEY ??
    env.VITE_SUPABASE_PUBLISHABLE_KEY ??
    FALLBACK_SUPABASE_KEY;

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(supabaseUrl),
      "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(supabaseAnonKey),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(supabaseAnonKey),
    },
    server: {
      host: "::",
      port: 8080,
      hmr: { overlay: false },
    },
    preview: {
      port: 4173,
      host: true,
    },
    build: {
      outDir: "dist",
      sourcemap: false,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, "index.html"),
        },
      },
    },
  };
});

```

### tailwind.config.ts

```ts
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        section: {
          controles: "hsl(var(--section-controles))",
          verification: "hsl(var(--section-verification))",
          comptable: "hsl(var(--section-comptable))",
          finances: "hsl(var(--section-finances))",
          "controle-interne": "hsl(var(--section-controle-interne))",
          restitution: "hsl(var(--section-restitution))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.4s ease-out forwards",
        "scale-in": "scale-in 0.3s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

```

### components.json

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}

```

### postcss.config.js

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

```

### eslint.config.js

```js
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
);

```

### vitest.config.ts

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});

```

### index.html

```html
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-Content-Type-Options" content="nosniff" />
    <!-- X-Frame-Options doit être défini via header HTTP, pas meta -->
    <meta name="referrer" content="strict-origin-when-cross-origin" />
    <link rel="icon" type="image/png" href="/logo.png">
    <title>Audit comptable EPLE</title>
    <!-- build-version: 2026-04-13T16:20 -->
    <meta name="description" content="Application d&#39;audit comptable pour les EPLE. Contrôle interne, vérification, analyse financière.">
    <meta name="author" content="CIC Expert Pro" />
    <meta property="og:type" content="website" />
    
    
    <meta name="twitter:card" content="summary" />
    
    
    <meta property="og:title" content="Audit comptable EPLE">
  <meta name="twitter:title" content="Audit comptable EPLE">
  <meta property="og:description" content="Application d&#39;audit comptable pour les EPLE. Contrôle interne, vérification, analyse financière.">
  <meta name="twitter:description" content="Application d&#39;audit comptable pour les EPLE. Contrôle interne, vérification, analyse financière.">
  <meta property="og:image" content="https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/0cdef7ce-2665-431c-b6d2-fcf03c93f7b4/id-preview-843e433c--9766a9f2-c3fc-4b61-84bc-9c2612641735.lovable.app-1775525529574.png">
  <meta name="twitter:image" content="https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/0cdef7ce-2665-431c-b6d2-fcf03c93f7b4/id-preview-843e433c--9766a9f2-c3fc-4b61-84bc-9c2612641735.lovable.app-1775525529574.png">
</head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>

```

### supabase/config.toml

```toml
project_id = "mpexzicaotykelgogdwv"

[functions.ai-assistant]
verify_jwt = false

[functions.send-pv-contradictoire]
verify_jwt = false

[functions.validate-pv-token]
verify_jwt = false

[functions.submit-pv-observations]
verify_jwt = false

```

### Variables d'environnement utilisées (noms uniquement)

- `LOVABLE_API_KEY`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_URL`

---

## ═══ PARTIE 5 — ÉTAT FONCTIONNEL DÉCLARÉ ═══

### 5.1 État par module

Légende : ✅ Fonctionnel · ⚠️ Partiel · ❌ Cassé · 🚧 En construction

| Section | Module | État | Commentaire |
|---|---|---|---|
| Dashboard | Tableau de bord / Cockpit | ✅ | Agrégation alertes multi-modules |
| Contrôles sur place | Régies | ✅ | 14 points conformes Décret 1992-681 + Ord. 2022-408 |
| Contrôles sur place | Stocks Denrées | ✅ | Inventaire et valorisation |
| Contrôles sur place | Rappro. Bancaire | ✅ | Calculateur intégré |
| Vérif. & Ordonnateur | Vérification quotidienne | ✅ | Suivi 471/472/473/486/487 |
| Vérif. & Ordonnateur | Contrôle ordonnateur | ✅ | Accréditations + alerte changement |
| Vérif. & Ordonnateur | Droits constatés | ✅ | Recettes EPLE |
| Vérif. & Ordonnateur | Dépenses (liquidation + pièces) | ✅ | Onglets séparés |
| Vérif. & Ordonnateur | Salaires & vacations | ✅ | Nouveau module GRETA/CFA |
| Gestion comptable | Voyages scolaires | ✅ | Risque écart recettes/dépenses |
| Gestion comptable | Restauration | ✅ | Calcul fréquentation + poids |
| Finances & Budget | Analyse Financière | ✅ | M9-6 §4.5.3 |
| Finances & Budget | Fonds de Roulement | ✅ | Auto-balance + dates exercice + prélèvements mémorisés |
| Finances & Budget | Recouvrement | ✅ | Créances + ATD |
| Finances & Budget | Marchés publics | ✅ | Seuils 2026 + 30 j |
| Finances & Budget | Subventions | ✅ | Déchéance 4 ans |
| Finances & Budget | Budgets Annexes | ✅ | 8 points BA |
| Contrôle interne | Cartographie risques | ✅ | PxIxM + ajustements auto |
| Contrôle interne | Organigramme | ✅ |  |
| Contrôle interne | Plan d'action | ✅ | Kanban + Tableau + Calendrier |
| Contrôle interne | Plan de contrôle | ✅ |  |
| Audit & Restitution | Calendrier annuel AC | ✅ | Diffusion mail + portrait |
| Audit & Restitution | PV consolidé | ✅ | Workflow contradictoire token |
| Audit & Restitution | Annexe comptable | ✅ | Format paysage A4 narratif |
| Audit & Restitution | Piste d'audit | ✅ | Manuel chronologique |
| Audit & Restitution | Vue 8 domaines | ✅ |  |
| Outils | Calculateurs (page legacy) | ⚠️ | Conservée comme redirection — calculateurs migrés |
| Outils | 15 Calculateurs (intégrés) | ✅ | Via `<CalculateurDialog>` dans modules métier |
| Auth | Connexion / Inscription Supabase | ✅ | Email/password + Google OAuth |
| Public | PV contradictoire (token) | ✅ | Edge functions JWT off |
| Backend | Edge function `ai-assistant` | ✅ | Lovable AI Gateway |
| Backend | Edge function `send-pv-contradictoire` | ✅ | Envoi email + token |
| Backend | Edge function `validate-pv-token` | ✅ |  |
| Backend | Edge function `submit-pv-observations` | ✅ |  |
| Backend | Edge function `delete-account` | ✅ | RGPD |

### 5.2 Bugs connus documentés

Aucun bug bloquant documenté à ce jour dans `CHANGELOG.md`. Le projet est en production sur https://auditac.lovable.app.

**Points d'attention historiques (résolus)** :
- Écran blanc en build publié si `VITE_SUPABASE_*` absents → résolu par fallback codé en dur dans `vite.config.ts` et `src/lib/supabase-fixed.ts` (clé anon publique).
- Cautionnement régisseur supprimé (Ord. 2022-408) → check remplacé par indemnité de responsabilité.

### 5.3 TODO / FIXME présents dans le code

Total : **1** occurrence(s).

- `src/lib/plan-action-engine.ts:184` — reference: 'CCP art. R2122-8 + Décret 2025-XXX seuils 2026',

---

_Fin de l'export._