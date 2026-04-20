/**
 * Parcours d'Audit en 7 étapes — colonne vertébrale de la navigation.
 *
 * Chaque étape regroupe plusieurs modules dans une logique
 * « workflow d'agent comptable » plutôt que par section thématique.
 *
 *  1. PRÉPARER  — Constitution du dossier et de l'équipe
 *  2. CADRER    — Délimitation du périmètre et planification
 *  3. CONTRÔLER — Contrôles sur place (caisse, stocks, régies, etc.)
 *  4. VÉRIFIER  — Vérification des opérations (dépenses, recettes, ordonnateur)
 *  5. ANALYSER  — Analyse financière et cartographie des risques
 *  6. RESTITUER — Production du PV, plan d'action, annexes
 *  7. SUIVRE    — Calendrier, suivi des recommandations, traçabilité
 */

import {
  Briefcase, Compass, Calculator, ClipboardCheck,
  TrendingUp, FileSignature, CalendarClock,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type EtapeId =
  | 'preparer' | 'cadrer' | 'controler'
  | 'verifier' | 'analyser' | 'restituer' | 'suivre';

export interface EtapeParcours {
  id: EtapeId;
  numero: number;
  label: string;
  description: string;
  /** Verbe d'action court pour breadcrumb / titres */
  verbe: string;
  icon: LucideIcon;
  /** Couleur de l'étape (token semantic ou Tailwind) */
  color: string;
  /** IDs de modules (issus de audit-modules.ts) appartenant à l'étape */
  moduleIds: string[];
}

export const PARCOURS_ETAPES: EtapeParcours[] = [
  {
    id: 'preparer',
    numero: 1,
    label: 'Préparer',
    verbe: 'Préparation',
    description: "Constitution du dossier, équipe, organigramme, calendrier annuel.",
    icon: Briefcase,
    color: 'text-section-controle-interne',
    moduleIds: ['parametres', 'calendrier-annuel'],
  },
  {
    id: 'cadrer',
    numero: 2,
    label: 'Cadrer',
    verbe: 'Cadrage',
    description: "Délimitation du périmètre et plan de contrôle. La cartographie des risques est traitée dans le Triptyque CICF.",
    icon: Compass,
    color: 'text-section-controle-interne',
    moduleIds: ['plan-controle'],
  },
  {
    id: 'controler',
    numero: 3,
    label: 'Contrôler',
    verbe: 'Contrôles sur place',
    description: "Caisse, stocks, régies, rapprochement bancaire — opérations physiques.",
    icon: Calculator,
    color: 'text-section-controles',
    moduleIds: ['controle-caisse', 'regies', 'stocks', 'rapprochement', 'restauration'],
  },
  {
    id: 'verifier',
    numero: 4,
    label: 'Vérifier',
    verbe: 'Vérification',
    description: "Vérification des recettes, dépenses, ordonnateur, marchés, voyages, bourses.",
    icon: ClipboardCheck,
    color: 'text-section-verification',
    moduleIds: [
      'verification', 'ordonnateur', 'droits-constates', 'depenses',
      'voyages', 'bourses', 'fonds-sociaux', 'recouvrement', 'marches',
      'subventions', 'budgets-annexes',
    ],
  },
  {
    id: 'analyser',
    numero: 5,
    label: 'Analyser',
    verbe: 'Analyse financière',
    description: "Analyse financière M9-6, fonds de roulement, autonomie, soldes intermédiaires.",
    icon: TrendingUp,
    color: 'text-section-finances',
    moduleIds: ['analyse-financiere', 'fonds-roulement', 'annexe-comptable'],
  },
  {
    id: 'restituer',
    numero: 6,
    label: 'Restituer',
    verbe: 'Restitution',
    description: "PV d'audit (consolidation de tous les items contrôlés), annexe comptable narrative. Le plan d'action figure dans le Triptyque CICF.",
    icon: FileSignature,
    color: 'text-section-restitution',
    moduleIds: ['pv-audit'],
  },
  {
    id: 'suivre',
    numero: 7,
    label: 'Suivre',
    verbe: 'Suivi & traçabilité',
    description: "Piste d'audit, suivi des recommandations, calendrier des prochaines échéances.",
    icon: CalendarClock,
    color: 'text-section-restitution',
    moduleIds: ['piste-audit'],
  },
];

/** Lookup rapide module → étape */
const MODULE_TO_ETAPE = new Map<string, EtapeParcours>();
PARCOURS_ETAPES.forEach(e => e.moduleIds.forEach(mid => MODULE_TO_ETAPE.set(mid, e)));

export function getEtapeForModule(moduleId: string): EtapeParcours | undefined {
  return MODULE_TO_ETAPE.get(moduleId);
}

export function getEtapeById(id: EtapeId): EtapeParcours | undefined {
  return PARCOURS_ETAPES.find(e => e.id === id);
}

/** Modules orphelins (présents dans audit-modules mais pas attachés à une étape) */
export function getOrphanModuleIds(allModuleIds: string[]): string[] {
  return allModuleIds.filter(id => !MODULE_TO_ETAPE.has(id));
}
