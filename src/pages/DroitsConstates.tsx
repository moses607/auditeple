import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { loadState, saveState } from '@/lib/store';

interface EleveVerifie {
  id: string;
  nom: string;
  prenom: string;
  classe: string;
  montantDu: number;
  montantPaye: number;
  observations: string;
}

export default function DroitsConstatesPage() {
  const [eleves, setEleves] = useState<EleveVerifie[]>(() => loadState('droits_constates_eleves', []));
  const [obsGenerales, setObsGenerales] = useState(() => loadState('droits_constates_obs', ''));

  const save = (data: EleveVerifie[]) => { setEleves(data); saveState('droits_constates_eleves', data); };

  const add = () => save([...eleves, { id: crypto.randomUUID(), nom: '', prenom: '', classe: '', montantDu: 0, montantPaye: 0, observations: '' }]);
  const remove = (id: string) => save(eleves.filter(e => e.id !== id));
  const update = (id: string, partial: Partial<EleveVerifie>) => save(eleves.map(e => e.id === id ? { ...e, ...partial } : e));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Droits constatés</h1>
          <p className="text-sm text-muted-foreground mt-1">Saisissez les élèves vérifiés pour documenter votre contrôle.</p>
        </div>
        <Button onClick={add}><Plus className="h-4 w-4 mr-2" /> Ajouter un élève</Button>
      </div>

      {eleves.length === 0 && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Aucun élève saisi. Ajoutez les élèves dont vous avez vérifié les droits constatés.</CardContent></Card>
      )}

      {eleves.map(eleve => (
        <Card key={eleve.id}>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 flex-1">
                <div className="space-y-1">
                  <Label className="text-xs">Nom</Label>
                  <Input value={eleve.nom} onChange={e => update(eleve.id, { nom: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Prénom</Label>
                  <Input value={eleve.prenom} onChange={e => update(eleve.id, { prenom: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Classe</Label>
                  <Input value={eleve.classe} onChange={e => update(eleve.id, { classe: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Montant dû (€)</Label>
                    <Input type="number" value={eleve.montantDu || ''} onChange={e => update(eleve.id, { montantDu: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Payé (€)</Label>
                    <Input type="number" value={eleve.montantPaye || ''} onChange={e => update(eleve.id, { montantPaye: parseFloat(e.target.value) || 0 })} />
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="ml-2" onClick={() => remove(eleve.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <Input placeholder="Observations pour cet élève" value={eleve.observations} onChange={e => update(eleve.id, { observations: e.target.value })} />
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader><CardTitle className="text-lg">Observations générales</CardTitle></CardHeader>
        <CardContent>
          <Textarea value={obsGenerales} onChange={e => { setObsGenerales(e.target.value); saveState('droits_constates_obs', e.target.value); }} rows={5} placeholder="Observations sur les droits constatés..." />
        </CardContent>
      </Card>
    </div>
  );
}
