/**
 * Collecteur universel d'anomalies — scanne tous les modules et remonte
 * les cases non cochées, écarts, et problèmes détectés automatiquement.
 */
import { loadState } from './store';
import { PVVerification, ECHELONS_BOURSES } from './types';
import { getModules } from './audit-modules';

export interface ModuleAnomalies {
  moduleId: string;
  moduleLabel: string;
  anomalies: PVVerification[];
}

// ═══ Voyages scolaires ═══
function collectVoyages(): PVVerification[] {
  const voyages = loadState<any[]>('voyages', []);
  const anomalies: PVVerification[] = [];
  const PIECES = [
    { key: 'listeParticipants', label: 'Liste des participants' },
    { key: 'budgetVoyage', label: 'Budget prévisionnel du voyage' },
    { key: 'acteCA_programmation', label: 'Acte du CA sur la programmation' },
    { key: 'acteCA_financement', label: 'Acte du CA sur le financement' },
    { key: 'acteCA_conventions', label: 'Acte du CA sur les conventions' },
    { key: 'acteCA_dons', label: 'Actes du CA autorisant les dons' },
  ];

  voyages.forEach(v => {
    const nom = v.intitule || 'Voyage sans intitulé';
    // Pièces manquantes
    PIECES.forEach(p => {
      if (!v[p.key]) {
        anomalies.push({
          label: `${nom} — ${p.label} manquant(e)`,
          reference: 'Circ. voyages scolaires',
          criticite: 'MAJEURE',
          status: 'anomalie',
          observations: `La pièce obligatoire « ${p.label} » n'est pas fournie pour le voyage « ${nom} ».`,
        });
      }
    });
    // Risque financier élevé
    if (v.montantTotal > 0) {
      const recettes = (v.montantEncaisseFamilles || 0) + (v.notificationCollectivites ? (v.montantNotifie || 0) : 0);
      const risque = 1 - recettes / v.montantTotal;
      if (risque > 0.5) {
        anomalies.push({
          label: `${nom} — Risque financier élevé (${Math.round(risque * 100)}%)`,
          reference: 'Gestion prudentielle',
          criticite: 'MAJEURE',
          status: 'anomalie',
          observations: `Taux de couverture insuffisant : ${Math.round((1 - risque) * 100)}%. Recettes sûres : ${recettes}€ / Total : ${v.montantTotal}€.`,
        });
      }
    }
  });
  return anomalies;
}

// ═══ Vérification quotidienne ═══
function collectVerification(): PVVerification[] {
  const checks = loadState<Record<string, boolean>>('verification_checks', {});
  const anomalies: PVVerification[] = [];
  const ITEMS: Record<string, string> = {
    v1: "Comptage de la caisse de l'agent comptable",
    v2: "Vérification du solde du compte DFT",
    v3: "Rapprochement bancaire à jour",
    v4: "Vérification des chéquiers",
    v5: "Contrôle des remises de chèques",
    v6: "Vérification de la balance générale",
    v7: "Contrôle des journaux",
    v8: "Suivi des comptes d'attente",
    v9: "Concordance GFC/Op@le",
    v10: "Contrôle du compte 472",
    v11: "Vérification du compte 515",
    v12: "Vérification des régies d'avances",
    v13: "Vérification des régies de recettes",
    v14: "Actes constitutifs des régies à jour",
    v15: "IR des régisseurs versée (cautionnement supprimé — Ord. 2022-408)",
    v16: "État des créances à recouvrer",
    v17: "Suivi des titres de recettes émis",
    v18: "Contrôle des encaissements du jour",
    v19: "Relances effectuées (créances anciennes)",
    v20: "Mandats en attente de paiement",
    v21: "Vérification des pièces justificatives du jour",
    v22: "Contrôle des oppositions (ATD, saisies)",
    v23: "Organigramme fonctionnel du service",
    v24: "Séparation des tâches vérifiée",
    v25: "Accès aux applications sécurisés",
    v26: "Coffre-fort vérifié",
  };

  // Only flag items that are explicitly false or absent (i.e. not checked)
  Object.entries(ITEMS).forEach(([id, label]) => {
    if (!checks[id]) {
      anomalies.push({
        label: `Vérification non effectuée : ${label}`,
        reference: 'M9-6 — Contrôle sur place',
        criticite: 'MINEURE',
        status: 'anomalie',
        observations: `Le point de contrôle « ${label} » n'a pas été coché comme vérifié.`,
      });
    }
  });
  return anomalies;
}

