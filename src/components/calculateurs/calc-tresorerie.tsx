/**
 * Calculateurs Trésorerie : Caisse régie + Rapprochement bancaire assisté
 */
import { useMemo, useState } from 'react';
import { CalculateurShell } from '@/components/calculateurs/CalculateurShell';
import { getCalculateur, fmtEur, addHistorique } from '@/lib/calculateurs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const BILLETS = [500, 200, 100, 50, 20, 10, 5];
const PIECES = [2, 1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01];

// ═════════════════════ CAISSE RÉGIE ═════════════════════
export function CalcCaisseRegie() {
  const meta = getCalculateur('caisse-regie')!;
  const [billets, setBillets] = useState<Record<number, number>>({});
  const [pieces, setPieces] = useState<Record<number, number>>({});
  const [cb, setCb] = useState(0);
  const [cheques, setCheques] = useState(0);
  const [theorique, setTheorique] = useState(0);

  const totalEspeces = useMemo(() =>
    BILLETS.reduce((s, v) => s + v * (billets[v] || 0), 0)
    + PIECES.reduce((s, v) => s + v * (pieces[v] || 0), 0), [billets, pieces]);
  const reel = totalEspeces + cb + cheques;
  const ecart = reel - theorique;

  const sample = () => {
    setBillets({ 50: 4, 20: 6, 10: 3 }); setPieces({ 2: 5, 1: 8, 0.5: 4 });
    setCb(125.50); setCheques(80); setTheorique(465);
  };

  return (
    <CalculateurShell meta={meta} onLoadSample={sample}>
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wide mb-2 text-muted-foreground">Billets</h4>
          <div className="space-y-1.5">
            {BILLETS.map(v => (
              <div key={v} className="flex items-center gap-2">
                <Label className="w-14 text-xs tabular-nums">{v} €</Label>
                <Input type="number" min={0} value={billets[v] || ''} onChange={e => setBillets({ ...billets, [v]: +e.target.value })} className="h-8 text-sm" />
                <span className="w-20 text-right text-xs tabular-nums text-muted-foreground">{fmtEur(v * (billets[v] || 0))}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wide mb-2 text-muted-foreground">Pièces</h4>
          <div className="space-y-1.5">
            {PIECES.map(v => (
              <div key={v} className="flex items-center gap-2">
                <Label className="w-14 text-xs tabular-nums">{v.toFixed(2)} €</Label>
                <Input type="number" min={0} value={pieces[v] || ''} onChange={e => setPieces({ ...pieces, [v]: +e.target.value })} className="h-8 text-sm" />
                <span className="w-20 text-right text-xs tabular-nums text-muted-foreground">{fmtEur(v * (pieces[v] || 0))}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Carte bancaire</Label>
            <Input type="number" value={cb || ''} onChange={e => setCb(+e.target.value)} className="h-8" />
          </div>
          <div>
            <Label className="text-xs">Chèques</Label>
            <Input type="number" value={cheques || ''} onChange={e => setCheques(+e.target.value)} className="h-8" />
          </div>
          <div>
            <Label className="text-xs">Solde théorique (livre de caisse)</Label>
            <Input type="number" value={theorique || ''} onChange={e => setTheorique(+e.target.value)} className="h-8" />
          </div>
          <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5">
            <div className="flex justify-between text-xs"><span>Espèces</span><span className="tabular-nums font-mono">{fmtEur(totalEspeces)}</span></div>
            <div className="flex justify-between text-xs"><span>CB + Chèques</span><span className="tabular-nums font-mono">{fmtEur(cb + cheques)}</span></div>
            <div className="flex justify-between text-sm font-semibold border-t pt-1"><span>Solde réel</span><span className="tabular-nums font-mono">{fmtEur(reel)}</span></div>
            <div className={cn('flex items-center justify-between text-sm font-bold rounded p-2 mt-1',
              Math.abs(ecart) < 0.01 ? 'bg-emerald-500/10 text-emerald-700' : 'bg-destructive/10 text-destructive')}>
              <span className="flex items-center gap-1.5">
                {Math.abs(ecart) < 0.01 ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                Écart
              </span>
              <span className="tabular-nums font-mono">{fmtEur(ecart)}</span>
            </div>
          </div>
          <button className="text-xs text-primary hover:underline" onClick={() => addHistorique({
            calculateurId: meta.id, label: meta.label, resume: `Réel ${fmtEur(reel)} / Théo ${fmtEur(theorique)} — Écart ${fmtEur(ecart)}`,
          })}>📌 Enregistrer dans l'historique</button>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground italic mt-3">
        En cas d'écart, l'arrêté du 11/12/2019 impose un PV constatant la situation, signé par le régisseur et l'agent comptable.
      </p>
    </CalculateurShell>
  );
}

// ═════════════════════ RAPPROCHEMENT BANCAIRE ═════════════════════
export function CalcRapprochement() {
  const meta = getCalculateur('rapprochement-bancaire')!;
  const [soldeDFT, setSoldeDFT] = useState(0);
  const [soldeCompta, setSoldeCompta] = useState(0);
  const [chequesEmis, setChequesEmis] = useState(0);
  const [chequesNonEnc, setChequesNonEnc] = useState(0);
  const [virementsEnAttente, setVirementsEnAttente] = useState(0);
  const [autres, setAutres] = useState(0);

  const soldeAjuste = soldeDFT + chequesNonEnc - virementsEnAttente + autres;
  const ecart = soldeAjuste - soldeCompta;
  const conforme = Math.abs(ecart) < 0.01;

  const sample = () => {
    setSoldeDFT(125400); setSoldeCompta(122850); setChequesEmis(8500);
    setChequesNonEnc(2100); setVirementsEnAttente(450); setAutres(-200);
  };

  return (
    <CalculateurShell meta={meta} onLoadSample={sample}>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          {[
            ['Solde DFT (relevé Trésor)', soldeDFT, setSoldeDFT],
            ['Solde C/515100 (Op@le)', soldeCompta, setSoldeCompta],
            ['Chèques émis (info)', chequesEmis, setChequesEmis],
            ['+ Chèques non encaissés', chequesNonEnc, setChequesNonEnc],
            ['− Virements en attente', virementsEnAttente, setVirementsEnAttente],
            ['± Autres écritures en suspens', autres, setAutres],
          ].map(([label, val, set]: any, i) => (
            <div key={i}>
              <Label className="text-xs">{label}</Label>
              <Input type="number" value={val || ''} onChange={e => set(+e.target.value)} className="h-8" />
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5">
            <div className="flex justify-between text-xs"><span>Solde DFT ajusté</span><span className="tabular-nums font-mono">{fmtEur(soldeAjuste)}</span></div>
            <div className="flex justify-between text-xs"><span>Solde Op@le</span><span className="tabular-nums font-mono">{fmtEur(soldeCompta)}</span></div>
            <div className={cn('flex justify-between text-sm font-bold rounded p-2 mt-1',
              conforme ? 'bg-emerald-500/10 text-emerald-700' : 'bg-destructive/10 text-destructive')}>
              <span>Écart résiduel</span>
              <span className="tabular-nums font-mono">{fmtEur(ecart)}</span>
            </div>
            <Badge variant={conforme ? 'default' : 'destructive'} className="w-full justify-center mt-1">
              {conforme ? '✓ Rapprochement équilibré' : '✗ Écart à justifier'}
            </Badge>
          </div>
          <p className="text-[10px] text-muted-foreground italic">
            M9-6 § 4.3.3 : le rapprochement bancaire mensuel est obligatoire. Tout écart non justifié ouvre une recherche
            (471 « Compte d'attente »).
          </p>
        </div>
      </div>
    </CalculateurShell>
  );
}
