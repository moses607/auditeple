/**
 * Plan d'Action — Moteur de règles métier extensible
 *
 * Génère automatiquement les actions correctives à partir :
 *   1. de la cartographie des risques (criticité ≥ Moyenne, score ≥ 20)
 *   2. des anomalies détectées dans les PV d'audit (mineures et majeures)
 *
 * Réf. : M9-6, Décret GBCP 2012-1246, Code de l'éducation, CCP.
 *
 * Le moteur est extensible : `LIBRARY_REGLES` peut être enrichie par l'AC via
 * l'interface (table miroir `regles_plan_action_custom` en localStorage).
 */
import { CartoRisque } from './types';
import { loadState, saveState } from './store';

// ════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════

export type CriticiteAction = 'critique' | 'majeure' | 'moyenne' | 'faible';
export type StatutAction = 'a_faire' | 'en_cours' | 'fait' | 'abandonne' | 'archive';
export type OrigineAction = 'risque' | 'audit' | 'regle' | 'manuelle';

export interface ActionPlan {
  id: string;
  origine: OrigineAction;
  origineRef: string;        // ex : `risque:abc-123`, `audit:xyz/point:5`, `regle:R07`
  origineLabel: string;      // libellé lisible : "Risque cartographié — Recouvrement"
  libelle: string;
  description?: string;
  criticite: CriticiteAction;
  responsable: string;       // depuis table `agents`
  responsableRole?: string;  // ex : 'agent_comptable', 'ordonnateur'
  echeance: string;          // YYYY-MM-DD
  statut: StatutAction;
  reference: string;         // M9-6, GBCP art X, etc.
  cycle?: string;            // Recettes / Dépenses / Trésorerie / RH / CICF / Régies
  commentaires: string;
  createdAt: string;
  updatedAt: string;
  alerteEnvoyee?: string;    // YYYY-MM-DD : date du dernier mail J-15
}

export interface RegleMetier {
  code: string;              // R01, R02…
  libelle: string;           // Condition métier
  action: string;            // Texte de l'action
  reference: string;
  criticite: CriticiteAction;
  responsableRole: string;   // 'agent_comptable' | 'ordonnateur' | 'sg' | 'regisseur'
  cycle: string;
  detection: (ctx: PlanActionContext) => boolean;
  custom?: boolean;
}

export interface PlanActionContext {
  risques: CartoRisque[];
  rapprochementBancaireDateLast?: string;       // YYYY-MM-DD
  fondsSociauxDelibCA?: boolean;
  arreteRegieAJour?: boolean;
  pvCaisseRegieDateLast?: string;
  organigrammeDateLast?: string;
  lettrage411AJour?: boolean;
  dgpDepasseMandats?: number;
  soldesAnormaux?: string[];                    // ex : ['C/411 créditeur', 'C/47 non soldé']
  achatsRepetitifsFournisseur?: { fournisseur: string; montant: number }[];
  modalitesFseFormalisees?: boolean;
  comptesAttentePerimees?: string[];
  signatureDelegationsAJour?: boolean;
  inventaireAnnuelFait?: boolean;
  tauxRecouvrement411?: number;                 // %
  bourses_versees_a_temps?: boolean;
  controleInterneSupervision2?: boolean;
  rapportAcAnnuelTransmis?: boolean;
  rattachementChargesProduitsClos?: boolean;
  marchesReconductionsRevues?: boolean;
}

// ════════════════════════════════════════════════════════════════════
// CALCUL ÉCHÉANCE
// ════════════════════════════════════════════════════════════════════

export function calculerEcheance(criticite: CriticiteAction, base = new Date()): string {
  const d = new Date(base);
  const mois = criticite === 'critique' ? 1 : criticite === 'majeure' ? 3 : criticite === 'moyenne' ? 6 : 12;
  d.setMonth(d.getMonth() + mois);
  return d.toISOString().slice(0, 10);
}

export function criticiteFromScore(score: number): CriticiteAction {
  if (score >= 40) return 'critique';
  if (score >= 27) return 'majeure';
  if (score >= 20) return 'moyenne';
  return 'faible';
}

