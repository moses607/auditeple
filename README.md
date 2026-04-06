# CIC Expert Pro — Audit comptable EPLE

Application de Contrôle Interne Comptable pour les Établissements Publics Locaux d'Enseignement.

## Stack technique

- **Frontend** : React 18 + TypeScript + Vite 5
- **UI** : Tailwind CSS 3 + shadcn/ui
- **Auth** : Supabase (email/password + Google OAuth)
- **Données métier** : localStorage (préfixe `cic_expert_`)
- **Graphiques** : Recharts

## Démarrage local

```bash
npm install
npm run dev
```

L'application sera disponible sur `http://localhost:8080`.

## Variables d'environnement

Créer un fichier `.env` à la racine :

```
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
```

## Build de production

```bash
npm run build
```

Le build est généré dans `dist/`. Déployable sur Vercel, Netlify ou tout hébergeur statique.

## Modules (27)

- **Contrôles sur place** : Régies, Stocks, Rapprochement bancaire
- **Vérification & Ordonnateur** : Vérification quotidienne, Contrôle ordonnateur, Droits constatés, Dépenses
- **Gestion comptable** : Voyages scolaires, Restauration
- **Finances & Budget** : Analyse financière, Fonds de roulement, Recouvrement, Marchés publics, Subventions, Budgets annexes
- **Contrôle interne** : Cartographie des risques, Organigramme, Plan d'action, Plan de contrôle
- **Audit & Restitution** : PV d'audit, Annexe comptable, Piste d'audit, Paramètres
