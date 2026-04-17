# Memory: index.md
Updated: now

# Project Memory

## Core
App: CIC Expert Pro (lang="fr"), deployed at auditac.lovable.app. Mobile-first SPA.
Stack: React, Supabase (Auth/RLS), Zod. Base64 docs in localStorage.
Data isolation: LocalStorage keys must be prefixed with `cic_expert_{UAI}_{key}`.
Navigation: All pages always accessible. Audit scope only affects PV inclusion and visibility.
Style: Institutional dashboard. Deep blue, slate gray. Gold disk logo. Cards with soft shadows, responsive grids.
Domain: EPLE accounting audit. Use Op@le terminology ("demande de paiement", "titre de recette", comptes 6 chiffres). Follow M9-6 & GBCP frameworks. Always say "établissements rattachés" or "ER", never "les rattachés".

## Memories
- [Project Context](mem://project/context) — Internal accounting audit tool for EPLE, focusing on BA and 185000
- [Project Structure](mem://project/structure) — 5 main sections, merged modules to avoid duplicates
- [Project Identity](mem://project/identity) — UAI identification, CFA/GRETA support, max 20 establishments per group
- [Terminology](mem://project/terminology) — Op@le terminology and CARTOP@LE models
- [UI Header](mem://project/ui-header) — Persistent header showing active establishment (UAI, Name, City)
- [Team Management](mem://project/team-management) — Permanent team management, select auditors per session
- [Establishment Governance](mem://project/establishment-governance) — Ordonnateur & SG per establishment, compliance alerts on change
- [Navigation Logic](mem://project/navigation-access-logic) — Pages accessible regardless of audit scope
- [Printing Support](mem://project/printing-support) — @media print for A4 layout, hiding UI elements for PV
- [Selective Reporting](mem://audit/selective-reporting) — Audit scope configurable, limits PV inclusion
- [School Trips](mem://audit/school-trips) — Risk scoring based on gap between receipts and expenses
- [Risk Assessment](mem://audit/risk-assessment) — Risk mapping (PxIxM), critical >= 40, link to audit findings
- [Reporting PV](mem://audit/reporting-pv) — A4, serif, auto-generated professional report with 4 statuses
- [Control Plan](mem://audit/control-plan) — Control types library based on M9-6 nomenclature
- [Calendrier annuel AC](mem://audit/calendrier-annuel) — Calendrier annuel agent comptable, bibliothèque pré-remplie, exports PDF/Word paysage
- [Catering](mem://audit/catering) — Weight calculators, frequency rate formula
- [Ordonnateur Compliance](mem://audit/ordonnateur-compliance) — Pre-filled official accreditation forms
- [Budgets Annexes](mem://audit/budgets-annexes) — Attach CFA/GRETA to main EPLE, 8 mandatory audit points
- [Regies Compliance](mem://audit/regies-compliance) — 14 mandatory control points for régies
- [Audit Trail](mem://audit/audit-trail) — Manual chronological tracking of control events
- [Regulatory Updates](mem://audit/regulatory-updates) — Dismissible alerts for legal deadlines
- [Dashboard Management](mem://audit/dashboard-management) — Centralized risk pilot, dynamic module visibility
- [Payment Suspension](mem://compliance/payment-suspension) — 5 legal motives to suspend payment
- [Grants](mem://compliance/grants) — 4-year forfeiture rule and balance clearance
- [Social Funds](mem://compliance/social-funds) — Legal guardian check, bourses + funds <= school fees
- [Procurement Thresholds](mem://compliance/procurement-thresholds) — 2026 legal thresholds, 30-day payment limit
- [Regulatory Framework](mem://compliance/regulatory-framework) — GBCP 2012-1246, M9-6, Code éducation
- [Legal Framework](mem://compliance/legal-framework) — GDPR, cookie banner, JSON export, account deletion
- [Autonomy Formula](mem://finance/autonomy) — Financial autonomy = Global treasury - debts
- [Accounting Annex](mem://finance/accounting-annex) — Narrative accounting annex in landscape format
- [Working Capital](mem://finance/working-capital) — FDRM IGAENR 2016-071 model, divisor C/360
- [Account 185000](mem://finance/account-185000) — Perfect compensation of cash movements (Planche 16)
- [Financial Analysis M96](mem://finance/financial-analysis-m96) — M9-6 § 4.5.3 methodology, DRFN / 365
- [Daily Controls](mem://finance/accounting-controls-daily) — Monitor waiting accounts (471, 472, 473, 486, 487)
- [Visual Identity](mem://style/visual-identity) — Colors, animations, glassmorphism header
- [Branding](mem://style/branding) — Gold disk logo on all touchpoints
- [Mobile UX](mem://style/mobile-ux) — Bottom nav, hidden UAI selector, default closed sidebar
- [Responsive Patterns](mem://style/responsive-patterns) — Adaptive tables and forms
- [User Profiles](mem://auth/user-profiles) — Profiles table with RLS, auto-creation trigger
- [Security Posture](mem://tech/security-posture) — Zod validation, rate limit, 30min inactivity logout
- [UAI Isolation](mem://tech/data-storage/uai-isolation) — LocalStorage prefixing `cic_expert_{UAI}_{key}`
- [Persistence Model](mem://tech/data-storage/persistence-model) — Supabase Auth, local Base64 storage for docs