// ═══ Régies ═══
function collectRegies(): PVVerification[] {
  const controles = loadState<any[]>('ctrl_caisse', []);
  const nomination = loadState<any>('regies_nomination', {});
  const acte = loadState<any>('regies_acte_constitutif', {});
  const anomalies: PVVerification[] = [];

  controles.forEach(c => {
    if (c.ecart !== 0) {
      anomalies.push({
        label: `Écart de caisse du ${c.date} (${c.regisseur})`,
        reference: 'M9-6 § 3.2 — Décret 2012-1246',
        criticite: Math.abs(c.ecart) > 10 ? 'MAJEURE' : 'MINEURE',
        status: 'anomalie',
        observations: `Théorique : ${c.theorique}€, Réel : ${c.reel}€, Écart : ${c.ecart}€`,
      });
    }
    if (c.journalCaisse === false) {
      anomalies.push({
        label: `Absence de journal de caisse — ${c.date}`,
        reference: 'M9-6 § 3.2',
        criticite: 'MAJEURE',
        status: 'anomalie',
        observations: 'Le journal de caisse est obligatoire. Son absence constitue une anomalie majeure.',
      });
    }
  });

  // Indemnité de responsabilité (cautionnement supprimé par Ord. 2022-408)
  if (nomination.plafondEncaisse > 1220 && !nomination.indemniteResponsabilite) {
    anomalies.push({
      label: `Régisseur — Indemnité de responsabilité non versée (plafond > 1 220 €)`,
      reference: 'Arrêté du 28 mai 1993 — Décret 2022-1605 (RGP)',
      criticite: 'MAJEURE',
      status: 'anomalie',
      observations: `Le plafond d'encaisse (${nomination.plafondEncaisse}€) dépasse le seuil de 1 220 €. L'indemnité de responsabilité doit être versée au régisseur. Le cautionnement n'est plus exigé depuis l'ordonnance 2022-408.`,
    });
  }

  if (!acte.referenceArrete) {
    anomalies.push({
      label: 'Acte constitutif de la régie — référence manquante',
      reference: 'Décret 2019-798',
      criticite: 'MAJEURE',
      status: 'anomalie',
      observations: 'L\'acte constitutif de la régie ne comporte pas de référence d\'arrêté.',
    });
  }

  return anomalies;
}

// ═══ Stocks ═══
function collectStocks(): PVVerification[] {
  const stocks = loadState<any[]>('stocks', []);
  const anomalies: PVVerification[] = [];

  // Écarts inventaire
  stocks.filter(s => s.ecart !== 0).forEach(s => anomalies.push({
    label: `Écart stock : ${s.nom}`,
    reference: 'M9-6 § 2.1.4 — Inventaire physique',
    criticite: Math.abs(s.ecart) > 5 ? 'MAJEURE' : 'MINEURE',
    status: 'anomalie',
    observations: `Théorique: ${s.theo}, Physique: ${s.phys}, Écart: ${s.ecart}`,
  }));

  // Stock dormant > 12 mois (rotation)
  stocks.forEach(s => {
    if (!s.dlc || !s.valeur) return;
    const moisDepuisDLC = (Date.now() - new Date(s.dlc).getTime()) / (30 * 86400000);
    if (moisDepuisDLC > 12 && s.valeur > 0) {
      anomalies.push({
        label: `Stock dormant : ${s.nom} (DLC dépassée de ${Math.round(moisDepuisDLC)} mois)`,
        reference: 'M9-6 § 2.1.4 — Rotation stocks',
        criticite: 'MAJEURE',
        status: 'anomalie',
        observations: `Valeur résiduelle : ${s.valeur}€. Article sans rotation depuis plus de 12 mois — déclassement, dépréciation (C/6817) ou destruction (PV) requis.`,
      });
    }
  });

  return anomalies;
}

