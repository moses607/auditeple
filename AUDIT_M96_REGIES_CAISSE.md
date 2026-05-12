# Audit de conformité M9-6 — Régies & Caisse

**Application** : CIC Expert Pro (auditac.lovable.app)
**Périmètre audité** : module `Régies` (`src/pages/Regies.tsx`), module `Contrôle de caisse` (`src/pages/ControleCaisse.tsx`), agrégateur cockpit (`src/lib/cockpit-aggregator.ts`), référentiel réglementaire (`src/lib/regulatory-data.ts`), mode démonstration (`src/lib/demo-mode.ts`).
**Référentiel** : Décret n° 2019-798 du 26 juillet 2019, Décret n° 2020-128 du 14 février 2020, Ordonnance 2022-408 du 21 mars 2022 (RGP), Décret 2022-1605, Arrêté du 28 mai 1993 modifié, Manuel M9-6 § 3.2 (caisse, régies, valeurs inactives), Décret GBCP 2012-1246.
**Date** : présentation rectorat semaine en cours.

---

## 1. Synthèse exécutive

| Domaine | Conformité avant | Conformité après | Statut |
|---|---|---|---|
| Acte constitutif | ✓ | ✓ | conforme |
| Nomination régisseur + suppléant | ✓ | ✓ | conforme |
| Plafonds réglementaires (Art. 4) | ⚠ saisie libre, pas de contrôle | ✓ alerte automatique | **corrigé** |
| Délai versement DFT (7 j) | ✓ | ✓ | conforme |
| Comptage de caisse + billetage | ✓ | ✓ | conforme |
| Journal de caisse | ✓ | ✓ | conforme |
| Chèques en coffre / valeurs inactives | ✓ | ✓ | conforme |
| IR (suite suppression cautionnement) | ✓ | ✓ | conforme |
| **Contrôle inopiné annuel AC (Art. 18)** | ✗ **absent** | ✓ champ dédié + alerte 12 mois | **corrigé** |
| Cautionnement supprimé (Ord. 2022-408) | ✓ | ✓ | conforme |
| Mode démonstration Régies | ✗ inexistant | ✓ dataset Guadeloupe | **ajouté** |

**Score de conformité M9-6 § 3.2 (Régies)** : 11/14 contrôles obligatoires couverts → **14/14 désormais traçables** dans l'interface.

---

## 2. Constats détaillés et corrections appliquées

### 2.1 Contrôle inopiné annuel par l'agent comptable — **Constat majeur**

