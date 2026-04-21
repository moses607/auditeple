/**
 * Calculateurs Paie + Pilotage : Surrémunération DOM, Heures sup, Ratios bilanciels
 */
import { useMemo, useState } from 'react';
import { CalculateurShell } from '@/components/calculateurs/CalculateurShell';
import { getCalculateur, fmtEur, fmtNum } from '@/lib/calculateurs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

// ═════════════ SURRÉMUNÉRATION DOM ═════════════
export function CalcSurremDOM() {
  const meta = getCalculateur('surremuneration-dom')!;
  const [brut, setBrut] = useState(0);
  const [coefficient, setCoefficient] = useState(1.40);

  const brutMajore = brut * coefficient;
  const surrem = brutMajore - brut;
  const cgss = brutMajore * 0.0905; // approx salarial CGSS (santé+vieillesse)
  const ircantec = brutMajore * 0.028;
  const totalSalarial = cgss + ircantec;
  const net = brutMajore - totalSalarial;

  const sample = () => { setBrut(2400); setCoefficient(1.40); };

  return (
    <CalculateurShell meta={meta} onLoadSample={sample}>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div><Label className="text-xs">Brut indiciaire (€)</Label>
            <Input type="number" value={brut || ''} onChange={e => setBrut(+e.target.value)} className="h-8" /></div>
          <div><Label className="text-xs">Coefficient de majoration</Label>
            <Select value={String(coefficient)} onValueChange={v => setCoefficient(+v)}>
              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1.40">1,40 — Guadeloupe / Martinique / Guyane</SelectItem>
                <SelectItem value="1.53">1,53 — La Réunion</SelectItem>
                <SelectItem value="1.84">1,84 — Mayotte</SelectItem>
              </SelectContent>
            </Select></div>
          <Alert className="mt-2"><Info className="h-4 w-4" /><AlertDescription className="text-[10px]">
            Décret 53-1266 — surrémunération applicable aux fonctionnaires d'État en poste DOM.
          </AlertDescription></Alert>
        </div>
        <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5 text-xs">
          <div className="flex justify-between"><span>Brut majoré (× {fmtNum(coefficient, 2)})</span><span className="tabular-nums font-mono">{fmtEur(brutMajore)}</span></div>
          <div className="flex justify-between"><span>dont surrémunération</span><span className="tabular-nums font-mono text-primary">{fmtEur(surrem)}</span></div>
          <div className="flex justify-between border-t pt-1"><span>Cotisations CGSS (~9,05 %)</span><span className="tabular-nums font-mono">−{fmtEur(cgss)}</span></div>
          <div className="flex justify-between"><span>Cotisations IRCANTEC (~2,80 %)</span><span className="tabular-nums font-mono">−{fmtEur(ircantec)}</span></div>
          <div className="flex justify-between font-bold text-sm border-t pt-1"><span>Net estimé</span><span className="tabular-nums font-mono">{fmtEur(net)}</span></div>
          <p className="text-[9px] italic text-muted-foreground mt-1">
            Estimation indicative — la liquidation officielle reste celle d'Op@le / Paye Outre-mer.
          </p>
        </div>
      </div>
    </CalculateurShell>
  );
}

// ═════════════ HEURES SUPPLÉMENTAIRES ═════════════
export function CalcHeuresSup() {
  const meta = getCalculateur('heures-sup')!;
  const [type, setType] = useState<'HSA' | 'HSE'>('HSA');
  const [tauxHoraire, setTauxHoraire] = useState(0);
  const [nbHeures, setNbHeures] = useState(0);
  const [grade, setGrade] = useState<'certifie' | 'agrege' | 'professeur_ep'>('certifie');

  // Bonification HSA 1ʳᵉ heure +25 % (décret 50-1253)
  const TAUX = { certifie: 1.25, agrege: 1.25, professeur_ep: 1.25 };
  const PLAFONDS = { HSA: 220, HSE: 1500 };

  const brutBase = nbHeures * tauxHoraire;
  const majo = type === 'HSA' && nbHeures >= 1 ? tauxHoraire * (TAUX[grade] - 1) : 0;
  const total = brutBase + majo;
  const plafond = PLAFONDS[type];
  const depasse = nbHeures > plafond;

  const sample = () => { setType('HSA'); setTauxHoraire(38.50); setNbHeures(72); };

  return (
    <CalculateurShell meta={meta} onLoadSample={sample}>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div><Label className="text-xs">Type d'heures</Label>
            <Select value={type} onValueChange={v => setType(v as any)}>
              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="HSA">HSA — Heures supp. année</SelectItem>
                <SelectItem value="HSE">HSE — Heures supp. effectives</SelectItem>
              </SelectContent>
            </Select></div>
          <div><Label className="text-xs">Grade</Label>
            <Select value={grade} onValueChange={v => setGrade(v as any)}>
              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="certifie">Certifié</SelectItem>
                <SelectItem value="agrege">Agrégé</SelectItem>
                <SelectItem value="professeur_ep">Professeur EPS</SelectItem>
              </SelectContent>
            </Select></div>
          <div><Label className="text-xs">Taux horaire (€)</Label>
            <Input type="number" step="0.01" value={tauxHoraire || ''} onChange={e => setTauxHoraire(+e.target.value)} className="h-8" /></div>
          <div><Label className="text-xs">Nombre d'heures</Label>
            <Input type="number" value={nbHeures || ''} onChange={e => setNbHeures(+e.target.value)} className="h-8" /></div>
        </div>
        <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5 text-xs">
          <div className="flex justify-between"><span>Brut de base</span><span className="tabular-nums font-mono">{fmtEur(brutBase)}</span></div>
          {majo > 0 && <div className="flex justify-between"><span>Majoration 1ʳᵉ heure HSA (+25 %)</span><span className="tabular-nums font-mono">{fmtEur(majo)}</span></div>}
          <div className="flex justify-between text-sm font-bold border-t pt-1"><span>Total à liquider</span><span className="tabular-nums font-mono">{fmtEur(total)}</span></div>
          <div className="flex justify-between text-[10px] text-muted-foreground"><span>Plafond {type}</span><span>{plafond} h</span></div>
          {depasse && (
            <Alert variant="destructive" className="mt-1"><AlertTriangle className="h-4 w-4" /><AlertDescription className="text-[10px]">
              Plafond {type} dépassé ({nbHeures} {'>'} {plafond} h).
            </AlertDescription></Alert>
          )}
        </div>
      </div>
    </CalculateurShell>
  );
}

