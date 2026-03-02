import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { BoursierEleve, ECHELONS_BOURSES, fmt } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';

export default function Bourses() {
  const [items, setItems] = useState<BoursierEleve[]>(() => loadState('bourses', []));
  const [form, setForm] = useState<any>(null);
  const save = (d: BoursierEleve[]) => { setItems(d); saveState('bourses', d); };

  const submit = () => {
    if (!form || !form.nom) return;
    const ech = parseInt(form.echelon) || 6;
    const ann = ECHELONS_BOURSES[ech] || 0;
    const t1 = parseFloat(form.t1) || 0, t2 = parseFloat(form.t2) || 0, t3 = parseFloat(form.t3) || 0;
    const verse = t1 + t2 + t3;
    const item: BoursierEleve = { id: form.id || crypto.randomUUID(), nom: form.nom, classe: form.classe, echelon: ech, annuel: ann, t1, t2, t3, verse, reliquat: ann - verse, statut: verse >= ann ? 'Soldé' : verse < ann / 3 ? 'Retard versement' : 'En cours' };
    if (form.id) save(items.map(i => i.id === form.id ? item : i));
    else save([...items, item]);
    setForm(null);
  };

  const totAnn = items.reduce((s, x) => s + x.annuel, 0);
  const totVerse = items.reduce((s, x) => s + x.verse, 0);
  const nbRetard = items.filter(x => x.statut === 'Retard versement').length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bourses Nationales</h1>
          <p className="text-xs text-muted-foreground mt-1">Réf. : M9-6 § 3.2.7.6.2 — Programme 230 — Barème 2024-2025</p>
        </div>
        <Button onClick={() => setForm({ nom: '', classe: '', echelon: '6', t1: '', t2: '', t3: '' })}><Plus className="h-4 w-4 mr-2" /> Nouvel élève</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{fmt(totAnn)}</p><p className="text-xs text-muted-foreground">Total annuel</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-green-600">{fmt(totVerse)}</p><p className="text-xs text-muted-foreground">Versé</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{fmt(totAnn - totVerse)}</p><p className="text-xs text-muted-foreground">Reliquat</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className={`text-2xl font-bold ${nbRetard > 0 ? 'text-destructive' : 'text-green-600'}`}>{nbRetard}</p><p className="text-xs text-muted-foreground">Retards</p></CardContent></Card>
      </div>

      {form && (
        <Card className="border-primary">
          <CardContent className="pt-6 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="space-y-1"><Label className="text-xs">Nom élève</Label><Input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Classe</Label><Input value={form.classe} onChange={e => setForm({ ...form, classe: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Échelon</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.echelon} onChange={e => setForm({ ...form, echelon: e.target.value })}>
                  {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>Éch. {n} — {ECHELONS_BOURSES[n]} €</option>)}
                </select>
              </div>
              <div className="space-y-1"><Label className="text-xs">Versé T1 (€)</Label><Input type="number" value={form.t1} onChange={e => setForm({ ...form, t1: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Versé T2 (€)</Label><Input type="number" value={form.t2} onChange={e => setForm({ ...form, t2: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Versé T3 (€)</Label><Input type="number" value={form.t3} onChange={e => setForm({ ...form, t3: e.target.value })} /></div>
            </div>
            <div className="flex gap-2"><Button onClick={submit}>Valider</Button><Button variant="outline" onClick={() => setForm(null)}>Annuler</Button></div>
          </CardContent>
        </Card>
      )}

      {items.length === 0 && !form && <Card><CardContent className="py-12 text-center text-muted-foreground">Aucun boursier enregistré.</CardContent></Card>}
      {items.length > 0 && (
        <Card><CardContent className="pt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">Élève</th><th className="p-2">Classe</th><th className="p-2">Éch.</th><th className="text-right p-2">Annuel</th><th className="text-right p-2">Versé</th><th className="text-right p-2">Reliquat</th><th className="p-2">Statut</th><th></th></tr></thead>
            <tbody>{items.map(x => (
              <tr key={x.id} className={`border-b ${x.statut === 'Retard versement' ? 'bg-destructive/5' : ''}`}>
                <td className="p-2 font-bold">{x.nom}</td><td className="p-2">{x.classe}</td><td className="p-2 text-center">{x.echelon}</td>
                <td className="p-2 text-right font-mono">{fmt(x.annuel)}</td><td className="p-2 text-right font-mono font-bold">{fmt(x.verse)}</td>
                <td className={`p-2 text-right font-mono font-bold ${x.reliquat > 0 ? 'text-orange-600' : 'text-green-600'}`}>{fmt(x.reliquat)}</td>
                <td className="p-2"><Badge variant={x.statut === 'Soldé' ? 'secondary' : x.statut === 'Retard versement' ? 'destructive' : 'default'}>{x.statut}</Badge></td>
                <td className="p-2"><div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setForm({ ...x, echelon: String(x.echelon), t1: String(x.t1), t2: String(x.t2), t3: String(x.t3) })}><Pencil className="h-3 w-3" /></Button>
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
