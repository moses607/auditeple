import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { RestaurationMois, fmt } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';

export default function Restauration() {
  const [items, setItems] = useState<RestaurationMois[]>(() => loadState('restauration', []));
  const [form, setForm] = useState<any>(null);
  const save = (d: RestaurationMois[]) => { setItems(d); saveState('restauration', d); };

  const submit = () => {
    if (!form || !form.mois) return;
    const cm = parseFloat(form.coutMatieres) || 0, cp = parseFloat(form.coutPersonnel) || 0, ce = parseFloat(form.coutEnergie) || 0;
    const item: RestaurationMois = { id: form.id || crypto.randomUUID(), mois: form.mois, repas: parseInt(form.repas) || 0, coutMatieres: cm, coutPersonnel: cp, coutEnergie: ce, coutTotal: cm + cp + ce, tarif: parseFloat(form.tarif) || 3.80, frequentation: parseFloat(form.frequentation) || 0, impayes: parseFloat(form.impayes) || 0, bio: parseFloat(form.bio) || 0, durable: parseFloat(form.durable) || 0 };
    if (form.id) save(items.map(i => i.id === form.id ? item : i));
    else save([item, ...items]);
    setForm(null);
  };

  const last = items[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Restauration — SRH</h1>
          <p className="text-xs text-muted-foreground mt-1">Réf. : EGAlim: 50% durable dont 20% bio — Convention CT/CR — HACCP</p>
        </div>
        <Button onClick={() => setForm({ mois: new Date().toISOString().slice(0, 7), repas: '', coutMatieres: '', coutPersonnel: '', coutEnergie: '', tarif: last?.tarif || 3.80, frequentation: '', impayes: '', bio: '', durable: '' })}><Plus className="h-4 w-4 mr-2" /> Nouveau mois</Button>
      </div>

      {last && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card><CardContent className="pt-4 text-center"><p className="text-lg font-bold">{last.mois}</p><p className="text-xs text-muted-foreground">Dernier mois</p></CardContent></Card>
          <Card><CardContent className="pt-4 text-center"><p className="text-lg font-bold">{last.coutTotal.toFixed(2)} €</p><p className="text-xs text-muted-foreground">Coût/repas</p></CardContent></Card>
          <Card><CardContent className="pt-4 text-center"><p className={`text-lg font-bold ${last.bio >= 20 ? 'text-green-600' : 'text-destructive'}`}>{last.bio}%</p><p className="text-xs text-muted-foreground">Bio</p></CardContent></Card>
          <Card><CardContent className="pt-4 text-center"><p className={`text-lg font-bold ${last.durable >= 50 ? 'text-green-600' : 'text-destructive'}`}>{last.durable}%</p><p className="text-xs text-muted-foreground">Durable</p></CardContent></Card>
          <Card><CardContent className="pt-4 text-center"><p className={`text-lg font-bold ${last.impayes > 0 ? 'text-destructive' : 'text-green-600'}`}>{fmt(last.impayes)}</p><p className="text-xs text-muted-foreground">Impayés</p></CardContent></Card>
        </div>
      )}

      {form && (
        <Card className="border-primary">
          <CardContent className="pt-6 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="space-y-1"><Label className="text-xs">Mois</Label><Input type="month" value={form.mois} onChange={e => setForm({ ...form, mois: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Nb repas</Label><Input type="number" value={form.repas} onChange={e => setForm({ ...form, repas: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Coût matière (€)</Label><Input type="number" value={form.coutMatieres} onChange={e => setForm({ ...form, coutMatieres: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Coût personnel (€)</Label><Input type="number" value={form.coutPersonnel} onChange={e => setForm({ ...form, coutPersonnel: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Coût énergie (€)</Label><Input type="number" value={form.coutEnergie} onChange={e => setForm({ ...form, coutEnergie: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Tarif (€)</Label><Input type="number" value={form.tarif} onChange={e => setForm({ ...form, tarif: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Fréquentation %</Label><Input type="number" value={form.frequentation} onChange={e => setForm({ ...form, frequentation: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Impayés (€)</Label><Input type="number" value={form.impayes} onChange={e => setForm({ ...form, impayes: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">% Bio</Label><Input type="number" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">% Durable</Label><Input type="number" value={form.durable} onChange={e => setForm({ ...form, durable: e.target.value })} /></div>
            </div>
            <div className="flex gap-2"><Button onClick={submit}>Valider</Button><Button variant="outline" onClick={() => setForm(null)}>Annuler</Button></div>
          </CardContent>
        </Card>
      )}

      {items.length === 0 && !form && <Card><CardContent className="py-12 text-center text-muted-foreground">Aucun mois enregistré.</CardContent></Card>}
      {items.length > 0 && (
        <Card><CardContent className="pt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-xs text-muted-foreground"><th className="p-2">Mois</th><th className="p-2">Repas</th><th className="text-right p-2">C.mat</th><th className="text-right p-2">C.tot</th><th className="text-right p-2">Tarif</th><th className="p-2">Fréq.</th><th className="text-right p-2">Impayés</th><th className="p-2">Bio%</th><th className="p-2">Dur%</th><th></th></tr></thead>
            <tbody>{items.map(x => (
              <tr key={x.id} className="border-b">
                <td className="p-2 font-bold">{x.mois}</td><td className="p-2 font-mono">{x.repas.toLocaleString('fr-FR')}</td>
                <td className="p-2 text-right font-mono">{x.coutMatieres.toFixed(2)}</td><td className="p-2 text-right font-mono font-bold">{x.coutTotal.toFixed(2)}</td>
                <td className="p-2 text-right font-mono">{x.tarif.toFixed(2)}</td><td className="p-2 font-bold">{x.frequentation}%</td>
                <td className={`p-2 text-right font-mono font-bold ${x.impayes > 0 ? 'text-destructive' : 'text-green-600'}`}>{fmt(x.impayes)}</td>
                <td className={`p-2 font-bold ${x.bio >= 20 ? 'text-green-600' : 'text-destructive'}`}>{x.bio}%</td>
                <td className={`p-2 font-bold ${x.durable >= 50 ? 'text-green-600' : 'text-destructive'}`}>{x.durable}%</td>
                <td className="p-2"><div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setForm({ ...x, repas: String(x.repas), coutMatieres: String(x.coutMatieres), coutPersonnel: String(x.coutPersonnel), coutEnergie: String(x.coutEnergie), tarif: String(x.tarif), frequentation: String(x.frequentation), impayes: String(x.impayes), bio: String(x.bio), durable: String(x.durable) })}><Pencil className="h-3 w-3" /></Button>
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
