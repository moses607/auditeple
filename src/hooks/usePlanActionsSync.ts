/**
 * usePlanActionsSync — Synchronise le Plan d'action avec Supabase
 * ─────────────────────────────────────────────────────────────────
 * Lit depuis Supabase (table plan_actions, RLS par groupement) si un
 * groupement actif est sélectionné, sinon retombe sur localStorage.
 *
 * Stratégie : Supabase = source de vérité quand connecté ; localStorage
 * sert de cache + fallback offline.
 */
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGroupements } from '@/hooks/useGroupements';
import {
  ActionPlan, loadActions, saveActions,
} from '@/lib/plan-action-engine';
import { toast } from 'sonner';

function rowToAction(r: any): ActionPlan {
  return {
    id: r.id,
    origine: r.origine,
    origineRef: r.origine_ref,
    origineLabel: r.origine_label,
    libelle: r.libelle,
    description: r.description ?? undefined,
    criticite: r.criticite,
    responsable: r.responsable ?? '',
    responsableRole: r.responsable_role ?? undefined,
    echeance: r.echeance ?? '',
    statut: r.statut,
    reference: r.reference ?? '',
    cycle: r.cycle ?? undefined,
    commentaires: r.commentaires ?? '',
    alerteEnvoyee: r.alerte_envoyee ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function actionToRow(a: ActionPlan, groupement_id: string, user_id: string | null) {
  return {
    id: a.id,
    groupement_id,
    origine: a.origine,
    origine_ref: a.origineRef,
    origine_label: a.origineLabel,
    libelle: a.libelle,
    description: a.description ?? null,
    criticite: a.criticite,
    responsable: a.responsable || null,
    responsable_role: a.responsableRole ?? null,
    echeance: a.echeance || null,
    statut: a.statut,
    reference: a.reference || null,
    cycle: a.cycle ?? null,
    commentaires: a.commentaires || null,
    alerte_envoyee: a.alerteEnvoyee ?? null,
    created_by: user_id,
    updated_at: new Date().toISOString(),
  };
}

export function usePlanActionsSync() {
  const { activeId } = useGroupements();
  const [actions, setActions] = useState<ActionPlan[]>(() => loadActions());
  const [loading, setLoading] = useState(false);
  const [synced, setSynced] = useState(false);
  const [remoteUpdateAt, setRemoteUpdateAt] = useState<number>(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null));
  }, []);

  // Charge depuis Supabase quand le groupement change
  useEffect(() => {
    if (!activeId) {
      setSynced(false);
      setActions(loadActions());
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('plan_actions')
          .select('*')
          .eq('groupement_id', activeId)
          .order('created_at', { ascending: false });
        if (error) throw error;
        if (cancelled) return;
        const remote = (data ?? []).map(rowToAction);
        setActions(remote);
        saveActions(remote); // cache local
        setSynced(true);
      } catch (e: any) {
        console.error('[usePlanActionsSync] load error', e);
        toast.error('Impossible de charger le plan d\'action depuis le cloud');
        setActions(loadActions());
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [activeId]);

  // Realtime : recharge à chaque changement distant
  useEffect(() => {
    if (!activeId) return;
    const channel = supabase
      .channel(`plan_actions_${activeId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'plan_actions', filter: `groupement_id=eq.${activeId}` },
        async (payload: any) => {
          const row: any = payload.new ?? payload.old;
          const authorId = row?.created_by ?? null;
          const fromOther = authorId && currentUserId && authorId !== currentUserId;
          const { data } = await supabase
            .from('plan_actions')
            .select('*')
            .eq('groupement_id', activeId)
            .order('created_at', { ascending: false });
          if (data) {
            const remote = data.map(rowToAction);
            setActions(remote);
            saveActions(remote);
          }
          if (fromOther) {
            setRemoteUpdateAt(Date.now());
            const verb = payload.eventType === 'INSERT' ? 'créée' : payload.eventType === 'DELETE' ? 'supprimée' : 'mise à jour';
            toast(`Action ${verb} par un collègue`, { duration: 2500, className: 'text-xs' });
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeId, currentUserId]);

  /** Persiste un set complet : upsert + delete des manquants. */
  const persist = useCallback(async (next: ActionPlan[]) => {
    setActions(next);
    saveActions(next); // cache local immédiat
    if (!activeId) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const rows = next.map(a => actionToRow(a, activeId, user?.id ?? null));
      // Upsert all
      const { error: upErr } = await supabase.from('plan_actions').upsert(rows, { onConflict: 'id' });
      if (upErr) throw upErr;
      // Delete obsolete
      const ids = next.map(a => a.id);
      if (ids.length > 0) {
        await supabase
          .from('plan_actions')
          .delete()
          .eq('groupement_id', activeId)
          .not('id', 'in', `(${ids.map(i => `"${i}"`).join(',')})`);
      } else {
        await supabase.from('plan_actions').delete().eq('groupement_id', activeId);
      }
    } catch (e: any) {
      console.error('[usePlanActionsSync] persist error', e);
      toast.error('Sauvegarde cloud échouée — données conservées en local');
    }
  }, [activeId]);

  /** Upsert d'une seule action (plus rapide pour drag-and-drop). */
  const upsertOne = useCallback(async (a: ActionPlan) => {
    const next = actions.some(x => x.id === a.id)
      ? actions.map(x => x.id === a.id ? a : x)
      : [...actions, a];
    setActions(next);
    saveActions(next);
    if (!activeId) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('plan_actions')
        .upsert(actionToRow(a, activeId, user?.id ?? null), { onConflict: 'id' });
      if (error) throw error;
    } catch (e: any) {
      console.error('[usePlanActionsSync] upsertOne error', e);
    }
  }, [actions, activeId]);

  return { actions, setActions: persist, upsertOne, loading, synced };
}
