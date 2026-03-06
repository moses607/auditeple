// Lookup establishment by UAI code using the French national education API
// Falls back to InserJeunes CFA dataset for CFA/GRETA not in the main annuaire
export interface UAIResult {
  uai: string;
  nom: string;
  type: string;
  adresse: string;
  codePostal: string;
  ville: string;
  academie: string;
}

async function lookupAnnuaire(code: string): Promise<UAIResult | null> {
  const url = `https://data.education.gouv.fr/api/records/1.0/search/?dataset=fr-en-annuaire-education&q=identifiant_de_l_etablissement%3A${code}&rows=1`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.records || data.records.length === 0) return null;

  const f = data.records[0].fields;
  return {
    uai: f.identifiant_de_l_etablissement || code,
    nom: f.nom_etablissement || '',
    type: f.type_etablissement || '',
    adresse: f.adresse_1 || '',
    codePostal: f.code_postal || '',
    ville: f.nom_commune || '',
    academie: f.libelle_academie || '',
  };
}

async function lookupInserJeunesCFA(code: string): Promise<UAIResult | null> {
  const url = `https://data.education.gouv.fr/api/records/1.0/search/?dataset=fr-en-inserjeunes-cfa&q=uai%3A${code}&rows=1`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.records || data.records.length === 0) return null;

  const f = data.records[0].fields;
  return {
    uai: f.uai || code,
    nom: f.libelle || '',
    type: 'CFA',
    adresse: '',
    codePostal: '',
    ville: '',
    academie: f.region || '',
  };
}

export async function lookupUAI(uai: string): Promise<UAIResult | null> {
  const code = uai.trim().toUpperCase();
  if (!/^\d{7}[A-Z]$/.test(code)) return null;

  try {
    // Try main annuaire first (collèges, lycées, etc.)
    const result = await lookupAnnuaire(code);
    if (result) return result;

    // Fallback: InserJeunes CFA dataset (CFA, GRETA)
    const cfaResult = await lookupInserJeunesCFA(code);
    if (cfaResult) return cfaResult;

    return null;
  } catch (e) {
    console.warn('UAI lookup failed:', e);
    return null;
  }
}
