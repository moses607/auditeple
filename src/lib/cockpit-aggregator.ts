/**
 * Cockpit Aggregator — Moteur d'agrégation centralisé pour le Tableau de Bord intelligent.
 *
 * Scanne tous les modules (calendrier, vérifications, régies, stocks, voyages, marchés,
 * recouvrement, cartographie, BA…) et remonte les alertes typées par criticité + deadline.
 *
 * Conforme aux référentiels : M9-6, GBCP (décret 2012-1246), Code éducation (R.421-*),
 * Code commande publique (seuils 2026), décret régies 2019-798, RGP (ord. 2022-408).
 */
import { loadState } from './store';
import { getModules } from './audit-modules';
import type { ActiviteCalendrier } from './calendrier-types';
import type { CartoRisque, BudgetAnnexe, CreanceItem } from './types';

export type AlerteSeverity = 'critique' | 'majeur' | 'moyen' | 'info';

export interface CockpitAlerte {
  id: string;
  titre: string;
  description?: string;
  severity: AlerteSeverity;
  source: string;          // ex : "Calendrier", "Régies", "Cartographie"
  reference?: string;      // ex : "M9-6 § 3.2"
  modulePath?: string;     // pour le bouton "Voir"
  deadline?: string;       // ISO date si applicable
  joursRestants?: number;  // < 0 = en retard
  etablissementId?: string;
  metric?: string;         // libre — ex : "Score 60", "+450 €"
}

