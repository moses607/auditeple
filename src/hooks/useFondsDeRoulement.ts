import { useMemo } from 'react';
import {
  BalanceLigne,
  RESSOURCES_STABLES,
  EMPLOIS_STABLES,
  BFR_ACTIF,
  BFR_PASSIF,
  TRESORERIE_ACTIF,
  TRESORERIE_PASSIF,
  CHARGES_DECAISSABLES,
  agreger,
  agregerRegle,
} from '@/config/m96-plan-comptable';

export interface FdrIndicateur {
  feu: 'vert' | 'orange' | 'rouge';
  valeur: number;
  label: string;
  unite: string;
  detail: string;
}

export interface FdrResult {
  // Agrégats
  ressourcesStables: number;
  emploisStables: number;
  fdr: number;
  bfrActif: number;
  bfrPassif: number;
  bfr: number;
  tresorerieActif: number;
  tresoreriePassif: number;
  tresorerie: number;

  // Détails par poste (pour tableau synoptique)
  detailRessources: Record<string, { montant: number; lignes: BalanceLigne[] }>;
  detailEmplois: Record<string, { montant: number; lignes: BalanceLigne[] }>;
  detailBfrActif: Record<string, { montant: number; lignes: BalanceLigne[] }>;
  detailBfrPassif: Record<string, { montant: number; lignes: BalanceLigne[] }>;
  detailTresoActif: Record<string, { montant: number; lignes: BalanceLigne[] }>;
  detailTresoPassif: Record<string, { montant: number; lignes: BalanceLigne[] }>;

  // Contrôle d'identité
  ecartIdentite: number;       // FdR - BFR - Trésorerie
  identiteRespectee: boolean;  // |ecart| < 0.01

  // Charges & seuils
  chargesAnnuelles: number;
  chargesParJour: number;       // C / nbJours
  seuilPlancher: number;        // 30 j × chargesParJour
  reservesAffectees: number;    // C/1068 si présent
  fdrMobilisable: number;       // FdR - seuilPlancher - reservesAffectees

  // Prélèvement
  pfrMontant: number;
  fdrMobilisableApres: number;
  rongeSurPlancher: boolean;

  // Indicateurs M9-6 (4 feux)
  indTresorerie: FdrIndicateur;
  indFdrMobilisable: FdrIndicateur;
  indAutonomie: FdrIndicateur;
  indCoherenceDettes: FdrIndicateur;
}

const fmtMois = (j: number) => (j / 30).toFixed(1).replace('.', ',');

export interface UseFdrParams {
  balance: BalanceLigne[];
  pfrMontant: number;
  nbJoursPeriode: number; // ex: 365 si exercice complet
  chargesParJourManuel?: number; // override si fourni
  pfrAnterieursTotal?: number;   // somme des prélèvements déjà décidés/engagés (mémoire)
}