// ═══ Rapprochement bancaire ═══
function collectRapprochement(): PVVerification[] {
  const rappro = loadState<any[]>('rapprochement', []);
  return rappro.filter(r => r.ecart !== 0).map(r => ({
    label: `Écart rapprochement bancaire du ${r.date}`,
    reference: 'M9-6 § 4.3.3',
    criticite: 'MAJEURE' as const,
    status: 'anomalie' as const,
    observations: `DFT: ${r.dft}, Compta: ${r.compta}, Écart: ${r.ecart}`,
  }));
}

// ═══ Droits constatés (bourses + fonds sociaux) ═══
function collectDroitsConstates(): PVVerification[] {
  const boursiers = loadState<any[]>('bourses', []);
  const fondsSociaux = loadState<any[]>('fonds_sociaux', []);
  const anomalies: PVVerification[] = [];

  boursiers.forEach(b => {
    if (!b.responsableVerifie) {
      anomalies.push({
        label: `Bourse ${b.nom} — Responsable légal non vérifié`,
        reference: 'M9-6 § 3.2.7.6.2',
        criticite: 'MAJEURE',
        status: 'anomalie',
        observations: `Le responsable légal percevant la bourse de l'élève ${b.nom} n'a pas été vérifié.`,
      });
    }
    if (b.statut === 'Retard versement') {
      anomalies.push({
        label: `Bourse ${b.nom} — Retard de versement`,
        reference: 'Programme 230',
        criticite: 'MINEURE',
        status: 'anomalie',
        observations: `Versé : ${b.verse}€ sur ${b.annuel}€ annuel.`,
      });
    }
  });

  fondsSociaux.forEach(fs => {
    if (fs.type === 'FSC' && fs.fraisScolaires) {
      const totalAides = (fs.montantBourse || 0) + fs.montant;
      if (totalAides > fs.fraisScolaires) {
        const excedent = totalAides - fs.fraisScolaires;
        anomalies.push({
          label: `FSC ${fs.nom} — Versement interdit à la famille`,
          reference: 'Circ. 2017-122',
          criticite: 'MAJEURE',
          status: 'anomalie',
          observations: `Bourse (${fs.montantBourse}€) + FSC (${fs.montant}€) = ${totalAides}€ > Frais scolaires (${fs.fraisScolaires}€). Excédent de ${excedent}€ constitue un versement interdit.`,
        });
      }
    }
  });

  return anomalies;
}

// ═══ Subventions ═══
function collectSubventions(): PVVerification[] {
  const subv = loadState<any[]>('subventions', []);
  const anomalies: PVVerification[] = [];

  subv.forEach(s => {
    if (s.reliquat > 0) {
      anomalies.push({
        label: `Subvention ${s.type} — Reliquat non consommé`,
        reference: 'Suivi subventions',
        criticite: 'MINEURE',
        status: 'anomalie',
        observations: `Reliquat de ${s.reliquat}€. Qu'est-ce qui empêche d'apurer ce reliquat ?`,
      });
    }
    if (s.dateVersement) {
      const diffYears = (Date.now() - new Date(s.dateVersement).getTime()) / (365.25 * 24 * 3600 * 1000);
      if (diffYears >= 4) {
        anomalies.push({
          label: `Subvention ${s.type} — Déchéance quadriennale atteinte`,
          reference: 'Loi du 31 décembre 1968',
          criticite: 'MAJEURE',
          status: 'anomalie',
          observations: `Subvention versée le ${s.dateVersement}. La déchéance quadriennale est atteinte. Régularisation obligatoire.`,
        });
      } else if (diffYears >= 3) {
        anomalies.push({
          label: `Subvention ${s.type} — Alerte déchéance quadriennale`,
          reference: 'Loi du 31 décembre 1968',
          criticite: 'MINEURE',
          status: 'anomalie',
          observations: `Subvention versée le ${s.dateVersement}. Déchéance dans moins d'un an.`,
        });
      }
    }
  });

  return anomalies;
}

