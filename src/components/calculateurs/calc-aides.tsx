/**
 * Calculateurs Aides sociales : Fonds social cantine, Fonds social élèves, Voyage famille
 */
import { useMemo, useState } from 'react';
import { CalculateurShell } from '@/components/calculateurs/CalculateurShell';
import { getCalculateur, fmtEur } from '@/lib/calculateurs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ═════════════ FONDS SOCIAL CANTINE ═════════════
export function CalcFondsSocialCantine() {
  const meta = getCalculateur('fonds-social-cantine')!;
  const [creanceDP, setCreanceDP] = useState(0);
  const [aide, setAide] = useState(0);
  const depasse = aide > creanceDP;
  const reliquat = Math.max(0, creanceDP - aide);

  const sample = () => { setCreanceDP(285); setAide(200); };

  return (
    <CalculateurShell meta={meta} onLoadSample={sample}>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Créance DP de l'élève (à la date de la commission)</Label>
            <Input type="number" value={creanceDP || ''} onChange={e => setCreanceDP(+e.target.value)} className="h-8" />
          </div>
          <div>
            <Label className="text-xs">Aide sociale envisagée</Label>
            <Input type="number" value={aide || ''} onChange={e => setAide(+e.target.value)} className="h-8" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5">
            <div className="flex justify-between text-xs"><span>Créance DP</span><span className="tabular-nums font-mono">{fmtEur(creanceDP)}</span></div>
            <div className="flex justify-between text-xs"><span>Aide proposée</span><span className="tabular-nums font-mono">{fmtEur(aide)}</span></div>
            <div className="flex justify-between text-sm font-semibold border-t pt-1"><span>Reliquat à charge famille</span><span className="tabular-nums font-mono">{fmtEur(reliquat)}</span></div>
          </div>
          {depasse ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <strong>Aide &gt; créance DP de {fmtEur(aide - creanceDP)}.</strong> Réduire l'aide au montant de la créance ou réaffecter le surplus à un autre élève.
              </AlertDescription>
            </Alert>
          ) : aide > 0 && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription className="text-xs">Aide conforme à la circulaire 2017-122 (aide ≤ créance DP).</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </CalculateurShell>
  );
}

// ═════════════ FONDS SOCIAL COLLÉGIEN / LYCÉEN ═════════════
export function CalcFondsSocialEleves() {
  const meta = getCalculateur('fonds-social-eleves')!;
  const [enveloppe, setEnveloppe] = useState(0);
  const [consomme, setConsomme] = useState(0);
  const [nbBeneficiaires, setNbBeneficiaires] = useState(0);

  const solde = enveloppe - consomme;
  const tauxConso = enveloppe > 0 ? (consomme / enveloppe) * 100 : 0;
  const moyenne = nbBeneficiaires > 0 ? consomme / nbBeneficiaires : 0;

  const sample = () => { setEnveloppe(8500); setConsomme(5320); setNbBeneficiaires(34); };

  return (
    <CalculateurShell meta={meta} onLoadSample={sample}>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div><Label className="text-xs">Enveloppe annuelle (€)</Label>
            <Input type="number" value={enveloppe || ''} onChange={e => setEnveloppe(+e.target.value)} className="h-8" /></div>
          <div><Label className="text-xs">Montant déjà consommé (€)</Label>
            <Input type="number" value={consomme || ''} onChange={e => setConsomme(+e.target.value)} className="h-8" /></div>
          <div><Label className="text-xs">Nombre de bénéficiaires</Label>
            <Input type="number" value={nbBeneficiaires || ''} onChange={e => setNbBeneficiaires(+e.target.value)} className="h-8" /></div>
        </div>
        <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5">
          <div className="flex justify-between text-xs"><span>Solde disponible</span><span className={cn('tabular-nums font-mono font-bold', solde < 0 ? 'text-destructive' : 'text-emerald-700')}>{fmtEur(solde)}</span></div>
          <div className="flex justify-between text-xs"><span>Taux de consommation</span><span className="tabular-nums font-mono">{tauxConso.toFixed(1)} %</span></div>
          <div className="flex justify-between text-xs"><span>Aide moyenne par élève</span><span className="tabular-nums font-mono">{fmtEur(moyenne)}</span></div>
          {tauxConso > 90 && (
            <Alert variant="destructive" className="mt-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">Enveloppe quasi-épuisée. Anticiper une demande de réabondement.</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </CalculateurShell>
  );
}

// ═════════════ PARTICIPATION FAMILLES VOYAGE ═════════════
export function CalcVoyageFamille() {
  const meta = getCalculateur('voyage-famille')!;
  const [coutTotal, setCoutTotal] = useState(0);
  const [nbEleves, setNbEleves] = useState(0);
  const [aideFSE, setAideFSE] = useState(0);
  const [aideCoop, setAideCoop] = useState(0);
  const [aideBourses, setAideBourses] = useState(0);
  const [seuil, setSeuil] = useState(150);

  const coutEleve = nbEleves > 0 ? coutTotal / nbEleves : 0;
  const aideTotale = aideFSE + aideCoop + aideBourses;
  const aideParEleve = nbEleves > 0 ? aideTotale / nbEleves : 0;
  const resteCharge = Math.max(0, coutEleve - aideParEleve);
  const alerteSeuil = resteCharge > seuil;

  const sample = () => { setCoutTotal(12500); setNbEleves(35); setAideFSE(800); setAideCoop(500); setAideBourses(0); };

  return (
    <CalculateurShell meta={meta} onLoadSample={sample}>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div><Label className="text-xs">Coût total du voyage (€)</Label>
            <Input type="number" value={coutTotal || ''} onChange={e => setCoutTotal(+e.target.value)} className="h-8" /></div>
          <div><Label className="text-xs">Nombre d'élèves participants</Label>
            <Input type="number" value={nbEleves || ''} onChange={e => setNbEleves(+e.target.value)} className="h-8" /></div>
          <div><Label className="text-xs">Aide FSE</Label>
            <Input type="number" value={aideFSE || ''} onChange={e => setAideFSE(+e.target.value)} className="h-8" /></div>
          <div><Label className="text-xs">Aide coopérative / association</Label>
            <Input type="number" value={aideCoop || ''} onChange={e => setAideCoop(+e.target.value)} className="h-8" /></div>
          <div><Label className="text-xs">Bourses fléchées voyage</Label>
            <Input type="number" value={aideBourses || ''} onChange={e => setAideBourses(+e.target.value)} className="h-8" /></div>
          <div><Label className="text-xs">Seuil acceptable / élève (€)</Label>
            <Input type="number" value={seuil || ''} onChange={e => setSeuil(+e.target.value)} className="h-8" /></div>
        </div>
        <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5">
          <div className="flex justify-between text-xs"><span>Coût par élève</span><span className="tabular-nums font-mono">{fmtEur(coutEleve)}</span></div>
          <div className="flex justify-between text-xs"><span>Aide totale</span><span className="tabular-nums font-mono">{fmtEur(aideTotale)}</span></div>
          <div className="flex justify-between text-xs"><span>Aide par élève</span><span className="tabular-nums font-mono">{fmtEur(aideParEleve)}</span></div>
          <div className="flex justify-between text-sm font-bold border-t pt-1"><span>Reste à charge famille</span><span className={cn('tabular-nums font-mono', alerteSeuil ? 'text-destructive' : 'text-emerald-700')}>{fmtEur(resteCharge)}</span></div>
          {alerteSeuil && (
            <Alert variant="destructive" className="mt-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">Reste à charge supérieur au seuil de non-discrimination. Prévoir un dispositif d'aide complémentaire.</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </CalculateurShell>
  );
}
