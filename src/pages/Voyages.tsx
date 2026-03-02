import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { VoyageScolaire, SEUILS_MARCHES } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';

const PIECES_OBLIGATOIRES = [
  { key: 'listeParticipants', label: 'Liste des participants' },
  { key: 'budgetVoyage', label: 'Budget prévisionnel du voyage' },
  { key: 'acteCA_programmation', label: 'Acte du CA sur la programmation du voyage' },
  { key: 'acteCA_financement', label: 'Acte du CA sur le financement (participation des familles)' },
  { key: 'acteCA_conventions', label: 'Acte du CA sur la ou les conventions nécessaires' },
  { key: 'acteCA_dons', label: 'Actes du CA autorisant les dons (acte cadre inclus)' },
] as const;

function calculerScoring(v: VoyageScolaire) {
  if (v.montantTotal <= 0) return null;
  const recettesSures = v.montantEncaisseFamilles + (v.notificationCollectivites ? v.montantNotifie : 0);
  const tauxCouverture = recettesSures / v.montantTotal;
  const risque = 1 - tauxCouverture;
  return {
    tauxCouverture: Math.round(tauxCouverture * 100),
    risque: Math.round(risque * 100),
    niveau: risque > 0.5 ? 'élevé' : risque > 0.25 ? 'modéré' : 'faible',
  };
}

const EMPTY_VOYAGE: Omit<VoyageScolaire, 'id'> = {
  intitule: '', destination: '', dateDepart: '', dateRetour: '',
  montantTotal: 0, montantEncaisseFamilles: 0,
  notificationCollectivites: false, montantNotifie: 0, promessesDons: 0,
  listeParticipants: false, budgetVoyage: false,
  acteCA_programmation: false, acteCA_financement: false,
  acteCA_conventions: false, acteCA_dons: false,
  erasmusSubvention: false, erasmusMontant: 0, observations: '',
};

