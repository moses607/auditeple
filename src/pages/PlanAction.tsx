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
      description="Plan d'action généré automatiquement à partir de TOUS les risques de la cartographie (toutes criticités) et des anomalies des PV d'audit. Moteur de 20 règles métier M9-6 / GBCP / Code éducation, extensible. Les constats sont repris dans le mail à l'ordonnateur lors de l'envoi du PV contradictoire."
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