// ════════════════════════════════════════════════════════════════════
// BIBLIOTHÈQUE — 20 RÈGLES MÉTIER M9-6 / GBCP / Code éducation
// ════════════════════════════════════════════════════════════════════

export const LIBRARY_REGLES: RegleMetier[] = [
  {
    code: 'R01',
    libelle: 'Absence de délibération du CA sur les modalités d\'attribution des fonds sociaux',
    action: 'Faire voter en CA les modalités d\'attribution des fonds sociaux. Sans cette délibération, l\'agent comptable ne peut valablement payer les aides.',
    reference: 'Code éducation art. R421-20 + Circulaire 2017-122',
    criticite: 'critique',
    responsableRole: 'ordonnateur',
    cycle: 'Aides sociales',
    detection: ctx => ctx.fondsSociauxDelibCA === false,
  },
  {
    code: 'R02',
    libelle: 'Absence d\'arrêté de régie à jour',
    action: 'Prendre/actualiser l\'arrêté constitutif de la régie et le transmettre au comptable assignataire.',
    reference: 'Décret 2019-798 + GBCP art. 22',
    criticite: 'majeure',
    responsableRole: 'ordonnateur',
    cycle: 'Régies',
    detection: ctx => ctx.arreteRegieAJour === false,
  },
  {
    code: 'R03',
    libelle: 'Rapprochement bancaire non effectué depuis plus de 30 jours',
    action: 'Procéder au rapprochement bancaire du mois, justifier les écarts, viser l\'état.',
    reference: 'M9-6 § 3.4 — Trésorerie',
    criticite: 'majeure',
    responsableRole: 'agent_comptable',
    cycle: 'Trésorerie',
    detection: ctx => {
      if (!ctx.rapprochementBancaireDateLast) return true;
      const diff = (Date.now() - new Date(ctx.rapprochementBancaireDateLast).getTime()) / 86400000;
      return diff > 30;
    },
  },
  {
    code: 'R04',
    libelle: 'Soldes anormaux détectés en balance (C/411 créditeur, C/515 créditeur, C/47 non soldé…)',
    action: 'Analyser et corriger les soldes anormaux identifiés, justifier chaque écart en commentaire de balance.',
    reference: 'M9-6 § 4.2 — Contrôles comptables quotidiens',
    criticite: 'majeure',
    responsableRole: 'agent_comptable',
    cycle: 'Comptabilité',
    detection: ctx => (ctx.soldesAnormaux?.length ?? 0) > 0,
  },
  {
    code: 'R05',
    libelle: 'Délai global de paiement dépassé sur plusieurs mandats',
    action: 'Analyser les causes de dépassement du DGP, prévoir le paiement des intérêts moratoires (décret 2013-269).',
    reference: 'Décret 2013-269 + CCP art. R2192-10',
    criticite: 'majeure',
    responsableRole: 'agent_comptable',
    cycle: 'Dépenses',
    detection: ctx => (ctx.dgpDepasseMandats ?? 0) > 0,
  },
  {
    code: 'R06',
    libelle: 'Absence de PV de caisse récent pour une régie',
    action: 'Réaliser un contrôle inopiné de la régie et établir le PV de caisse contradictoire.',
    reference: 'GBCP art. 22 + Décret 2019-798 art. 13',
    criticite: 'majeure',
    responsableRole: 'agent_comptable',
    cycle: 'Régies',
    detection: ctx => {
      if (!ctx.pvCaisseRegieDateLast) return true;
      const diff = (Date.now() - new Date(ctx.pvCaisseRegieDateLast).getTime()) / 86400000;
      return diff > 180;
    },
  },
  {
    code: 'R07',
    libelle: 'Modalités de fonctionnement du FSE / fonds sociaux non formalisées',
    action: 'Formaliser les modalités de fonctionnement dans une commission fonds sociaux et faire délibérer le CA.',
    reference: 'Circulaire 2017-122 + Code éducation R421-20',
    criticite: 'majeure',
    responsableRole: 'sg',
    cycle: 'Aides sociales',
    detection: ctx => ctx.modalitesFseFormalisees === false,
  },
  {
    code: 'R08',
    libelle: 'Commande publique : achats répétés chez un même fournisseur dépassant les seuils',
    action: 'Mettre en place un marché formalisé — risque de saucissonnage caractérisé. Vérifier les seuils 2026 (40k€ HT travaux/fournitures, 143k€ HT pour collectivités).',
    reference: 'CCP art. R2122-8 + Décret 2025-XXX seuils 2026',
    criticite: 'critique',
    responsableRole: 'ordonnateur',
    cycle: 'Commande publique',
    detection: ctx => (ctx.achatsRepetitifsFournisseur?.some(f => f.montant > 40000) ?? false),
  },
  {
    code: 'R09',
    libelle: 'Absence de lettrage C/411 à jour',
    action: 'Procéder au lettrage des comptes familles, identifier les impayés et engager les relances graduées.',
    reference: 'M9-6 § 4.5 — Recouvrement',
    criticite: 'moyenne',
    responsableRole: 'agent_comptable',
    cycle: 'Recettes',
    detection: ctx => ctx.lettrage411AJour === false,
  },
  {
    code: 'R10',
    libelle: 'Organigramme fonctionnel non à jour',
    action: 'Mettre à jour l\'organigramme fonctionnel CICF en lien avec les paramètres agents et le faire viser par l\'AC.',
    reference: 'M9-6 § 2 — Organisation comptable + GBCP art. 215',
    criticite: 'moyenne',
    responsableRole: 'agent_comptable',
    cycle: 'CICF',
    detection: ctx => {
      if (!ctx.organigrammeDateLast) return true;
      const diff = (Date.now() - new Date(ctx.organigrammeDateLast).getTime()) / 86400000;
      return diff > 365;
    },
  },
  {
    code: 'R11',
    libelle: 'Comptes d\'attente non apurés en fin d\'exercice (C/471, C/472, C/473, C/486)',
    action: 'Apurer les comptes d\'attente, justifier les soldes restants par pièce et inscrire les régularisations sur l\'exercice.',
    reference: 'M9-6 § 4.2.3 + GBCP art. 65',
    criticite: 'majeure',
    responsableRole: 'agent_comptable',
    cycle: 'Comptabilité',
    detection: ctx => (ctx.comptesAttentePerimees?.length ?? 0) > 0,
  },
  {
    code: 'R12',
    libelle: 'Délégations de signature non à jour pour la rentrée',
    action: 'Renouveler les arrêtés de délégation de signature de l\'ordonnateur et de l\'AC, les transmettre aux services concernés.',
    reference: 'GBCP art. 10 + Code éducation R421-13',
    criticite: 'majeure',
    responsableRole: 'ordonnateur',
    cycle: 'CICF',
    detection: ctx => ctx.signatureDelegationsAJour === false,
  },
  {
    code: 'R13',
    libelle: 'Inventaire physique annuel non réalisé',
    action: 'Procéder à l\'inventaire physique des immobilisations et des stocks, rapprocher avec la comptabilité, ajuster.',
    reference: 'M9-6 § 4.6 — Inventaire + GBCP art. 53',
    criticite: 'majeure',
    responsableRole: 'sg',
    cycle: 'Comptabilité',
    detection: ctx => ctx.inventaireAnnuelFait === false,
  },
  {
    code: 'R14',
    libelle: 'Taux de recouvrement C/411 inférieur à 90%',
    action: 'Renforcer la procédure de recouvrement : relances, mise en demeure, OTI à transmettre à l\'huissier des finances publiques.',
    reference: 'M9-6 § 4.5.3 — Recouvrement',
    criticite: 'majeure',
    responsableRole: 'agent_comptable',
    cycle: 'Recettes',
    detection: ctx => (ctx.tauxRecouvrement411 ?? 100) < 90,
  },
  {
    code: 'R15',
    libelle: 'Bourses non versées dans les délais réglementaires',
    action: 'Procéder à la régularisation des bourses, vérifier les listes de bénéficiaires (TS) avec le rectorat.',
    reference: 'Code éducation D531-1 et suivants',
    criticite: 'majeure',
    responsableRole: 'agent_comptable',
    cycle: 'Aides sociales',
    detection: ctx => ctx.bourses_versees_a_temps === false,
  },
  {
    code: 'R16',
    libelle: 'Supervision de 2ᵉ niveau du contrôle interne non assurée',
    action: 'Mettre en place la supervision documentée de 2ᵉ niveau (revue par l\'AC des contrôles de 1ᵉʳ niveau).',
    reference: 'M9-6 § 2.3 — CICF',
    criticite: 'moyenne',
    responsableRole: 'agent_comptable',
    cycle: 'CICF',
    detection: ctx => ctx.controleInterneSupervision2 === false,
  },
  {
    code: 'R17',
    libelle: 'Rapport annuel de l\'agent comptable non transmis aux autorités',
    action: 'Établir et transmettre le rapport annuel de l\'AC au conseil d\'administration et au rectorat.',
    reference: 'GBCP art. 215 + Code éducation R421-77',
    criticite: 'majeure',
    responsableRole: 'agent_comptable',
    cycle: 'CICF',
    detection: ctx => ctx.rapportAcAnnuelTransmis === false,
  },
  {
    code: 'R18',
    libelle: 'Rattachement charges/produits non clôturé en fin d\'exercice',
    action: 'Procéder aux opérations de rattachement (PCA / CCA), constater les produits à recevoir et charges à payer.',
    reference: 'M9-6 § 4.4 — Opérations d\'inventaire + GBCP art. 65',
    criticite: 'majeure',
    responsableRole: 'agent_comptable',
    cycle: 'Comptabilité',
    detection: ctx => ctx.rattachementChargesProduitsClos === false,
  },
  {
    code: 'R19',
    libelle: 'Reconductions de marchés non revues avant échéance',
    action: 'Recenser les marchés en cours, statuer sur les reconductions, anticiper les nouvelles consultations.',
    reference: 'CCP art. R2112-4 + R2122-8',
    criticite: 'moyenne',
    responsableRole: 'ordonnateur',
    cycle: 'Commande publique',
    detection: ctx => ctx.marchesReconductionsRevues === false,
  },
  {
    code: 'R20',
    libelle: 'Risque cartographié de criticité ≥ Moyenne sans action associée',
    action: 'Définir le plan de traitement du risque (mitigation, transfert, acceptation) et formaliser l\'action corrective.',
    reference: 'M9-6 § 2.2 — Cartographie des risques',
    criticite: 'moyenne',
    responsableRole: 'agent_comptable',
    cycle: 'CICF',
    detection: ctx => ctx.risques.some(r => r.probabilite * r.impact * r.maitrise >= 20 && !r.action),
  },
];