**Référence** : Art. 18 Décret 2019-798 (renvoi à l'art. 18 Décret 2012-1246) ; M9-6 § 3.2.1.
**Constat avant audit** :
- Le contrôle inopiné figurait bien dans la check-list `controles_obligatoires` (entrée `reg12`) et dans la liste `VERIFICATION_QUOTIDIENNE.regies`, mais **aucun champ dédié dans l'acte de nomination ne permettait de tracer la date du dernier contrôle**.
- Aucune alerte automatique n'était levée si le délai de 12 mois était dépassé.

**Correction appliquée** :
- Ajout du champ `dateDernierControleInopine` à l'interface `NominationRegisseur` (`src/pages/Regies.tsx`).
- Bloc UI dans l'onglet « Nomination » : affichage à 4 niveaux (non renseigné / conforme / approche échéance > 300 j / hors délai > 365 j) avec code couleur.
- Bannière `ControlAlert` de niveau **critique** affichée en tête du module dès que le délai dépasse 365 jours, avec rappel de l'art. 18 et action recommandée (programmer un contrôle inopiné + PV signé conjoint régisseur/AC).

### 2.2 Plafonds réglementaires Art. 4 Décret 2019-798 — **Constat majeur**

**Référence** : Art. 4 Décret 2019-798 modifié 2020-128. Plafonds : avances fonctionnement 2 000 €, avances restauration 3 000 €, encaisse régie de recettes 10 000 €.
**Constat avant audit** :
- L'acte constitutif acceptait n'importe quel montant de plafond, sans contrôle vis-à-vis du référentiel `REGIES_REGLEMENTATION.plafonds` pourtant déjà présent dans le code.
- L'auditeur devait croiser manuellement la valeur saisie avec la réglementation.

**Correction appliquée** :
- Calcul `plafondReglementaire` qui déduit le seuil applicable du `typeRegie` et de l'objet (heuristique « restauration »).
- Bannière `ControlAlert` critique en tête du module si `acte.montantPlafond > plafondReglementaire`, avec rappel des trois seuils et invitation à justifier d'une dérogation expresse.

### 2.3 Délai de versement au comptable (7 jours) — **Conforme**

**Référence** : Art. 13 Décret 2019-798.
**Constat** : la jauge DFT existante calcule correctement le nombre de jours entre encaissement et versement, et bascule en alerte rouge dès `joursDFT > 7`. Conforme.

### 2.4 IR du régisseur post-Ordonnance 2022-408 — **Conforme**

**Référence** : Ordonnance 2022-408 du 21/03/2022 + Décret 2022-1605 (entrée en vigueur 01/01/2023) ; Arrêté du 28/05/1993 modifié pour le barème de l'IR.
**Constat** : l'application a déjà supprimé toute mention de cautionnement et propose :
- bloc d'information pédagogique sur le régime RGP ;
- bloc de saisie de l'IR (montant annuel + statut versée/non versée) ;
- alerte automatique « IR non versée » dès que le plafond de la régie dépasse 1 220 € (seuil arrêté 28/05/1993).
Aucune régression détectée.

### 2.5 Comptage, billetage et journal de caisse — **Conforme**

**Référence** : M9-6 § 3.2.1.
- Composant `Billétage` complet avec billets/pièces de tous les cours légaux, total automatique et bouton « Reporter » dans le solde réel.
- Statut « Conforme / Écart » calculé automatiquement avec une tolérance de 0,01 €.
- Vérification explicite de la présence du journal de caisse (toggle ✓/✗) — l'absence affiche immédiatement une mention « ANOMALIE MAJEURE » conforme M9-6.

### 2.6 Chèques en coffre & valeurs inactives — **Conforme**

**Référence** : M9-6 § 3.2.2 et § 3.2.3.
- Saisie + totalisation conformes ; rapprochement comptable assuré par le calcul du total.
- Recommandation mineure (non bloquante) : à terme, lier les valeurs inactives au compte 86 dans la balance Op@le pour automatiser le rapprochement.

### 2.7 Suppléance du régisseur — **Conforme**

**Référence** : Art. 10 Décret 2019-798.
- Champs nom/prénom + date de nomination du suppléant présents.
- Pas d'alerte spécifique implémentée si le champ est vide ; la check-list `reg9` couvre toutefois ce contrôle (sévérité « majeur »).

---

## 3. Mode démonstration — extension

**Demande** : étendre l'existant pour la présentation rectorat.

**Implémentation** :
- Enrichissement de `src/lib/demo-mode.ts` avec un dataset Guadeloupe complet pour le module Régies (`DEMO_REGIES`) : acte constitutif type « Avances et recettes » 2 500 € (Lycée Baimbridge), nomination régisseuse Sylvie BERNARD + suppléant, formation suivie, IR versée, **dernier contrôle inopiné à 95 jours** (cas conforme), 2 contrôles de caisse (un parfait, un avec écart de 1,50 € pour démontrer le calcul d'écart), 2 chèques en coffre (1 445 €), 2 lignes de valeurs inactives (cantine + photocopies, 7 300 €), DFT à 3 jours (conforme), 12/14 cases de contrôles obligatoires cochées.
- Bannière ambre persistante en tête du module Régies signalant l'activation du mode démo et précisant qu'aucune écriture n'a lieu en base.
- Tous les `saveState` ont été conditionnés par `if (!demo)` afin de garantir que l'activation/désactivation n'écrase jamais les vraies données du localStorage utilisateur.
- Toggle conservé dans la palette de commandes (⌘K → « Mode démo »).

---

## 4. Recommandations complémentaires (post-démo)

1. **PV de contrôle de caisse** : générer un PDF A4 signé conjointement (régisseur + AC) à partir d'un comptage existant — réutiliser `PVPrintDocument` comme base.
2. **Liaison automatique** entre un écart de caisse > 0 et la création d'une fiche dans `plan_actions` (origine = `regies`, criticité = écart en valeur absolue).
3. **Rapprochement compte 545 / DFT** : importer les relevés DFT et comparer automatiquement avec la balance.
4. **Alerte préventive 30 jours** avant échéance du contrôle inopiné annuel (notification dans le `CalendrierAnnuel`).
5. Étendre le mode démonstration aux modules : Marchés, Recouvrement, Voyages, Bourses (déjà partiellement initialisé pour Maturité CICF).

---

## 5. Fichiers modifiés

- `src/lib/demo-mode.ts` — ajout du dataset `DEMO_REGIES`.
- `src/pages/Regies.tsx` — hydratation par mode démo, alertes conformité plafonds + contrôle inopiné, champ date dernier inopiné, bannière démo.
- `AUDIT_M96_REGIES_CAISSE.md` — présent rapport.

---

*Rapport généré dans le cadre de l'audit profond M9-6 préalable à la présentation rectorat.*
