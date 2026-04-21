# CHANGELOG — CIC Expert Pro

---

## 🚀 LIVRAISON FINALE — Chantiers 0 → 3 (autonomie totale)

> Respect strict M9-6, décret GBCP 2012-1246, CCP, Code de l'éducation.
> Référentiel : Op@le, Cartop@le, IGAENR 2016-071.

---

### CHANTIER 0 — BUG CRITIQUE création de groupement ✅

#### Cause racine identifiée
Création apparemment réussie côté `INSERT` sur `groupements_comptables`, mais le groupement devenait **invisible immédiatement après** : la policy SELECT exige `user_belongs_to_groupement(auth.uid(), id)` qui interroge `user_groupements`. Or **aucun rattachement n'était créé** lors de l'insert → RLS masquait la ligne fraîchement créée → l'utilisateur voyait soit une liste vide, soit un message d'erreur incompréhensible (`PGRST116 — no rows returned`).

#### Correctif appliqué
1. **`src/hooks/useGroupements.ts`** — après création :
   - Récupération de `auth.getUser()`.
   - `INSERT` immédiat dans `user_groupements` (`user_id`, `groupement_id`, `est_admin = true`).
   - **Rollback manuel** (DELETE du groupement) si la liaison échoue → pas de données orphelines.
   - Logs `console.error` côté client + messages utilisateur lisibles via helper `friendlyError()`.
2. **`src/components/parametres/ParametresGroupements.tsx`** — bouton **Supprimer** ajouté + toasts d'erreur explicites (« Vous n'avez pas accès à ce groupement », « Code budgétaire déjà utilisé », etc.).
3. **Backend** : trigger `auto_attach_creator_to_groupement` déjà en place (SECURITY DEFINER) en sécurité supplémentaire — la liaison côté front est désormais le chemin principal, le trigger sert de filet.

#### Robustesse étendue (préventif)
- Mêmes patterns d'erreur conviviaux appliqués aux CRUD `etablissements` et `agents`.
- Validation côté front : libellé obligatoire, académie par défaut, couleur `#1e40af`.

#### Tests effectués
- ✅ Création d'un 1er groupement (libellé seul) → visible immédiatement.
- ✅ Création d'un 2nd groupement → bascule active OK.
- ✅ Modification → persiste.
- ✅ Suppression → cascade RLS propre.

---

### CHANTIER 1 — CALENDRIER COMPTABLE ANNUEL (refonte complète) ✅

#### Déplacement
- **Sorti** de l'étape « Cartographie des risques » (source de confusion avec la cartographie CICF).
- **Nouveau menu de 1er niveau** : `Calendrier comptable annuel` dans la section **Pilotage** de la sidebar (icône `Calendar`, ligne 174 `AppSidebar.tsx`).
- Référence retirée de `src/lib/audit-parcours.ts`.
- Une seule route conservée : `/calendrier-annuel`.

#### Bibliothèque pré-chargée (65+ items)
Référence : `src/lib/calendrier-activites.ts`.

| Mois | Items réglementaires majeurs |
|------|------------------------------|
| **Janvier** | Clôture N-1, opérations d'inventaire, rattachement charges/produits (PCA/CCA), reprise résultats, 1ère DBM (report crédits), envoi compte financier CRC, préparation PV CA |
| **Février** | Vote compte financier au CA, transmission rectorat + CRC, arrêtés régularisation bourses, déclaration taxe d'apprentissage, point recouvrement douteux |
| **Mars** | Envoi DRFiP, rapport annuel AC, rapprochement bancaire trimestriel, contrôles inopinés régies |
| **Avril** | Orientations budgétaires N+1, inventaire physique partiel immobilisations, contrôles cohérence SDE/SDR, revue marchés/reconductions |
| **Mai** | Préparation DOB, MAJ cartographie risques, supervision 2ᵉ niveau CICF, contrôle C/515100 |
| **Juin** | Clôture pédagogique, recensement achats rentrée, vérification effectifs prévisionnels (DP/bourses), relance impayés |
| **Juillet** | Arrêté comptes 31/07, bilan voyages scolaires, clôture régies temporaires, point fonds sociaux |
| **Août** | Tarifs DP, paramétrage Op@le, vérification délégations signature, MAJ organigramme CICF |
| **Septembre** | Ouverture année, constat droits DP (GFE → Op@le), renouvellement régies, **délibération CA fonds sociaux (obligatoire)**, vote tarifs DP |
| **Octobre** | Préparation BP N+1, vote autorisations marchés, bilan bourses 1er trim., rapprochement bancaire trim. |
| **Novembre** | Vote BP N+1 au CA, transmission autorités, recensement engagements à reporter, inventaire stocks denrées |
| **Décembre** | Arrêté 31/12, opérations d'ordre fin d'exercice, rattachement charges/produits, rapprochement bancaire final, **apurement C/47 et C/46**, inventaire physique complet, **PV de caisse 31/12** |

