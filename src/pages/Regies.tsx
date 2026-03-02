import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BILLETS, PIECES } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';
import { Separator } from '@/components/ui/separator';

export default function RegiesPage() {
  const [billetsCount, setBilletsCount] = useState<Record<number, number>>(() => loadState('regies_billets', {}));
  const [piecesCount, setPiecesCount] = useState<Record<number, number>>(() => loadState('regies_pieces', {}));
  const [dftMontant, setDftMontant] = useState<string>(() => loadState('regies_dft_montant', ''));
  const [dftDateEncaissement, setDftDateEncaissement] = useState<string>(() => loadState('regies_dft_date_enc', ''));
  const [dftDateVersement, setDftDateVersement] = useState<string>(() => loadState('regies_dft_date_ver', ''));

  const updateBillet = (val: number, count: number) => {
    const updated = { ...billetsCount, [val]: count };
    setBilletsCount(updated);
    saveState('regies_billets', updated);
  };

  const updatePiece = (val: number, count: number) => {
    const updated = { ...piecesCount, [val]: count };
    setPiecesCount(updated);
    saveState('regies_pieces', updated);
  };

  const totalBillets = useMemo(() => BILLETS.reduce((acc, b) => acc + b * (billetsCount[b] || 0), 0), [billetsCount]);
  const totalPieces = useMemo(() => PIECES.reduce((acc, p) => acc + p * (piecesCount[p] || 0), 0), [piecesCount]);
  const totalCaisse = totalBillets + totalPieces;

  const joursDFT = useMemo(() => {
    if (!dftDateEncaissement || !dftDateVersement) return null;
    const d1 = new Date(dftDateEncaissement);
    const d2 = new Date(dftDateVersement);
    const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? diff : null;
  }, [dftDateEncaissement, dftDateVersement]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Régies</h1>
        <p className="text-sm text-muted-foreground mt-1">Comptage de caisse et suivi des délais de versement DFT.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Comptage de la caisse</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-semibold mb-3">Billets</h3>
              <div className="space-y-2">
                {BILLETS.map(b => (
                  <div key={b} className="flex items-center gap-3">
                    <Label className="w-16 text-right text-sm">{b} €</Label>
                    <Input
                      type="number" min="0" className="w-20"
                      value={billetsCount[b] || ''}
                      onChange={e => updateBillet(b, parseInt(e.target.value) || 0)}
                    />
                    <span className="text-sm text-muted-foreground w-20 text-right">
                      {(b * (billetsCount[b] || 0)).toLocaleString('fr-FR')} €
                    </span>
                  </div>
                ))}
                <Separator />
                <p className="text-sm font-semibold text-right">Total billets : {totalBillets.toLocaleString('fr-FR')} €</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3">Pièces</h3>
              <div className="space-y-2">
                {PIECES.map(p => (
                  <div key={p} className="flex items-center gap-3">
                    <Label className="w-16 text-right text-sm">{p < 1 ? `${(p * 100).toFixed(0)} c` : `${p} €`}</Label>
                    <Input
                      type="number" min="0" className="w-20"
                      value={piecesCount[p] || ''}
                      onChange={e => updatePiece(p, parseInt(e.target.value) || 0)}
                    />
                    <span className="text-sm text-muted-foreground w-20 text-right">
                      {(p * (piecesCount[p] || 0)).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                    </span>
                  </div>
                ))}
                <Separator />
                <p className="text-sm font-semibold text-right">Total pièces : {totalPieces.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</p>
              </div>
            </div>
          </div>

          <Separator className="my-4" />
          <p className="text-lg font-bold text-center">
            Total caisse : {totalCaisse.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Délai de versement DFT</CardTitle>
          <p className="text-xs text-muted-foreground">
            Nombre de jours durant lesquels un montant est resté sur le compte DFT du régisseur sans être versé.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Montant (€)</Label>
              <Input type="number" value={dftMontant} onChange={e => { setDftMontant(e.target.value); saveState('regies_dft_montant', e.target.value); }} />
            </div>
            <div className="space-y-2">
              <Label>Date d'encaissement</Label>
              <Input type="date" value={dftDateEncaissement} onChange={e => { setDftDateEncaissement(e.target.value); saveState('regies_dft_date_enc', e.target.value); }} />
            </div>
            <div className="space-y-2">
              <Label>Date de versement</Label>
              <Input type="date" value={dftDateVersement} onChange={e => { setDftDateVersement(e.target.value); saveState('regies_dft_date_ver', e.target.value); }} />
            </div>
          </div>

          {joursDFT !== null && (
            <div className={`p-4 rounded-lg border ${joursDFT > 7 ? 'bg-destructive/10 border-destructive' : 'bg-green-50 border-green-300'}`}>
              <p className="text-2xl font-bold text-center">{joursDFT} jour{joursDFT > 1 ? 's' : ''}</p>
              <p className="text-sm text-center text-muted-foreground">
                {joursDFT > 7 ? '⚠️ Délai supérieur à 7 jours — rappeler les obligations réglementaires au régisseur.' : '✅ Délai de versement conforme.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
