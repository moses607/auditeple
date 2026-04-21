/**
 * Calculateurs Recettes : Droits DP, Bourses, Taxe d'apprentissage
 */
import { useMemo, useState } from 'react';
import { CalculateurShell } from '@/components/calculateurs/CalculateurShell';
import { getCalculateur, fmtEur } from '@/lib/calculateurs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ═════════════ DROITS CONSTATÉS DEMI-PENSION ═════════════
export function CalcDroitsDP() {
  const meta = getCalculateur('droits-dp')!;
  const [mode, setMode] = useState<'forfait' | 'ticket'>('forfait');
  const [effectifs, setEffectifs] = useState(0);
  const [tarif, setTarif] = useState(0);
  const [periodeJours, setPeriodeJours] = useState(60);
  const [transfertGFE, setTransfertGFE] = useState(0);

  const droitsTheoriques = mode === 'forfait'
    ? effectifs * tarif
    : effectifs * tarif * periodeJours;
  const ecart = transfertGFE - droitsTheoriques;
  const ecartPct = droitsTheoriques > 0 ? (ecart / droitsTheoriques) * 100 : 0;

  const sample = () => { setMode('forfait'); setEffectifs(420); setTarif(165); setTransfertGFE(68800); };

  return (
    <CalculateurShell meta={meta} onLoadSample={sample}>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div><Label className="text-xs">Mode de tarification</Label>
            <Select value={mode} onValueChange={v => setMode(v as any)}>
              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="forfait">Forfait trimestriel / annuel</SelectItem>
                <SelectItem value="ticket">Ticket (au repas)</SelectItem>
              </SelectContent>
            </Select></div>
          <div><Label className="text-xs">Effectif demi-pensionnaires</Label>
            <Input type="number" value={effectifs || ''} onChange={e => setEffectifs(+e.target.value)} className="h-8" /></div>
          <div><Label className="text-xs">Tarif unitaire CA (€)</Label>
            <Input type="number" step="0.01" value={tarif || ''} onChange={e => setTarif(+e.target.value)} className="h-8" /></div>
          {mode === 'ticket' && (
            <div><Label className="text-xs">Nombre de jours de service</Label>
              <Input type="number" value={periodeJours || ''} onChange={e => setPeriodeJours(+e.target.value)} className="h-8" /></div>
          )}
          <div><Label className="text-xs">Transfert GFE → Op@le (€ constatés)</Label>
            <Input type="number" value={transfertGFE || ''} onChange={e => setTransfertGFE(+e.target.value)} className="h-8" /></div>
        </div>
        <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5 text-xs">
          <div className="flex justify-between"><span>Droits théoriques calculés</span><span className="tabular-nums font-mono font-semibold">{fmtEur(droitsTheoriques)}</span></div>
          <div className="flex justify-between"><span>Constatés Op@le (GFE)</span><span className="tabular-nums font-mono">{fmtEur(transfertGFE)}</span></div>
          <div className={cn('flex justify-between text-sm font-bold border-t pt-1', Math.abs(ecartPct) > 1 ? 'text-destructive' : 'text-emerald-700')}>
            <span>Écart</span><span className="tabular-nums font-mono">{fmtEur(ecart)} ({ecartPct.toFixed(2)} %)</span>
          </div>
          {Math.abs(ecartPct) > 1 ? (
            <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertDescription className="text-[10px]">
              Écart {'>'} 1 %. Investiguer : exonérations, remises d'ordre, élèves boursiers, doublons.
            </AlertDescription></Alert>
          ) : (
            <Alert><CheckCircle2 className="h-4 w-4" /><AlertDescription className="text-[10px]">
              Concordance acceptable (M9-6 § 3.2).
            </AlertDescription></Alert>
          )}
        </div>
      </div>
    </CalculateurShell>
  );
}