// ════════════════════════════════════════════════════════════════════
// MOTEUR DE GÉNÉRATION
// ════════════════════════════════════════════════════════════════════

const STORAGE_KEY = 'plan_action_v2';
const REGLES_CUSTOM_KEY = 'plan_action_regles_custom';

export function loadActions(): ActionPlan[] {
  return loadState<ActionPlan[]>(STORAGE_KEY, []);
}

export function saveActions(actions: ActionPlan[]): void {
  saveState(STORAGE_KEY, actions);
}

export function loadReglesCustom(): RegleMetier[] {
  return loadState<RegleMetier[]>(REGLES_CUSTOM_KEY, []).map(r => ({
    ...r,
    custom: true,
    detection: () => false, // les règles custom sont déclenchables manuellement uniquement
  }));
}

export function saveReglesCustom(regles: RegleMetier[]): void {
  saveState(REGLES_CUSTOM_KEY, regles.map(({ detection, ...rest }) => rest as any));
}

export function getAllRegles(): RegleMetier[] {
  return [...LIBRARY_REGLES, ...loadReglesCustom()];
}

/**
 * Génère les actions à partir du contexte + cartographie + anomalies PV.
 * Idempotent : ne duplique pas une action déjà existante (clé sur origineRef).
 */
export function genererActions(
  ctx: PlanActionContext,
  pvAnomalies: { auditId: string; pointId: string; libelle: string; severity: 'mineure' | 'majeure'; cycle?: string }[] = [],
  existing: ActionPlan[] = loadActions(),
): ActionPlan[] {
  const map = new Map(existing.map(a => [a.origineRef, a]));
  const now = new Date().toISOString();

  // 1) Règles métier
  for (const regle of LIBRARY_REGLES) {
    try {
      if (!regle.detection(ctx)) continue;
    } catch {
      continue;
    }
    const ref = `regle:${regle.code}`;
    if (map.has(ref) && map.get(ref)!.statut !== 'archive') continue;
    map.set(ref, {
      id: crypto.randomUUID(),
      origine: 'regle',
      origineRef: ref,
      origineLabel: `Règle ${regle.code} — ${regle.libelle}`,
      libelle: regle.action,
      criticite: regle.criticite,
      responsable: '',
      responsableRole: regle.responsableRole,
      echeance: calculerEcheance(regle.criticite),
      statut: 'a_faire',
      reference: regle.reference,
      cycle: regle.cycle,
      commentaires: '',
      createdAt: now,
      updatedAt: now,
    });
  }

  // 2) Cartographie des risques — TOUS les risques constatés (peu importe la criticité)
  for (const r of ctx.risques) {
    const score = r.probabilite * r.impact * r.maitrise;
    const crit = criticiteFromScore(score);
    const ref = `risque:${r.id}`;
    const existing = map.get(ref);
    if (existing && existing.statut !== 'archive') {
      // Mise à jour de la criticité si elle a changé
      if (existing.criticite !== crit) {
        existing.criticite = crit;
        existing.updatedAt = now;
      }
      continue;
    }
    map.set(ref, {
      id: crypto.randomUUID(),
      origine: 'risque',
      origineRef: ref,
      origineLabel: `Risque cartographié [${r.processus}] — ${r.risque}`,
      libelle: r.action || `Traiter le risque "${r.risque}" identifié dans le processus ${r.processus}.`,
      description: `Score : ${score} (P=${r.probabilite} × I=${r.impact} × M=${r.maitrise})`,
      criticite: crit,
      responsable: r.responsable || '',
      echeance: r.echeance || calculerEcheance(crit),
      statut: 'a_faire',
      reference: 'M9-6 § 2.2 — Cartographie des risques',
      cycle: r.processus,
      commentaires: '',
      createdAt: now,
      updatedAt: now,
    });
  }

  // 3) Anomalies PV audit
  for (const a of pvAnomalies) {
    const ref = `audit:${a.auditId}/point:${a.pointId}`;
    if (map.has(ref) && map.get(ref)!.statut !== 'archive') continue;
    const crit: CriticiteAction = a.severity === 'majeure' ? 'majeure' : 'moyenne';
    map.set(ref, {
      id: crypto.randomUUID(),
      origine: 'audit',
      origineRef: ref,
      origineLabel: `PV audit — ${a.libelle}`,
      libelle: `Corriger l'anomalie ${a.severity} relevée : "${a.libelle}".`,
      criticite: crit,
      responsable: '',
      echeance: calculerEcheance(crit),
      statut: 'a_faire',
      reference: 'M9-6 — Audit sur place',
      cycle: a.cycle || 'CICF',
      commentaires: '',
      createdAt: now,
      updatedAt: now,
    });
  }

  // 4) Archivage des risques disparus / criticité tombée
  const refsActifs = new Set([
    ...ctx.risques.filter(r => r.probabilite * r.impact * r.maitrise >= 20).map(r => `risque:${r.id}`),
  ]);
  for (const a of map.values()) {
    if (a.origine === 'risque' && a.statut !== 'archive' && a.statut !== 'fait' && !refsActifs.has(a.origineRef)) {
      a.statut = 'archive';
      a.commentaires = (a.commentaires ? a.commentaires + '\n' : '') + `Archivée auto le ${now.slice(0, 10)} — risque retiré ou criticité < Moyenne.`;
      a.updatedAt = now;
    }
  }

  return Array.from(map.values()).sort((x, y) => {
    const orderCrit = { critique: 0, majeure: 1, moyenne: 2, faible: 3 };
    if (orderCrit[x.criticite] !== orderCrit[y.criticite]) return orderCrit[x.criticite] - orderCrit[y.criticite];
    return x.echeance.localeCompare(y.echeance);
  });
}

