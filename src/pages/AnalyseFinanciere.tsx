import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { fmt } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';
import { ModulePageLayout, AnomalyAlert, ModuleSection } from '@/components/ModulePageLayout';
import { INDICATEURS_FINANCIERS_M96 } from '@/lib/regulatory-data';
import { DoctrineEPLE } from '@/components/DoctrineEPLE';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

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
  const hasAllThree = data.fdr !== '' && data.bfr !== '' && data.treso !== '';
  const relationOK = !hasAllThree || ecartRelation < 1;

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
      <DoctrineEPLE theme="analyse-financiere" titre="Analyse financière M9-6 § 4.5.3" resume="FDR / BFR / Trésorerie en jours de DRFN, CAF, ratios prudentiels" />
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

            {/* Import balance Op@le */}
            <div className="pt-3 border-t border-border space-y-2">
              <p className="text-xs font-semibold text-foreground">Import depuis Op@le (CSV ou Excel)</p>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer">
                  <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    // Normalise un nom d'onglet : minuscules + suppression des accents
                    const norm = (s: string) => s
                      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                      .toLowerCase().trim();
                    // Convertit un montant FR/EN en number (gère "1 234,56", "1,234.56", "(123,45)" négatif)
                    const toNum = (v: unknown): number => {
                      if (v === null || v === undefined || v === '') return 0;
                      if (typeof v === 'number') return v;
                      let s = String(v).replace(/\s|\u00a0/g, '').replace(/"/g, '').trim();
                      if (!s) return 0;
                      let neg = false;
                      if (/^\(.*\)$/.test(s)) { neg = true; s = s.slice(1, -1); }
                      // Format FR : virgule décimale
                      if (s.includes(',') && !s.includes('.')) s = s.replace(/\./g, '').replace(',', '.');
                      else if (s.includes(',') && s.includes('.')) s = s.replace(/,/g, '');
                      const n = parseFloat(s);
                      if (isNaN(n)) return 0;
                      return neg ? -n : n;
                    };
                    try {
                      const ext = file.name.toLowerCase().split('.').pop();
                      let parsedSheet = '';
                      let totalRows = 0;
                      let comptesFound: string[] = [];
                      let fdrSum = 0, tresoSum = 0;
                      let fdrFound = false, tresoFound = false;

                      if (ext === 'xlsx' || ext === 'xls') {
                        const buf = await file.arrayBuffer();
                        const wb = XLSX.read(buf, { type: 'array' });
                        // Sélection de l'onglet : priorité absolue à "Donnees/Données/Data*"
                        const sheetNames = wb.SheetNames;
                        let chosen = sheetNames.find(n => {
                          const x = norm(n);
                          return x.startsWith('donnees') || x.startsWith('data');
                        });
                        if (!chosen) chosen = sheetNames.length === 1 ? sheetNames[0] : (sheetNames.find(n => norm(n) !== 'balance') ?? sheetNames[0]);
                        parsedSheet = chosen;
                        const ws = wb.Sheets[chosen];

                        // Op@le : lignes 1-2 = métadonnées, ligne 3 = en-têtes, ligne 4+ = données
                        const matrix = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, raw: true, defval: '' }) as unknown[][];
                        // Trouver la ligne d'en-tête (contient "Compte")
                        let headerRowIdx = matrix.findIndex(r => Array.isArray(r) && r.some(c => norm(String(c ?? '')) === 'compte'));
                        if (headerRowIdx < 0) headerRowIdx = 2; // fallback ligne 3
                        const headers = (matrix[headerRowIdx] as unknown[]).map(h => String(h ?? '').trim());
                        const idxOf = (label: string) => headers.findIndex(h => norm(h) === norm(label));
                        const iCompte   = idxOf('Compte');
                        const iSdeb     = idxOf('Solde débit');
                        const iScred    = idxOf('Solde crédit');

                        if (iCompte < 0) {
                          toast.error(`Onglet « ${parsedSheet} » : colonne "Compte" introuvable.`);
                          return;
                        }

                        for (let r = headerRowIdx + 1; r < matrix.length; r++) {
                          const row = matrix[r] as unknown[];
                          if (!row || row.length === 0) continue;
                          const rawCompte = row[iCompte];
                          if (rawCompte === null || rawCompte === undefined || rawCompte === '') continue;
                          const compteStr = String(rawCompte).trim();
                          // Doit être numérique (ignore "Total général" etc.)
                          if (!/^\d+$/.test(compteStr)) continue;
                          const compte = compteStr.padStart(6, '0');
                          totalRows++;
                          if (comptesFound.length < 3) comptesFound.push(compte);

                          const sDeb  = iSdeb  >= 0 ? toNum(row[iSdeb])  : 0;
                          const sCred = iScred >= 0 ? toNum(row[iScred]) : 0;
                          const solde = sDeb - sCred; // convention : débiteur positif

                          if (compte.startsWith('10')) {
                            fdrSum += -solde; // capitaux : crédit normal → on prend l'opposé pour avoir un montant positif
                            fdrFound = true;
                          }
                          if (compte.startsWith('515')) {
                            tresoSum += solde; // trésorerie : débit normal
                            tresoFound = true;
                          }
                        }
                      } else {
                        // CSV : conserve le comportement historique (préfixe sur 1ère colonne, montant sur dernière)
                        parsedSheet = 'CSV';
                        const text = await file.text();
                        const rows = text.split('\n').map(l => l.split(/[;,\t]/));
                        for (const cols of rows) {
                          const compteRaw = (cols[0] || '').replace(/"/g, '').trim().replace(/^C\//, '');
                          if (!/^\d+$/.test(compteRaw)) continue;
                          const compte = compteRaw.padStart(6, '0');
                          totalRows++;
                          if (comptesFound.length < 3) comptesFound.push(compte);
                          const montant = toNum((cols[cols.length - 1] || ''));
                          if (compte.startsWith('10')) { fdrSum += montant; fdrFound = true; }
                          if (compte.startsWith('515')) { tresoSum += montant; tresoFound = true; }
                        }
                      }

                      if (tresoFound) { update('treso', String(Math.round(tresoSum))); }
                      if (fdrFound)   { update('fdr',   String(Math.round(fdrSum))); }

                      if (tresoFound || fdrFound) {
                        toast.success(`Import Op@le réussi (onglet « ${parsedSheet} », ${totalRows} lignes)`);
                      } else {
                        toast.warning(
                          `Aucun compte 515 ou 10 détecté. Onglet parsé : « ${parsedSheet} » — ${totalRows} lignes lues. ` +
                          (comptesFound.length ? `Premiers comptes : ${comptesFound.join(', ')}.` : 'Aucun numéro de compte numérique trouvé.')
                        );
                      }
                    } catch (err) {
                      console.error(err);
                      toast.error('Erreur lors de la lecture du fichier');
                    } finally {
                      e.target.value = '';
                    }
                  }} />
                  <Button type="button" variant="outline" size="sm" className="gap-2 text-xs pointer-events-none" tabIndex={-1}>
                    <Upload className="h-3.5 w-3.5" />Importer balance Op@le (CSV / Excel)
                  </Button>
                </label>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Importe automatiquement les soldes des comptes 515 (trésorerie) et capitaux depuis la balance Op@le exportée en CSV ou Excel (.xlsx, .xls).
              </p>
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
          {hasAllThree && !relationOK && (
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
