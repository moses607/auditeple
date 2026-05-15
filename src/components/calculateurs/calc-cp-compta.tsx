/**
 * Calculateurs Commande publique + Comptabilité : Seuils CCP 2026, Amortissements, DBM, DGP
 */
import { useMemo, useState } from 'react';
import { CalculateurShell } from '@/components/calculateurs/CalculateurShell';
import { getCalculateur, fmtEur, fmtPct } from '@/lib/calculateurs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ═════════════ SEUILS CCP 2026 ═════════════
export function CalcSeuilsCCP() {
  const meta = getCalculateur('seuils-ccp')!;
  const [montant, setMontant] = useState(0);
  const [nature, setNature] = useState<'fournitures' | 'travaux'>('fournitures');
  const [memeFournisseur, setMemeFournisseur] = useState(0);

  const seuilDispense = nature === 'travaux' ? 100000 : 60000;
  const seuilFormalise = nature === 'travaux' ? 5538000 : 216000;

  const procedure = useMemo(() => {
    if (montant <= 0) return null;
    if (montant < seuilDispense) return { color: 'emerald', label: 'Gré à gré (dispense)', detail: 'Pas de mise en concurrence obligatoire.' };
    if (montant < seuilFormalise) return { color: 'amber', label: 'MAPA (procédure adaptée)', detail: 'Publicité et mise en concurrence adaptées. Au moins 3 devis recommandés.' };
    return { color: 'red', label: 'Procédure formalisée', detail: 'Appel d\'offres + publication JOUE + BOAMP.' };
  }, [montant, seuilDispense, seuilFormalise]);

  const cumulSaucissonnage = memeFournisseur + montant;
  const alerteSauc = cumulSaucissonnage > seuilDispense && montant < seuilDispense;

  const sample = () => { setMontant(45000); setMemeFournisseur(35000); };

  return (
    <CalculateurShell meta={meta} onLoadSample={sample}>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Nature de l'achat</Label>
            <Select value={nature} onValueChange={v => setNature(v as any)}>
              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="fournitures">Fournitures et services</SelectItem>
                <SelectItem value="travaux">Travaux</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Montant HT envisagé (€)</Label>
            <Input type="number" value={montant || ''} onChange={e => setMontant(+e.target.value)} className="h-8" />
          </div>
          <div>
            <Label className="text-xs">Cumul exercice — même fournisseur / même objet (€)</Label>
            <Input type="number" value={memeFournisseur || ''} onChange={e => setMemeFournisseur(+e.target.value)} className="h-8" />
          </div>
          <div className="text-[10px] text-muted-foreground space-y-0.5 mt-2">
            <p>Seuils 2026 (Décret 2025-1386) :</p>
            <p>• Fournitures/services : dispense &lt; 60 000 € — formalisée ≥ 216 000 €</p>
            <p>• Travaux : dispense &lt; 100 000 € — formalisée ≥ 5 538 000 €</p>
          </div>
        </div>
        <div className="space-y-3">
          {procedure && (
            <div className={cn('rounded-lg border-2 p-4',
              procedure.color === 'emerald' && 'border-emerald-500/40 bg-emerald-500/10',
              procedure.color === 'amber' && 'border-amber-500/40 bg-amber-500/10',
              procedure.color === 'red' && 'border-destructive/40 bg-destructive/10',
            )}>
              <Badge className={cn('mb-2',
                procedure.color === 'emerald' && 'bg-emerald-600',
                procedure.color === 'amber' && 'bg-amber-600',
                procedure.color === 'red' && 'bg-destructive',
              )}>{procedure.label}</Badge>
              <p className="text-xs">{procedure.detail}</p>
            </div>
          )}
          {alerteSauc && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <strong>Risque de saucissonnage :</strong> cumul {fmtEur(cumulSaucissonnage)} {'>'} seuil de dispense {fmtEur(seuilDispense)}.
                Une procédure adaptée doit être engagée (art. R2121-1 CCP).
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </CalculateurShell>
  );
}

// ═════════════ AMORTISSEMENTS ═════════════
export function CalcAmortissements() {
  const meta = getCalculateur('amortissements')!;
  const [valeur, setValeur] = useState(0);
  const [duree, setDuree] = useState(5);
  const [dateMiseService, setDateMiseService] = useState(new Date().toISOString().slice(0, 10));

  const tableau = useMemo(() => {
    if (valeur <= 0 || duree <= 0) return [];
    const annuite = valeur / duree;
    const start = new Date(dateMiseService).getFullYear();
    const rows = [];
    let vnc = valeur;
    for (let i = 0; i < duree; i++) {
      vnc -= annuite;
      rows.push({ annee: start + i, annuite, cumul: annuite * (i + 1), vnc: Math.max(0, vnc) });
    }
    return rows;
  }, [valeur, duree, dateMiseService]);

  const sample = () => { setValeur(15000); setDuree(5); setDateMiseService('2024-09-01'); };

  return (
    <CalculateurShell meta={meta} onLoadSample={sample}>
      <div className="grid md:grid-cols-3 gap-3 mb-4">
        <div><Label className="text-xs">Valeur d'acquisition (€)</Label>
          <Input type="number" value={valeur || ''} onChange={e => setValeur(+e.target.value)} className="h-8" /></div>
        <div><Label className="text-xs">Durée (années)</Label>
          <Input type="number" value={duree || ''} onChange={e => setDuree(+e.target.value)} className="h-8" /></div>
        <div><Label className="text-xs">Date mise en service</Label>
          <Input type="date" value={dateMiseService} onChange={e => setDateMiseService(e.target.value)} className="h-8" /></div>
      </div>
      {tableau.length > 0 && (
        <table className="w-full text-xs">
          <thead><tr className="border-b">
            <th className="text-left py-1">Année</th>
            <th className="text-right py-1">Annuité</th>
            <th className="text-right py-1">Cumul amortissements</th>
            <th className="text-right py-1">VNC fin d'année</th>
          </tr></thead>
          <tbody>
            {tableau.map(r => (
              <tr key={r.annee} className="border-b">
                <td className="py-1">{r.annee}</td>
                <td className="text-right tabular-nums font-mono">{fmtEur(r.annuite)}</td>
                <td className="text-right tabular-nums font-mono">{fmtEur(r.cumul)}</td>
                <td className="text-right tabular-nums font-mono">{fmtEur(r.vnc)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="text-[10px] text-muted-foreground italic mt-3">
        Méthode linéaire (M9-6 § 4.6). À l'issue de la période, sortir l'immobilisation de l'inventaire (PV de réforme).
      </p>
    </CalculateurShell>
  );
}

// ═════════════ DBM / VIREMENTS BUDGÉTAIRES ═════════════
export function CalcDBM() {
  const meta = getCalculateur('dbm')!;
  const [type, setType] = useState<'21' | '23' | '32' | '34'>('21');
  const [montant, setMontant] = useState(0);
  const [budgetInitial, setBudgetInitial] = useState(0);

  // Nomenclature Op@le : 1er chiffre = niveau (2 = info CA, 3 = vote CA) ; 2e chiffre = nature de l'opération.
  const TYPES = {
    '21': { label: 'DBM 21 — Niveau 2 — Virement entre comptes d\'un même service (info CA)', auto: true, ca: false, recteur: false, detail: 'Niveau 2 : compétence ordonnateur, simple information du CA. Pas de vote.' },
    '23': { label: 'DBM 23 — Niveau 2 — Ressources nouvelles spécifiques affectées (info CA)', auto: true, ca: false, recteur: false, detail: 'Niveau 2 : ressources affectées (subvention fléchée, participation des familles…). Information du CA.' },
    '34': { label: 'DBM 34 — Niveau 3 — Virement entre services (vote CA)', auto: false, ca: true, recteur: false, detail: 'Niveau 3 : vote du CA obligatoire. Modification de la répartition entre services.' },
    '32': { label: 'DBM 32 — Niveau 3 — Prélèvement sur fonds de roulement (vote CA + accord recteur)', auto: false, ca: true, recteur: true, detail: 'Niveau 3 : mobilisation du FdR. Vote du CA puis accord exprès du recteur (autorité académique).' },
  } as const;

  const cur = TYPES[type];
  const impactPct = budgetInitial > 0 ? (montant / budgetInitial) * 100 : 0;

  const sample = () => { setType('32'); setMontant(15000); setBudgetInitial(450000); };

  return (
    <CalculateurShell meta={meta} onLoadSample={sample}>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div><Label className="text-xs">Type de DBM</Label>
            <Select value={type} onValueChange={v => setType(v as any)}>
              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select></div>
          <div><Label className="text-xs">Montant (€)</Label>
            <Input type="number" value={montant || ''} onChange={e => setMontant(+e.target.value)} className="h-8" /></div>
          <div><Label className="text-xs">Budget initial concerné (€)</Label>
            <Input type="number" value={budgetInitial || ''} onChange={e => setBudgetInitial(+e.target.value)} className="h-8" /></div>
        </div>
        <div className="rounded-lg border bg-muted/30 p-3 space-y-2 text-xs">
          <p className="font-semibold">{cur.label}</p>
          <p className="text-muted-foreground">{cur.detail}</p>
          <ul className="space-y-1 mt-2">
            <li>• Procédure ordonnateur seul : <strong>{cur.auto ? 'Oui' : 'Non'}</strong></li>
            <li>• Vote CA requis : <strong>{cur.ca ? 'Oui' : 'Non'}</strong></li>
            <li>• Accord recteur : <strong>{cur.recteur ? 'Oui' : 'Non'}</strong></li>
            <li>• Impact sur budget initial : <strong>{fmtPct(impactPct)}</strong></li>
          </ul>
          {impactPct > 10 && (
            <Alert variant="destructive" className="mt-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">Impact &gt; 10 % du budget initial — vigilance équilibre budgétaire.</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </CalculateurShell>
  );
}

// ═════════════ DÉLAI GLOBAL DE PAIEMENT ═════════════
export function CalcDGP() {
  const meta = getCalculateur('dgp')!;
  const [dateRecep, setDateRecep] = useState('');
  const [datePaiement, setDatePaiement] = useState('');
  const [montant, setMontant] = useState(0);
  const tauxBCE = 4.25; // À jour 2024-2025
  const tauxIM = tauxBCE + 8;

  const dgp = useMemo(() => {
    if (!dateRecep || !datePaiement) return 0;
    const d1 = new Date(dateRecep), d2 = new Date(datePaiement);
    return Math.round((d2.getTime() - d1.getTime()) / 86400000);
  }, [dateRecep, datePaiement]);
  const depassement = Math.max(0, dgp - 30);
  const interets = (montant * (tauxIM / 100) * depassement) / 365;
  const forfait = depassement > 0 ? 40 : 0;
  const totalDu = interets + forfait;

  const sample = () => { setDateRecep('2026-02-15'); setDatePaiement('2026-04-10'); setMontant(8500); };

  return (
    <CalculateurShell meta={meta} onLoadSample={sample}>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div><Label className="text-xs">Date réception facture</Label>
            <Input type="date" value={dateRecep} onChange={e => setDateRecep(e.target.value)} className="h-8" /></div>
          <div><Label className="text-xs">Date paiement effectif</Label>
            <Input type="date" value={datePaiement} onChange={e => setDatePaiement(e.target.value)} className="h-8" /></div>
          <div><Label className="text-xs">Montant HT du mandat (€)</Label>
            <Input type="number" value={montant || ''} onChange={e => setMontant(+e.target.value)} className="h-8" /></div>
          <p className="text-[10px] text-muted-foreground mt-1">
            Taux BCE retenu : {tauxBCE} % → taux IM = BCE + 8 = <strong>{tauxIM} %</strong>.
          </p>
        </div>
        <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5 text-xs">
          <div className="flex justify-between"><span>DGP</span><span className={cn('font-bold tabular-nums', depassement > 0 ? 'text-destructive' : 'text-emerald-700')}>{dgp} jours</span></div>
          <div className="flex justify-between"><span>Délai légal</span><span className="font-mono">30 jours</span></div>
          <div className="flex justify-between"><span>Dépassement</span><span className="font-bold tabular-nums">{depassement} j</span></div>
          <div className="border-t pt-1 mt-1 space-y-1">
            <div className="flex justify-between"><span>Intérêts moratoires</span><span className="tabular-nums font-mono">{fmtEur(interets)}</span></div>
            <div className="flex justify-between"><span>Indemnité forfaitaire</span><span className="tabular-nums font-mono">{fmtEur(forfait)}</span></div>
            <div className="flex justify-between font-bold text-sm border-t pt-1"><span>Total dû au fournisseur</span><span className="tabular-nums font-mono">{fmtEur(totalDu)}</span></div>
          </div>
          {depassement > 0 && (
            <Alert variant="destructive" className="mt-2">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-[10px]">
                Décret 2013-269 : intérêts moratoires + 40 € d'indemnité forfaitaire dus de plein droit.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </CalculateurShell>
  );
}
