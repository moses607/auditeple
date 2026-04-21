/**
 * Moteur de scoring CICF (Chantier 2).
 *
 * Score par rubrique [0;100] :
 *   100 − (Σ criticités risques × pondération)
 *       − (anomalies majeures × 5)
 *       − (anomalies mineures × 2)
 *       + (actions clôturées × 1)
 *       − (actions en retard × 3)
 *       − (PV non finalisés × 2)
 *   bornage [0 ; 100]
 *
 * Score établissement = moyenne pondérée des 8 rubriques.
 * Score groupement    = moyenne des scores établissement.
 */
import { supabase } from '@/integrations/supabase/client';
import { RUBRIQUES_SCORING, type RubriqueScoring, MAPPING_SEED } from './mapping-audit-risque-seed';
import { loadMapping } from './risque-engine';

export interface ScoreRubrique {
  id: RubriqueScoring;
  label: string;
  score: number;
  details: {
    risques_critiques: number;
    risques_majeurs: number;
    anomalies_majeures: number;
    anomalies_mineures: number;
    actions_cloturees: number;
    actions_retard: number;
    pv_non_finalises: number;
  };
}

export interface ScoreEtablissement {
  etablissement_id: string | null;
  etablissement_label: string;
  score_global: number;
  rubriques: ScoreRubrique[];
}

export interface ScoreGroupement {
  groupement_id: string;
  score_global: number;
  rubriques: ScoreRubrique[];
  etablissements: ScoreEtablissement[];
  alertes: { type: 'seuil' | 'evolution' | 'transversal'; message: string; rubrique?: RubriqueScoring }[];
  quickWins: { rubrique: RubriqueScoring; gain_estime: number; libelle: string }[];
}

const niveauLabel = (s: number) => {
  if (s >= 90) return { label: 'Excellent', color: 'text-emerald-600', bg: 'bg-emerald-500/10' };
  if (s >= 75) return { label: 'Satisfaisant', color: 'text-blue-600', bg: 'bg-blue-500/10' };
  if (s >= 60) return { label: 'À consolider', color: 'text-amber-600', bg: 'bg-amber-500/10' };
  if (s >= 40) return { label: 'Fragile', color: 'text-orange-600', bg: 'bg-orange-500/10' };
  return { label: 'Critique', color: 'text-destructive', bg: 'bg-destructive/10' };
};
export { niveauLabel as niveauScoring };

