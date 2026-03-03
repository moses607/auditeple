import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Plus, Trash2, Pencil } from 'lucide-react';
import { MarchePublic, SEUILS_MARCHES, fmt } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';

const NATURES = ['Fournitures', 'Services', 'Travaux', 'Fournitures et services', 'Prestations intellectuelles'];
const PROCEDURES = ['Gré à gré (< 40 000 €)', 'MAPA simplifié', 'MAPA avec publicité', 'Appel d\'offres ouvert', 'Appel d\'offres restreint', 'Procédure négociée', 'Dialogue compétitif'];

export default function MarchesPage() {
  const [marches, setMarches] = useState<MarchePublic[]>(() => loadState('marches', []));
  const [form, setForm] = useState<any>(null);
  const save = (m: MarchePublic[]) => { setMarches(m); saveState('marches', m); };

  const submit = () => {
    if (!form || !form.objet) return;
    const item: MarchePublic = {
      id: form.id || crypto.randomUUID(), objet: form.objet,
      montant: parseFloat(form.montant) || 0, typeMarche: form.typeMarche,
      dateNotification: form.dateNotification, observations: form.observations || '',
    };
    if (form.id) save(marches.map(m => m.id === form.id ? item : m));
    else save([...marches, item]);
    setForm(null);
  };

  const remove = (id: string) => save(marches.filter(m => m.id !== id));
  const totMontant = marches.reduce((s, m) => s + m.montant, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Commande & Marchés Publics</h1>
          <p className="text-sm text-muted-foreground mt-1">Suivi des marchés et alertes sur les seuils du Code de la commande publique.</p>
        </div>
        <Button onClick={() => setForm({ objet: '', montant: '', typeMarche: 'Fournitures', dateNotification: '', observations: '' })}>
          <Plus className="h-4 w-4 mr-2" /> Ajouter un marché
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{marches.length}</p><p className="text-xs text-muted-foreground">Marchés</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{fmt(totMontant)}</p><p className="text-xs text-muted-foreground">Montant total</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-destructive">{marches.filter(m => m.montant >= 40000).length}</p><p className="text-xs text-muted-foreground">Seuils franchis</p></CardContent></Card>
      </div>

      {form && (
        <Card className="border-primary"><CardContent className="pt-6 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1"><Label className="text-xs">Objet du marché</Label><Input value={form.objet} onChange={e => setForm({ ...form, objet: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Montant (€ HT)</Label><Input type="number" value={form.montant} onChange={e => setForm({ ...form, montant: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Nature</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.typeMarche} onChange={e => setForm({ ...form, typeMarche: e.target.value })}>
                {NATURES.map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
            <div className="space-y-1"><Label className="text-xs">Date de notification</Label><Input type="date" value={form.dateNotification} onChange={e => setForm({ ...form, dateNotification: e.target.value })} /></div>
          </div>

          {/* Alerte seuils en temps réel */}
          {(() => {
            const montant = parseFloat(form.montant) || 0;
            const seuilAtteint = SEUILS_MARCHES.filter(s => montant >= s.seuil).pop();
            const seuilProchain = SEUILS_MARCHES.find(s => montant < s.seuil);
            return (
              <>
                {seuilAtteint && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <span className="text-sm font-bold text-destructive">Seuil franchi : {seuilAtteint.label}</span>
                    </div>
                    <p className="text-xs">{seuilAtteint.consigne}</p>
                  </div>
                )}
                {seuilProchain && montant > 0 && (
                  <p className="text-xs text-muted-foreground">Prochain seuil à {seuilProchain.label} — marge : {fmt(seuilProchain.seuil - montant)}</p>
                )}
              </>
            );
          })()}

          <div className="space-y-1"><Label className="text-xs">Observations</Label>
            <Textarea value={form.observations || ''} onChange={e => setForm({ ...form, observations: e.target.value })} rows={3} placeholder="Observations, procédure suivie, référence..." />
          </div>
          <div className="flex gap-2"><Button onClick={submit}>Valider</Button><Button variant="outline" onClick={() => setForm(null)}>Annuler</Button></div>
        </CardContent></Card>
      )}

      {marches.length === 0 && !form && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Aucun marché enregistré.</CardContent></Card>
      )}

      {marches.map(marche => {
        const seuilAtteint = SEUILS_MARCHES.filter(s => marche.montant >= s.seuil).pop();
        return (
          <Card key={marche.id} className={seuilAtteint ? 'border-l-4 border-l-destructive' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold">{marche.objet}</span>
                    {seuilAtteint && <Badge variant="destructive">{seuilAtteint.label}</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{marche.typeMarche} — {fmt(marche.montant)} — {marche.dateNotification || 'Non notifié'}</p>
                  {seuilAtteint && <p className="text-xs text-destructive mt-1">{seuilAtteint.consigne}</p>}
                  {marche.observations && <p className="text-xs text-muted-foreground mt-2 italic">{marche.observations}</p>}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setForm({ ...marche, montant: String(marche.montant) })}><Pencil className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => remove(marche.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
