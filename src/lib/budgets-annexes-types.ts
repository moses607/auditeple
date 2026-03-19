// ═══ BUDGETS ANNEXES – Module complet M9.6 / GBCP ═══

export interface BudgetAnnexeRecord {
  id: string;
  epleSupportId: string;       // ID établissement support
  type: 'CFA' | 'GRETA' | 'SRH' | 'Autre';
  nom: string;
  dateCreation: string;
  exercice: string;
  deliberationCA: string;      // nom fichier délibération
  budget: number;
  resultatExploitation: number;
  resultatFinancier: number;
  resultatExceptionnel: number;
  resultatNet: number;
  tauxExecution: number;
  // Liaison 185000
  mouvements185: Mouvement185[];
}

export interface Mouvement185 {
  id: string;
  date: string;
  libelle: string;
  debit: number;
  credit: number;
}

// ═══ AUDIT ITEMS ═══
export interface AuditItemBA {
  id: string;
  budgetAnnexeId: string;
  itemIndex: number;           // 1-8
  existant: string;
  attendu: string;
  ecart: string;
  conforme: 'oui' | 'non' | 'partiel' | '';
  commentaire: string;
  pieces: string[];            // noms fichiers joints
  montantExistant: number;
  montantAttendu: number;
}

export const AUDIT_ITEMS_BA = [
  {
    index: 1,
    label: 'Salaires / Charges personnel (64)',
    description: 'Comparaison masse salariale réelle vs crédits votés + service fait + compta analytique CFA.',
    reference: 'M9.6 Tome 2 § 2.1.2.3.2 – Charges de personnel classe 64',
    regle: 'La masse salariale réelle doit correspondre aux crédits votés au budget. Le service fait doit être certifié. La comptabilité analytique CFA doit ventiler les charges par formation.',
  },
  {
    index: 2,
    label: 'Achats / Services extérieurs (60-61)',
    description: 'Factures + service fait + marchés publics.',
    reference: 'M9.6 Tome 2 § 2.1.2.3.2 – Charges d\'exploitation classes 60-61 + Code de la commande publique',
    regle: 'Chaque dépense doit être justifiée par une facture conforme, la certification du service fait, et le respect des seuils de marchés publics (40 k€ / 90 k€ / 221 k€).',
  },
  {
    index: 3,
    label: 'Immobilisations (classe 2)',
    description: 'Inventaire + seuil 800 € + plan amortissement CA.',
    reference: 'M9.6 Tome 2 § 2.1.2.3.2 – Immobilisations + GBCP art. 56 + seuil 800 € HT (CGI art. 236)',
    regle: 'Tout bien > 800 € HT doit être immobilisé (classe 2). L\'inventaire physique doit correspondre à l\'inventaire comptable. Le plan d\'amortissement doit être voté par le CA.',
  },
  {
    index: 4,
    label: 'Amortissements & Dotations (28 + 68)',
    description: 'Calcul dotations + durées + reprises.',
    reference: 'M9.6 Tome 2 § 2.1.2.3.2 – Dotations aux amortissements comptes 28/68',
    regle: 'Les dotations aux amortissements doivent être calculées selon les durées définies par le CA. Les reprises (comptes 78) doivent être symétriques. Aucune immobilisation ne doit être non amortie sans justification.',
  },
  {
    index: 5,
    label: 'Recettes (classe 7)',
    description: 'Titres émis + recouvrement + affectation.',
    reference: 'M9.6 Tome 2 § 2.1.2.3.2 – Produits classe 7 + Décret 2012-1246 art. 11',
    regle: 'Tous les droits constatés doivent donner lieu à émission d\'un titre de recette. Le recouvrement doit être suivi. L\'affectation des recettes doit respecter la nomenclature des domaines CFA/GRETA.',
  },
  {
    index: 6,
    label: 'Suivi créances & Provisions (4 + 49 + 68)',
    description: 'Diligences + prescription + non-valeur.',
    reference: 'M9.6 Tome 2 § 2.1.2.3.2 – Comptes 4xx/49x/68x + Décret 2012-1246 art. 18',
    regle: 'Les créances doivent faire l\'objet de diligences de recouvrement avant prescription (4 ans). Les provisions pour dépréciation (compte 49) doivent être constituées. Les admissions en non-valeur doivent être soumises au CA.',
  },
  {
    index: 7,
    label: 'Équilibre sections + Nomenclature domaines CFA/GRETA',
    description: 'Vérification de l\'équilibre budgétaire et de la nomenclature.',
    reference: 'M9.6 Tome 2 § 2.1.2.3.2 – Équilibre des sections + Code éducation R421-58 et s.',
    regle: 'Le budget annexe doit être équilibré en fonctionnement et en investissement. La nomenclature des domaines de formation (CFA) ou des activités (GRETA) doit être respectée conformément aux instructions académiques.',
  },
  {
    index: 8,
    label: 'Liaison 185000 (Planche 16)',
    description: 'Vérification de la compensation parfaite entre BA et budget principal.',
    reference: 'M9.6 Tome 2 § 2.1.2.3.2 + Planche 16 – Compte 185000',
    regle: 'Le compte 185000 du budget annexe doit être le miroir exact du compte 185000 du budget principal. La compensation doit être parfaite : total débit BA = total crédit principal et inversement. Aucun solde résiduel n\'est admis.',
  },
] as const;

export type AuditScoring = 'vert' | 'jaune' | 'rouge';

export function computeAuditScore(items: AuditItemBA[]): { score: number; label: AuditScoring; detail: string } {
  if (items.length === 0) return { score: 0, label: 'rouge', detail: 'Aucun contrôle effectué' };
  const done = items.filter(i => i.conforme !== '');
  if (done.length === 0) return { score: 0, label: 'rouge', detail: 'Aucun contrôle effectué' };
  const conformes = done.filter(i => i.conforme === 'oui').length;
  const partiels = done.filter(i => i.conforme === 'partiel').length;
  const score = Math.round(((conformes + partiels * 0.5) / 8) * 100);
  if (score >= 75) return { score, label: 'vert', detail: `${conformes}/8 conformes, ${partiels} partiels` };
  if (score >= 50) return { score, label: 'jaune', detail: `${conformes}/8 conformes, ${partiels} partiels` };
  return { score, label: 'rouge', detail: `${conformes}/8 conformes, ${partiels} partiels` };
}

export function defaultAuditItems(baId: string): AuditItemBA[] {
  return AUDIT_ITEMS_BA.map(item => ({
    id: crypto.randomUUID(),
    budgetAnnexeId: baId,
    itemIndex: item.index,
    existant: '',
    attendu: item.regle,
    ecart: '',
    conforme: '' as const,
    commentaire: '',
    pieces: [],
    montantExistant: 0,
    montantAttendu: 0,
  }));
}
