import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { loadState, saveState } from '@/lib/store';
import { ModulePageLayout, ModuleSection, ComplianceCheck, AnomalyAlert } from '@/components/ModulePageLayout';
import { MOTIFS_SUSPENSION_GBCP, CONTROLES_AGENT_COMPTABLE, PIECES_JUSTIFICATIVES_DEPENSES, SEUILS_MARCHES_2026 } from '@/lib/regulatory-data';
import { DoctrineEPLE } from '@/components/DoctrineEPLE';

export default function DepensesPage() {
  const [suspensions, setSuspensions] = useState<Record<string, boolean>>(() => loadState('depenses_suspensions_v2', {}));
  const [controles, setControles] = useState<Record<string, boolean>>(() => loadState('depenses_controles_ac', {}));
  const [pieces, setPieces] = useState<Record<string, boolean>>(() => loadState('depenses_pieces_v2', {}));
  const [montantMandat, setMontantMandat] = useState<string>(() => loadState('depenses_montant', ''));
  const [observations, setObservations] = useState<string>(() => loadState('depenses_obs', ''));

  const toggleSuspension = (idx: number) => {
    const updated = { ...suspensions, [idx]: !suspensions[idx] };
    setSuspensions(updated); saveState('depenses_suspensions_v2', updated);
  };
  const toggleControle = (id: string) => {
    const updated = { ...controles, [id]: !controles[id] };
    setControles(updated); saveState('depenses_controles_ac', updated);
  };
  const togglePiece = (id: string) => {
    const updated = { ...pieces, [id]: !pieces[id] };
    setPieces(updated); saveState('depenses_pieces_v2', updated);
  };

  const montant = parseFloat(montantMandat) || 0;
  const seuilAtteint = SEUILS_MARCHES_2026.filter(s => montant >= s.seuil).pop();

  const allChecks = [
    ...CONTROLES_AGENT_COMPTABLE.depenses.map(c => controles[c.id]),
    ...PIECES_JUSTIFICATIVES_DEPENSES.map(p => pieces[p.id]),
    ...MOTIFS_SUSPENSION_GBCP.map((_, i) => suspensions[i]),
  ];
  const completed = allChecks.filter(Boolean).length;
  const total = allChecks.length;

  return (
    <ModulePageLayout
      title="Dépenses"
      section="VÉRIFICATION & ORDONNATEUR"
      description="Contrôle de la validité de la liquidation, vérification des pièces justificatives et motifs de suspension du paiement."
      refs={[
        { code: 'Art. 19 GBCP', label: 'Contrôles de l\'agent comptable' },
        { code: 'Art. 38 GBCP', label: 'Motifs de suspension' },
        { code: 'Arrêté 25/07/2013', label: 'Pièces justificatives' },
        { code: 'Décrets 2025', label: 'Seuils commande publique 2026' },
      ]}
      completedChecks={completed}
      totalChecks={total}
    >
      <DoctrineEPLE theme="depenses" titre="Chaîne de la dépense publique" resume="Engagement → liquidation → DP → paiement, PJ, DGP 30 j" />
      {/* ─── Contrôles de l'agent comptable (art. 19 GBCP) ─── */}
      <ModuleSection
        title="Contrôles de l'agent comptable en matière de dépenses"
        description="Article 19 du décret n°2012-1246 du 7 novembre 2012 (GBCP)"
        badge={`${CONTROLES_AGENT_COMPTABLE.depenses.filter(c => controles[c.id]).length}/${CONTROLES_AGENT_COMPTABLE.depenses.length}`}
      >
        <Card className="shadow-card">
          <CardContent className="p-3 space-y-2">
            {CONTROLES_AGENT_COMPTABLE.depenses.map(item => (
              <ComplianceCheck
                key={item.id}
                label={item.label}
                checked={controles[item.id] || false}
                onChange={() => toggleControle(item.id)}
                severity={item.severity}
                detail={item.ref}
              />
            ))}
          </CardContent>
        </Card>
      </ModuleSection>

      {/* ─── Motifs de suspension (art. 38 GBCP) ─── */}
      <ModuleSection
        title="Motifs de suspension du paiement"
        description="Article 38 du décret n°2012-1246 — Les 5 cas de suspension par l'agent comptable"
      >
        <Card className="shadow-card">
          <CardContent className="p-3 space-y-2">
            {MOTIFS_SUSPENSION_GBCP.map((item, idx) => (
              <ComplianceCheck
                key={idx}
                label={item.motif}
                checked={suspensions[idx] || false}
                onChange={() => toggleSuspension(idx)}
                severity={item.severity}
                detail={`${item.ref} — ${item.detail}`}
              />
            ))}
          </CardContent>
        </Card>
      </ModuleSection>

      {/* ─── Pièces justificatives ─── */}
      <ModuleSection
        title="Vérification des pièces justificatives"
        description="Arrêté du 25 juillet 2013 — Liste des pièces justificatives des dépenses publiques locales"
        badge={`${PIECES_JUSTIFICATIVES_DEPENSES.filter(p => pieces[p.id]).length}/${PIECES_JUSTIFICATIVES_DEPENSES.length}`}
      >
        <Card className="shadow-card">
          <CardContent className="p-3 space-y-2">
            {PIECES_JUSTIFICATIVES_DEPENSES.map(item => (
              <ComplianceCheck
                key={item.id}
                label={item.label}
                checked={pieces[item.id] || false}
                onChange={() => togglePiece(item.id)}
                severity={item.obligatoire ? 'majeur' : 'normal'}
                detail={item.ref}
              />
            ))}
          </CardContent>
        </Card>
      </ModuleSection>

      {/* ─── Seuils commande publique 2026 ─── */}
      <ModuleSection
        title="Contrôle des seuils de commande publique"
        description="Décrets n°2025-1386 et n°2025-1383 du 18 décembre 2025 — Seuils applicables en 2026"
      >
        <Card className="shadow-card">
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Montant de la dépense / du marché (€ HT)</Label>
              <Input
                type="number"
                value={montantMandat}
                onChange={e => { setMontantMandat(e.target.value); saveState('depenses_montant', e.target.value); }}
                placeholder="0.00"
                className="max-w-xs"
              />
            </div>
            {seuilAtteint && (
              <div className={`p-4 rounded-lg border ${montant >= 143_000 ? 'bg-destructive/10 border-destructive' : montant >= 90_000 ? 'bg-orange-50 border-orange-400 dark:bg-orange-950/20' : 'bg-accent/10 border-accent'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5" />
                  <Badge className="text-xs">{seuilAtteint.label}</Badge>
                </div>
                <p className="text-sm">{seuilAtteint.consigne}</p>
                <p className="text-xs text-muted-foreground mt-1 italic">{seuilAtteint.ref}</p>
              </div>
            )}
            <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted/50 rounded-lg">
              {SEUILS_MARCHES_2026.map((s, i) => (
                <p key={i} className={montant >= s.seuil ? 'font-bold text-foreground' : ''}>
                  {s.label} : {s.consigne.split('.')[0]}.
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      </ModuleSection>

      {/* ─── Observations ─── */}
      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-base font-bold">Observations de l'auditeur</CardTitle></CardHeader>
        <CardContent>
          <Textarea
            value={observations}
            onChange={e => { setObservations(e.target.value); saveState('depenses_obs', e.target.value); }}
            placeholder="Constats sur les dépenses vérifiées, anomalies, recommandations..."
            rows={5}
            className="resize-y"
          />
        </CardContent>
      </Card>
    </ModulePageLayout>
  );
}