// ═══ Restauration ═══
function collectRestauration(): PVVerification[] {
  const grammages = loadState<any[]>('rest_grammages', []);
  const va = loadState<any>('rest_ventes_achats', {});
  const titres = loadState<any[]>('rest_titres_recettes', []);
  const contrat = loadState<any>('rest_contrat', {});
  const mois = loadState<any[]>('restauration', []);
  const anomalies: PVVerification[] = [];

  // Seuils EGAlim (Loi 2018-938) sur le dernier mois
  const last = mois[0];
  if (last) {
    if (last.bio < 20) {
      anomalies.push({
        label: `EGAlim — Taux bio insuffisant (${last.bio}%)`,
        reference: 'Loi EGAlim 2018-938 — Art. 24',
        criticite: last.bio < 10 ? 'MAJEURE' : 'MINEURE',
        status: 'anomalie',
        observations: `Mois ${last.mois} : ${last.bio}% bio constaté, seuil légal 20%. Réviser la politique d'approvisionnement et tracer les justificatifs.`,
      });
    }
    if (last.durable < 50) {
      anomalies.push({
        label: `EGAlim — Taux produits durables insuffisant (${last.durable}%)`,
        reference: 'Loi EGAlim 2018-938 — Art. 24',
        criticite: last.durable < 25 ? 'MAJEURE' : 'MINEURE',
        status: 'anomalie',
        observations: `Mois ${last.mois} : ${last.durable}% durable constaté, seuil légal 50%.`,
      });
    }
  }

  grammages.forEach(g => {
    if (g.ecart > g.quantiteNecessaire * 0.1) {
      anomalies.push({
        label: `Sur-commande : ${g.denree} le ${g.date}`,
        reference: 'Contrôle grammage / effectif',
        criticite: 'MINEURE',
        status: 'anomalie',
        observations: `Commandé ${g.quantiteCommandee} kg vs besoin ${g.quantiteNecessaire} kg. Excédent de ${g.ecart} kg.`,
      });
    }
  });

  if (va.ecart && va.ecart < 0) {
    anomalies.push({
      label: `Restauration — Ventes < Achats`,
      reference: 'Équilibre financier SRH',
      criticite: 'MAJEURE',
      status: 'anomalie',
      observations: `Ventes : ${va.totalVentes}€, Achats : ${va.totalAchats}€. Déficit de ${Math.abs(va.ecart)}€.`,
    });
  }

  const nonEnregistres = titres.filter((t: any) => !t.enregistre);
  if (nonEnregistres.length > 0) {
    anomalies.push({
      label: `${nonEnregistres.length} titre(s) de recette cuisine non enregistré(s)`,
      reference: 'Cuisine centrale — Suivi TR',
      criticite: 'MAJEURE',
      status: 'anomalie',
      observations: nonEnregistres.map((t: any) => `${t.etablissement} (${t.mois})`).join(', '),
    });
  }

  if (contrat.existeContrat === false || contrat.existeMarche === false) {
    if (!contrat.existeContrat) {
      anomalies.push({
        label: 'Cuisine livrée — Absence de contrat',
        reference: 'Code de la commande publique',
        criticite: 'MAJEURE',
        status: 'anomalie',
        observations: 'Aucun contrat de prestation de restauration n\'a été trouvé.',
      });
    }
    if (!contrat.existeMarche) {
      anomalies.push({
        label: 'Cuisine livrée — Absence de marché',
        reference: 'Code de la commande publique',
        criticite: 'MAJEURE',
        status: 'anomalie',
        observations: 'Aucun marché public n\'a été identifié pour la cuisine livrée.',
      });
    }
  }

  return anomalies;
}

