import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { EquipeMembre, FONCTIONS_COMPTABLES, TACHES_COMPTABLES } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';

export default function OrganigrammePage() {
  const [items, setItems] = useState<EquipeMembre[]>(() => loadState('organigramme', []));
  const [form, setForm] = useState<any>(null);
  const save = (d: EquipeMembre[]) => { setItems(d); saveState('organigramme', d); };

  const submit = () => {
    if (!form || !form.nom) return;
    const item: EquipeMembre = { id: form.id || crypto.randomUUID(), nom: form.nom, fonction: form.fonction, telephone: form.telephone, email: form.email, taches: form.taches || [] };
    if (form.id) save(items.map(i => i.id === form.id ? item : i));
    else save([...items, item]);
    setForm(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Organigramme Fonctionnel</h1>
          <p className="text-xs text-muted-foreground mt-1">Réf. : Prérequis CICF — Organigramme fonctionnel nominatif annuel — Séparation des tâches</p>
        </div>
        <Button onClick={() => setForm({ nom: '', fonction: 'Agent Comptable', telephone: '', email: '', taches: [] })}><Plus className="h-4 w-4 mr-2" /> Membre</Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{items.length}</p><p className="text-xs text-muted-foreground">Effectif</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{[...new Set(items.map(x => x.fonction))].length}</p><p className="text-xs text-muted-foreground">Fonctions</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{items.reduce((s, x) => s + x.taches.length, 0)}</p><p className="text-xs text-muted-foreground">Tâches attr.</p></CardContent></Card>
      </div>

      {form && (
        <Card className="border-primary"><CardContent className="pt-6 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1"><Label className="text-xs">Nom complet</Label><Input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Fonction</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.fonction} onChange={e => setForm({ ...form, fonction: e.target.value })}>
                {FONCTIONS_COMPTABLES.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div className="space-y-1"><Label className="text-xs">Téléphone</Label><Input value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Courriel</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
          </div>
          <div>
            <Label className="text-xs">Tâches attribuées</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {TACHES_COMPTABLES.map(t => (
                <button key={t} onClick={() => setForm({ ...form, taches: form.taches.includes(t) ? form.taches.filter((x: string) => x !== t) : [...form.taches, t] })}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${form.taches.includes(t) ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border text-muted-foreground hover:border-primary'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2"><Button onClick={submit}>Valider</Button><Button variant="outline" onClick={() => setForm(null)}>Annuler</Button></div>
        </CardContent></Card>
      )}

      {items.length === 0 && !form && <Card><CardContent className="py-12 text-center text-muted-foreground">Aucun membre enregistré.</CardContent></Card>}
      {items.map(m => (
        <Card key={m.id}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">{m.nom.charAt(0)}</div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-lg">{m.nom}</p>
                <p className="text-sm text-primary font-semibold">{m.fonction}</p>
                <p className="text-xs text-muted-foreground">{m.telephone} — {m.email}</p>
                <div className="flex flex-wrap gap-1 mt-2">{m.taches.map(t => <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">{t}</span>)}</div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => setForm({ ...m })}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => save(items.filter(i => i.id !== m.id))}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
