---
name: Calendrier annuel AC
description: Module Calendrier annuel de l'agent comptable, bibliothèque pré-remplie d'activités EPLE, exports PDF/Word paysage, mail .eml mensuel, suivi de réalisation, widget Dashboard et badge sidebar
type: feature
---
Module « Calendrier annuel AC » dans la section AUDIT & RESTITUTION (route `/calendrier-annuel`).
Bibliothèque pré-remplie (`src/lib/calendrier-activites.ts`) basée sur GBCP 2012-1246, M9.6, R. 421-64+ et circ. 2011-117 (voyages).
Chaque activité possède : titre, catégorie, périodicité, mois début/fin, date d'échéance personnalisable,
responsable (AC / ER / AC+ER), criticité, affectation multi-établissements rattachés (case « Tous » par défaut),
et suivi de réalisation (case à cocher avec horodatage + auteur via `params.agentComptable`).
Vocabulaire : « établissements rattachés » (ou ER), jamais « les rattachés ». Sous Op@le : « demande de paiement » et « titre de recette ».
Exports : PDF paysage (jspdf + jspdf-autotable), Word paysage A4 (docx + file-saver), mail .eml mensuel
(`src/lib/calendrier-mail.ts`) avec destinataires = emails des ER, contenu = activités du mois courant + retards,
encodage quoted-printable UTF-8, header `X-Unsent: 1` (ouvre en brouillon).
Widget Dashboard `CalendrierAlertesWidget` : 3 KPI (du mois / <7j / en retard) + top 5 alertes.
Badge numérique destructive sur l'item sidebar `calendrier-annuel` (proches7j + retard), recalculé à chaque navigation.
Avertissement intégré aux SG : le non-respect met l'AC en difficulté.
Stockage : `cic_expert_{UAI}_calendrier_annuel_v1`.
