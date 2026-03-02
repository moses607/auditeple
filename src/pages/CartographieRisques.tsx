import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { CartoRisque, PROCESSUS_CICF, NIVEAUX_RISQUE } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';

const riskLevel = (r: CartoRisque) => {
  const n = r.probabilite * r.impact * r.maitrise;
  if (n >= 40) return { label: 'CRITIQUE', color: 'destructive' as const };
  if (n >= 20) return { label: 'MAJEUR', color: 'default' as const };
  if (n >= 10) return { label: 'MOYEN', color: 'secondary' as const };
  return { label: 'FAIBLE', color: 'secondary' as const };
};

export default function CartographieRisques() {
  const [items, setItems] = useState<CartoRisque[]>(() => loadState('cartographie', []));
  const [form, setForm] = useState<any>(null);
  const save = (d: CartoRisque[]) => { setItems(d); saveState('cartographie', d); };

  const submit = () => {
    if (!form || !form.risque) return;
    const item: CartoRisque = { id: form.id || crypto.randomUUID(), processus: form.processus, risque: form.risque, probabilite: parseInt(form.probabilite) || 3, impact: parseInt(form.impact) || 3, maitrise: parseInt(form.maitrise) || 3, action: form.action, responsable: form.responsable, echeance: form.echeance, statut: form.statut };
    if (form.id) save(items.map(i => i.id === form.id ? item : i));
    else save([...items, item]);
    setForm(null);
  };

  const sorted = [...items].sort((a, b) => (b.probabilite * b.impact * b.maitrise) - (a.probabilite * a.impact * a.maitrise));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cartographie des Risques — CICF</h1>
          <p className="text-xs text-muted-foreground mt-1">Réf. : Cartop@le / ODICé — 11 processus — Décret 2012-1246 art. 170-172</p>
        </div>
        <Button onClick={() => setForm({ processus: 'Trésorerie', risque: '', probabilite: '3', impact: '3', maitrise: '3', action: '', responsable: '', echeance: 'Permanent', statut: 'À lancer' })}><Plus className="h-4 w-4 mr-2" /> Nouveau risque</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{items.length}</p><p className="text-xs text-muted-foreground">Risques</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-destructive">{items.filter(r => r.probabilite * r.impact * r.maitrise >= 40).length}</p><p className="text-xs text-muted-foreground">Critiques</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-orange-600">{items.filter(r => { const n = r.probabilite * r.impact * r.maitrise; return n >= 20 && n < 40; }).length}</p><p className="text-xs text-muted-foreground">Majeurs</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{[...new Set(items.map(r => r.processus))].length}/11</p><p className="text-xs text-muted-foreground">Processus</p></CardContent></Card>
      </div>

      {form && (
        <Card className="border-destructive"><CardContent className="pt-6 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="space-y-1"><Label className="text-xs">Processus</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.processus} onChange={e => setForm({ ...form, processus: e.target.value })}>
                {PROCESSUS_CICF.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="space-y-1"><Label className="text-xs">Risque identifié</Label><Input value={form.risque} onChange={e => setForm({ ...form, risque: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Probabilité (1-5)</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.probabilite} onChange={e => setForm({ ...form, probabilite: e.target.value })}>
                {NIVEAUX_RISQUE.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
              </select>
            </div>
            <div className="space-y-1"><Label className="text-xs">Impact (1-5)</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.impact} onChange={e => setForm({ ...form, impact: e.target.value })}>
                {NIVEAUX_RISQUE.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
              </select>
            </div>
            <div className="space-y-1"><Label className="text-xs">Maîtrise (1-5)</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.maitrise} onChange={e => setForm({ ...form, maitrise: e.target.value })}>
                {NIVEAUX_RISQUE.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
              </select>
            </div>
            <div className="space-y-1"><Label className="text-xs">Action corrective</Label><Input value={form.action} onChange={e => setForm({ ...form, action: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Responsable</Label><Input value={form.responsable} onChange={e => setForm({ ...form, responsable: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Échéance</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.echeance} onChange={e => setForm({ ...form, echeance: e.target.value })}>
                {['Permanent', 'Mensuel', 'Trimestriel', 'Semestriel', 'Annuel'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="space-y-1"><Label className="text-xs">Statut</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.statut} onChange={e => setForm({ ...form, statut: e.target.value })}>
                {['À lancer', 'Planifié', 'En cours', 'Réalisé'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div className="p-2 bg-muted rounded text-sm">Note: <span className="text-lg font-bold">{(parseInt(form.probabilite) || 1) * (parseInt(form.impact) || 1) * (parseInt(form.maitrise) || 1)}</span></div>
          <div className="flex gap-2"><Button onClick={submit}>Valider</Button><Button variant="outline" onClick={() => setForm(null)}>Annuler</Button></div>
        </CardContent></Card>
      )}

      {items.length === 0 && !form && <Card><CardContent className="py-12 text-center text-muted-foreground">Aucun risque enregistré.</CardContent></Card>}
      {sorted.length > 0 && (
        <Card><CardContent className="pt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">Processus</th><th className="text-left p-2">Risque</th><th className="p-2">P</th><th className="p-2">I</th><th className="p-2">M</th><th className="p-2">Note</th><th className="p-2">Criticité</th><th className="text-left p-2">Action</th><th className="p-2">Statut</th><th></th></tr></thead>
            <tbody>{sorted.map(r => {
              const n = r.probabilite * r.impact * r.maitrise;
              const rl = riskLevel(r);
              return (
                <tr key={r.id} className={`border-b ${n >= 40 ? 'bg-destructive/5' : n >= 20 ? 'bg-orange-50' : ''}`}>
                  <td className="p-2 font-bold">{r.processus}</td><td className="p-2 max-w-[200px]">{r.risque}</td>
                  <td className="p-2 text-center">{r.probabilite}</td><td className="p-2 text-center">{r.impact}</td><td className="p-2 text-center">{r.maitrise}</td>
                  <td className="p-2 text-center font-mono font-bold text-lg">{n}</td>
                  <td className="p-2"><Badge variant={rl.color}>{rl.label}</Badge></td>
                  <td className="p-2 text-xs max-w-[180px]">{r.action}</td>
                  <td className="p-2"><Badge variant={r.statut === 'Réalisé' ? 'secondary' : 'default'}>{r.statut}</Badge></td>
                  <td className="p-2"><div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setForm({ ...r, probabilite: String(r.probabilite), impact: String(r.impact), maitrise: String(r.maitrise) })}><Pencil className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => save(items.filter(i => i.id !== r.id))}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                  </div></td>
                </tr>
              );
            })}</tbody>
          </table>
        </CardContent></Card>
      )}
    </div>
  );
}