// ═══ Cartographie risques ═══
function collectCartographie(): PVVerification[] {
  const risques = loadState<any[]>('cartographie', []);
  return risques.filter(r => r.probabilite * r.impact * r.maitrise >= 40).map(r => ({
    label: `Risque critique : ${r.risque}`,
    reference: `Processus : ${r.processus}`,
    criticite: 'MAJEURE' as const,
    status: 'anomalie' as const,
    observations: `Score ${r.probabilite * r.impact * r.maitrise} — Action : ${r.action || 'Non définie'}`,
  }));
}

// ═══ Marchés publics — Saucissonnage (seuils 2025 : 60K€ HT / 100K€ travaux) ═══
function collectMarches(): PVVerification[] {
  const marches = loadState<any[]>('marches', []);
  const anomalies: PVVerification[] = [];

  // Cluster par objet/nature similaire (1ers mots-clés)
  const norm = (s: string) => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]/g, '').split(/\s+/).slice(0, 3).join(' ');
  const clusters = new Map<string, { total: number; items: any[] }>();
  marches.forEach(m => {
    const key = `${m.nature || 'fournitures'}::${norm(m.objet || '')}`;
    const c = clusters.get(key) || { total: 0, items: [] };
    c.total += m.montant || 0;
    c.items.push(m);
    clusters.set(key, c);
  });

  clusters.forEach((c, key) => {
    if (c.items.length < 2) return;
    const seuil = key.startsWith('travaux') ? 100000 : 60000;
    if (c.total > seuil) {
      anomalies.push({
        label: `Saucissonnage potentiel : ${c.items.length} marchés similaires cumulant ${c.total.toLocaleString('fr-FR')}€`,
        reference: 'Décret 2025-1386 — CCP art. R.2122-8',
        criticite: 'MAJEURE',
        status: 'anomalie',
        observations: `Cluster « ${key.split('::')[1]} » : ${c.items.map(i => i.objet).join(' / ')}. Total ${c.total}€ > seuil ${seuil}€. Risque de fractionnement artificiel pour éviter la procédure formalisée.`,
      });
    }
  });

  // Délai global de paiement > 30 jours
  marches.forEach(m => {
    if (m.delaiPaiement && m.delaiPaiement > 30) {
      anomalies.push({
        label: `Marché ${m.objet || m.id} — Délai paiement > 30 jours (${m.delaiPaiement}j)`,
        reference: 'Décret 2013-269',
        criticite: 'MINEURE',
        status: 'anomalie',
        observations: `Le délai global de paiement légal est de 30 jours pour les EPLE. Intérêts moratoires dus.`,
      });
    }
  });

  return anomalies;
}

// ═══ Recouvrement — Prescription quadriennale (T-90j et atteinte) ═══
function collectRecouvrement(): PVVerification[] {
  const creances = loadState<any[]>('recouvrement', []);
  const anomalies: PVVerification[] = [];
  const now = Date.now();

  creances.forEach(c => {
    if (!c.dateEmission || c.statut === 'Soldée' || c.statut === 'ANV') return;
    const ageJours = (now - new Date(c.dateEmission).getTime()) / 86400000;
    const joursAvantPrescription = 4 * 365 - ageJours;
    if (joursAvantPrescription <= 0) {
      anomalies.push({
        label: `Créance prescrite : ${c.debiteur || c.id} (${c.montant}€)`,
        reference: 'Loi 68-1250 — Prescription quadriennale',
        criticite: 'MAJEURE',
        status: 'anomalie',
        observations: `Créance émise le ${c.dateEmission}. Prescription quadriennale atteinte. Constater l'admission en non-valeur (C/6541) après décision motivée du CA.`,
      });
    } else if (joursAvantPrescription <= 90) {
      anomalies.push({
        label: `Créance proche de la prescription : ${c.debiteur || c.id} (T-${Math.round(joursAvantPrescription)}j)`,
        reference: 'Loi 68-1250',
        criticite: 'MAJEURE',
        status: 'anomalie',
        observations: `Créance ${c.montant}€ émise le ${c.dateEmission}. Engager sans délai un acte interruptif (commandement de payer, OTD, action contentieuse).`,
      });
    }
  });

  return anomalies;
}

