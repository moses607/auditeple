// Lookup establishment by UAI code using the French national education API
export interface UAIResult {
  uai: string;
  nom: string;
  type: string;
  adresse: string;
  codePostal: string;
  ville: string;
  academie: string;
}

export async function lookupUAI(uai: string): Promise<UAIResult | null> {
  const code = uai.trim().toUpperCase();
  if (!/^\d{7}[A-Z]$/.test(code)) return null;

  try {
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
  } catch (e) {
    console.warn('UAI lookup failed:', e);
    return null;
  }
}