// ═════════════ RATIOS BILANCIELS ═════════════
export function CalcRatiosBilanciels() {
  const meta = getCalculateur('ratios-bilanciels')!;
  const [actifCircu, setActifCircu] = useState(0);
  const [passifCircu, setPassifCircu] = useState(0);
  const [tresorerie, setTresorerie] = useState(0);
  const [stocks, setStocks] = useState(0);
  const [creances, setCreances] = useState(0);
  const [dettesCT, setDettesCT] = useState(0);
  const [drfn, setDrfn] = useState(0);
  const [resultatExploit, setResultatExploit] = useState(0);
  const [dotAmort, setDotAmort] = useState(0);

  const fdr = actifCircu - passifCircu;
  const bfr = (stocks + creances) - dettesCT;
  const tn = fdr - bfr;
  const joursFonct = drfn > 0 ? (fdr / drfn) * 365 : 0;
  const caf = resultatExploit + dotAmort;

  const sample = () => {
    setActifCircu(485000); setPassifCircu(180000); setTresorerie(305000);
    setStocks(28000); setCreances(54000); setDettesCT(72000);
    setDrfn(1450000); setResultatExploit(38000); setDotAmort(22000);
  };

  return (
    <CalculateurShell meta={meta} onLoadSample={sample}>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Bilan</h4>
          <div><Label className="text-xs">Actif circulant (€)</Label>
            <Input type="number" value={actifCircu || ''} onChange={e => setActifCircu(+e.target.value)} className="h-8" /></div>
          <div><Label className="text-xs">Passif circulant (€)</Label>
            <Input type="number" value={passifCircu || ''} onChange={e => setPassifCircu(+e.target.value)} className="h-8" /></div>
          <div><Label className="text-xs">Trésorerie globale (€)</Label>
            <Input type="number" value={tresorerie || ''} onChange={e => setTresorerie(+e.target.value)} className="h-8" /></div>
          <div className="grid grid-cols-3 gap-2">
            <div><Label className="text-[10px]">Stocks</Label><Input type="number" value={stocks || ''} onChange={e => setStocks(+e.target.value)} className="h-7 text-xs" /></div>
            <div><Label className="text-[10px]">Créances</Label><Input type="number" value={creances || ''} onChange={e => setCreances(+e.target.value)} className="h-7 text-xs" /></div>
            <div><Label className="text-[10px]">Dettes CT</Label><Input type="number" value={dettesCT || ''} onChange={e => setDettesCT(+e.target.value)} className="h-7 text-xs" /></div>
          </div>
          <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mt-2">Compte de résultat</h4>
          <div><Label className="text-xs">DRFN annuelles (€)</Label>
            <Input type="number" value={drfn || ''} onChange={e => setDrfn(+e.target.value)} className="h-8" /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-[10px]">Résultat exploitation</Label><Input type="number" value={resultatExploit || ''} onChange={e => setResultatExploit(+e.target.value)} className="h-7 text-xs" /></div>
            <div><Label className="text-[10px]">Dot. amort.</Label><Input type="number" value={dotAmort || ''} onChange={e => setDotAmort(+e.target.value)} className="h-7 text-xs" /></div>
          </div>
        </div>
        <div className="rounded-lg border bg-muted/30 p-3 space-y-2 text-xs">
          <h4 className="font-bold">Indicateurs M9-6</h4>
          {[
            ['Fonds de roulement (FDR)', fdr],
            ['Besoin en FdR (BFR)', bfr],
            ['Trésorerie nette (FDR − BFR)', tn],
            ['CAF estimée', caf],
          ].map(([l, v]) => (
            <div key={l as string} className="flex justify-between"><span>{l}</span><span className={cn('tabular-nums font-mono font-semibold', (v as number) < 0 && 'text-destructive')}>{fmtEur(v as number)}</span></div>
          ))}
          <div className="flex justify-between border-t pt-1 font-bold"><span>Jours de fonctionnement</span><span className="tabular-nums font-mono">{fmtNum(joursFonct, 0)} j</span></div>
          {joursFonct < 30 && drfn > 0 && (
            <Alert variant="destructive" className="mt-1"><AlertTriangle className="h-4 w-4" /><AlertDescription className="text-[10px]">
              Couverture &lt; 30 jours — situation tendue (M9-6 § 4.5.3).
            </AlertDescription></Alert>
          )}
          {joursFonct >= 30 && joursFonct < 60 && (
            <Alert className="mt-1"><Info className="h-4 w-4" /><AlertDescription className="text-[10px]">
              Couverture entre 30 et 60 j — vigilance. Seuil prudentiel IGAENR : 30 jours.
            </AlertDescription></Alert>
          )}
          <p className="text-[9px] italic text-muted-foreground">
            Modèle FDRM IGAENR 2016-071 — diviseur DRFN/365.
          </p>
        </div>
      </div>
    </CalculateurShell>
  );
}