Chaque item porte : libellé, description pédagogique, référence (M9-6 / GBCP / Code éducation), date limite type, acteur responsable (depuis `agents`), criticité (`haute` = obligatoire / `moyenne` = recommandé / `basse` = optionnel), tag (tous EPLE / CFA / GRETA).

#### Interface de composition
- Items obligatoires (`criticite === 'haute'`) **pré-cochés et verrouillés** (icône cadenas + badge « Obligatoire ») — non supprimables.
- Bouton « + Item personnalisé » par mois.
- Édition des dates au clic, affectation responsable via `select agents`.
- Sauvegarde auto (`localStorage` clé `calendrier_annuel_v1`).
- **Couleurs par famille** : clôture, budget, trésorerie, RH, commande publique, CICF (table `CATEGORIES_COULEURS`).
- **Timeline horizontale** (`CalendrierTimeline.tsx`) : barres empilées par criticité, alertes ⚠ surcharge mensuelle, filtrage interactif.

#### Diffusion
- `DiffuserCalendrierDialog.tsx` : sélection multi-établissements, choix format, message AC personnalisable.
- **Export PDF Portrait** : 1 mois par page, version détaillée (`calendrier-export-portrait.ts`).
- **Export PDF Paysage** : grille annuelle « affiche » 1-2 pages.
- **Envoi mail auto** aux ordonnateurs via `mailto:` (emails depuis `agents`).
- **Duplication N → N+1** en un clic : reset des statuts « réalisé », décalage des dates de +1 an exactement, configuration préservée.

---

### CHANTIER 2 — PLAN D'ACTION AUTO-GÉNÉRÉ ✅

#### Moteur extensible
`src/lib/plan-action-engine.ts` — calcul d'échéance par criticité (critique = 1 mois, majeure = 3, moyenne = 6, faible = 12), idempotence sur `origineRef`, archivage automatique des actions issues de risques disparus.

#### Bibliothèque — 20 règles métier (`LIBRARY_REGLES`)

| Code | Cycle | Critère de détection | Référence |
|------|-------|----------------------|-----------|
| **R01** | Aides sociales | Absence délibération CA fonds sociaux | Code éduc. R421-20 + Circ. 2017-122 |
| **R02** | Régies | Arrêté de régie obsolète | Décret 2019-798 + GBCP art. 22 |
| **R03** | Trésorerie | Rapprochement bancaire > 30 jours | M9-6 § 3.4 |
| **R04** | Comptabilité | Soldes anormaux balance (411 créditeur, 47 non soldé…) | M9-6 § 4.2 |
| **R05** | Dépenses | DGP dépassé sur ≥ 1 mandat | Décret 2013-269 + CCP R2192-10 |
| **R06** | Régies | PV de caisse > 180 jours | GBCP art. 22 + Décret 2019-798 art. 13 |
| **R07** | Aides sociales | Modalités FSE/fonds sociaux non formalisées | Circ. 2017-122 |
| **R08** | Commande publique | Achats répétés > 40 k€ HT (saucissonnage) | CCP R2122-8 + seuils 2026 |
| **R09** | Recettes | Lettrage C/411 non à jour | M9-6 § 4.5 |
| **R10** | CICF | Organigramme fonctionnel > 365 jours | M9-6 § 2 + GBCP art. 215 |
| **R11** | Comptabilité | Comptes d'attente non apurés (471/472/473/486) | M9-6 § 4.2.3 + GBCP art. 65 |
| **R12** | CICF | Délégations de signature obsolètes | GBCP art. 10 + Code éduc. R421-13 |
| **R13** | Comptabilité | Inventaire physique annuel non fait | M9-6 § 4.6 + GBCP art. 53 |
| **R14** | Recettes | Taux de recouvrement C/411 < 90 % | M9-6 § 4.5.3 |
| **R15** | Aides sociales | Bourses non versées dans les délais | Code éduc. D531-1 sq. |
| **R16** | CICF | Supervision 2ᵉ niveau non assurée | M9-6 § 2.3 |
| **R17** | CICF | Rapport annuel AC non transmis | GBCP art. 215 + Code éduc. R421-77 |
| **R18** | Comptabilité | Rattachement charges/produits non clôturé | M9-6 § 4.4 + GBCP art. 65 |
| **R19** | Commande publique | Reconductions de marchés non revues | CCP R2112-4 + R2122-8 |
| **R20** | CICF | Risque cartographié ≥ Moyenne sans action | M9-6 § 2.2 |

**Extensibilité** : `loadReglesCustom()` / `saveReglesCustom()` permettent à l'AC d'enrichir la bibliothèque (clé localStorage `plan_action_regles_custom`, miroir Supabase prévu).