// ════════════════════════════════════════════════════════════════════
// ALERTES J-15
// ════════════════════════════════════════════════════════════════════

export function getActionsJ15(actions: ActionPlan[] = loadActions()): ActionPlan[] {
  const today = new Date();
  const j15 = new Date(today.getTime() + 15 * 86400000);
  return actions.filter(a => {
    if (a.statut === 'fait' || a.statut === 'abandonne' || a.statut === 'archive') return false;
    if (!a.echeance) return false;
    const ech = new Date(a.echeance);
    return ech <= j15 && ech >= today;
  });
}

export function getActionsEnRetard(actions: ActionPlan[] = loadActions()): ActionPlan[] {
  const today = new Date().toISOString().slice(0, 10);
  return actions.filter(a => a.echeance && a.echeance < today && a.statut !== 'fait' && a.statut !== 'abandonne' && a.statut !== 'archive');
}

export function buildMailtoAlerteJ15(action: ActionPlan, emailResp: string): string {
  const subject = encodeURIComponent(`[Plan d'action CICF] Échéance dans 15 jours — ${action.origineLabel}`);
  const body = encodeURIComponent(
    `Bonjour,\n\n` +
    `Cette action du plan d'action CICF arrive à échéance le ${action.echeance} (dans moins de 15 jours).\n\n` +
    `▶ Action : ${action.libelle}\n` +
    `▶ Origine : ${action.origineLabel}\n` +
    `▶ Criticité : ${action.criticite.toUpperCase()}\n` +
    `▶ Référence : ${action.reference}\n\n` +
    `Merci de mettre à jour le statut dans l'application ou de me notifier des éventuels obstacles.\n\n` +
    `Cordialement,\nL'agent comptable`
  );
  return `mailto:${emailResp}?subject=${subject}&body=${body}`;
}

