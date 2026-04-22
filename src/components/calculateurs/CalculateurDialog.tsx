/**
 * CalculateurDialog — wrapper modal réutilisable.
 * Permet de monter n'importe quel calculateur depuis n'importe quelle page métier.
 *
 * Usage :
 *   <CalculateurDialog calculateurId="seuils-ccp" trigger={
 *     <Button variant="outline" size="sm">🧮 Vérifier le seuil</Button>
 *   } />
 */
import { ReactNode, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CALCULATEURS, getCalculateur } from '@/lib/calculateurs';

import { CalcCaisseRegie, CalcRapprochement } from './calc-tresorerie';
import { CalcFondsSocialCantine, CalcFondsSocialEleves, CalcVoyageFamille } from './calc-aides';
import { CalcSeuilsCCP, CalcAmortissements, CalcDBM, CalcDGP } from './calc-cp-compta';
import { CalcDroitsDP, CalcBourses, CalcTaxeApprentissage } from './calc-recettes';
import { CalcSurremDOM, CalcHeuresSup, CalcRatiosBilanciels } from './calc-paie-pilotage';

const REGISTRY: Record<string, () => JSX.Element> = {
  'caisse-regie': CalcCaisseRegie,
  'rapprochement-bancaire': CalcRapprochement,
  'fonds-social-cantine': CalcFondsSocialCantine,
  'fonds-social-eleves': CalcFondsSocialEleves,
  'voyage-famille': CalcVoyageFamille,
  'seuils-ccp': CalcSeuilsCCP,
  'amortissements': CalcAmortissements,
  'dbm': CalcDBM,
  'dgp': CalcDGP,
  'droits-dp': CalcDroitsDP,
  'bourses': CalcBourses,
  'taxe-apprentissage': CalcTaxeApprentissage,
  'surremuneration-dom': CalcSurremDOM,
  'heures-sup': CalcHeuresSup,
  'ratios-bilanciels': CalcRatiosBilanciels,
};

interface Props {
  calculateurId: string;
  trigger: ReactNode;
  /** Contexte d'appel (nom du module appelant) — pour l'historique */
  contexte?: string;
}

export function CalculateurDialog({ calculateurId, trigger, contexte }: Props) {
  const [open, setOpen] = useState(false);
  const meta = getCalculateur(calculateurId);
  const Comp = REGISTRY[calculateurId];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <span onClick={() => setOpen(true)} className="inline-flex">{trigger}</span>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">
            🧮 {meta?.label ?? 'Calculateur'}
            {contexte && <span className="ml-2 text-xs font-normal text-muted-foreground">— {contexte}</span>}
          </DialogTitle>
        </DialogHeader>
        {meta && Comp ? <Comp /> : (
          <p className="text-sm text-muted-foreground p-4">Calculateur introuvable.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Helper : liste tous les calculateurs disponibles (utile pour menus) */
export const ALL_CALCULATEURS = CALCULATEURS;
