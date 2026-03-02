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

export default function RapprochementBancaire() {
  const [items, setItems] = useState<RapprochementItem[]>(() => loadState('rapprochement', []));
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Rapprochement Bancaire</h1>
          <p className="text-xs text-muted-foreground mt-1">Réf. : M9-6 § 3.2.1 — Rapprochement mensuel obligatoire</p>
        </div>
        <Button onClick={() => setForm({ date: '', dft: '', compta: '', suspens: '0', observations: '' })}><Plus className="h-4 w-4 mr-2" /> Nouveau</Button>
      </div>

      {form && (
        <Card className="border-primary">
          <CardContent className="pt-6 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
    </div>
  );
}