// ════════════════════════════════════════════════════════════════════
// STATS
// ════════════════════════════════════════════════════════════════════

export interface PlanActionStats {
  total: number;
  parStatut: Record<StatutAction, number>;
  parCriticite: Record<CriticiteAction, number>;
  enRetard: number;
  j15: number;
  tauxAvancement: number;
}

export function computeStats(actions: ActionPlan[] = loadActions()): PlanActionStats {
  const actifs = actions.filter(a => a.statut !== 'archive');
  const parStatut: Record<StatutAction, number> = { a_faire: 0, en_cours: 0, fait: 0, abandonne: 0, archive: 0 };
  const parCriticite: Record<CriticiteAction, number> = { critique: 0, majeure: 0, moyenne: 0, faible: 0 };
  for (const a of actions) {
    parStatut[a.statut]++;
    if (a.statut !== 'archive') parCriticite[a.criticite]++;
  }
  const total = actifs.length;
  const fait = parStatut.fait;
  return {
    total,
    parStatut,
    parCriticite,
    enRetard: getActionsEnRetard(actions).length,
    j15: getActionsJ15(actions).length,
    tauxAvancement: total > 0 ? Math.round((fait / total) * 100) : 0,
  };
}

// ════════════════════════════════════════════════════════════════════
// LIBELLÉS
// ════════════════════════════════════════════════════════════════════

export const STATUT_LABELS: Record<StatutAction, string> = {
  a_faire: 'À faire',
  en_cours: 'En cours',
  fait: 'Fait',
  abandonne: 'Abandonné',
  archive: 'Archivée',
};

export const CRITICITE_LABELS: Record<CriticiteAction, string> = {
  critique: 'Critique',
  majeure: 'Majeure',
  moyenne: 'Moyenne',
  faible: 'Faible',
};

export const CRITICITE_COLORS: Record<CriticiteAction, string> = {
  critique: 'bg-destructive text-destructive-foreground',
  majeure: 'bg-orange-500 text-white',
  moyenne: 'bg-amber-400 text-amber-950',
  faible: 'bg-muted text-muted-foreground',
};
