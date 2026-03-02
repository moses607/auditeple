import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { BudgetAnnexe, fmt } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';

export default function BudgetsAnnexes() {
  const [items, setItems] = useState<BudgetAnnexe[]>(() => loadState('budgets_annexes', []));
  const [form, setForm] = useState<any>(null);
  const save = (d: BudgetAnnexe[]) => { setItems(d); saveState('budgets_annexes', d); };

  const submit = () => {
    if (!form || !form.nom) return;
    const item: BudgetAnnexe = { id: form.id || crypto.randomUUID(), type: form.type, nom: form.nom, budget: parseFloat(form.budget) || 0, resultatExploitation: parseFloat(form.resultatExploitation) || 0, resultatFinancier: parseFloat(form.resultatFinancier) || 0, resultatExceptionnel: parseFloat(form.resultatExceptionnel) || 0, resultatNet: parseFloat(form.resultatNet) || 0, tauxExecution: parseFloat(form.tauxExecution) || 0, compte185: parseFloat(form.compte185) || 0 };
    if (form.id) save(items.map(i => i.id === form.id ? item : i));
    else save([...items, item]);
    setForm(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Budgets Annexes — M9-43</h1>
          <p className="text-xs text-muted-foreground mt-1">Réf. : M9-43 § 3.4 — Réciprocité 185000 — Contrôle rattachement</p>
        </div>
        <Button onClick={() => setForm({ type: 'GRETA', nom: '', budget: '', resultatExploitation: '', resultatFinancier: '', resultatExceptionnel: '', resultatNet: '', tauxExecution: '', compte185: '' })}><Plus className="h-4 w-4 mr-2" /> Nouveau BA</Button>
      </div>

      {form && (
        <Card className="border-primary"><CardContent className="pt-6 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="space-y-1"><Label className="text-xs">Type</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option>GRETA</option><option>CFA</option><option>SRH</option><option>Autre</option>
              </select>
            </div>
            <div className="space-y-1"><Label className="text-xs">Nom</Label><Input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Budget (€)</Label><Input type="number" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Rés. exploitation</Label><Input type="number" value={form.resultatExploitation} onChange={e => setForm({ ...form, resultatExploitation: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Rés. financier</Label><Input type="number" value={form.resultatFinancier} onChange={e => setForm({ ...form, resultatFinancier: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Rés. exceptionnel</Label><Input type="number" value={form.resultatExceptionnel} onChange={e => setForm({ ...form, resultatExceptionnel: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Résultat net</Label><Input type="number" value={form.resultatNet} onChange={e => setForm({ ...form, resultatNet: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Taux exéc. %</Label><Input type="number" value={form.tauxExecution} onChange={e => setForm({ ...form, tauxExecution: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Compte 185</Label><Input type="number" value={form.compte185} onChange={e => setForm({ ...form, compte185: e.target.value })} /></div>
          </div>
          <div className="flex gap-2"><Button onClick={submit}>Valider</Button><Button variant="outline" onClick={() => setForm(null)}>Annuler</Button></div>
        </CardContent></Card>
      )}

      {items.length === 0 && !form && <Card><CardContent className="py-12 text-center text-muted-foreground">Aucun budget annexe.</CardContent></Card>}
      {items.map(x => (
        <Card key={x.id}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div><Badge className="mr-2">{x.type}</Badge><span className="font-bold">{x.nom}</span></div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setForm({ ...x, budget: String(x.budget), resultatExploitation: String(x.resultatExploitation), resultatFinancier: String(x.resultatFinancier), resultatExceptionnel: String(x.resultatExceptionnel), resultatNet: String(x.resultatNet), tauxExecution: String(x.tauxExecution), compte185: String(x.compte185) })}><Pencil className="h-3 w-3" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => save(items.filter(i => i.id !== x.id))}><Trash2 className="h-3 w-3 text-destructive" /></Button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
              <div><span className="text-muted-foreground text-xs">Budget</span><p className="font-mono font-bold">{fmt(x.budget)}</p></div>
              <div><span className="text-muted-foreground text-xs">Rés. exploit.</span><p className="font-mono font-bold">{fmt(x.resultatExploitation)}</p></div>
              <div><span className="text-muted-foreground text-xs">Résultat net</span><p className={`font-mono font-bold ${x.resultatNet >= 0 ? 'text-green-600' : 'text-destructive'}`}>{fmt(x.resultatNet)}</p></div>
              <div><span className="text-muted-foreground text-xs">Taux exéc.</span><p className={`font-bold ${x.tauxExecution >= 80 ? 'text-green-600' : 'text-destructive'}`}>{x.tauxExecution}%</p></div>
              <div><span className="text-muted-foreground text-xs">C185</span><p className="font-mono font-bold">{fmt(x.compte185)}</p></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
