/**
 * useCalendrierSync — Synchronise le Calendrier annuel avec Supabase
 * ────────────────────────────────────────────────────────────────────
 * Lit/écrit dans la table calendrier_annuel (RLS par groupement) si un
 * groupement actif est sélectionné, sinon fallback localStorage.
 */
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGroupements } from '@/hooks/useGroupements';
import { loadState, saveState } from '@/lib/store';
import type { ActiviteCalendrier } from '@/lib/calendrier-types';
import { toast } from 'sonner';

const STORAGE_KEY = 'calendrier_annuel_v1';

function rowToActivite(r: any): ActiviteCalendrier {
  return {
    id: r.id,
    modeleId: r.activite_ref || undefined,
    titre: r.libelle,
    categorie: (r.categorie || 'Pilotage / Conseil AC') as any,
    periodicite: 'annuelle',
    moisDebut: r.mois,
    description: r.description || '',
    reference: r.reference_reglementaire || undefined,
    responsable: (r.responsable_role || 'AC') as any,
    criticite: (r.criticite === 'haute' ? 'haute' : r.criticite === 'info' ? 'info' : 'moyenne'),
    dateEcheance: r.date_limite || undefined,
    etablissementsIds: [],
    tousEtablissements: true,
    notes: r.notes || undefined,
    realisee: r.statut === 'fait',
  };
}

function activiteToRow(a: ActiviteCalendrier, groupement_id: string, user_id: string | null) {
  return {
    id: a.id,
    groupement_id,
    activite_ref: a.modeleId || a.id,
    libelle: a.titre,
    description: a.description || null,
    mois: a.moisDebut,
    date_limite: a.dateEcheance || null,
    categorie: a.categorie || null,
    criticite: a.criticite || 'moyenne',
    reference_reglementaire: a.reference || null,
    responsable_role: a.responsable || null,
    statut: a.realisee ? 'fait' : 'a_faire',
    custom: !a.modeleId,
    notes: a.notes || null,
    created_by: user_id,
    updated_at: new Date().toISOString(),
  };
}

export function useCalendrierSync() {
  const { activeId } = useGroupements();
  const [activites, setActivites] = useState<ActiviteCalendrier[]>(() =>
    loadState<ActiviteCalendrier[]>(STORAGE_KEY, [])
  );
  const [loading, setLoading] = useState(false);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    if (!activeId) {
      setSynced(false);
      setActivites(loadState<ActiviteCalendrier[]>(STORAGE_KEY, []));
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('calendrier_annuel')
          .select('*')
          .eq('groupement_id', activeId)
          .order('mois', { ascending: true });
        if (error) throw error;
        if (cancelled) return;
        const remote = (data ?? []).map(rowToActivite);
        setActivites(remote);
        saveState(STORAGE_KEY, remote);
        setSynced(true);
      } catch (e: any) {
        console.error('[useCalendrierSync] load error', e);
        toast.error('Impossible de charger le calendrier depuis le cloud');
        setActivites(loadState<ActiviteCalendrier[]>(STORAGE_KEY, []));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [activeId]);

  // Realtime : recharge la liste à chaque changement distant sur ce groupement
  useEffect(() => {
    if (!activeId) return;
    const channel = supabase
      .channel(`calendrier_annuel_${activeId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'calendrier_annuel', filter: `groupement_id=eq.${activeId}` },
        async () => {
          const { data } = await supabase
            .from('calendrier_annuel')
            .select('*')
            .eq('groupement_id', activeId)
            .order('mois', { ascending: true });
          if (data) {
            const remote = data.map(rowToActivite);
            setActivites(remote);
            saveState(STORAGE_KEY, remote);
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeId]);

  const persist = useCallback(async (next: ActiviteCalendrier[]) => {
    setActivites(next);
    saveState(STORAGE_KEY, next);
    if (!activeId) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (next.length === 0) {
        await supabase.from('calendrier_annuel').delete().eq('groupement_id', activeId);
        return;
      }
      const rows = next.map(a => activiteToRow(a, activeId, user?.id ?? null));
      const { error: upErr } = await supabase
        .from('calendrier_annuel')
        .upsert(rows, { onConflict: 'id' });
      if (upErr) throw upErr;
      const ids = next.map(a => a.id);
      await supabase
        .from('calendrier_annuel')
        .delete()
        .eq('groupement_id', activeId)
        .not('id', 'in', `(${ids.map(i => `"${i}"`).join(',')})`);
    } catch (e: any) {
      console.error('[useCalendrierSync] persist error', e);
      toast.error('Sauvegarde cloud échouée — données conservées en local');
    }
  }, [activeId]);

  return { activites, setActivites: persist, loading, synced };
}
