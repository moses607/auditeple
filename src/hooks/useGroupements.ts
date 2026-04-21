/**
 * useGroupements / useEtablissements / useAgents
 * ─────────────────────────────────────────────
 * Hooks centralisés pour le module Paramètres multi-groupements.
 * Source unique de vérité — alimente automatiquement organigramme,
 * plan d'action, PV, fiches de contrôle (zéro double saisie).
 */
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export type AgentRole =
  | 'agent_comptable' | 'fonde_pouvoir' | 'ordonnateur' | 'ordonnateur_suppleant'
  | 'secretaire_general' | 'assistant_gestion' | 'regisseur_recettes' | 'regisseur_avances'
  | 'suppleant_regisseur' | 'magasinier' | 'chef_cuisine' | 'secretaire_intendance'
  | 'gestionnaire_materiel' | 'responsable_cfa_greta' | 'correspondant_cicf' | 'archiviste_comptable';

export const AGENT_ROLES: { value: AgentRole; label: string; cycle?: string }[] = [
  { value: 'agent_comptable', label: 'Agent comptable', cycle: 'Gouvernance' },
  { value: 'fonde_pouvoir', label: 'Fondé de pouvoir', cycle: 'Gouvernance' },
  { value: 'ordonnateur', label: 'Ordonnateur (chef d\'établissement)', cycle: 'Gouvernance' },
  { value: 'ordonnateur_suppleant', label: 'Ordonnateur suppléant (adjoint)', cycle: 'Gouvernance' },
  { value: 'secretaire_general', label: 'Secrétaire général / Adjoint gestionnaire', cycle: 'Gouvernance' },
  { value: 'assistant_gestion', label: 'Assistant de gestion', cycle: 'Gestion' },
  { value: 'regisseur_recettes', label: 'Régisseur de recettes', cycle: 'Trésorerie' },
  { value: 'regisseur_avances', label: 'Régisseur d\'avances', cycle: 'Trésorerie' },
  { value: 'suppleant_regisseur', label: 'Suppléant régisseur', cycle: 'Trésorerie' },
  { value: 'magasinier', label: 'Magasinier', cycle: 'Stocks' },
  { value: 'chef_cuisine', label: 'Chef de cuisine', cycle: 'Restauration' },
  { value: 'secretaire_intendance', label: 'Secrétaire d\'intendance', cycle: 'Gestion' },
  { value: 'gestionnaire_materiel', label: 'Gestionnaire matériel', cycle: 'Patrimoine' },
  { value: 'responsable_cfa_greta', label: 'Responsable CFA / GRETA', cycle: 'Services spéciaux' },
  { value: 'correspondant_cicf', label: 'Correspondant CICF', cycle: 'Contrôle interne' },
  { value: 'archiviste_comptable', label: 'Archiviste comptable', cycle: 'Gouvernance' },
];

export type EtablissementType = 'EPLE' | 'LYCEE' | 'LYCEE_PRO' | 'COLLEGE' | 'CFA' | 'GRETA' | 'EREA' | 'SEGPA';

export const ETABLISSEMENT_TYPES: { value: EtablissementType; label: string }[] = [
  { value: 'EPLE', label: 'EPLE (générique)' },
  { value: 'LYCEE', label: 'Lycée' },
  { value: 'LYCEE_PRO', label: 'Lycée professionnel' },
  { value: 'COLLEGE', label: 'Collège' },
  { value: 'CFA', label: 'CFA' },
  { value: 'GRETA', label: 'GRETA' },
  { value: 'EREA', label: 'EREA' },
  { value: 'SEGPA', label: 'SEGPA' },
];

export interface Groupement {
  id: string;
  libelle: string;
  academie: string;
  siege: string | null;
  email_agent_comptable: string | null;
  telephone: string | null;
  logo_url: string | null;
  couleur_principale: string | null;
  actif: boolean;
}

export interface EtablissementRow {
  id: string;
  groupement_id: string;
  type: EtablissementType;
  nom: string;
  uai: string;
  siret: string | null;
  code_budgetaire: string | null;
  adresse: string | null;
  code_postal: string | null;
  ville: string | null;
  telephone: string | null;
  email: string | null;
  est_agence_comptable: boolean;
  actif: boolean;
}

export interface AgentRow {
  id: string;
  groupement_id: string;
  etablissement_id: string | null;
  role: AgentRole;
  civilite: string | null;
  nom: string;
  prenom: string;
  email: string | null;
  telephone: string | null;
  date_prise_fonction: string | null;
  delegation_signature: boolean;
  signature_url: string | null;
  actif: boolean;
  notes: string | null;
}

const ACTIVE_GROUPEMENT_KEY = 'cic_expert_active_groupement';

export function getActiveGroupementId(): string | null {
  return localStorage.getItem(ACTIVE_GROUPEMENT_KEY);
}