export interface CockpitSummary {
  scoreConformite: number;      // 0-100
  scoreLetter: 'A' | 'B' | 'C' | 'D' | 'E';
  totalAlertes: number;
  critiques: CockpitAlerte[];
  majeurs: CockpitAlerte[];
  moyens: CockpitAlerte[];
  info: CockpitAlerte[];
  topActions: CockpitAlerte[]; // 3 actions prioritaires
  parModule: Record<string, number>; // moduleId → nb alertes
  derniereMaj: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────
function joursEntre(iso: string): number {
  const target = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

function severityRank(s: AlerteSeverity): number {
  return { critique: 0, majeur: 1, moyen: 2, info: 3 }[s];
}

// ─── Collecteurs par domaine ─────────────────────────────────────────

function fromCalendrier(): CockpitAlerte[] {
  const acts = loadState<ActiviteCalendrier[]>('calendrier_annuel_v1', []);
  const out: CockpitAlerte[] = [];
  acts.forEach(a => {
    if (a.realisee || !a.dateEcheance) return;
    const j = joursEntre(a.dateEcheance);
    if (j < 0) {
      out.push({
        id: `cal-${a.id}`,
        titre: a.titre,
        description: `Échéance dépassée de ${Math.abs(j)} j (${a.categorie})`,
        severity: a.criticite === 'haute' ? 'critique' : 'majeur',
        source: 'Calendrier annuel AC',
        reference: a.reference,
        modulePath: '/calendrier-annuel',
        deadline: a.dateEcheance,
        joursRestants: j,
      });
    } else if (j <= 7) {
      out.push({
        id: `cal-${a.id}`,
        titre: a.titre,
        description: `Échéance dans ${j} j (${a.categorie})`,
        severity: a.criticite === 'haute' ? 'majeur' : 'moyen',
        source: 'Calendrier annuel AC',
        reference: a.reference,
        modulePath: '/calendrier-annuel',
        deadline: a.dateEcheance,
        joursRestants: j,
      });
    } else if (j <= 30 && a.criticite === 'haute') {
      out.push({
        id: `cal-${a.id}`,
        titre: a.titre,
        description: `Échéance dans ${j} j (haute criticité)`,
        severity: 'moyen',
        source: 'Calendrier annuel AC',
        reference: a.reference,
        modulePath: '/calendrier-annuel',
        deadline: a.dateEcheance,
        joursRestants: j,
      });
    }
  });
  return out;
}

function fromCartographie(): CockpitAlerte[] {
  const risques = loadState<CartoRisque[]>('cartographie', []);
  return risques
    .filter(r => r.probabilite * r.impact * r.maitrise >= 40)
    .sort((a, b) => (b.probabilite * b.impact * b.maitrise) - (a.probabilite * a.impact * a.maitrise))
    .slice(0, 10)
    .map(r => {
      const score = r.probabilite * r.impact * r.maitrise;
      return {
        id: `risk-${r.id}`,
        titre: r.risque,
        description: `${r.processus} — score ${score} — Action : ${r.action || 'à définir'}`,
        severity: score >= 64 ? 'critique' : 'majeur',
        source: 'Cartographie des risques',
        reference: 'P × I × M ≥ 40',
        modulePath: '/cartographie',
        metric: `Score ${score}`,
      } as CockpitAlerte;
    });
}

function fromVerificationQuotidienne(): CockpitAlerte[] {
  const checks = loadState<Record<string, boolean>>('verification_checks', {});
  const out: CockpitAlerte[] = [];
  // Critiques absolues : caisse, rapprochement, comptes d'attente, séparation tâches
  const CRITIQUES = [
    { id: 'vq1', label: 'Caisse AC non comptée', ref: 'M9-6 § 3.2.1' },
    { id: 'vq3', label: 'Rapprochement bancaire en retard', ref: 'M9-6 § 3.1.3' },
    { id: 'vq8', label: "Comptes d'attente 47x non soldés", ref: 'M9-6 § 2.4' },
    { id: 'vq11', label: 'Compte 515 non rapproché DFT', ref: 'M9-6 § 3.1' },
    { id: 'vq24', label: 'Séparation des tâches non vérifiée', ref: 'Art. 9 GBCP' },
  ];
  CRITIQUES.forEach(c => {
    if (!checks[c.id]) {
      out.push({
        id: `verif-${c.id}`,
        titre: c.label,
        severity: 'critique',
        source: 'Vérification quotidienne',
        reference: c.ref,
        modulePath: '/verification',
      });
    }
  });
  return out;
}

function fromRegies(): CockpitAlerte[] {
  const ctrl = loadState<any[]>('ctrl_caisse', []);
  const nomination = loadState<any>('regies_nomination', {});
  const acte = loadState<any>('regies_acte_constitutif', {});
  const out: CockpitAlerte[] = [];

  ctrl.forEach((c, i) => {
    if (c.ecart && c.ecart !== 0) {
      out.push({
        id: `regie-ecart-${i}`,
        titre: `Écart de caisse ${c.regisseur || ''}`,
        description: `${c.date} — Théorique ${c.theorique}€ / Réel ${c.reel}€ / Écart ${c.ecart}€`,
        severity: Math.abs(c.ecart) > 10 ? 'critique' : 'majeur',
        source: 'Régies',
        reference: 'Décret 2019-798 — M9-6 § 3.2',
        modulePath: '/regies',
        metric: `${c.ecart > 0 ? '+' : ''}${c.ecart} €`,
      });
    }
  });

  // Cautionnement supprimé par Ord. 2022-408 + Décret 2022-1605 (au 1er janvier 2023).
  // Contrôle remplacé par : indemnité de responsabilité (IR) due si plafond > 1 220 €.
  if (nomination?.plafondEncaisse > 1220 && !nomination?.indemniteResponsabilite) {
    out.push({
      id: 'regie-ir',
      titre: 'Indemnité de responsabilité régisseur non versée (plafond > 1 220 €)',
      severity: 'majeur',
      source: 'Régies',
      reference: 'Arrêté 28/05/1993 modifié — Ord. 2022-408 (RGP)',
      modulePath: '/regies',
    });
  }
  if (!acte?.referenceArrete) {
    out.push({
      id: 'regie-acte',
      titre: 'Acte constitutif régie sans référence',
      severity: 'majeur',
      source: 'Régies',
      reference: 'Décret 2019-798 art. 1',
      modulePath: '/regies',
    });
  }
  return out;
}

function fromStocks(): CockpitAlerte[] {
  const stocks = loadState<any[]>('stocks', []);
  return stocks
    .filter(s => s.ecart && s.ecart !== 0)
    .map((s, i) => ({
      id: `stock-${s.id || i}`,
      titre: `Écart stock : ${s.nom}`,
      description: `Théo ${s.theo} / Phys ${s.phys} / Écart ${s.ecart}`,
      severity: Math.abs(s.ecart) > 5 ? 'majeur' : 'moyen',
      source: 'Stocks denrées',
      reference: 'M9-6 inventaire',
      modulePath: '/stocks',
      metric: `${s.ecart > 0 ? '+' : ''}${s.ecart}`,
    } as CockpitAlerte));
}

function fromRapprochement(): CockpitAlerte[] {
  const rappro = loadState<any[]>('rapprochement', []);
  return rappro
    .filter(r => r.ecart && r.ecart !== 0)
    .map((r, i) => ({
      id: `rappro-${i}`,
      titre: `Écart rapprochement bancaire`,
      description: `${r.date} — DFT ${r.dft}€ / Compta ${r.compta}€`,
      severity: 'critique' as AlerteSeverity,
      source: 'Rapprochement bancaire',
      reference: 'M9-6 § 4.3.3',
      modulePath: '/rapprochement',
      metric: `${r.ecart > 0 ? '+' : ''}${r.ecart} €`,
    }));
}

function fromVoyages(): CockpitAlerte[] {
  const voyages = loadState<any[]>('voyages', []);
  const out: CockpitAlerte[] = [];
  voyages.forEach(v => {
    if (!v.acteCA_programmation) {
      out.push({
        id: `voy-prog-${v.id}`,
        titre: `${v.intitule || 'Voyage'} — Acte CA programmation manquant`,
        severity: 'majeur',
        source: 'Voyages scolaires',
        reference: 'Circ. 2011-117',
        modulePath: '/voyages',
      });
    }
    if (!v.acteCA_financement) {
      out.push({
        id: `voy-fin-${v.id}`,
        titre: `${v.intitule || 'Voyage'} — Acte CA financement manquant`,
        severity: 'majeur',
        source: 'Voyages scolaires',
        reference: 'Circ. 2011-117',
        modulePath: '/voyages',
      });
    }
    if (v.montantTotal > 0) {
      const recettes = (v.montantEncaisseFamilles || 0) + (v.notificationCollectivites ? (v.montantNotifie || 0) : 0);
      const couverture = recettes / v.montantTotal;
      if (couverture < 0.5) {
        out.push({
          id: `voy-risk-${v.id}`,
          titre: `${v.intitule || 'Voyage'} — Risque financier élevé`,
          description: `Couverture ${Math.round(couverture * 100)}% (${recettes}€/${v.montantTotal}€)`,
          severity: 'critique',
          source: 'Voyages scolaires',
          reference: 'Gestion prudentielle',
          modulePath: '/voyages',
          metric: `${Math.round(couverture * 100)}%`,
        });
      }
    }
  });
  return out;
}

function fromRecouvrement(): CockpitAlerte[] {
  const creances = loadState<CreanceItem[]>('creances', []);
  const out: CockpitAlerte[] = [];
  const today = Date.now();
  creances.forEach(c => {
    if (!c.echeance) return;
    const ageJours = Math.floor((today - new Date(c.echeance).getTime()) / 86_400_000);
    // Prescription quadriennale (loi 31/12/1968) — 4 ans = 1461 jours
    if (ageJours > 1461) {
      out.push({
        id: `crea-presc-${c.id}`,
        titre: `Créance prescrite : ${c.debiteur}`,
        description: `Échéance ${c.echeance} — Montant ${c.montant}€`,
        severity: 'critique',
        source: 'Recouvrement',
        reference: 'Loi 31/12/1968 — déchéance quadriennale',
        modulePath: '/recouvrement',
        metric: `${c.montant} €`,
      });
    } else if (ageJours > 1095) {
      out.push({
        id: `crea-alerte-${c.id}`,
        titre: `Créance proche prescription : ${c.debiteur}`,
        description: `Prescription dans ${1461 - ageJours} j`,
        severity: 'majeur',
        source: 'Recouvrement',
        reference: 'Loi 31/12/1968',
        modulePath: '/recouvrement',
      });
    } else if (ageJours > 60 && c.relances < 1) {
      out.push({
        id: `crea-relance-${c.id}`,
        titre: `Créance > 2 mois sans relance : ${c.debiteur}`,
        severity: 'majeur',
        source: 'Recouvrement',
        reference: 'RGP — Ord. 2022-408',
        modulePath: '/recouvrement',
      });
    }
  });
  return out;
}

function fromBudgetsAnnexes(): CockpitAlerte[] {
  const ba = loadState<BudgetAnnexe[]>('budgets_annexes', []);
  const out: CockpitAlerte[] = [];
  ba.forEach(b => {
    if (b.compte185 && Math.abs(b.compte185) > 0.01) {
      out.push({
        id: `ba-185-${b.id}`,
        titre: `BA ${b.nom} — compte 185000 non équilibré`,
        description: `Solde ${b.compte185}€ — doit être à 0 (compensation parfaite)`,
        severity: 'critique',
        source: 'Budgets Annexes',
        reference: 'M9-6 Tome 2 § 2.1.2.3.2 — Planche 16',
        modulePath: '/budgets-annexes',
        metric: `${b.compte185} €`,
      });
    }
    if (b.tauxExecution && b.tauxExecution < 50) {
      out.push({
        id: `ba-exec-${b.id}`,
        titre: `BA ${b.nom} — exécution faible`,
        description: `Taux ${b.tauxExecution}% — sous-consommation`,
        severity: 'moyen',
        source: 'Budgets Annexes',
        modulePath: '/budgets-annexes',
        metric: `${b.tauxExecution}%`,
      });
    }
  });
  return out;
}

function fromSubventions(): CockpitAlerte[] {
  const subv = loadState<any[]>('subventions', []);
  const out: CockpitAlerte[] = [];
  subv.forEach(s => {
    if (!s.dateVersement) return;
    const ans = (Date.now() - new Date(s.dateVersement).getTime()) / 31_557_600_000;
    if (ans >= 4) {
      out.push({
        id: `sub-presc-${s.id}`,
        titre: `Subvention ${s.type} — déchéance quadriennale atteinte`,
        description: `Versée le ${s.dateVersement}`,
        severity: 'critique',
        source: 'Subventions',
        reference: 'Loi 31/12/1968',
        modulePath: '/subventions',
      });
    } else if (ans >= 3) {
      out.push({
        id: `sub-alerte-${s.id}`,
        titre: `Subvention ${s.type} — déchéance < 1 an`,
        severity: 'majeur',
        source: 'Subventions',
        reference: 'Loi 31/12/1968',
        modulePath: '/subventions',
      });
    }
  });
  return out;
}

// ─── Agrégateur principal ────────────────────────────────────────────

const COLLECTORS: Array<() => CockpitAlerte[]> = [
  fromCalendrier,
  fromCartographie,
  fromVerificationQuotidienne,
  fromRegies,
  fromStocks,
  fromRapprochement,
  fromVoyages,
  fromRecouvrement,
  fromBudgetsAnnexes,
  fromSubventions,
];

export function aggregateCockpit(): CockpitSummary {
  const allAlertes: CockpitAlerte[] = [];
  for (const c of COLLECTORS) {
    try {
      allAlertes.push(...c());
    } catch (e) {
      console.warn('cockpit collector failed', e);
    }
  }

  // Tri par criticité puis deadline
  allAlertes.sort((a, b) => {
    const dr = severityRank(a.severity) - severityRank(b.severity);
    if (dr !== 0) return dr;
    if (a.joursRestants != null && b.joursRestants != null) return a.joursRestants - b.joursRestants;
    return 0;
  });

  const critiques = allAlertes.filter(a => a.severity === 'critique');
  const majeurs = allAlertes.filter(a => a.severity === 'majeur');
  const moyens = allAlertes.filter(a => a.severity === 'moyen');
  const info = allAlertes.filter(a => a.severity === 'info');

  // Score = 100 − pénalités. Critique=15, Majeur=6, Moyen=2 (plafonné à 100)
  const penalite = critiques.length * 15 + majeurs.length * 6 + moyens.length * 2;
  const scoreConformite = Math.max(0, 100 - penalite);
  const scoreLetter: CockpitSummary['scoreLetter'] =
    scoreConformite >= 90 ? 'A' :
    scoreConformite >= 75 ? 'B' :
    scoreConformite >= 55 ? 'C' :
    scoreConformite >= 35 ? 'D' : 'E';

  // Top 3 actions = 3 premières alertes (déjà triées)
  const topActions = allAlertes.slice(0, 3);

  // Par module
  const parModule: Record<string, number> = {};
  allAlertes.forEach(a => {
    parModule[a.source] = (parModule[a.source] || 0) + 1;
  });

  return {
    scoreConformite,
    scoreLetter,
    totalAlertes: allAlertes.length,
    critiques,
    majeurs,
    moyens,
    info,
    topActions,
    parModule,
    derniereMaj: new Date().toISOString(),
  };
}

/** Liste des sources connues pour la matrice ER × Processus */
export const COCKPIT_SOURCES = [
  'Calendrier annuel AC',
  'Cartographie des risques',
  'Vérification quotidienne',
  'Régies',
  'Stocks denrées',
  'Rapprochement bancaire',
  'Voyages scolaires',
  'Recouvrement',
  'Budgets Annexes',
  'Subventions',
] as const;
