import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { MOTIFS_SUSPENSION, SEUILS_MARCHES } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';

const PIECES_JUSTIFICATIVES = [
  'Facture originale',
  'Bon de commande signé',
  'Bon de livraison / attestation de service fait',
  'Visa de l\'ordonnateur sur le mandat',
  'Certification de l\'ordonnateur (exactitude des calculs de liquidation)',
  'RIB du créancier',
  'Pièces contractuelles (marché, convention)',
  'Acte d\'engagement le cas échéant',
];

export default function DepensesPage() {
  const [suspensions, setSuspensions] = useState<Record<string, boolean>>(() => loadState('depenses_suspensions', {}));
  const [pieces, setPieces] = useState<Record<string, boolean>>(() => loadState('depenses_pieces', {}));
  const [montantMandat, setMontantMandat] = useState<string>(() => loadState('depenses_montant', ''));
  const [observations, setObservations] = useState<string>(() => loadState('depenses_obs', ''));

  const toggleSuspension = (idx: number) => {
    const updated = { ...suspensions, [idx]: !suspensions[idx] };
    setSuspensions(updated);
    saveState('depenses_suspensions', updated);
  };

  const togglePiece = (idx: number) => {
    const updated = { ...pieces, [idx]: !pieces[idx] };
    setPieces(updated);
    saveState('depenses_pieces', updated);
  };

  const montant = parseFloat(montantMandat) || 0;
  const seuilAtteint = SEUILS_MARCHES.filter(s => montant >= s.seuil).pop();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dépenses</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Validité de la liquidation et vérification des pièces justificatives.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Motifs de suspension du paiement</CardTitle>
          <p className="text-xs text-muted-foreground">
            Les 5 cas dans lesquels l'agent comptable peut suspendre un paiement (décret n°2012-1246)
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {MOTIFS_SUSPENSION.map((motif, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <Checkbox
                id={`susp-${idx}`}
                checked={suspensions[idx] || false}
                onCheckedChange={() => toggleSuspension(idx)}
              />
              <Label htmlFor={`susp-${idx}`} className="text-sm leading-relaxed cursor-pointer">
                {motif}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vérification des pièces justificatives</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {PIECES_JUSTIFICATIVES.map((piece, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <Checkbox
                id={`piece-${idx}`}
                checked={pieces[idx] || false}
                onCheckedChange={() => togglePiece(idx)}
              />
              <Label htmlFor={`piece-${idx}`} className="text-sm leading-relaxed cursor-pointer">
                {piece}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contrôle des seuils de commande publique</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Montant du mandat / de la dépense (€)</Label>
            <Input
              type="number"
              value={montantMandat}
              onChange={e => {
                setMontantMandat(e.target.value);
                saveState('depenses_montant', e.target.value);
              }}
              placeholder="0.00"
            />
          </div>
          {seuilAtteint && (
            <div className="p-4 rounded-lg bg-accent/10 border border-accent">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-accent" />
                <Badge className="bg-accent text-accent-foreground">Seuil atteint : {seuilAtteint.label}</Badge>
              </div>
              <p className="text-sm">{seuilAtteint.consigne}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Observations</CardTitle></CardHeader>
        <CardContent>
          <Textarea
            value={observations}
            onChange={e => { setObservations(e.target.value); saveState('depenses_obs', e.target.value); }}
            placeholder="Observations sur les dépenses vérifiées..."
            rows={5}
          />
        </CardContent>
      </Card>
    </div>
  );
}
