/**
 * Calcul du score de maturité CICF (Contrôle Interne Comptable et Financier).
 * Inspiré de la grille AMUE / DGFiP / IGAENR pour les EPLE :
 *   - 5 axes pondérés (gouvernance, périmètre, contrôles, traçabilité, restitution)
 *   - 4 niveaux : Initial · Reproductible · Maîtrisé · Optimisé
 *   - Score global 0-100 dérivé d'agrégats Supabase (audits, points, PV).
 */
import { supabase } from '@/integrations/supabase/client';

export type NiveauMaturite = 'initial' | 'reproductible' | 'maitrise' | 'optimise';

export interface MaturiteAxe {
  id: string;
  label: string;
  score: number; // 0-100
  description: string;
  poids: number;
}

export interface MaturiteCICF {
  scoreGlobal: number; // 0-100
  niveau: NiveauMaturite;
  axes: MaturiteAxe[];
  kpis: {
    auditsTotal: number;
    auditsClotures: number;
    pointsAudites: number;
    pointsTotal: number;
    tauxCouverture: number; // %
    anomaliesOuvertes: number;
    pvEnAttente: number;
    pvFinalises: number;
    agentsActifs: number;
    etablissementsCouverts: number;
  };
}

export const NIVEAU_LABEL: Record<NiveauMaturite, { label: string; color: string; bg: string; description: string }> = {
  initial: { label: 'Initial', color: 'text-destructive', bg: 'bg-destructive/10', description: 'Contrôles non formalisés, démarche à structurer.' },
  reproductible: { label: 'Reproductible', color: 'text-amber-600', bg: 'bg-amber-500/10', description: 'Procédures en place mais perfectibles.' },
  maitrise: { label: 'Maîtrisé', color: 'text-blue-600', bg: 'bg-blue-500/10', description: 'CICF opérationnel et tracé. Cible M9-6.' },
  optimise: { label: 'Optimisé', color: 'text-emerald-600', bg: 'bg-emerald-500/10', description: 'Excellence : pilotage continu et amélioration permanente.' },
};

function niveauFromScore(s: number): NiveauMaturite {
  if (s >= 80) return 'optimise';
  if (s >= 60) return 'maitrise';
  if (s >= 35) return 'reproductible';
  return 'initial';
}

export async function computeMaturiteCICF(groupementId: string): Promise<MaturiteCICF> {
  // Charge les agrégats nécessaires en parallèle
  const [auditsRes, pointsRes, pvRes, agentsRes, etabsRes] = await Promise.all([
    supabase.from('audits').select('id,status').eq('groupement_id', groupementId),
    supabase.from('audit_points_results').select('id,status,audit_id'),
    supabase.from('pv_contradictoires').select('id,status').eq('groupement_id', groupementId),
    supabase.from('agents').select('id,actif,role').eq('groupement_id', groupementId),
    supabase.from('etablissements').select('id,actif').eq('groupement_id', groupementId),
  ]);

  const audits = auditsRes.data ?? [];
  const auditIds = new Set(audits.map(a => a.id));
  const points = (pointsRes.data ?? []).filter(p => auditIds.has(p.audit_id));
  const pvs = pvRes.data ?? [];
  const agents = agentsRes.data ?? [];
  const etabs = etabsRes.data ?? [];

  const auditsClotures = audits.filter(a => a.status !== 'en_cours').length;
  const pointsAudites = points.filter(p => p.status !== 'non_audite').length;
  const pointsTotal = points.length;
  const anomaliesOuvertes = points.filter(p => p.status === 'anomalie_majeure' || p.status === 'anomalie_mineure').length;
  const pvEnAttente = pvs.filter(p => p.status === 'envoye').length;
  const pvFinalises = pvs.filter(p => p.status === 'finalise').length;
  const agentsActifs = agents.filter(a => a.actif).length;
  const etablissementsCouverts = etabs.filter(e => e.actif).length;
  const auditedEtab = new Set(audits.map((a: any) => a.etablissement_id)).size;

  const tauxCouverture = pointsTotal > 0 ? Math.round((pointsAudites / pointsTotal) * 100) : 0;

  // Axes pondérés
  const hasGouvernance = ['agent_comptable', 'ordonnateur'].every(r => agents.some(a => a.role === r && a.actif));
  const axeGouvernance = Math.min(100,
    (hasGouvernance ? 50 : 0) +
    Math.min(50, agentsActifs * 8),
  );

  const axePerimetre = etabs.length === 0 ? 0 : Math.round((auditedEtab / Math.max(1, etablissementsCouverts)) * 100);

  const axeControles = tauxCouverture;

  const axeTracabilite = pointsTotal === 0 ? 0 :
    Math.round(((pointsAudites - anomaliesOuvertes * 0.3) / Math.max(1, pointsTotal)) * 100);

  const axeRestitution = audits.length === 0 ? 0 :
    Math.round(((pvFinalises * 100 + pvEnAttente * 60 + auditsClotures * 30) /
      Math.max(1, audits.length * 100)) * 100) / 1;

  const axes: MaturiteAxe[] = [
    { id: 'gouvernance', label: 'Gouvernance & équipe', score: Math.round(axeGouvernance), poids: 0.20, description: 'AC, ordonnateur, équipe dans Paramètres.' },
    { id: 'perimetre', label: "Périmètre d'audit", score: Math.round(axePerimetre), poids: 0.15, description: 'Couverture des établissements du groupement.' },
    { id: 'controles', label: 'Exécution des contrôles', score: Math.round(axeControles), poids: 0.30, description: 'Points M9-6 audités sur la période.' },
    { id: 'tracabilite', label: 'Traçabilité & qualité', score: Math.max(0, Math.round(axeTracabilite)), poids: 0.20, description: 'Anomalies documentées et corrigées.' },
    { id: 'restitution', label: 'Restitution contradictoire', score: Math.min(100, Math.round(axeRestitution)), poids: 0.15, description: 'PV envoyés et finalisés.' },
  ];

  const scoreGlobal = Math.round(axes.reduce((s, a) => s + a.score * a.poids, 0));

  return {
    scoreGlobal,
    niveau: niveauFromScore(scoreGlobal),
    axes,
    kpis: {
      auditsTotal: audits.length,
      auditsClotures,
      pointsAudites,
      pointsTotal,
      tauxCouverture,
      anomaliesOuvertes,
      pvEnAttente,
      pvFinalises,
      agentsActifs,
      etablissementsCouverts,
    },
  };
}
