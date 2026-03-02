import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { CreanceItem, fmt, fmtDate } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';

export default function Recouvrement() {
  const [items, setItems] = useState<CreanceItem[]>(() => loadState('creances', []));
  const [form, setForm] = useState<any>(null);
  const save = (d: CreanceItem[]) => { setItems(d); saveState('creances', d); };

  const submit = () => {
    if (!form || !form.debiteur) return;
    const item: CreanceItem = { id: form.id || crypto.randomUUID(), debiteur: form.debiteur, nature: form.nature, montant: parseFloat(form.montant) || 0, dateEmission: form.dateEmission, echeance: form.echeance, relances: parseInt(form.relances) || 0, derniereRelance: form.derniereRelance, statut: form.statut, observations: form.observations };
    if (form.id) save(items.map(i => i.id === form.id ? item : i));
    else save([...items, item]);
    setForm(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Recouvrement</h1>
          <p className="text-xs text-muted-foreground mt-1">Réf. : M9-6 § 3.3 — Suivi des créances et relances</p>
        </div>
        <Button onClick={() => setForm({ debiteur: '', nature: '', montant: '', dateEmission: '', echeance: '', relances: '0', derniereRelance: '', statut: 'Relance amiable', observations: '' })}><Plus className="h-4 w-4 mr-2" /> Nouvelle créance</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{items.length}</p><p className="text-xs text-muted-foreground">Créances</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-destructive">{fmt(items.reduce((s, x) => s + x.montant, 0))}</p><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-destructive">{items.filter(x => x.statut === 'Contentieux').length}</p><p className="text-xs text-muted-foreground">Contentieux</p></CardContent></Card>
      </div>

      {form && (
        <Card className="border-primary"><CardContent className="pt-6 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
        <Card><CardContent className="pt-6 overflow-x-auto">
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
      )}
    </div>
  );
}
