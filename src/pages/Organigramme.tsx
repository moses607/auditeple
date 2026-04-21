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