export function useFondsDeRoulement(params: UseFdrParams): FdrResult {
  const { balance, pfrMontant, nbJoursPeriode, chargesParJourManuel, pfrAnterieursTotal = 0 } = params;

  return useMemo(() => {
    // Agrégats
    const r = agreger(balance, RESSOURCES_STABLES);
    const e = agreger(balance, EMPLOIS_STABLES);
    // Emplois stables : brut moins amortissements/dépréciations
    const emploisNets = (e.detail.immoIncorp?.montant ?? 0)
      + (e.detail.immoCorp?.montant ?? 0)
      + (e.detail.immoFin?.montant ?? 0)
      - (e.detail.amortissements?.montant ?? 0)
      - (e.detail.deprImmos?.montant ?? 0);

    const ressourcesStables = r.total;
    const fdr = ressourcesStables - emploisNets;

    const bfrA = agreger(balance, BFR_ACTIF);
    const bfrP = agreger(balance, BFR_PASSIF);
    // BFR actif net : stocks - dépréciations + créances - dépréciations créances
    const bfrActif = (bfrA.detail.stocks?.montant ?? 0)
      - (bfrA.detail.deprStocks?.montant ?? 0)
      + (bfrA.detail.creancesFam?.montant ?? 0)
      - (bfrA.detail.deprCreances?.montant ?? 0)
      + (bfrA.detail.creancesEtat?.montant ?? 0)
      + (bfrA.detail.creancesDiv?.montant ?? 0)
      + (bfrA.detail.transitActif?.montant ?? 0);
    const bfrPassif = bfrP.total;
    const bfr = bfrActif - bfrPassif;

    const tA = agreger(balance, TRESORERIE_ACTIF);
    const tP = agreger(balance, TRESORERIE_PASSIF);
    const tresorerie = tA.total - tP.total;

    const ecartIdentite = fdr - bfr - tresorerie;
    const identiteRespectee = Math.abs(ecartIdentite) < 0.01;

    // Charges décaissables : mouvements DÉBIT période
    const chargesAnnuelles = agregerRegle(balance, CHARGES_DECAISSABLES, true);
    const chargesParJour = chargesParJourManuel && chargesParJourManuel > 0
      ? chargesParJourManuel
      : (nbJoursPeriode > 0 ? chargesAnnuelles / nbJoursPeriode : 0);

    const seuilPlancher = chargesParJour * 30;

    // Réserves affectées = C/1068 si identifiable (sinon 0)
    const reservesAffectees = balance
      .filter(l => l.compte.startsWith('1068'))
      .reduce((s, l) => s + Math.max(0, l.sCred - l.sDeb), 0);

    const fdrMobilisable = fdr - seuilPlancher - reservesAffectees - pfrAnterieursTotal;
    const fdrMobilisableApres = fdrMobilisable - pfrMontant;
    const rongeSurPlancher = (fdr - pfrAnterieursTotal - pfrMontant) < seuilPlancher;

    // Dettes classe 4 créditrices (pour ratio)
    const dettes4 = balance
      .filter(l => /^4/.test(l.compte))
      .reduce((s, l) => s + Math.max(0, l.sCred - l.sDeb), 0);

    // ─── Feux M9-6 ───
    const moisTreso = chargesParJour > 0 ? tresorerie / (chargesParJour * 30) : 0;
    const indTresorerie: FdrIndicateur = {
      label: 'Trésorerie nette',
      unite: 'mois de charges',
      valeur: tresorerie,
      detail: chargesParJour > 0 ? `${fmtMois(tresorerie / chargesParJour)} mois` : '—',
      feu: moisTreso >= 2 ? 'vert' : moisTreso >= 1 ? 'orange' : 'rouge',
    };

    const indFdrMobilisable: FdrIndicateur = {
      label: 'FdR mobilisable',
      unite: '€',
      valeur: fdrMobilisable,
      detail: fdr > 0 ? `${((fdrMobilisable / fdr) * 100).toFixed(1)} % du FdR` : '—',
      feu: fdrMobilisable > 0 ? 'vert' : fdrMobilisable > -0.05 * Math.abs(fdr) ? 'orange' : 'rouge',
    };

    const autonomieJours = chargesParJour > 0 ? fdrMobilisable / chargesParJour : 0;
    const indAutonomie: FdrIndicateur = {
      label: 'Autonomie financière',
      unite: 'jours',
      valeur: autonomieJours,
      detail: `${Math.round(autonomieJours)} jours`,
      feu: autonomieJours >= 60 ? 'vert' : autonomieJours >= 30 ? 'orange' : 'rouge',
    };

    const ratio = bfr !== 0 ? Math.abs(dettes4) / Math.abs(bfr) : 0;
    const indCoherenceDettes: FdrIndicateur = {
      label: 'Cohérence dettes / BFR',
      unite: 'ratio',
      valeur: ratio,
      detail: ratio > 0 ? `${ratio.toFixed(2)}x` : '—',
      feu: ratio >= 0.9 && ratio <= 1.1 ? 'vert'
        : (ratio >= 0.7 && ratio < 0.9) || (ratio > 1.1 && ratio <= 1.3) ? 'orange'
        : 'rouge',
    };

    return {
      ressourcesStables,
      emploisStables: emploisNets,
      fdr,
      bfrActif,
      bfrPassif,
      bfr,
      tresorerieActif: tA.total,
      tresoreriePassif: tP.total,
      tresorerie,
      detailRessources: r.detail,
      detailEmplois: e.detail,
      detailBfrActif: bfrA.detail,
      detailBfrPassif: bfrP.detail,
      detailTresoActif: tA.detail,
      detailTresoPassif: tP.detail,
      ecartIdentite,
      identiteRespectee,
      chargesAnnuelles,
      chargesParJour,
      seuilPlancher,
      reservesAffectees,
      fdrMobilisable,
      pfrMontant,
      fdrMobilisableApres,
      rongeSurPlancher,
      indTresorerie,
      indFdrMobilisable,
      indAutonomie,
      indCoherenceDettes,
    };
  }, [balance, pfrMontant, nbJoursPeriode, chargesParJourManuel]);
}

// ─── Utilitaires de formatage ───
const fmtFR = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
export const fmtEur = (n: number) => fmtFR.format(n || 0);