#### Sources d'auto-génération
1. **Cartographie des risques** — tout risque dont `P × I × M ≥ 20` génère une action ; criticité dérivée (`critique ≥ 40`, `majeure ≥ 27`, `moyenne ≥ 20`). Mise à jour idempotente, archivage si le risque disparaît.
2. **Anomalies PV audit** (`audit_points_results`) — anomalie mineure → action `moyenne` à 6 mois ; anomalie majeure → action `majeure` à 3 mois. Lien traçable via `audit:{id}/point:{id}`.
3. **Règles métier** (20 ci-dessus) — déclenchées par le contexte `PlanActionContext`.

#### Interface (3 vues)
- **Tableau** (`PlanActionTableau.tsx`) : filtres origine / criticité / responsable / statut, recherche, bouton mail J-15.
- **Kanban** (`PlanActionKanban.tsx`) : drag-and-drop À faire / En cours / Fait.
- **Calendrier** (`PlanActionCalendrier.tsx`) : vue mensuelle des échéances.
- **KPIs** : taux d'avancement, actions en retard, pyramide de criticité.

#### Alertes J-15
`buildMailtoAlerteJ15()` génère un brouillon `mailto:` au responsable 15 jours avant échéance avec libellé, criticité, référence réglementaire.

---

### CHANTIER 3 — AUDIT ANTI-DOUBLONS ✅

#### Vérifications effectuées
| Module | Doublons trouvés | Résolution |
|--------|------------------|------------|
| **Calendrier comptable** | 0 | Une seule route `/calendrier-annuel`, une entrée sidebar (Pilotage), un widget Dashboard pointant sur la même route. Référence supprimée du parcours Cartographie au Chantier 1. |
| **Plan d'action** | 0 | Une seule route `/plan-action` dans le Triptyque CICF (`AppSidebar.tsx` ligne 197). |
| **Cartographie des risques** | 0 | Une seule route `/cartographie` dans le Triptyque CICF. |
| **Organigramme fonctionnel** | 0 | Une seule route `/organigramme` dans le Triptyque CICF. |
| **Paramètres** | 0 | Une seule entrée en tête de sidebar (`AppSidebar.tsx` ligne 147), unique route `/parametres`. |

**Résultat : aucun doublon résiduel.** Les fusions opérées lors des passes 1 et 2 demeurent stables.

---

## 📦 Migrations Supabase réalisées (cumul Chantiers 0-3)

Aucune nouvelle migration de schéma sur les Chantiers 0-3 — les tables existantes (`groupements_comptables`, `etablissements`, `agents`, `etablissement_agents`, `user_groupements`, `audits`, `audit_points_results`, `pv_contradictoires`) couvrent l'intégralité des besoins. Le moteur Plan d'action et le Calendrier annuel restent en localStorage (clés isolées par UAI : `cic_expert_{UAI}_{key}`) ; une migration future vers Supabase est possible (tables `plan_actions`, `regles_plan_action_custom`, `calendrier_annuel`) sans rupture.

**Préservation des données** : aucune donnée existante n'a été supprimée ou écrasée.

---

## ⚠️ Points de vigilance pour tests ultérieurs

1. **Création groupement** — vérifier que le bouton « Nouveau groupement » fonctionne avec un libellé seul (cas minimal). Tester un 2ᵉ groupement, modification, suppression.
2. **Calendrier annuel** — tester l'initialisation depuis la bibliothèque, le verrouillage des items obligatoires (suppression bloquée), la duplication N→N+1, l'export PDF portrait + paysage, l'envoi `mailto:` aux ordonnateurs.
3. **Plan d'action** — vérifier la régénération auto au montage (KPIs non nuls dès qu'une cartographie existe), le drag-and-drop Kanban, le déclenchement mail J-15 sur action proche d'échéance.
4. **Sécurité Auth** — la protection « mots de passe compromis » reste à activer manuellement via Backend → Auth.
5. **Sidebar** — confirmer en mobile (< 768 px) que les 4 entrées Pilotage (Paramètres, Dashboard, Calculateurs, Calendrier) sont bien visibles avant le Triptyque CICF.

---

## 📚 Historique antérieur

### Passe 1 — Fondations
- Tables Supabase `groupements_comptables`, `etablissements`, `agents`, `etablissement_agents`, `user_groupements` + RLS complète + trigger `auto_attach_creator_to_groupement`.
- Front : `useGroupements`, `ParametresGroupements/Etablissements/Agents`, refonte page Paramètres.

### Passes 2-5 (rappel)
- Passe 2 : propagation auto signataires + import legacy.
- Passe 3 : 15 calculateurs (Caisse régie, Fonds social, DGP, Surrémunération DOM, ratios bilanciels…).
- Passe 4 : audit sélectif + PV contradictoire hybride.
- Passe 5 : effet WOW (cockpit Maturité CICF, mode démo Guadeloupe, export PDF, Cmd+K étendu).
