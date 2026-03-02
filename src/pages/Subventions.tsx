import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { SubventionItem, fmt } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';

export default function Subventions() {
  const [items, setItems] = useState<SubventionItem[]>(() => loadState('subventions', []));
  const [form, setForm] = useState<any>(null);
  const save = (d: SubventionItem[]) => { setItems(d); saveState('subventions', d); };

  const submit = () => {
    if (!form || !form.type) return;
    const notif = parseFloat(form.notifie) || 0, conso = parseFloat(form.consomme) || 0;
    const item: SubventionItem = { id: form.id || crypto.randomUUID(), type: form.type, programme: form.programme, notifie: notif, recu: parseFloat(form.recu) || 0, conditionsEmploi: form.conditionsEmploi || false, consomme: conso, reliquat: notif - conso, statut: form.statut };
    if (form.id) save(items.map(i => i.id === form.id ? item : i));
    else save([...items, item]);
    setForm(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Subventions</h1>
          <p className="text-xs text-muted-foreground mt-1">Réf. : Suivi des subventions notifiées et consommées</p>
        </div>
        <Button onClick={() => setForm({ type: 'DGF État', programme: 'P141', notifie: '', recu: '', consomme: '', conditionsEmploi: false, statut: 'En cours' })}><Plus className="h-4 w-4 mr-2" /> Ajouter</Button>
      </div>

      {form && (
        <Card className="border-primary"><CardContent className="pt-6 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="space-y-1"><Label className="text-xs">Type</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                {['DGF État', 'Bourses', 'Fonds sociaux', 'Région', 'Département', 'Taxe apprentissage', 'Subv. européenne', 'Autre'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1"><Label className="text-xs">Programme</Label><Input value={form.programme} onChange={e => setForm({ ...form, programme: e.target.value })} placeholder="P141, P230..." /></div>
            <div className="space-y-1"><Label className="text-xs">Notifié (€)</Label><Input type="number" value={form.notifie} onChange={e => setForm({ ...form, notifie: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Reçu (€)</Label><Input type="number" value={form.recu} onChange={e => setForm({ ...form, recu: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Consommé (€)</Label><Input type="number" value={form.consomme} onChange={e => setForm({ ...form, consomme: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Statut</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.statut} onChange={e => setForm({ ...form, statut: e.target.value })}>
                <option>En cours</option><option>Soldé</option><option>Sous-consommé</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2"><Checkbox checked={form.conditionsEmploi} onCheckedChange={v => setForm({ ...form, conditionsEmploi: v })} /><Label className="text-xs">Conditions d'emploi</Label></div>
          <div className="flex gap-2"><Button onClick={submit}>Valider</Button><Button variant="outline" onClick={() => setForm(null)}>Annuler</Button></div>
        </CardContent></Card>
      )}

      {items.length === 0 && !form && <Card><CardContent className="py-12 text-center text-muted-foreground">Aucune subvention.</CardContent></Card>}
      {items.length > 0 && (
        <Card><CardContent className="pt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">Type</th><th className="p-2">Prog.</th><th className="text-right p-2">Notifié</th><th className="text-right p-2">Consommé</th><th className="p-2">Taux</th><th className="text-right p-2">Reliquat</th><th className="p-2">Cond.</th><th className="p-2">Statut</th><th></th></tr></thead>
            <tbody>{items.map(x => {
              const tx = x.notifie > 0 ? x.consomme / x.notifie * 100 : 0;
              return (
                <tr key={x.id} className="border-b">
                  <td className="p-2 font-bold">{x.type}</td><td className="p-2 font-mono">{x.programme}</td>
                  <td className="p-2 text-right font-mono">{fmt(x.notifie)}</td><td className="p-2 text-right font-mono font-bold">{fmt(x.consomme)}</td>
                  <td className={`p-2 font-bold ${tx < 50 ? 'text-destructive' : 'text-green-600'}`}>{tx.toFixed(1)}%</td>
                  <td className={`p-2 text-right font-mono ${x.reliquat > 0 ? 'text-orange-600' : 'text-green-600'}`}>{fmt(x.reliquat)}</td>
                  <td className="p-2">{x.conditionsEmploi ? <Badge variant="destructive">OUI</Badge> : 'Non'}</td>
                  <td className="p-2"><Badge variant={x.statut === 'Sous-consommé' ? 'destructive' : 'default'}>{x.statut}</Badge></td>
                  <td className="p-2"><div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setForm({ ...x, notifie: String(x.notifie), recu: String(x.recu), consomme: String(x.consomme) })}><Pencil className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => save(items.filter(i => i.id !== x.id))}><Trash2 className="h-3 w-3 text-destructive" /></Button>
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