// ═════════════ BOURSES NATIONALES ═════════════
const ECHELONS = { 1: 441, 2: 531, 3: 561, 4: 612, 5: 654, 6: 1029 } as const;
export function CalcBourses() {
  const meta = getCalculateur('bourses')!;
  const [echelon, setEchelon] = useState<1 | 2 | 3 | 4 | 5 | 6>(3);
  const [nbEleves, setNbEleves] = useState(0);
  const [creanceDP, setCreanceDP] = useState(0);
  const [dejaVerse, setDejaVerse] = useState(0);

  const annuel = ECHELONS[echelon];
  const arreteRectorat = annuel * nbEleves;
  const aDeduireDP = Math.min(creanceDP, arreteRectorat);
  const aVerser = arreteRectorat - aDeduireDP - dejaVerse;
  const reliquat = aVerser;

  const sample = () => { setEchelon(3); setNbEleves(45); setCreanceDP(8500); setDejaVerse(12000); };

  return (
    <CalculateurShell meta={meta} onLoadSample={sample}>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div><Label className="text-xs">Échelon</Label>
            <Select value={String(echelon)} onValueChange={v => setEchelon(+v as any)}>
              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(ECHELONS).map(([k, v]) => <SelectItem key={k} value={k}>Échelon {k} — {fmtEur(v)} / an</SelectItem>)}
              </SelectContent>
            </Select></div>
          <div><Label className="text-xs">Nombre d'élèves de cet échelon</Label>
            <Input type="number" value={nbEleves || ''} onChange={e => setNbEleves(+e.target.value)} className="h-8" /></div>
          <div><Label className="text-xs">Créances DP cumulées (€)</Label>
            <Input type="number" value={creanceDP || ''} onChange={e => setCreanceDP(+e.target.value)} className="h-8" /></div>
          <div><Label className="text-xs">Déjà versé aux familles (€)</Label>
            <Input type="number" value={dejaVerse || ''} onChange={e => setDejaVerse(+e.target.value)} className="h-8" /></div>
        </div>
        <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5 text-xs">
          <div className="flex justify-between"><span>Arrêté rectorat (théorique)</span><span className="tabular-nums font-mono">{fmtEur(arreteRectorat)}</span></div>
          <div className="flex justify-between"><span>− Déduction DP</span><span className="tabular-nums font-mono">{fmtEur(aDeduireDP)}</span></div>
          <div className="flex justify-between"><span>− Déjà versé</span><span className="tabular-nums font-mono">{fmtEur(dejaVerse)}</span></div>
          <div className="flex justify-between text-sm font-bold border-t pt-1"><span>Reliquat à verser</span><span className={cn('tabular-nums font-mono', reliquat < 0 ? 'text-destructive' : 'text-emerald-700')}>{fmtEur(reliquat)}</span></div>
          {reliquat < 0 && (
            <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertDescription className="text-[10px]">
              Trop-versé de {fmtEur(Math.abs(reliquat))} : régulariser par titre de recette (Code éducation R531-13).
            </AlertDescription></Alert>
          )}
        </div>
      </div>
    </CalculateurShell>
  );
}

// ═════════════ TAXE D'APPRENTISSAGE ═════════════
export function CalcTaxeApprentissage() {
  const meta = getCalculateur('taxe-apprentissage')!;
  const [perçu, setPerçu] = useState(0);
  const [affectations, setAffectations] = useState<{ activite: string; pct: number }[]>([
    { activite: 'Section A', pct: 50 }, { activite: 'Section B', pct: 30 },
  ]);

  const totalPct = affectations.reduce((s, a) => s + a.pct, 0);
  const reliquat = perçu * (1 - totalPct / 100);

  const sample = () => { setPerçu(45000); setAffectations([
    { activite: 'CFA bâtiment', pct: 60 }, { activite: 'BTS', pct: 35 },
  ]); };

  return (
    <CalculateurShell meta={meta} onLoadSample={sample}>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div><Label className="text-xs">Taxe d'apprentissage perçue (€)</Label>
            <Input type="number" value={perçu || ''} onChange={e => setPerçu(+e.target.value)} className="h-8" /></div>
          <Label className="text-xs">Affectation par section / activité</Label>
          {affectations.map((a, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input value={a.activite} onChange={e => { const c = [...affectations]; c[i].activite = e.target.value; setAffectations(c); }} className="h-8 flex-1" />
              <Input type="number" value={a.pct} onChange={e => { const c = [...affectations]; c[i].pct = +e.target.value; setAffectations(c); }} className="h-8 w-20" />
              <span className="text-xs">%</span>
            </div>
          ))}
          <button className="text-xs text-primary hover:underline" onClick={() => setAffectations([...affectations, { activite: '', pct: 0 }])}>
            + Ajouter une section
          </button>
        </div>
        <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5 text-xs">
          {affectations.map((a, i) => (
            <div key={i} className="flex justify-between">
              <span>{a.activite || `Section ${i + 1}`} ({a.pct} %)</span>
              <span className="tabular-nums font-mono">{fmtEur(perçu * a.pct / 100)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t pt-1"><span>Total affecté ({totalPct} %)</span><span className="tabular-nums font-mono">{fmtEur(perçu * totalPct / 100)}</span></div>
          <div className={cn('flex justify-between font-bold', Math.abs(reliquat) > 0.01 ? 'text-amber-700' : 'text-emerald-700')}>
            <span>Reliquat à reverser</span><span className="tabular-nums font-mono">{fmtEur(reliquat)}</span>
          </div>
          {totalPct > 100 && (
            <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertDescription className="text-[10px]">
              Total des pourcentages &gt; 100 %.
            </AlertDescription></Alert>
          )}
        </div>
      </div>
    </CalculateurShell>
  );
}