export default function VoyagesPage() {
  const [voyages, setVoyages] = useState<VoyageScolaire[]>(() => loadState('voyages', []));

  const save = (v: VoyageScolaire[]) => { setVoyages(v); saveState('voyages', v); };

  const addVoyage = () => {
    save([...voyages, { ...EMPTY_VOYAGE, id: crypto.randomUUID() }]);
  };

  const updateVoyage = (id: string, partial: Partial<VoyageScolaire>) => {
    save(voyages.map(v => v.id === id ? { ...v, ...partial } : v));
  };

  const removeVoyage = (id: string) => {
    save(voyages.filter(v => v.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Voyages scolaires</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Vérification des pièces obligatoires et analyse du risque financier.
          </p>
        </div>
        <Button onClick={addVoyage}><Plus className="h-4 w-4 mr-2" /> Ajouter un voyage</Button>
      </div>

      {voyages.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Aucun voyage scolaire enregistré. Cliquez sur « Ajouter un voyage » pour commencer.
          </CardContent>
        </Card>
      )}

      {voyages.map(voyage => {
        const scoring = calculerScoring(voyage);
        const seuilAtteint = SEUILS_MARCHES.filter(s => voyage.montantTotal >= s.seuil).pop();

        return (
          <Card key={voyage.id}>
            <CardHeader className="flex flex-row items-start justify-between">
              <CardTitle className="text-lg">{voyage.intitule || 'Nouveau voyage'}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => removeVoyage(voyage.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Infos générales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Intitulé</Label>
                  <Input value={voyage.intitule} onChange={e => updateVoyage(voyage.id, { intitule: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Destination</Label>
                  <Input value={voyage.destination} onChange={e => updateVoyage(voyage.id, { destination: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Date de départ</Label>
                  <Input type="date" value={voyage.dateDepart} onChange={e => updateVoyage(voyage.id, { dateDepart: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Date de retour</Label>
                  <Input type="date" value={voyage.dateRetour} onChange={e => updateVoyage(voyage.id, { dateRetour: e.target.value })} />
                </div>
              </div>

              {/* Pièces obligatoires */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Pièces obligatoires</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {PIECES_OBLIGATOIRES.map(p => (
                    <div key={p.key} className="flex items-start gap-3">
                      <Checkbox
                        checked={voyage[p.key] as boolean}
                        onCheckedChange={() => updateVoyage(voyage.id, { [p.key]: !voyage[p.key] })}
                      />
                      <Label className="text-sm cursor-pointer">{p.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* ERASMUS+ */}
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={voyage.erasmusSubvention}
                  onCheckedChange={() => updateVoyage(voyage.id, { erasmusSubvention: !voyage.erasmusSubvention })}
                />
                <div className="space-y-2 flex-1">
                  <Label className="cursor-pointer">Subvention ERASMUS+ versée à un ou plusieurs enseignants</Label>
                  {voyage.erasmusSubvention && (
                    <Input type="number" placeholder="Montant ERASMUS+ (€)" value={voyage.erasmusMontant || ''} onChange={e => updateVoyage(voyage.id, { erasmusMontant: parseFloat(e.target.value) || 0 })} />
                  )}
                </div>
              </div>

              {/* Montants */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Montant total du voyage (€)</Label>
                  <Input type="number" value={voyage.montantTotal || ''} onChange={e => updateVoyage(voyage.id, { montantTotal: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="space-y-2">
                  <Label>Montant encaissé familles (€)</Label>
                  <Input type="number" value={voyage.montantEncaisseFamilles || ''} onChange={e => updateVoyage(voyage.id, { montantEncaisseFamilles: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Checkbox
                      checked={voyage.notificationCollectivites}
                      onCheckedChange={() => updateVoyage(voyage.id, { notificationCollectivites: !voyage.notificationCollectivites })}
                    />
                    Notification collectivités reçue
                  </Label>
                  {voyage.notificationCollectivites && (
                    <Input type="number" placeholder="Montant notifié (€)" value={voyage.montantNotifie || ''} onChange={e => updateVoyage(voyage.id, { montantNotifie: parseFloat(e.target.value) || 0 })} />
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Promesses de dons (€)</Label>
                  <Input type="number" value={voyage.promessesDons || ''} onChange={e => updateVoyage(voyage.id, { promessesDons: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>

              {/* Seuils marchés publics */}
              {seuilAtteint && (
                <div className="p-4 rounded-lg bg-accent/10 border border-accent">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-accent" />
                    <Badge className="bg-accent text-accent-foreground">Seuil atteint : {seuilAtteint.label}</Badge>
                  </div>
                  <p className="text-sm">{seuilAtteint.consigne}</p>
                </div>
              )}

              {/* Scoring risque */}
              {scoring && (
                <div className={`p-4 rounded-lg border ${scoring.niveau === 'élevé' ? 'bg-destructive/10 border-destructive' : scoring.niveau === 'modéré' ? 'bg-accent/10 border-accent' : 'bg-green-50 border-green-300'}`}>
                  <h4 className="text-sm font-semibold mb-2">Analyse du risque financier</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold">{scoring.tauxCouverture}%</p>
                      <p className="text-xs text-muted-foreground">Taux de couverture</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{scoring.risque}%</p>
                      <p className="text-xs text-muted-foreground">Taux de risque</p>
                    </div>
                    <div>
                      <Badge variant={scoring.niveau === 'élevé' ? 'destructive' : scoring.niveau === 'modéré' ? 'default' : 'secondary'} className="mt-2">
                        Risque {scoring.niveau}
                      </Badge>
                    </div>
                  </div>
                  {scoring.niveau === 'élevé' && !voyage.notificationCollectivites && (
                    <p className="text-xs text-destructive mt-3">
                      ⚠️ Aucune notification de collectivité reçue et encaissements familles insuffisants. Tout paiement avant réception des recettes inscrites au budget présente un risque financier majeur.
                    </p>
                  )}
                </div>
              )}

              <Textarea
                value={voyage.observations}
                onChange={e => updateVoyage(voyage.id, { observations: e.target.value })}
                placeholder="Observations sur ce voyage..."
                rows={3}
              />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
