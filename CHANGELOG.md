# CHANGELOG — Refonte CICF (présentation rectorat Guadeloupe)

## Passe 1 — Fondations (livrée)

### Chantier 1 — Audit anti-doublons
**Doublons identifiés :**
- `parametres` apparaissait dans la section AUDIT & RESTITUTION ET dans l'étape 1 du parcours → fusionné, désormais accessible uniquement via la nouvelle entrée dédiée en tête de sidebar.
- `audit-domaines` était dans section CONTRÔLES SUR PLACE alors que c'est une vue de l'étape 3 AUDIT → reclassé en AUDIT & RESTITUTION.
- `mentions-legales` orphelin dans étape 7 → retiré du parcours (reste accessible via footer/route directe).
- Cartographie / Organigramme / Plan d'action déjà unifiés dans Triptyque CICF (passes précédentes — vérifié OK).

### Chantier 2 — Module Paramètres multi-groupements (fondations)

**Tables Supabase créées :**
- `groupements_comptables` (id, libellé, académie, siège, email AC, couleur, logo, actif)
- `etablissements` (groupement_id, type enum EPLE/LYCEE/COLLEGE/CFA/GRETA…, UAI, SIRET, adresse, est_agence_comptable)
- `agents` (groupement_id, etablissement_id, role enum 16 valeurs M9-6, civilité, nom, prénom, contacts, délégation_signature)
- `etablissement_agents` (association n-n)
- `user_groupements` (rattachement utilisateur ↔ groupement, est_admin)

**Sécurité :**
- RLS complète sur toutes les tables (chaque user ne voit que ses groupements via `user_belongs_to_groupement`).
- Trigger `auto_attach_creator_to_groupement` : le créateur d'un groupement en devient automatiquement admin.

**Front livré :**
- `src/hooks/useGroupements.ts` — hooks `useGroupements` / `useEtablissements` / `useAgents` + helpers `AGENT_ROLES`, `ETABLISSEMENT_TYPES`, gestion du groupement actif.
- `src/components/parametres/ParametresGroupements.tsx` — onglet 1 (CRUD groupements + sélection actif).
- `src/components/parametres/ParametresEtablissements.tsx` — onglet 2 (CRUD établissements + lookup UAI annuaire éducation).
- `src/components/parametres/ParametresAgents.tsx` — onglet 3 (CRUD agents, filtres rôle/établissement).
- `src/pages/Parametres.tsx` — refonte 4 onglets (Groupement / Établissements / Agents / Préférences).
- `src/components/AppSidebar.tsx` — entrée « Paramètres » avec icône engrenage en tête de sidebar.

### Routes
- Aucune route ajoutée/supprimée (la route `/parametres` existait déjà).

### Migration de données
- Aucune migration automatique sur la passe 1. Les anciennes données localStorage (équipe, établissements) restent disponibles via l'onglet « Préférences » de la page Paramètres ; un import manuel sera proposé en passe 2.

### Points de vigilance
- ⚠️ La protection « mots de passe compromis » est désactivée côté Auth Supabase (warning linter) → à activer manuellement par l'admin via Backend → Auth → Password Protection.
- L'utilisateur doit créer son premier groupement pour activer les onglets Établissements/Agents.

## Passes restantes (à enchaîner)

- **Passe 2** : Propagation auto (organigramme, plan d'action, PV signataires) + import legacy localStorage → Supabase.
- **Passe 3** : 15 calculateurs (Caisse régie, Fonds social cantine, Seuils CCP, DGP, Surrémunération DOM, Ratios bilanciels…).
- **Passe 4** : Audit sélectif + PV contradictoire hybride email/in-app (edge function `send-pv-contradictoire`).
- **Passe 5** : Effet WOW — Dashboard KPI animés, recherche Cmd+K étendue, mode démo, export rapport exécutif.
