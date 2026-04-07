import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { fmt } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';
import { ModulePageLayout, AnomalyAlert, ModuleSection } from '@/components/ModulePageLayout';
import { INDICATEURS_FINANCIERS_M96 } from '@/lib/regulatory-data';

export default function AnalyseFinanciere() {
  const [data, setData] = useState(() => loadState('analyse_fin_v2', {
    fdr: '', bfr: '', treso: '', drfn: '', caf: '',
    fdrN1: '', fdrN2: '', bfrN1: '', tresoN1: '',
    obs: '',
  }));
  const update = (k: string, v: string) => { const n = { ...data, [k]: v }; setData(n); saveState('analyse_fin_v2', n); };

  const fdr = parseFloat(data.fdr) || 0;
  const bfr = parseFloat(data.bfr) || 0;
  const treso = parseFloat(data.treso) || 0;
  const drfn = parseFloat(data.drfn) || 0;
  const caf = parseFloat(data.caf) || 0;
  const fdrN1 = parseFloat(data.fdrN1) || 0;
  const fdrN2 = parseFloat(data.fdrN2) || 0;

  // Jours calculés sur DRFN (M9-6 § 4.5.3)
  const joursFDR = drfn > 0 ? Math.round(fdr / drfn * 365) : null;
  const joursBFR = drfn > 0 ? Math.round(bfr / drfn * 365) : null;
  const joursTreso = drfn > 0 ? Math.round(treso / drfn * 365) : null;

  // Variation FDR
  const variationFDR = fdrN1 !== 0 ? Math.round((fdr - fdrN1) / fdrN1 * 100) : null;

  // Vérification de la relation fondamentale
  const ecartRelation = Math.abs(fdr - bfr - treso);
  const relationOK = fdr > 0 && ecartRelation < 1;

  const hasData = fdr !== 0 || bfr !== 0 || treso !== 0;

  return (
    <ModulePageLayout
      title="Analyse financière"
      section="FINANCES & BUDGET"
      description="Calcul et interprétation des indicateurs financiers du compte financier selon la méthodologie M9-6 § 4.5.3. Le dénominateur pour le calcul des jours est la DRFN (Dépenses Réelles de Fonctionnement Nettes), et non le budget total."
      refs={[
        { code: 'M9-6 § 4.5.3', label: 'Indicateurs financiers' },
        { code: 'M9-6 § 4.5.3.1', label: 'FDR' },
        { code: 'M9-6 § 4.5.3.2', label: 'BFR' },
        { code: 'M9-6 § 4.5.3.4', label: 'CAF' },
      ]}
    >
      {/* ─── Saisie des données ─── */}
      <ModuleSection title="Données financières du compte financier" description="Saisir les montants issus de la balance ou du compte financier (Op@le)">
        <Card className="shadow-card">
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-medium">Fonds de roulement (€)</Label>
                <Input type="number" value={data.fdr} onChange={e => update('fdr', e.target.value)} placeholder="Capitaux permanents − Actif immobilisé net" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium">Besoin en fonds de roulement (€)</Label>
                <Input type="number" value={data.bfr} onChange={e => update('bfr', e.target.value)} placeholder="Actif circulant − Dettes CT" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium">Trésorerie nette (€)</Label>
                <Input type="number" value={data.treso} onChange={e => update('treso', e.target.value)} placeholder="FDR − BFR" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium text-primary">DRFN — Dépenses Réelles de Fonctionnement Nettes (€)</Label>
                <Input type="number" value={data.drfn} onChange={e => update('drfn', e.target.value)} placeholder="Dénominateur pour le calcul des jours" />
                <p className="text-[10px] text-muted-foreground">Total dépenses fonctionnement − cessions − dotations amortissements</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium">CAF (€)</Label>
                <Input type="number" value={data.caf} onChange={e => update('caf', e.target.value)} placeholder="Résultat + dotations − reprises" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2 border-t border-border">
              <div className="space-y-1">
                <Label className="text-xs">FDR N-1 (€)</Label>
                <Input type="number" value={data.fdrN1} onChange={e => update('fdrN1', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">FDR N-2 (€)</Label>
                <Input type="number" value={data.fdrN2} onChange={e => update('fdrN2', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">BFR N-1 (€)</Label>
                <Input type="number" value={data.bfrN1} onChange={e => update('bfrN1', e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>
      </ModuleSection>

      {/* ─── Indicateurs calculés ─── */}
      {hasData && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Card className="shadow-card"><CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Fonds de roulement</p>
              <p className={`text-xl font-bold ${fdr < 0 ? 'text-destructive' : 'text-foreground'}`}>{fmt(fdr)}</p>
              {joursFDR !== null && <p className="text-xs font-bold mt-1">{joursFDR} jours de DRFN</p>}
            </CardContent></Card>
            <Card className="shadow-card"><CardContent className="p-4">
              <p className="text-xs text-muted-foreground">BFR</p>
              <p className={`text-xl font-bold ${bfr > 0 ? 'text-orange-600' : 'text-green-600'}`}>{fmt(bfr)}</p>
              {joursBFR !== null && <p className="text-xs mt-1">{joursBFR} jours</p>}
            </CardContent></Card>
            <Card className="shadow-card"><CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Trésorerie nette</p>
              <p className={`text-xl font-bold ${treso < 0 ? 'text-destructive' : 'text-green-600'}`}>{fmt(treso)}</p>
              {joursTreso !== null && <p className="text-xs mt-1">{joursTreso} jours</p>}
            </CardContent></Card>
            <Card className="shadow-card"><CardContent className="p-4">
              <p className="text-xs text-muted-foreground">CAF</p>
              <p className={`text-xl font-bold ${caf < 0 ? 'text-destructive' : 'text-foreground'}`}>{fmt(caf)}</p>
            </CardContent></Card>
            <Card className="shadow-card"><CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Variation FDR</p>
              <p className={`text-xl font-bold ${(variationFDR ?? 0) < 0 ? 'text-destructive' : 'text-green-600'}`}>
                {variationFDR !== null ? `${variationFDR > 0 ? '+' : ''}${variationFDR}%` : '—'}
              </p>
            </CardContent></Card>
          </div>

          {/* Alertes */}
          {joursFDR !== null && joursFDR < 30 && (
            <AnomalyAlert title={`CRITIQUE — FDR à ${joursFDR} jours de DRFN (seuil minimum : 30 jours)`} description="Un fonds de roulement inférieur à 30 jours de DRFN constitue un risque de trésorerie majeur signalé par les CRC." severity="error" />
          )}
          {joursFDR !== null && joursFDR >= 30 && joursFDR < 60 && (
            <AnomalyAlert title={`ATTENTION — FDR à ${joursFDR} jours de DRFN (recommandation CRC : 60 jours)`} severity="warning" />
          )}
          {treso < 0 && (
            <AnomalyAlert title="Trésorerie nette négative" description="L'établissement est en situation de découvert comptable. Le FDR ne couvre pas le BFR." severity="error" />
          )}
          {fdr > 0 && bfr !== 0 && treso !== 0 && !relationOK && (
            <AnomalyAlert title={`Incohérence : FDR − BFR ≠ Trésorerie (écart : ${fmt(ecartRelation)})`} description="Relation fondamentale M9-6 : Trésorerie = FDR − BFR. Vérifiez vos données." severity="warning" />
          )}

          {/* Formules de référence */}
          <Card className="shadow-card">
            <CardHeader><CardTitle className="text-base font-bold">Formules M9-6 § 4.5.3</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(INDICATEURS_FINANCIERS_M96).map(([key, ind]) => (
                <div key={key} className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold">{ind.label}</p>
                    <span className="text-[10px] text-muted-foreground">{ind.ref}</span>
                  </div>
                  <p className="text-xs font-mono text-primary mt-1">{ind.formule}</p>
                  <p className="text-xs text-muted-foreground mt-1">{ind.interpretation}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}

      {/* ─── Observations ─── */}
      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-base font-bold">Observations et analyse</CardTitle></CardHeader>
        <CardContent><Textarea value={data.obs} onChange={e => update('obs', e.target.value)} rows={5} placeholder="Analyse des indicateurs, évolution pluriannuelle, recommandations..." className="resize-y" /></CardContent>
      </Card>
    </ModulePageLayout>
  );
}