// ═══ Annexe comptable — FRNG / DRFN (IGAENR 2016-071) ═══
function collectAnnexe(): PVVerification[] {
  const data = loadState<Record<string, string>>('annexe_comptable', {});
  const anomalies: PVVerification[] = [];
  const fdr = parseFloat(data['bilan_fdr']) || 0;
  const depRealisees = parseFloat(data['budget_depenses_realisees']) || 0;
  if (fdr > 0 && depRealisees > 0) {
    const fdrJours = Math.round((fdr / depRealisees) * 365);
    if (fdrJours < 15) {
      anomalies.push({
        label: `FRNG critique : ${fdrJours} jours de DRFN (seuil 15j)`,
        reference: 'IGAENR 2016-071 — Modèle FDRM',
        criticite: 'MAJEURE',
        status: 'anomalie',
        observations: `Fonds de roulement très insuffisant. Continuité d'exploitation compromise. Plan de redressement à présenter au CA.`,
      });
    } else if (fdrJours < 30) {
      anomalies.push({
        label: `FRNG faible : ${fdrJours} jours de DRFN (seuil prudentiel 30j)`,
        reference: 'IGAENR 2016-071',
        criticite: 'MINEURE',
        status: 'anomalie',
        observations: `Risque de tension de trésorerie. Maîtrise des dépenses et optimisation des recettes à documenter.`,
      });
    }
  }
  return anomalies;
}

// ═══ COLLECTEUR PRINCIPAL ═══

const MODULE_COLLECTORS: Record<string, () => PVVerification[]> = {
  'voyages': collectVoyages,
  'verification': collectVerification,
  'regies': collectRegies,
  'stocks': collectStocks,
  'rapprochement': collectRapprochement,
  'droits-constates': collectDroitsConstates,
  'subventions': collectSubventions,
  'restauration': collectRestauration,
  'cartographie': collectCartographie,
  'marches': collectMarches,
  'recouvrement': collectRecouvrement,
  'annexe-comptable': collectAnnexe,
};

/**
 * Collecte les anomalies uniquement pour les modules sélectionnés.
 * @param selectedModuleIds - IDs des modules à auditer. Si vide, collecte tout.
 */
export function collectAllAnomalies(selectedModuleIds?: string[]): ModuleAnomalies[] {
  const modules = getModules();
  const results: ModuleAnomalies[] = [];

  for (const [moduleId, collector] of Object.entries(MODULE_COLLECTORS)) {
    // Si une sélection est fournie, ne scanner que ces modules
    if (selectedModuleIds && selectedModuleIds.length > 0 && !selectedModuleIds.includes(moduleId)) continue;

    const mod = modules.find(m => m.id === moduleId);
    const anomalies = collector();
    if (anomalies.length > 0) {
      results.push({
        moduleId,
        moduleLabel: mod?.label || moduleId,
        anomalies,
      });
    }
  }

  return results;
}

/**
 * Retourne une liste plate de PVVerification pour les modules sélectionnés.
 */
export function collectAnomaliesFlat(selectedModuleIds?: string[]): PVVerification[] {
  return collectAllAnomalies(selectedModuleIds).flatMap(m => m.anomalies);
}
