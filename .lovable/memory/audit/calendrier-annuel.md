---
name: Calendrier annuel AC
description: Module Calendrier annuel de l'agent comptable, bibliothèque pré-remplie d'activités EPLE, exports PDF et Word paysage
type: feature
---
Module « Calendrier annuel AC » dans la section AUDIT & RESTITUTION (route `/calendrier-annuel`).
Bibliothèque pré-remplie (`src/lib/calendrier-activites.ts`) basée sur GBCP 2012-1246, M9.6, R. 421-64+ et circ. 2011-117 (voyages).
Chaque activité possède : titre, catégorie, périodicité, mois début/fin, date d'échéance personnalisable,
responsable (AC / ER / AC+ER), criticité, et affectation multi-établissements rattachés (case « Tous » par défaut).
Vocabulaire : « établissements rattachés » (ou ER), jamais « les rattachés ». Sous Op@le : « demande de paiement » et « titre de recette ».
Exports : PDF paysage (jspdf + jspdf-autotable) et Word paysage A4 (docx + file-saver), regroupés par mois.
Avertissement intégré aux SG : le non-respect met l'AC en difficulté.
Stockage : `cic_expert_{UAI}_calendrier_annuel_v1`.
