import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { EPCPItem, fmt } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';

export default function CommandePublique() {
  const [items, setItems] = useState<EPCPItem[]>(() => loadState('epcp', []));
  const [form, setForm] = useState<any>(null);
  const save = (d: EPCPItem[]) => { setItems(d); saveState('epcp', d); };

  const submit = () => {
    if (!form || !form.objet) return;
    const item: EPCPItem = { id: form.id || crypto.randomUUID(), objet: form.objet, nature: form.nature, previsionnel: parseFloat(form.previsionnel) || 0, engage: parseFloat(form.engage) || 0, procedure: form.procedure, referenceMarche: form.referenceMarche };
    if (form.id) save(items.map(i => i.id === form.id ? item : i));
    else save([...items, item]);
    setForm(null);
  };

  const totPrev = items.reduce((s, x) => s + x.previsionnel, 0);
  const totEng = items.reduce((s, x) => s + x.engage, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Commande Publique</h1>
          <p className="text-xs text-muted-foreground mt-1">Réf. : CMP 2024 — Suivi des engagements et procédures</p>
        </div>
        <Button onClick={() => setForm({ objet: '', nature: 'Fournitures', previsionnel: '', engage: '', procedure: 'Gré à gré', referenceMarche: '' })}><Plus className="h-4 w-4 mr-2" /> Ajouter</Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{items.length}</p><p className="text-xs text-muted-foreground">Marchés</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{fmt(totPrev)}</p><p className="text-xs text-muted-foreground">Prévisionnel</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{fmt(totEng)}</p><p className="text-xs text-muted-foreground">Engagé</p></CardContent></Card>
      </div>

      {form && (
        <Card className="border-primary"><CardContent className="pt-6 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="space-y-1"><Label className="text-xs">Objet</Label><Input value={form.objet} onChange={e => setForm({ ...form, objet: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Nature</Label><Input value={form.nature} onChange={e => setForm({ ...form, nature: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Prévisionnel (€)</Label><Input type="number" value={form.previsionnel} onChange={e => setForm({ ...form, previsionnel: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Engagé (€)</Label><Input type="number" value={form.engage} onChange={e => setForm({ ...form, engage: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Procédure</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.procedure} onChange={e => setForm({ ...form, procedure: e.target.value })}>
                <option>Gré à gré</option><option>MAPA</option><option>Formalisée</option>
              </select>
            </div>
            <div className="space-y-1"><Label className="text-xs">Réf. marché</Label><Input value={form.referenceMarche} onChange={e => setForm({ ...form, referenceMarche: e.target.value })} /></div>
          </div>
          <div className="flex gap-2"><Button onClick={submit}>Valider</Button><Button variant="outline" onClick={() => setForm(null)}>Annuler</Button></div>
        </CardContent></Card>
      )}

      {items.length === 0 && !form && <Card><CardContent className="py-12 text-center text-muted-foreground">Aucun marché enregistré.</CardContent></Card>}
      {items.length > 0 && (
        <Card><CardContent className="pt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">Objet</th><th className="p-2">Nature</th><th className="text-right p-2">Prév.</th><th className="text-right p-2">Engagé</th><th className="p-2">Procédure</th><th className="p-2">Réf.</th><th></th></tr></thead>
            <tbody>{items.map(x => (
              <tr key={x.id} className="border-b">
                <td className="p-2 font-bold">{x.objet}</td><td className="p-2">{x.nature}</td>
                <td className="p-2 text-right font-mono">{fmt(x.previsionnel)}</td><td className="p-2 text-right font-mono font-bold">{fmt(x.engage)}</td>
                <td className="p-2">{x.procedure}</td><td className="p-2 font-mono text-xs">{x.referenceMarche}</td>
                <td className="p-2"><div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setForm({ ...x, previsionnel: String(x.previsionnel), engage: String(x.engage) })}><Pencil className="h-3 w-3" /></Button>
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