export function setActiveGroupementId(id: string | null) {
  if (id) localStorage.setItem(ACTIVE_GROUPEMENT_KEY, id);
  else localStorage.removeItem(ACTIVE_GROUPEMENT_KEY);
  window.dispatchEvent(new CustomEvent('groupement-changed'));
}

export function useGroupements() {
  const [groupements, setGroupements] = useState<Groupement[]>([]);
  const [activeId, setActiveId] = useState<string | null>(getActiveGroupementId());
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('groupements_comptables')
      .select('*')
      .order('libelle');
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } else {
      setGroupements(data as Groupement[]);
      // Auto-sélection du premier groupement si aucun actif
      if (!activeId && data && data.length > 0) {
        setActiveGroupementId(data[0].id);
        setActiveId(data[0].id);
      }
    }
    setLoading(false);
  }, [activeId]);

  useEffect(() => {
    refresh();
    const onChange = () => setActiveId(getActiveGroupementId());
    window.addEventListener('groupement-changed', onChange);
    return () => window.removeEventListener('groupement-changed', onChange);
  }, [refresh]);

  const createGroupement = async (g: Omit<Groupement, 'id' | 'actif'> & { actif?: boolean }) => {
    const { data, error } = await supabase
      .from('groupements_comptables')
      .insert({ ...g, actif: g.actif ?? true })
      .select()
      .single();
    if (error) { toast({ title: 'Erreur', description: error.message, variant: 'destructive' }); return null; }
    toast({ title: 'Groupement créé', description: data.libelle });
    await refresh();
    setActiveGroupementId(data.id);
    return data as Groupement;
  };

  const updateGroupement = async (id: string, patch: Partial<Groupement>) => {
    const { error } = await supabase.from('groupements_comptables').update(patch).eq('id', id);
    if (error) { toast({ title: 'Erreur', description: error.message, variant: 'destructive' }); return false; }
    toast({ title: 'Groupement mis à jour' });
    await refresh();
    return true;
  };

  return { groupements, activeId, loading, refresh, createGroupement, updateGroupement, setActive: setActiveGroupementId };
}

export function useEtablissements(groupementId: string | null) {
  const [list, setList] = useState<EtablissementRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!groupementId) { setList([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('etablissements')
      .select('*')
      .eq('groupement_id', groupementId)
      .order('nom');
    if (error) toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    else setList(data as EtablissementRow[]);
    setLoading(false);
  }, [groupementId]);

  useEffect(() => { refresh(); }, [refresh]);

  const create = async (e: Omit<EtablissementRow, 'id'>) => {
    const { error } = await supabase.from('etablissements').insert(e);
    if (error) { toast({ title: 'Erreur', description: error.message, variant: 'destructive' }); return false; }
    toast({ title: 'Établissement ajouté', description: e.nom });
    await refresh();
    return true;
  };

  const update = async (id: string, patch: Partial<EtablissementRow>) => {
    const { error } = await supabase.from('etablissements').update(patch).eq('id', id);
    if (error) { toast({ title: 'Erreur', description: error.message, variant: 'destructive' }); return false; }
    toast({ title: 'Établissement mis à jour' });
    await refresh();
    return true;
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('etablissements').delete().eq('id', id);
    if (error) { toast({ title: 'Erreur', description: error.message, variant: 'destructive' }); return false; }
    toast({ title: 'Établissement supprimé' });
    await refresh();
    return true;
  };

  return { etablissements: list, loading, refresh, create, update, remove };
}

export function useAgents(groupementId: string | null) {
  const [list, setList] = useState<AgentRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!groupementId) { setList([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('groupement_id', groupementId)
      .order('nom');
    if (error) toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    else setList(data as AgentRow[]);
    setLoading(false);
  }, [groupementId]);

  useEffect(() => { refresh(); }, [refresh]);

  const create = async (a: Omit<AgentRow, 'id'>) => {
    const { error } = await supabase.from('agents').insert(a);
    if (error) { toast({ title: 'Erreur', description: error.message, variant: 'destructive' }); return false; }
    toast({ title: 'Agent ajouté', description: `${a.prenom} ${a.nom}` });
    await refresh();
    return true;
  };

  const update = async (id: string, patch: Partial<AgentRow>) => {
    const { error } = await supabase.from('agents').update(patch).eq('id', id);
    if (error) { toast({ title: 'Erreur', description: error.message, variant: 'destructive' }); return false; }
    toast({ title: 'Agent mis à jour' });
    await refresh();
    return true;
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('agents').delete().eq('id', id);
    if (error) { toast({ title: 'Erreur', description: error.message, variant: 'destructive' }); return false; }
    toast({ title: 'Agent supprimé' });
    await refresh();
    return true;
  };

  return { agents: list, loading, refresh, create, update, remove };
}

export function getRoleLabel(role: AgentRole): string {
  return AGENT_ROLES.find(r => r.value === role)?.label ?? role;
}
