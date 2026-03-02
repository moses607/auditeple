import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { MarchePublic, SEUILS_MARCHES } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';

export default function MarchesPage() {
  const [marches, setMarches] = useState<MarchePublic[]>(() => loadState('marches', []));

  const save = (m: MarchePublic[]) => { setMarches(m); saveState('marches', m); };

  const add = () => save([...marches, { id: crypto.randomUUID(), objet: '', montant: 0, typeMarche: '', dateNotification: '', observations: '' }]);
  const remove = (id: string) => save(marches.filter(m => m.id !== id));
  const update = (id: string, partial: Partial<MarchePublic>) => save(marches.map(m => m.id === id ? { ...m, ...partial } : m));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Marchés publics</h1>
          <p className="text-sm text-muted-foreground mt-1">Suivi des marchés et alertes sur les seuils du Code de la commande publique.</p>
        </div>
        <Button onClick={add}><Plus className="h-4 w-4 mr-2" /> Ajouter un marché</Button>
      </div>

      {marches.length === 0 && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Aucun marché enregistré.</CardContent></Card>
      )}

      {marches.map(marche => {
        const seuilAtteint = SEUILS_MARCHES.filter(s => marche.montant >= s.seuil).pop();
        const seuilProchain = SEUILS_MARCHES.find(s => marche.montant < s.seuil);

        return (
          <Card key={marche.id}>
            <CardHeader className="flex flex-row items-start justify-between">
              <CardTitle className="text-lg">{marche.objet || 'Nouveau marché'}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => remove(marche.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Objet du marché</Label>
                  <Input value={marche.objet} onChange={e => update(marche.id, { objet: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Montant (€ HT)</Label>
                  <Input type="number" value={marche.montant || ''} onChange={e => update(marche.id, { montant: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="space-y-2">
                  <Label>Type de marché</Label>
                  <Input value={marche.typeMarche} onChange={e => update(marche.id, { typeMarche: e.target.value })} placeholder="Fournitures, services, travaux..." />
                </div>
                <div className="space-y-2">
                  <Label>Date de notification</Label>
                  <Input type="date" value={marche.dateNotification} onChange={e => update(marche.id, { dateNotification: e.target.value })} />
                </div>
              </div>

              {seuilAtteint && (
                <div className="p-4 rounded-lg bg-accent/10 border border-accent">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-accent" />
                    <Badge className="bg-accent text-accent-foreground">Seuil franchi : {seuilAtteint.label}</Badge>
                  </div>
                  <p className="text-sm">{seuilAtteint.consigne}</p>
                </div>
              )}

              {seuilProchain && marche.montant > 0 && (
                <p className="text-xs text-muted-foreground">
                  Prochain seuil à {seuilProchain.label} — marge restante : {((seuilProchain.seuil - marche.montant)).toLocaleString('fr-FR')} €
                </p>
              )}

              <Textarea
                value={marche.observations}
                onChange={e => update(marche.id, { observations: e.target.value })}
                placeholder="Observations..."
                rows={3}
              />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
