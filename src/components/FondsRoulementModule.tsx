import { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Upload, FileDown, FileText, Info, AlertTriangle, CheckCircle2, XCircle, CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, differenceInCalendarDays, parse } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { BalanceLigne } from '@/config/m96-plan-comptable';
import { useFondsDeRoulement, fmtEur, genererAvisMotive, FdrIndicateur } from '@/hooks/useFondsDeRoulement';
import { loadState, saveState } from '@/lib/store';
import { getSelectedEtablissement } from '@/lib/types';
import { useAuditParamsContext } from '@/contexts/AuditParamsContext';

// ───────────────────── Couleurs (palette charte) ─────────────────────
const COLORS = {
  plancher: 'hsl(220, 65%, 38%)',     // bleu marine
  affecte: 'hsl(25, 95%, 53%)',       // orange
  mobilisable: 'hsl(152, 60%, 40%)',  // vert
  preleveResidu: 'hsl(152, 60%, 40%)',
  prelevePart: 'hsl(0, 72%, 51%)',    // rouge
};

const STORAGE_KEY = 'fdr_module_v3';

// ───────────────────── Parseur balance Op@le (factorisé) ─────────────────────
async function parseBalanceFile(file: File): Promise<{ lignes: BalanceLigne[]; sheetName: string; dateDebut?: string; dateFin?: string; }> {
  const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const toNum = (v: unknown): number => {
    if (v === null || v === undefined || v === '') return 0;
    if (typeof v === 'number') return v;
    let s = String(v).replace(/\s|\u00a0/g, '').replace(/"/g, '').trim();
    if (!s) return 0;
    let neg = false;
    if (/^\(.*\)$/.test(s)) { neg = true; s = s.slice(1, -1); }
    if (s.includes(',') && !s.includes('.')) s = s.replace(/\./g, '').replace(',', '.');
    else if (s.includes(',') && s.includes('.')) s = s.replace(/,/g, '');
    const n = parseFloat(s);
    return isNaN(n) ? 0 : (neg ? -n : n);
  };

  // Extraction d'une date au format dd/mm/yyyy ou yyyy-mm-dd dans une cellule
  const extractDate = (cell: unknown): string | undefined => {
    if (cell === null || cell === undefined) return undefined;
    // Date Excel native (number ou Date)
    if (cell instanceof Date) return cell.toISOString().slice(0, 10);
    if (typeof cell === 'number' && cell > 25000 && cell < 80000) {
      const d = XLSX.SSF.parse_date_code(cell);
      if (d) return `${d.y.toString().padStart(4, '0')}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
    }
    const s = String(cell).trim();
    let m = s.match(/(\d{2})[\/\-\.](\d{2})[\/\-\.](\d{4})/);
    if (m) return `${m[3]}-${m[2]}-${m[1]}`;
    m = s.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;
    return undefined;
  };

  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array', cellDates: true });
  const sheetNames = wb.SheetNames;
  let chosen = sheetNames.find(n => {
    const x = norm(n);
    return x.startsWith('donnees') || x.startsWith('data');
  });
  if (!chosen) chosen = sheetNames.length === 1 ? sheetNames[0] : (sheetNames.find(n => norm(n) !== 'balance') ?? sheetNames[0]);
  const ws = wb.Sheets[chosen];
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, raw: true, defval: '' }) as unknown[][];
  let headerRowIdx = matrix.findIndex(r => Array.isArray(r) && r.some(c => norm(String(c ?? '')) === 'compte'));
  if (headerRowIdx < 0) headerRowIdx = 2;

  // ─── Recherche des dates d'exercice dans les lignes de méta (avant headers) ───
  let dateDebut: string | undefined;
  let dateFin: string | undefined;
  const metaText = matrix.slice(0, headerRowIdx).flat().map(c => String(c ?? '')).join(' | ');
  const datesTrouvees: string[] = [];
  const reDate = /(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4})|(\d{4}-\d{2}-\d{2})/g;
  let match;
  while ((match = reDate.exec(metaText)) !== null) {
    const d = extractDate(match[0]);
    if (d) datesTrouvees.push(d);
  }
  // Détection contextuelle : "du ... au ..."
  const ctxMatch = metaText.match(/du\s+(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4})\s+au\s+(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4})/i);
  if (ctxMatch) {
    dateDebut = extractDate(ctxMatch[1]);
    dateFin = extractDate(ctxMatch[2]);
  } else if (datesTrouvees.length >= 2) {
    const sorted = [...datesTrouvees].sort();
    dateDebut = sorted[0];
    dateFin = sorted[sorted.length - 1];
  }

  const headers = (matrix[headerRowIdx] as unknown[]).map(h => String(h ?? '').trim());
  const idx = (label: string) => headers.findIndex(h => norm(h) === norm(label));
  const iCompte = idx('Compte');
  const iLib = idx('Intitulé réduit du compte');
  const iSdeb = idx('Solde débit');
  const iScred = idx('Solde crédit');
  const iMdeb = idx('Montant débit');
  const iMcred = idx('Montant crédit');

  if (iCompte < 0) throw new Error(`Onglet « ${chosen} » : colonne "Compte" introuvable.`);

  const lignes: BalanceLigne[] = [];
  for (let r = headerRowIdx + 1; r < matrix.length; r++) {
    const row = matrix[r] as unknown[];
    if (!row || row.length === 0) continue;
    const rawCompte = row[iCompte];
    if (rawCompte === null || rawCompte === undefined || rawCompte === '') continue;
    const compteStr = String(rawCompte).trim();
    if (!/^\d+$/.test(compteStr)) continue;
    lignes.push({
      compte: compteStr.padStart(6, '0'),
      libelle: iLib >= 0 ? String(row[iLib] ?? '') : undefined,
      sDeb: iSdeb >= 0 ? toNum(row[iSdeb]) : 0,
      sCred: iScred >= 0 ? toNum(row[iScred]) : 0,
      mDeb: iMdeb >= 0 ? toNum(row[iMdeb]) : undefined,
      mCred: iMcred >= 0 ? toNum(row[iMcred]) : undefined,
    });
  }
  return { lignes, sheetName: chosen, dateDebut, dateFin };
}

// ───────────────────── Composant Feu tricolore ─────────────────────
function FeuCard({ ind }: { ind: FdrIndicateur }) {
  const couleur = ind.feu === 'vert' ? 'bg-emerald-500' : ind.feu === 'orange' ? 'bg-orange-500' : 'bg-red-500';
  const Icon = ind.feu === 'vert' ? CheckCircle2 : ind.feu === 'orange' ? AlertTriangle : XCircle;
  return (
    <Card className="shadow-card">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{ind.label}</p>
            <p className="text-2xl font-bold mt-1">{ind.detail}</p>
          </div>
          <div className={`h-3 w-3 rounded-full ${couleur} ring-2 ring-offset-2 ring-${ind.feu === 'vert' ? 'emerald' : ind.feu === 'orange' ? 'orange' : 'red'}-200 mt-1`} />
        </div>
        <div className={`flex items-center gap-1 mt-2 text-xs ${ind.feu === 'vert' ? 'text-emerald-700' : ind.feu === 'orange' ? 'text-orange-700' : 'text-red-700'}`}>
          <Icon className="h-3 w-3" />
          <span>{ind.unite}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ───────────────────── Tooltip info ─────────────────────
function InfoTip({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <UITooltip>
        <TooltipTrigger asChild>
          <Info className="inline h-3 w-3 text-muted-foreground cursor-help ml-1" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-xs">{children}</TooltipContent>
      </UITooltip>
    </TooltipProvider>
  );
}

// ───────────────────── Module principal ─────────────────────
export interface FondsRoulementModuleProps {
  // permet d'utiliser ce composant en sous-section de la page existante
  onPrintReady?: (ref: HTMLDivElement | null) => void;
}

export function FondsRoulementModule(_props: FondsRoulementModuleProps) {
  const { params } = useAuditParamsContext();
  const etab = getSelectedEtablissement(params);
  const etabLabel = etab ? `${etab.nom} (${etab.uai})` : params.etablissements[0]?.nom || 'Établissement non sélectionné';

  const [stored, setStored] = useState(() => loadState(STORAGE_KEY, {
    balance: [] as BalanceLigne[],
    nbJoursPeriode: 365,
    chargesParJourManuel: 0,
    pfrMontant: 0,
    avisManuel: '',
    sheetName: '',
    dateDebut: '' as string,           // YYYY-MM-DD
    dateFin: '' as string,             // YYYY-MM-DD
    dateCA: '' as string,              // YYYY-MM-DD : date du conseil d'administration
    datesAutoDetectees: false,
  }));
  const persist = (next: typeof stored) => { setStored(next); saveState(STORAGE_KEY, next); };

  // Recalcul automatique du nb de jours depuis les dates si présentes
  const nbJoursCalcule = (() => {
    if (stored.dateDebut && stored.dateFin) {
      const d1 = new Date(stored.dateDebut);
      const d2 = new Date(stored.dateFin);
      const diff = differenceInCalendarDays(d2, d1) + 1;
      if (diff > 0 && diff < 1000) return diff;
    }
    return stored.nbJoursPeriode || 365;
  })();

  const r = useFondsDeRoulement({
    balance: stored.balance,
    pfrMontant: stored.pfrMontant,
    nbJoursPeriode: nbJoursCalcule,
    chargesParJourManuel: stored.chargesParJourManuel || undefined,
  });

  const printRef = useRef<HTMLDivElement>(null);

  const fmtDateFR = (iso: string) => {
    if (!iso) return '';
    try { return format(new Date(iso), 'dd MMMM yyyy', { locale: fr }); } catch { return iso; }
  };

  // ─── Handlers ───
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { lignes, sheetName, dateDebut, dateFin } = await parseBalanceFile(file);
      if (lignes.length === 0) {
        toast.warning(`Aucune ligne exploitable dans l'onglet « ${sheetName} ».`);
        return;
      }
      const next = {
        ...stored,
        balance: lignes,
        sheetName,
        dateDebut: dateDebut || stored.dateDebut,
        dateFin: dateFin || stored.dateFin,
        datesAutoDetectees: !!(dateDebut && dateFin),
      };
      persist(next);
      if (dateDebut && dateFin) {
        toast.success(`Balance importée : ${lignes.length} lignes — exercice détecté du ${fmtDateFR(dateDebut)} au ${fmtDateFR(dateFin)}`);
      } else {
        toast.success(`Balance importée : ${lignes.length} lignes (onglet « ${sheetName} »)`);
        toast.info("Dates d'exercice non détectées — veuillez les saisir manuellement.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur de lecture du fichier');
    } finally {
      e.target.value = '';
    }
  };

  const exportPDF = async () => {
    if (!printRef.current) return;
    const canvas = await html2canvas(printRef.current, { scale: 2, backgroundColor: '#ffffff' });
    const img = canvas.toDataURL('image/png');
    const pdf = new jsPDF('portrait', 'mm', 'a4');
    const w = 210, h = (canvas.height * w) / canvas.width;
    pdf.addImage(img, 'PNG', 0, 0, w, Math.min(h, 297));
    pdf.save(`fdr-${etab?.uai || 'etablissement'}.pdf`);
  };

  const exportWord = async () => {
    const txt = stored.avisManuel || genererAvisMotive(r, etabLabel, `${stored.nbJoursPeriode} jours`);
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({ heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "Avis motivé de l'agent comptable", bold: true })] }),
          new Paragraph({ children: [new TextRun({ text: etabLabel, italics: true })] }),
          new Paragraph({ children: [new TextRun('')] }),
          ...txt.split('\n').map(line => new Paragraph({ children: [new TextRun(line)] })),
        ],
      }],
    });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `avis-motive-fdr-${etab?.uai || 'etab'}.docx`);
  };

  const hasBalance = stored.balance.length > 0;

  // ─── Données camemberts ───
  const seuilPlancher = Math.max(0, r.seuilPlancher);
  const reservesAffectees = Math.max(0, r.reservesAffectees);
  const fdrMobilisable = Math.max(0, r.fdrMobilisable);
  const camAvant = [
    { name: 'Seuil plancher (30j)', value: seuilPlancher, fill: COLORS.plancher },
    { name: 'Réserves affectées', value: reservesAffectees, fill: COLORS.affecte },
    { name: 'FdR mobilisable', value: fdrMobilisable, fill: COLORS.mobilisable },
  ].filter(x => x.value > 0);

  const partPrelevee = Math.min(stored.pfrMontant, fdrMobilisable);
  const partResiduelle = Math.max(0, fdrMobilisable - partPrelevee);
  const camApres = [
    { name: 'Seuil plancher (30j)', value: seuilPlancher, fill: COLORS.plancher },
    { name: 'Réserves affectées', value: reservesAffectees, fill: COLORS.affecte },
    { name: 'Part résiduelle', value: partResiduelle, fill: COLORS.preleveResidu },
    { name: 'Part prélevée', value: partPrelevee, fill: COLORS.prelevePart },
  ].filter(x => x.value > 0);

  const avisAuto = hasBalance ? genererAvisMotive(r, etabLabel, `${stored.nbJoursPeriode} jours`) : '';

  // ─── Rendu ───
  return (
    <div className="space-y-6">
      {/* Bandeau import */}
      <Card className="shadow-card">
        <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <label className="cursor-pointer">
              <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />
              <Button asChild size="sm" variant="outline" className="gap-2">
                <span><Upload className="h-4 w-4" /> Importer balance Op@le (.xlsx)</span>
              </Button>
            </label>
            {hasBalance && (
              <Badge variant="secondary" className="text-xs">
                {stored.balance.length} lignes — onglet « {stored.sheetName} »
              </Badge>
            )}
          </div>
          {hasBalance && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={exportPDF} className="gap-2"><FileDown className="h-4 w-4" /> Export PDF A4</Button>
              <Button size="sm" variant="outline" onClick={exportWord} className="gap-2"><FileText className="h-4 w-4" /> Export Word (avis)</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {!hasBalance && (
        <Card className="shadow-card border-dashed">
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Importez la balance Op@le (onglet « Donnees ») pour activer l'analyse complète : agrégats M9-6, double camembert PFR, feu tricolore, avis motivé auto-généré.
          </CardContent>
        </Card>
      )}

      {hasBalance && (
        <div ref={printRef} className="space-y-6 bg-background p-4 rounded-lg">
          {/* En-tête imprimable */}
          <div className="text-center border-b pb-3">
            <h2 className="text-lg font-bold">Analyse du fonds de roulement — {etabLabel}</h2>
            <p className="text-xs text-muted-foreground">Période d'analyse : {stored.nbJoursPeriode} jours · Méthodologie M9-6 § 4.5.3</p>
          </div>

          {/* Contrôle d'identité */}
          {!r.identiteRespectee && (
            <Card className="border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/20">
              <CardContent className="p-3 flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="font-medium">Incohérence bilancielle</span>
                <span className="text-muted-foreground">— FdR − BFR ≠ Trésorerie (écart : {fmtEur(r.ecartIdentite)}). Vérifier les écritures de classe 18 ou 47.</span>
              </CardContent>
            </Card>
          )}

          {/* 4 feux tricolores */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <FeuCard ind={r.indTresorerie} />
            <FeuCard ind={r.indFdrMobilisable} />
            <FeuCard ind={r.indAutonomie} />
            <FeuCard ind={r.indCoherenceDettes} />
          </div>

          {/* Paramètres simulateur */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Simulateur de prélèvement sur fonds de roulement (PFR)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">Période de référence (jours)<InfoTip>Nombre de jours couverts par la balance. Par défaut 365 (exercice complet).</InfoTip></Label>
                  <Input type="number" value={stored.nbJoursPeriode} onChange={e => persist({ ...stored, nbJoursPeriode: parseInt(e.target.value) || 365 })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Charges décaissables / jour (€)<InfoTip>Calculées automatiquement depuis les mouvements débit des classes 60-64. Saisir une valeur pour forcer.</InfoTip></Label>
                  <Input type="number" value={stored.chargesParJourManuel || ''} placeholder={r.chargesParJour.toFixed(2)} onChange={e => persist({ ...stored, chargesParJourManuel: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">FdR mobilisable maximum</Label>
                  <div className="h-10 flex items-center px-3 rounded-md border text-sm font-bold">{fmtEur(fdrMobilisable)}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold">Montant du prélèvement envisagé : <span className="text-primary">{fmtEur(stored.pfrMontant)}</span></Label>
                  <Input type="number" value={stored.pfrMontant} onChange={e => persist({ ...stored, pfrMontant: Math.max(0, parseFloat(e.target.value) || 0) })} className="w-40" />
                </div>
                <Slider
                  value={[stored.pfrMontant]}
                  max={Math.max(fdrMobilisable, 1)}
                  step={Math.max(1, Math.round(fdrMobilisable / 100))}
                  onValueChange={(v) => persist({ ...stored, pfrMontant: v[0] })}
                />
              </div>

              {r.rongeSurPlancher && stored.pfrMontant > 0 && (
                <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 dark:bg-red-950/20 p-2 rounded">
                  <AlertTriangle className="h-4 w-4" />
                  Prélèvement en-dessous du seuil prudentiel M9-6 — avis défavorable
                </div>
              )}
            </CardContent>
          </Card>

          {/* Double camembert */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="shadow-card">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-center">Structure du FdR — AVANT prélèvement</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={camAvant} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={90} animationDuration={400}
                      label={({ percent }) => `${((percent || 0) * 100).toFixed(0)}%`}>
                      {camAvant.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => fmtEur(v)} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-center">Structure du FdR — APRÈS prélèvement</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={camApres} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={90} animationDuration={400}
                      label={({ percent }) => `${((percent || 0) * 100).toFixed(0)}%`}>
                      {camApres.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => fmtEur(v)} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Tableau synoptique */}
          <Card className="shadow-card">
            <CardHeader className="pb-2"><CardTitle className="text-base">Tableau synoptique — Agrégats issus de la balance</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted/50 text-left">
                      <th className="p-2 border">Bloc</th>
                      <th className="p-2 border">Poste M9-6</th>
                      <th className="p-2 border">Comptes</th>
                      <th className="p-2 border text-right">Montant (€)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <SynRow bloc="Ressources stables" detail={r.detailRessources} />
                    <tr className="bg-primary/10 font-bold"><td className="p-2 border">Total ressources stables</td><td colSpan={2} className="p-2 border" /><td className="p-2 border text-right font-mono">{fmtEur(r.ressourcesStables)}</td></tr>
                    <SynRow bloc="Emplois stables" detail={r.detailEmplois} />
                    <tr className="bg-primary/10 font-bold"><td className="p-2 border">Emplois stables nets</td><td colSpan={2} className="p-2 border" /><td className="p-2 border text-right font-mono">{fmtEur(r.emploisStables)}</td></tr>
                    <tr className="bg-emerald-100 dark:bg-emerald-950/30 font-bold"><td className="p-2 border">FONDS DE ROULEMENT</td><td colSpan={2} className="p-2 border text-xs">Ressources stables − Emplois stables nets</td><td className="p-2 border text-right font-mono">{fmtEur(r.fdr)}</td></tr>
                    <SynRow bloc="BFR (actif)" detail={r.detailBfrActif} />
                    <SynRow bloc="BFR (passif)" detail={r.detailBfrPassif} />
                    <tr className="bg-orange-100 dark:bg-orange-950/30 font-bold"><td className="p-2 border">BESOIN EN FONDS DE ROULEMENT</td><td colSpan={2} className="p-2 border text-xs">Actif circulant − Passif circulant</td><td className="p-2 border text-right font-mono">{fmtEur(r.bfr)}</td></tr>
                    <SynRow bloc="Trésorerie (actif)" detail={r.detailTresoActif} />
                    <SynRow bloc="Trésorerie (passif)" detail={r.detailTresoPassif} />
                    <tr className="bg-blue-100 dark:bg-blue-950/30 font-bold"><td className="p-2 border">TRÉSORERIE NETTE</td><td colSpan={2} className="p-2 border text-xs">Actif − Passif</td><td className="p-2 border text-right font-mono">{fmtEur(r.tresorerie)}</td></tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Avis motivé */}
          <Card className="shadow-card border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Avis motivé de l'agent comptable (auto-généré, modifiable)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Textarea
                rows={10}
                value={stored.avisManuel || avisAuto}
                onChange={e => persist({ ...stored, avisManuel: e.target.value })}
                className="font-serif text-sm leading-relaxed"
              />
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => persist({ ...stored, avisManuel: '' })}>
                  Régénérer depuis les indicateurs
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Sous-composant : lignes du tableau synoptique
function SynRow({ bloc, detail }: { bloc: string; detail: Record<string, { montant: number; lignes: BalanceLigne[] }> }) {
  const entries = Object.entries(detail).filter(([_, v]) => Math.abs(v.montant) > 0.01);
  if (entries.length === 0) return null;
  return (
    <>
      {entries.map(([key, v], i) => (
        <tr key={`${bloc}-${key}`} className="border-b">
          {i === 0 && <td rowSpan={entries.length} className="p-2 border font-semibold align-top text-xs">{bloc}</td>}
          <td className="p-2 border">{key}</td>
          <td className="p-2 border font-mono text-[10px] text-muted-foreground">
            {Array.from(new Set(v.lignes.map(l => l.compte.replace(/0+$/, '').slice(0, 3)))).slice(0, 5).join(', ')}
          </td>
          <td className="p-2 border text-right font-mono">{fmtEur(v.montant)}</td>
        </tr>
      ))}
    </>
  );
}
