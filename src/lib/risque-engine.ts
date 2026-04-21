/**
 * Moteur de réévaluation Audit → Cartographie (Chantier 1).
 *
 * Règles :
 *   • Anomalie majeure (status = 'anomalie_majeure') = +3 pts
 *   • Anomalie mineure (status = 'anomalie_mineure') = +1 pt
 *   • Conforme (status = 'conforme')                 = -1 pt (plafonné à 0)
 *   • Fenêtre glissante : 12 mois pour relèvement, 24 mois pour allègement
 *
 *   Si score ≥ 6 et criticité < 'majeur' → propose 'majeur' (relèvement)
 *   Si score ≥ 12 et criticité < 'critique' → propose 'critique'
 *   Si score = 0 sur 24 mois consécutifs et criticité > 'faible' → propose un cran en-dessous
 */
import { supabase } from '@/integrations/supabase/client';
import { MAPPING_SEED, type MappingSeed } from './mapping-audit-risque-seed';

export type Criticite = 'faible' | 'moyen' | 'majeur' | 'critique';
const ORDRE: Criticite[] = ['faible', 'moyen', 'majeur', 'critique'];

export interface AnomalieAggregee {
  risque_processus: string;
  risque_libelle: string;
  rubrique: string;
  score: number;
  count_majeur: number;
  count_mineur: number;
  count_conforme: number;
  derniers_audits: string[];
}

export interface PropositionAjustement {
  groupement_id: string;
  etablissement_id?: string;
  risque_processus: string;
  risque_libelle: string;
  criticite_actuelle: Criticite;
  criticite_suggeree: Criticite;
  score_anomalies: number;
  motif: 'relevement' | 'allègement';
  source_audit_id: string;
}

/** Charge le mapping (DB + fallback seed). */
export async function loadMapping(groupementId: string): Promise<MappingSeed[]> {
  const { data } = await (supabase as any)
    .from('mapping_audit_risque')
    .select('*')
    .or(`groupement_id.is.null,groupement_id.eq.${groupementId}`);
  if (data && data.length > 0) {
    return data.map((r: any) => ({
      domaine_id: r.domaine_id,
      point_index: r.point_index,
      point_libelle: r.point_libelle,
      risque_processus: r.risque_processus,
      risque_libelle: r.risque_libelle,
      rubrique: r.rubrique,
      ponderation: Number(r.ponderation) || 1,
    }));
  }
  // Fallback : seed in-memory si pas de mapping en DB
  return MAPPING_SEED;
}

/**
 * Initialise le mapping global en DB s'il est vide.
 * Appelé au premier lancement de la cartographie pour un groupement.
 */
export async function ensureMappingSeed(): Promise<void> {
  const { count } = await (supabase as any)
    .from('mapping_audit_risque')
    .select('id', { count: 'exact', head: true })
    .is('groupement_id', null);
  if ((count ?? 0) > 0) return;
  await (supabase as any).from('mapping_audit_risque').insert(
    MAPPING_SEED.map(s => ({ ...s, groupement_id: null }))
  );
}

/**
 * Agrège les résultats de points d'audit sur une période et calcule le score
 * d'anomalies par risque.
 */
export async function aggregerAnomalies(
  groupementId: string,
  periodeMois: number = 12,
): Promise<AnomalieAggregee[]> {
  const since = new Date();
  since.setMonth(since.getMonth() - periodeMois);
  const sinceISO = since.toISOString();

  const mapping = await loadMapping(groupementId);
  const mapKey = (d: string, i: number) => `${d}::${i}`;
  const mapByPoint = new Map(mapping.map(m => [mapKey(m.domaine_id, m.point_index), m]));

  // Audits du groupement
  const { data: audits } = await supabase
    .from('audits')
    .select('id, etablissement_id, date_audit')
    .eq('groupement_id', groupementId)
    .gte('date_audit', sinceISO);
  if (!audits?.length) return [];

  const auditIds = audits.map(a => a.id);
  const { data: results } = await supabase
    .from('audit_points_results')
    .select('audit_id, domaine_id, point_index, status')
    .in('audit_id', auditIds);
  if (!results?.length) return [];

  const agg = new Map<string, AnomalieAggregee>();
  for (const r of results) {
    const m = mapByPoint.get(mapKey(r.domaine_id, r.point_index));
    if (!m) continue;
    const key = `${m.risque_processus}|${m.risque_libelle}`;
    let entry = agg.get(key);
    if (!entry) {
      entry = {
        risque_processus: m.risque_processus,
        risque_libelle: m.risque_libelle,
        rubrique: m.rubrique,
        score: 0, count_majeur: 0, count_mineur: 0, count_conforme: 0,
        derniers_audits: [],
      };
      agg.set(key, entry);
    }
    if (r.status === 'anomalie_majeure') { entry.score += 3 * m.ponderation; entry.count_majeur += 1; }
    else if (r.status === 'anomalie_mineure') { entry.score += 1 * m.ponderation; entry.count_mineur += 1; }
    else if (r.status === 'conforme') { entry.score = Math.max(0, entry.score - 1); entry.count_conforme += 1; }
    if (!entry.derniers_audits.includes(r.audit_id)) entry.derniers_audits.push(r.audit_id);
  }
  return [...agg.values()].sort((a, b) => b.score - a.score);
}