// ─── Génération de l'avis motivé ───
export function genererAvisMotive(r: FdrResult, etablissement: string, periode: string): string {
  const feux = [r.indTresorerie, r.indFdrMobilisable, r.indAutonomie, r.indCoherenceDettes];
  const nbRouges = feux.filter(f => f.feu === 'rouge').length;
  const nbOranges = feux.filter(f => f.feu === 'orange').length;

  const moisTreso = r.chargesParJour > 0 ? (r.tresorerie / (r.chargesParJour * 30)).toFixed(1).replace('.', ',') : '—';
  const jours = Math.round(r.indAutonomie.valeur);
  const fdrMob = fmtEur(r.fdrMobilisable);
  const treso = fmtEur(r.tresorerie);
  const dettes4 = balanceDettes4Display(r);
  const bfr = fmtEur(r.bfr);

  const enTete = `Au vu de la situation bilancielle de l'établissement ${etablissement} à la clôture de la période ${periode}, l'agent comptable `;
  const piedDePage = `\n\nAvis rendu en application de l'article R. 421-69 du Code de l'éducation et de l'instruction codificatrice M9-6.`;

  // Cas favorable
  if (nbRouges === 0 && nbOranges === 0) {
    return enTete + `émet un avis FAVORABLE SANS RÉSERVE au prélèvement sur fonds de roulement proposé d'un montant de ${fmtEur(r.pfrMontant)}. ` +
      `La trésorerie, d'un montant de ${treso}, représente ${moisTreso} mois de charges décaissables. ` +
      `Le fonds de roulement mobilisable, établi à ${fdrMob}, demeure supérieur au seuil prudentiel après prélèvement. ` +
      `L'autonomie financière s'établit à ${jours} jours, au-delà du seuil recommandé de 60 jours par l'instruction M9-6. ` +
      `Enfin, la cohérence entre les dettes de la classe 4 (${dettes4}) et le besoin en fonds de roulement (${bfr}) confirme une structure bilancielle saine.` +
      piedDePage;
  }

  // Avis défavorable (≥ 2 rouges OU rouge sur trésorerie/FdR mobilisable)
  const rougeBlocant = r.indTresorerie.feu === 'rouge' || r.indFdrMobilisable.feu === 'rouge';
  if (nbRouges >= 2 || rougeBlocant) {
    const motifs: string[] = [];
    if (r.indTresorerie.feu === 'rouge') motifs.push(`la trésorerie ne représente que ${moisTreso} mois de charges (seuil critique : 1 mois)`);
    if (r.indFdrMobilisable.feu === 'rouge') motifs.push(`le fonds de roulement mobilisable est négatif (${fdrMob})`);
    if (r.indAutonomie.feu === 'rouge') motifs.push(`l'autonomie financière n'est que de ${jours} jours (seuil M9-6 : 30 jours)`);
    if (r.indCoherenceDettes.feu === 'rouge') motifs.push(`la cohérence dettes/BFR est rompue (ratio ${r.indCoherenceDettes.detail})`);
    return enTete + `émet un avis DÉFAVORABLE motivé au prélèvement sur fonds de roulement proposé d'un montant de ${fmtEur(r.pfrMontant)}. ` +
      `Les motifs sont les suivants : ${motifs.join(' ; ')}. ` +
      `Il est en conséquence recommandé de surseoir au prélèvement, ou à tout le moins de le réduire significativement, afin de préserver l'équilibre bilanciel et la capacité de l'établissement à honorer ses engagements courants.` +
      piedDePage;
  }

  // Avis favorable avec réserves
  const reserves: string[] = [];
  feux.forEach(f => {
    if (f.feu === 'orange') reserves.push(`${f.label.toLowerCase()} en zone de vigilance (${f.detail})`);
    if (f.feu === 'rouge')  reserves.push(`${f.label.toLowerCase()} en zone critique (${f.detail})`);
  });
  return enTete + `émet un avis FAVORABLE AVEC RÉSERVES au prélèvement sur fonds de roulement proposé d'un montant de ${fmtEur(r.pfrMontant)}. ` +
    `Les réserves portent sur les points suivants : ${reserves.join(' ; ')}. ` +
    `Un suivi renforcé de la trésorerie et du besoin en fonds de roulement est recommandé sur les exercices à venir.` +
    piedDePage;
}

function balanceDettes4Display(_r: FdrResult): string {
  // approximation pour le rendu : on réutilise indCoherenceDettes (ratio × BFR)
  // mais on préfère afficher le BFR passif comme proxy lisible
  return fmtEur(_r.bfrPassif);
}
