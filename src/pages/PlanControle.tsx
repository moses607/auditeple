import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { PlanControleItem } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';

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
    const item: PlanControleItem = { id: crypto.randomUUID(), type: form.type, frequence: form.frequence, risque: form.risque, reference: form.reference, planning: form.dates ? form.dates.split(',').map((d: string) => d.trim()).filter(Boolean) : [], realises: [], objectif: form.objectif };
    save([...items, item]);
    setForm(null);
  };

  const pT = items.reduce((s, p) => s + p.planning.length, 0);
  const pR = items.reduce((s, p) => s + p.realises.length, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Plan de Contrôle — CICF</h1>
          <p className="text-xs text-muted-foreground mt-1">Réf. : Exigence CRC — Plan annuel hiérarchisé par risques</p>
        </div>
        <Button onClick={() => setForm({ type: '', frequence: 'Trimestriel', risque: 'MOYEN', reference: '', dates: '', objectif: '' })}><Plus className="h-4 w-4 mr-2" /> Nouveau contrôle</Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{pT}</p><p className="text-xs text-muted-foreground">Planifiés</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-green-600">{pR}</p><p className="text-xs text-muted-foreground">Réalisés</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className={`text-2xl font-bold ${pT && pR / pT >= 0.7 ? 'text-green-600' : 'text-destructive'}`}>{pT ? Math.round(pR / pT * 100) : 0}%</p><p className="text-xs text-muted-foreground">Taux</p></CardContent></Card>
      </div>

      {form && (
        <Card className="border-primary"><CardContent className="pt-6 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="space-y-1"><Label className="text-xs">Type de contrôle</Label><Input value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} placeholder="Régies, Stocks..." /></div>
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
            <div className="space-y-1"><Label className="text-xs">Référence</Label><Input value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} placeholder="M9-6 §..." /></div>
            <div className="space-y-1"><Label className="text-xs">Dates planifiées</Label><Input value={form.dates} onChange={e => setForm({ ...form, dates: e.target.value })} placeholder="2025-03-31, 2025-06-30" /></div>
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
              <div className="flex items-center justify-between mb-3">
                <div>
                  <Badge variant={p.risque === 'ÉLEVÉ' ? 'destructive' : p.risque === 'MOYEN' ? 'default' : 'secondary'} className="mr-2">{p.risque}</Badge>
                  <span className="font-bold">{p.type}</span>
                  <span className="text-xs text-muted-foreground ml-2">— {p.frequence} — {p.reference}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{p.realises.length}/{p.planning.length}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => save(items.filter(i => i.id !== p.id))}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                </div>
              </div>
              {p.objectif && <p className="text-xs text-muted-foreground italic mb-2">{p.objectif}</p>}
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
    </div>
  );
}