/**
 * Compare aux criticités déclarées dans la cartographie (LocalStorage `cartographie`).
 * Génère des propositions d'ajustement et les enregistre en DB.
 */
export async function genererAjustements(
  groupementId: string,
  cartographieDeclaree: { processus: string; risque: string; probabilite: number; impact: number; maitrise: number }[],
  sourceAuditId: string,
): Promise<PropositionAjustement[]> {
  const aggs = await aggregerAnomalies(groupementId, 12);
  const propositions: PropositionAjustement[] = [];

  const niveauFromNote = (n: number): Criticite => {
    if (n >= 40) return 'critique';
    if (n >= 20) return 'majeur';
    if (n >= 10) return 'moyen';
    return 'faible';
  };

  for (const agg of aggs) {
    // Cherche le risque déclaré par libellé (fuzzy)
    const decl = cartographieDeclaree.find(c =>
      c.risque?.toLowerCase().includes(agg.risque_libelle.toLowerCase().slice(0, 20)) ||
      agg.risque_libelle.toLowerCase().includes(c.risque?.toLowerCase().slice(0, 20) ?? ''),
    );
    const noteDecl = decl ? decl.probabilite * decl.impact * decl.maitrise : 10;
    const critActuelle = niveauFromNote(noteDecl);
    const idxActuel = ORDRE.indexOf(critActuelle);

    // Relèvement
    if (agg.score >= 12 && critActuelle !== 'critique') {
      propositions.push({
        groupement_id: groupementId,
        risque_processus: agg.risque_processus,
        risque_libelle: agg.risque_libelle,
        criticite_actuelle: critActuelle,
        criticite_suggeree: 'critique',
        score_anomalies: agg.score,
        motif: 'relevement',
        source_audit_id: sourceAuditId,
      });
    } else if (agg.score >= 6 && idxActuel < ORDRE.indexOf('majeur')) {
      propositions.push({
        groupement_id: groupementId,
        risque_processus: agg.risque_processus,
        risque_libelle: agg.risque_libelle,
        criticite_actuelle: critActuelle,
        criticite_suggeree: 'majeur',
        score_anomalies: agg.score,
        motif: 'relevement',
        source_audit_id: sourceAuditId,
      });
    }
  }

  // Allègement : risques avec score = 0 sur 24 mois ET criticité élevée
  const aggs24 = await aggregerAnomalies(groupementId, 24);
  const aggs24ByKey = new Map(aggs24.map(a => [`${a.risque_processus}|${a.risque_libelle}`, a]));
  for (const decl of cartographieDeclaree) {
    const note = decl.probabilite * decl.impact * decl.maitrise;
    const crit = niveauFromNote(note);
    if (crit === 'faible') continue;
    const key24 = [...aggs24ByKey.entries()].find(([k]) =>
      k.toLowerCase().includes(decl.risque.toLowerCase().slice(0, 20)),
    );
    if (!key24 || key24[1].score === 0) {
      const idx = ORDRE.indexOf(crit);
      propositions.push({
        groupement_id: groupementId,
        risque_processus: decl.processus,
        risque_libelle: decl.risque,
        criticite_actuelle: crit,
        criticite_suggeree: ORDRE[Math.max(0, idx - 1)],
        score_anomalies: 0,
        motif: 'allègement',
        source_audit_id: sourceAuditId,
      });
    }
  }

  // Persistance (ignore les doublons en attente sur même risque)
  if (propositions.length) {
    const { data: existing } = await (supabase as any)
      .from('risque_ajustements')
      .select('risque_libelle')
      .eq('groupement_id', groupementId)
      .eq('status', 'en_attente');
    const dejaPropose = new Set((existing ?? []).map((e: any) => e.risque_libelle));
    const nouveaux = propositions.filter(p => !dejaPropose.has(p.risque_libelle));
    if (nouveaux.length) {
      await (supabase as any).from('risque_ajustements').insert(nouveaux);
    }
  }

  return propositions;
}