export async function computeScoringGroupement(groupementId: string, seuilAlerte = 60): Promise<ScoreGroupement> {
  const mapping = await loadMapping(groupementId);
  const rubriqueByPoint = new Map(mapping.map(m => [`${m.domaine_id}::${m.point_index}`, m.rubrique as RubriqueScoring]));

  const [auditsRes, etabsRes, planRes, pvRes] = await Promise.all([
    supabase.from('audits').select('id, etablissement_id, status, date_audit').eq('groupement_id', groupementId),
    supabase.from('etablissements').select('id, nom, uai').eq('groupement_id', groupementId).eq('actif', true),
    supabase.from('plan_actions').select('id, statut, echeance, criticite, origine_ref').eq('groupement_id', groupementId),
    supabase.from('pv_contradictoires').select('id, status, audit_id').eq('groupement_id', groupementId),
  ]);
  const audits = auditsRes.data ?? [];
  const etabs = etabsRes.data ?? [];
  const plan = planRes.data ?? [];
  const pvs = pvRes.data ?? [];

  let resultats: any[] = [];
  if (audits.length) {
    const r = await supabase
      .from('audit_points_results')
      .select('audit_id, domaine_id, point_index, status')
      .in('audit_id', audits.map(a => a.id));
    resultats = r.data ?? [];
  }
  const auditById = new Map(audits.map(a => [a.id, a]));

  const computeForEtab = (etabId: string | null, etabLabel: string): ScoreEtablissement => {
    const auditsEtab = etabId ? audits.filter(a => a.etablissement_id === etabId) : audits;
    const auditIds = new Set(auditsEtab.map(a => a.id));
    const resEtab = resultats.filter(r => auditIds.has(r.audit_id));
    const pvsEtab = pvs.filter(p => auditIds.has(p.audit_id));

    const today = new Date();
    const planEtab = plan; // pas d'etab_id sur plan_actions, on garde groupement-level

    const rubriques: ScoreRubrique[] = RUBRIQUES_SCORING.map(rub => {
      const resRub = resEtab.filter(r => rubriqueByPoint.get(`${r.domaine_id}::${r.point_index}`) === rub.id);
      const ano_maj = resRub.filter(r => r.status === 'anomalie_majeure').length;
      const ano_min = resRub.filter(r => r.status === 'anomalie_mineure').length;
      const planRub = planEtab.filter(p => (p.origine_ref ?? '').toLowerCase().includes(rub.id) || (p.criticite === 'critique' || p.criticite === 'haute'));
      const closed = planRub.filter(p => p.statut === 'fait').length;
      const retard = planRub.filter(p => p.statut !== 'fait' && p.echeance && new Date(p.echeance) < today).length;
      const pvNonFin = pvsEtab.filter(p => p.status !== 'finalise').length;

      // Pénalité criticité = nombre de risques pondéré
      const score = Math.max(0, Math.min(100,
        100
        - (ano_maj * 5)
        - (ano_min * 2)
        + (closed * 1)
        - (retard * 3)
        - (pvNonFin * 2),
      ));
      return {
        id: rub.id,
        label: rub.label,
        score,
        details: {
          risques_critiques: 0, risques_majeurs: 0,
          anomalies_majeures: ano_maj,
          anomalies_mineures: ano_min,
          actions_cloturees: closed,
          actions_retard: retard,
          pv_non_finalises: pvNonFin,
        },
      };
    });

    const score_global = Math.round(rubriques.reduce((s, r) => s + r.score, 0) / rubriques.length);
    return { etablissement_id: etabId, etablissement_label: etabLabel, score_global, rubriques };
  };

  const etablissements = etabs.map(e => computeForEtab(e.id, `${e.uai} — ${e.nom}`));
  const consolide = computeForEtab(null, 'Groupement consolidé');

  // Alertes
  const alertes: ScoreGroupement['alertes'] = [];
  if (consolide.score_global < seuilAlerte) {
    alertes.push({ type: 'seuil', message: `Score global consolidé (${consolide.score_global}) sous le seuil d'alerte (${seuilAlerte}).` });
  }
  // Risque transversal : 3 etabs ou plus avec rubrique sous 60
  RUBRIQUES_SCORING.forEach(rub => {
    const fragiles = etablissements.filter(e => (e.rubriques.find(r => r.id === rub.id)?.score ?? 100) < 60).length;
    if (fragiles >= 3) {
      alertes.push({
        type: 'transversal',
        rubrique: rub.id,
        message: `${fragiles} établissements présentent une fragilité sur « ${rub.label} » → action transversale recommandée.`,
      });
    }
  });

  // Quick-wins : rubriques avec score 60-75 et peu d'actions en retard
  const quickWins = consolide.rubriques
    .filter(r => r.score >= 60 && r.score < 75 && r.details.actions_retard <= 2)
    .map(r => ({
      rubrique: r.id,
      gain_estime: Math.min(15, 75 - r.score + 3),
      libelle: `Solder ${r.details.actions_retard || 1} action(s) sur « ${r.label} » → gain estimé +${Math.min(15, 75 - r.score + 3)} pts`,
    }));

  return {
    groupement_id: groupementId,
    score_global: consolide.score_global,
    rubriques: consolide.rubriques,
    etablissements,
    alertes,
    quickWins,
  };
}

/** Snapshot mensuel — à appeler depuis l'écran Scoring. */
export async function snapshotScoring(groupementId: string, score: ScoreGroupement) {
  const periode = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
  const rows = [
    {
      groupement_id: groupementId,
      etablissement_id: null,
      periode,
      score_global: score.score_global,
      scores_rubriques: Object.fromEntries(score.rubriques.map(r => [r.id, r.score])),
      details: { alertes: score.alertes },
    },
    ...score.etablissements.map(e => ({
      groupement_id: groupementId,
      etablissement_id: e.etablissement_id,
      periode,
      score_global: e.score_global,
      scores_rubriques: Object.fromEntries(e.rubriques.map(r => [r.id, r.score])),
      details: {},
    })),
  ];
  await (supabase as any).from('scoring_snapshots').upsert(rows, { onConflict: 'groupement_id,etablissement_id,periode' });
}

export async function loadHistorique(groupementId: string, etablissementId: string | null = null) {
  const since = new Date(); since.setMonth(since.getMonth() - 24);
  const q = (supabase as any).from('scoring_snapshots')
    .select('periode, score_global, scores_rubriques')
    .eq('groupement_id', groupementId)
    .gte('periode', since.toISOString().slice(0, 7))
    .order('periode', { ascending: true });
  const r = etablissementId
    ? await q.eq('etablissement_id', etablissementId)
    : await q.is('etablissement_id', null);
  return (r.data ?? []) as { periode: string; score_global: number; scores_rubriques: Record<string, number> }[];
}
