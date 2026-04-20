import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CartoRisque } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';
import { Plus, Trash2, Pencil, FileSignature } from 'lucide-react';
import { ModulePageLayout } from '@/components/ModulePageLayout';
import { DoctrineEPLE } from '@/components/DoctrineEPLE';
import SignaturePad from '@/components/SignaturePad';
import { useAuditParams } from '@/hooks/useAuditStore';

interface ActionItem {
  id: string;
  risqueId: string;
  risqueLabel: string;
  processus: string;
  scoreRisque: number;
  recommandation: string;
  responsable: string;
  dateLimite: string;
  statut: string;
  observations: string;
}

export default function PlanAction() {
  const risques: CartoRisque[] = loadState('cartographie', []);
  const [actions, setActions] = useState<ActionItem[]>(() => loadState('plan_action', []));
  const [form, setForm] = useState<any>(null);
  const save = (d: ActionItem[]) => { setActions(d); saveState('plan_action', d); };

  const submit = () => {
    if (!form || !form.risqueId) return;
    const r = risques.find(x => x.id === form.risqueId);
    const item: ActionItem = {
      id: form.id || crypto.randomUUID(),
      risqueId: form.risqueId,
      risqueLabel: r?.risque || form.risqueLabel || '',
      processus: r?.processus || form.processus || '',
      scoreRisque: r ? r.probabilite * r.impact * r.maitrise : form.scoreRisque || 0,
      recommandation: form.recommandation,
      responsable: form.responsable,
      dateLimite: form.dateLimite,
      statut: form.statut,
      observations: form.observations || '',
    };
    if (form.id) save(actions.map(a => a.id === form.id ? item : a));
    else save([...actions, item]);
    setForm(null);
  };

  const sorted = [...actions].sort((a, b) => b.scoreRisque - a.scoreRisque);

  return (
    <ModulePageLayout
      title="Plan d'action — CICF"
      section="CONTRÔLE INTERNE"
      description="Actions correctives et préventives issues de la cartographie des risques et des contrôles. Suivi de la mise en œuvre, responsables et échéances."
      refs={[
        { code: "Décret 2012-1246 art. 170", label: "CICF" },
        { code: "Cartop@le", label: "Plans d'action" },
      ]}
    >
      <DoctrineEPLE
        theme="plan-action"
        titre="Plan d'action correctif — CICF"
        resume="Suivi des actions issues de la cartographie des risques et des PV. Risques critiques (score ≥ 40) prioritaires."
      />

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold">{actions.length}</p><p className="text-xs text-muted-foreground mt-0.5">Actions correctives</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold text-green-600">{actions.filter(x => x.statut === 'Réalisé').length}</p><p className="text-xs text-muted-foreground mt-0.5">Réalisées</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold text-primary">{actions.filter(x => x.statut === 'En cours').length}</p><p className="text-xs text-muted-foreground mt-0.5">En cours</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold text-amber-600">{actions.filter(x => x.statut === 'À lancer' || x.statut === 'Planifié').length}</p><p className="text-xs text-muted-foreground mt-0.5">À lancer</p></CardContent></Card>
      </div>

      <div className="flex justify-end">
        <Button disabled={risques.length === 0} onClick={() => setForm({ risqueId: risques[0]?.id || '', recommandation: '', responsable: '', dateLimite: '', statut: 'À lancer', observations: '' })}>
          <Plus className="h-4 w-4 mr-2" /> Nouvelle action
        </Button>
      </div>

      {risques.length === 0 && <Card><CardContent className="py-12 text-center text-muted-foreground">Aucun risque dans la cartographie. Alimentez la cartographie des risques pour créer des actions.</CardContent></Card>}

      {form && (
        <Card className="border-primary"><CardContent className="pt-6 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Risque identifié (de la cartographie)</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.risqueId} onChange={e => setForm({ ...form, risqueId: e.target.value })}>
                {risques.map(r => <option key={r.id} value={r.id}>[{r.processus}] {r.risque} (score: {r.probabilite * r.impact * r.maitrise})</option>)}
              </select>
            </div>
            <div className="space-y-1"><Label className="text-xs">Responsable</Label><Input value={form.responsable} onChange={e => setForm({ ...form, responsable: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Date limite de mise en œuvre</Label><Input type="date" value={form.dateLimite} onChange={e => setForm({ ...form, dateLimite: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Statut</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.statut} onChange={e => setForm({ ...form, statut: e.target.value })}>
                {['À lancer', 'Planifié', 'En cours', 'Réalisé'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1"><Label className="text-xs">Recommandation / Action corrective</Label>
            <Textarea value={form.recommandation} onChange={e => setForm({ ...form, recommandation: e.target.value })} rows={3} placeholder="Décrire l'action corrective à mettre en œuvre pour traiter le risque..." />
          </div>
          <div className="space-y-1"><Label className="text-xs">Observations</Label>
            <Textarea value={form.observations || ''} onChange={e => setForm({ ...form, observations: e.target.value })} rows={2} placeholder="Observations complémentaires..." />
          </div>
          <div className="flex gap-2"><Button onClick={submit}>Valider</Button><Button variant="outline" onClick={() => setForm(null)}>Annuler</Button></div>
        </CardContent></Card>
      )}

      {sorted.map(a => {
        const overdue = a.dateLimite && new Date(a.dateLimite) < new Date() && a.statut !== 'Réalisé';
        return (
          <Card key={a.id} className={`${a.scoreRisque >= 40 ? 'border-l-4 border-l-destructive' : a.scoreRisque >= 20 ? 'border-l-4 border-l-orange-500' : ''} ${overdue ? 'bg-destructive/5' : ''}`}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={a.scoreRisque >= 40 ? 'destructive' : 'default'}>{a.scoreRisque}</Badge>
                    {overdue && <Badge variant="destructive" className="text-[10px]">EN RETARD</Badge>}
                  </div>
                  <p className="font-bold mt-1">{a.recommandation || 'Recommandation à définir'}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                    <span>Resp: <strong>{a.responsable || '—'}</strong></span>
                    <span>Échéance: <strong>{a.dateLimite || '—'}</strong></span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={a.statut === 'Réalisé' ? 'secondary' : a.statut === 'En cours' ? 'default' : 'outline'}>{a.statut}</Badge>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setForm({ ...a })}><Pencil className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => save(actions.filter(x => x.id !== a.id))}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </ModulePageLayout>
  );
}