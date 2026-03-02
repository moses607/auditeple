import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { StockItem, fmt } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';

export default function Stocks() {
  const [items, setItems] = useState<StockItem[]>(() => loadState('stocks', []));
  const [form, setForm] = useState<any>(null);
  const save = (d: StockItem[]) => { setItems(d); saveState('stocks', d); };

  const submit = () => {
    if (!form || !form.nom) return;
    const phys = parseInt(form.phys) || 0, cu = parseFloat(form.cump) || 0;
    const ecart = phys - (parseInt(form.theo) || 0);
    const dlcAlert = form.dlc && (new Date(form.dlc).getTime() - Date.now()) < 7 * 86400000;
    const item: StockItem = { id: form.id || crypto.randomUUID(), ref: form.ref, nom: form.nom, categorie: form.categorie, theo: parseInt(form.theo) || 0, phys, ecart, cump: cu, valeur: phys * cu, dlc: form.dlc, statut: dlcAlert ? 'Alerte DLC' : 'Normal', fournisseur: form.fournisseur };
    if (form.id) save(items.map(i => i.id === form.id ? item : i));
    else save([...items, item]);
    setForm(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Stocks Denrées</h1>
          <p className="text-xs text-muted-foreground mt-1">Réf. : M9-6 § 2.1.4 — Inventaire physique 2x/an — Valorisation CUMP</p>
        </div>
        <Button onClick={() => setForm({ ref: 'D-' + String(items.length + 1).padStart(3, '0'), nom: '', categorie: 'Viandes', theo: '', phys: '', cump: '', dlc: '', fournisseur: '' })}><Plus className="h-4 w-4 mr-2" /> Ajouter</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{items.length}</p><p className="text-xs text-muted-foreground">Articles</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{fmt(items.reduce((s, x) => s + x.valeur, 0))}</p><p className="text-xs text-muted-foreground">Valeur stock</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-destructive">{items.filter(x => x.ecart !== 0).length}</p><p className="text-xs text-muted-foreground">Écarts</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-destructive">{items.filter(x => x.statut !== 'Normal').length}</p><p className="text-xs text-muted-foreground">Alertes DLC</p></CardContent></Card>
      </div>

      {form && (
        <Card className="border-primary">
          <CardContent className="pt-6 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1"><Label className="text-xs">Référence</Label><Input value={form.ref} onChange={e => setForm({ ...form, ref: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Désignation</Label><Input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Catégorie</Label><Input value={form.categorie} onChange={e => setForm({ ...form, categorie: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Fournisseur</Label><Input value={form.fournisseur} onChange={e => setForm({ ...form, fournisseur: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Qté théorique</Label><Input type="number" value={form.theo} onChange={e => setForm({ ...form, theo: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Qté physique</Label><Input type="number" value={form.phys} onChange={e => setForm({ ...form, phys: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">CUMP (€)</Label><Input type="number" value={form.cump} onChange={e => setForm({ ...form, cump: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">DLC</Label><Input type="date" value={form.dlc} onChange={e => setForm({ ...form, dlc: e.target.value })} /></div>
            </div>
            <div className="flex gap-2"><Button onClick={submit}>Valider</Button><Button variant="outline" onClick={() => setForm(null)}>Annuler</Button></div>
          </CardContent>
        </Card>
      )}

      {items.length === 0 && !form && <Card><CardContent className="py-12 text-center text-muted-foreground">Aucun article en stock.</CardContent></Card>}

      {items.length > 0 && (
        <Card>
          <CardContent className="pt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">Réf</th><th className="text-left p-2">Désignation</th><th className="p-2">Théo</th><th className="p-2">Phys</th><th className="p-2">Écart</th><th className="text-right p-2">CUMP</th><th className="text-right p-2">Valeur</th><th className="p-2">DLC</th><th className="p-2">Statut</th><th></th></tr></thead>
              <tbody>{items.map(x => (
                <tr key={x.id} className="border-b hover:bg-muted/50">
                  <td className="p-2 font-mono text-xs">{x.ref}</td>
                  <td className="p-2 font-medium">{x.nom}<br /><span className="text-xs text-muted-foreground">{x.categorie} — {x.fournisseur}</span></td>
                  <td className="p-2 text-center font-mono">{x.theo}</td>
                  <td className="p-2 text-center font-mono font-bold">{x.phys}</td>
                  <td className={`p-2 text-center font-mono font-bold ${x.ecart === 0 ? 'text-green-600' : 'text-destructive'}`}>{x.ecart >= 0 ? '+' : ''}{x.ecart}</td>
                  <td className="p-2 text-right font-mono">{fmt(x.cump)}</td>
                  <td className="p-2 text-right font-mono font-bold">{fmt(x.valeur)}</td>
                  <td className="p-2 text-xs">{x.dlc}</td>
                  <td className="p-2"><Badge variant={x.statut === 'Normal' ? 'secondary' : 'destructive'}>{x.statut}</Badge></td>
                  <td className="p-2"><div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setForm({ ...x, theo: String(x.theo), phys: String(x.phys), cump: String(x.cump) })}><Pencil className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => save(items.filter(i => i.id !== x.id))}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
