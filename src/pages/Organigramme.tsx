import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Pencil, Download, AlertTriangle, CheckCircle2, Users, Printer } from 'lucide-react';
import { EquipeMembre, FONCTIONS_COMPTABLES, TACHES_COMPTABLES } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';
import { CONTROLES_ORGANIGRAMME } from '@/lib/regulatory-data';
import { ModulePageLayout, ComplianceCheck, ModuleSection } from '@/components/ModulePageLayout';
import { DoctrineEPLE } from '@/components/DoctrineEPLE';
import { useAgents, useGroupements, useEtablissements, getRoleLabel } from '@/hooks/useGroupements';
import { useAuditParamsContext } from '@/contexts/AuditParamsContext';
import { AgentSelect } from '@/components/AgentSelect';
import { toast } from '@/hooks/use-toast';
import { printLandscape, table, badge } from '@/lib/print-landscape';

// Tâches « ordonnateur » (engagement) vs « comptable » (paiement) — séparation GBCP art. 9
const TACHES_ORDONNATEUR = ['Liquidation dépenses', 'Demande de paiement', 'Émission titres', 'Commande publique', 'Engagement'];
const TACHES_COMPTABLE   = ['Visa des dépenses', 'Tenue comptabilité', 'Rapprochement bancaire', 'Contrôle caisse'];

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

  const { activeId, groupements } = useGroupements();
  const activeGroupement = groupements.find(g => g.id === activeId);
  const { agents } = useAgents(activeId);
  const { etablissements } = useEtablissements(activeId);
  const { params } = useAuditParamsContext();
  const etabId = params.selectedEtablissementId || null;
  const activeEtab = etabId ? etablissements.find(e => e.id === etabId) : null;

  // Agents filtrés sur l'établissement actif (+ agents transverses du groupement)
  const agentsEtab = useMemo(
    () => agents.filter(a => a.actif && (!etabId || a.etablissement_id === etabId || a.etablissement_id === null)),
    [agents, etabId],
  );

  // Matrice « qui fait quoi » : pour chaque tâche, liste des membres qui en sont chargés
  const matriceTaches = useMemo(() => {
    return TACHES_COMPTABLES.map(tache => ({
      tache,
      membres: items.filter(m => m.taches?.includes(tache)),
    }));
  }, [items]);
  const tachesNonAttribuees = matriceTaches.filter(t => t.membres.length === 0);

  // Vue regroupée par fonction
  const parFonction = useMemo(() => {
    const map = new Map<string, EquipeMembre[]>();
    items.forEach(m => {
      const k = m.fonction || 'Non défini';
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(m);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [items]);

  // Conflits séparation des tâches : même personne sur engagement + paiement
  const conflitsSeparation = useMemo(() => {
    return items.filter(m => {
      const ordo = m.taches?.some(t => TACHES_ORDONNATEUR.includes(t));
      const compta = m.taches?.some(t => TACHES_COMPTABLE.includes(t));
      return ordo && compta;
    });
  }, [items]);

  // Importe les agents Paramètres → organigramme (sans doublon de nom)
  const importerDepuisParametres = () => {
    if (agentsEtab.length === 0) {
      toast({ title: 'Aucun agent à importer', description: 'Ajoutez des agents dans Paramètres → Agents pour cet établissement.', variant: 'destructive' });
      return;
    }
    const existingNames = new Set(items.map(i => i.nom.trim().toLowerCase()));
    const newItems: EquipeMembre[] = [];
    agentsEtab.forEach(a => {
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

  const handlePrint = () => {
    const equipeRows = items.length === 0 ? null : items.map(m => {
      const ordo = (m.taches || []).some(t => TACHES_ORDONNATEUR.includes(t));
      const compta = (m.taches || []).some(t => TACHES_COMPTABLE.includes(t));
      return [
        m.nom || '—', m.fonction || '—', m.email || '—', m.telephone || '—',
        (m.taches || []).join(' · ') || '—',
        (ordo && compta) ? badge('Conflit GBCP art. 9', 'critique') : badge('Conforme', 'ok'),
      ];
    });
    const matriceRows = matriceTaches.map(t => [
      t.tache,
      t.membres.length === 0 ? badge('Non attribuée', 'critique') : badge(`${t.membres.length} agent(s)`, 'ok'),
      t.membres.map(m => m.nom).join(' · ') || '—',
    ]);
    const fonctionRows = parFonction.map(([fonction, membres]) => [
      fonction, String(membres.length), membres.map(m => m.nom).join(' · '),
    ]);
    const controlesRows = CONTROLES_ORGANIGRAMME.map(c => [
      (c as any).code || '—', c.label,
      regChecks[c.id] ? badge('Vérifié', 'ok') : badge('À vérifier', 'majeure'),
    ]);
    printLandscape({
      title: 'Organigramme fonctionnel — qui fait quoi',
      subtitle: 'Rôles, délégations et matrice de séparation des tâches · M9-6 § 1.2 · GBCP art. 9',
      etablissement: activeEtab?.nom || activeGroupement?.libelle,
      identifiant: activeEtab ? `UAI ${activeEtab.uai}` : undefined,
      reference: 'Pièce annexée au compte financier — Organigramme fonctionnel',
      sections: [
        { title: `Synthèse — ${items.length} agent(s)`,
          subtitle: `${parFonction.length} fonction(s) · ${conflitsSeparation.length} conflit(s) de séparation`,
          html: table(['Indicateur', 'Valeur'], [
            ['Nombre d\'agents', String(items.length)],
            ['Fonctions distinctes', String(parFonction.length)],
            ['Tâches couvertes', `${[...new Set(items.flatMap(x => x.taches || []))].length} / ${TACHES_COMPTABLES.length}`],
            ['Tâches non attribuées', String(tachesNonAttribuees.length)],
            ['Conflits séparation (GBCP art. 9)', String(conflitsSeparation.length)],
          ]) },
        { title: 'Composition de l\'équipe',
          subtitle: 'Détail nominatif, fonction, coordonnées et tâches assignées',
          html: equipeRows
            ? table(['Nom', 'Fonction', 'Email', 'Téléphone', 'Tâches', 'Séparation'], equipeRows)
            : '<div class="note">Aucun membre enregistré dans l\'organigramme.</div>' },
        { title: 'Matrice « qui fait quoi » — couverture par tâche',
          html: table(['Tâche comptable', 'Couverture', 'Agent(s) en charge'], matriceRows) },
        { title: 'Vue regroupée par fonction',
          html: fonctionRows.length > 0
            ? table(['Fonction', 'Effectif', 'Agents'], fonctionRows)
            : '<div class="note">Aucune fonction renseignée.</div>' },
        { title: 'Points de contrôle réglementaires',
          html: table(['Réf.', 'Contrôle', 'État'], controlesRows) },
      ],
    });
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold">{items.length}</p><p className="text-xs text-muted-foreground mt-0.5">Agents</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold">{[...new Set(items.map(x => x.fonction))].length}</p><p className="text-xs text-muted-foreground mt-0.5">Fonctions distinctes</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold">{[...new Set(items.flatMap(x => x.taches || []))].length} / {TACHES_COMPTABLES.length}</p><p className="text-xs text-muted-foreground mt-0.5">Tâches couvertes</p></CardContent></Card>
        <Card className={`shadow-card ${conflitsSeparation.length > 0 ? 'border-destructive/50 bg-destructive/5' : ''}`}><CardContent className="p-4"><p className={`text-2xl font-bold ${conflitsSeparation.length > 0 ? 'text-destructive' : 'text-emerald-600'}`}>{conflitsSeparation.length}</p><p className="text-xs text-muted-foreground mt-0.5">Conflits séparation des tâches</p></CardContent></Card>
      </div>

      <div className="flex justify-end gap-2 flex-wrap">
        <Button variant="outline" onClick={importerDepuisParametres} disabled={agentsEtab.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Importer agents de l'établissement ({agentsEtab.length})
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
                placeholder="Choisir dans l'équipe de l'établissement…"
                etablissementId={etabId}
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

      {items.length === 0 && !form && <Card><CardContent className="py-12 text-center text-muted-foreground">Aucun membre enregistré. Cliquez sur « Importer agents de l'établissement » pour pré-remplir.</CardContent></Card>}

      {/* Conflits séparation des tâches (GBCP art. 9) */}
      {conflitsSeparation.length > 0 && (
        <Card className="border-destructive bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" /> Conflit de séparation des tâches (GBCP art. 9)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-1.5">
            <p>Les agents suivants cumulent des tâches d'<strong>ordonnateur</strong> (engagement, liquidation, DP) et de <strong>comptable</strong> (visa, tenue, rappro) — incompatible avec le principe de séparation :</p>
            <ul className="list-disc pl-5">
              {conflitsSeparation.map(m => (
                <li key={m.id}><strong>{m.nom}</strong> ({m.fonction}) — tâches : {m.taches?.join(', ')}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Vue 1 : par fonction (Qui occupe quelle fonction) */}
      {parFonction.length > 0 && (
        <ModuleSection title="Qui occupe quelle fonction" description="Vue regroupée par fonction comptable" badge={`${parFonction.length} fonction(s)`}>
          <div className="space-y-3">
            {parFonction.map(([fonction, membres]) => (
              <Card key={fonction}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Badge variant="secondary">{fonction}</Badge>
                    <span className="text-xs text-muted-foreground font-normal">{membres.length} agent{membres.length > 1 ? 's' : ''}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {membres.map(m => (
                    <div key={m.id} className="flex items-start gap-3 border-l-2 border-primary/30 pl-3 py-1">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">{m.nom.charAt(0)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{m.nom}</p>
                        {(m.email || m.telephone) && (
                          <p className="text-[11px] text-muted-foreground">{[m.telephone, m.email].filter(Boolean).join(' · ')}</p>
                        )}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {m.taches?.map(t => (
                            <span
                              key={t}
                              className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                                TACHES_ORDONNATEUR.includes(t) ? 'bg-amber-500/10 text-amber-700 border-amber-500/30' :
                                TACHES_COMPTABLE.includes(t)   ? 'bg-blue-500/10 text-blue-700 border-blue-500/30' :
                                'bg-primary/10 text-primary border-primary/20'
                              }`}
                            >
                              {t}
                            </span>
                          ))}
                          {(!m.taches || m.taches.length === 0) && <span className="text-[10px] text-muted-foreground italic">Aucune tâche assignée</span>}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setForm({ ...m })}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => save(items.filter(i => i.id !== m.id))}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </ModuleSection>
      )}

      {/* Vue 2 : matrice qui-fait-quoi (par tâche) */}
      {items.length > 0 && (
        <ModuleSection
          title="Matrice « Qui fait quoi »"
          description="Pour chaque tâche comptable Op@le, identification du ou des agents responsables. Les tâches non attribuées sont à risque."
          badge={`${tachesNonAttribuees.length} tâche(s) non attribuée(s)`}
        >
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="px-3 py-2 font-semibold w-1/3">Tâche</th>
                    <th className="px-3 py-2 font-semibold">Agent(s) en charge</th>
                    <th className="px-3 py-2 font-semibold w-24 text-center">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {matriceTaches.map(({ tache, membres }) => {
                    const orphelin = membres.length === 0;
                    const cumul = membres.length > 1;
                    return (
                      <tr key={tache} className={`border-t ${orphelin ? 'bg-destructive/5' : ''}`}>
                        <td className="px-3 py-2 font-medium">
                          {tache}
                          {TACHES_ORDONNATEUR.includes(tache) && <Badge variant="outline" className="ml-2 text-[9px] border-amber-500/40 text-amber-700">Ordonnateur</Badge>}
                          {TACHES_COMPTABLE.includes(tache)   && <Badge variant="outline" className="ml-2 text-[9px] border-blue-500/40 text-blue-700">Comptable</Badge>}
                        </td>
                        <td className="px-3 py-2">
                          {orphelin ? (
                            <span className="italic text-destructive">Aucun agent — risque opérationnel</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {membres.map(m => (
                                <Badge key={m.id} variant="secondary" className="text-[10px]">
                                  <Users className="h-2.5 w-2.5 mr-1" />
                                  {m.nom} <span className="opacity-60 ml-1">· {m.fonction}</span>
                                </Badge>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {orphelin && <Badge variant="destructive" className="text-[10px]">Non attribuée</Badge>}
                          {!orphelin && cumul && <Badge className="text-[10px] bg-amber-600">Partagée</Badge>}
                          {!orphelin && !cumul && <Badge variant="secondary" className="text-[10px]"><CheckCircle2 className="h-2.5 w-2.5 mr-1" />OK</Badge>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </ModuleSection>
      )}

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