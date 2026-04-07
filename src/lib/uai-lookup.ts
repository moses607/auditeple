/**
 * Lookup establishment by UAI code using the French national education API
 * 
 * Strategy:
 * 1. API v2.1 (recommended) — exact SQL match on identifiant_de_l_etablissement
 * 2. API v1.0 fallback — full-text search (less reliable but wider coverage)
 * 3. InserJeunes CFA dataset — for CFA/GRETA not in main annuaire
 * 4. Geolocation dataset — additional fallback for second degree establishments
 * 
 * All endpoints: data.education.gouv.fr (Opendatasoft platform)
 */
export interface UAIResult {
  uai: string;
  nom: string;
  type: string;
  adresse: string;
  codePostal: string;
  ville: string;
  academie: string;
  telephone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
}

// Helper: detect type from UAI code prefix or name
function detectType(nom: string, existingType?: string): string {
  if (existingType && existingType.trim()) return existingType;
  const upper = (nom || '').toUpperCase();
  if (upper.includes('GRETA')) return 'GRETA';
  if (upper.includes('CFA')) return 'CFA';
  return '';
}

// ─── API v2.1 (preferred — exact match) ────────────────────────
async function lookupV21(code: string): Promise<UAIResult | null> {
  const url = `https://data.education.gouv.fr/api/explore/v2.1/catalog/datasets/fr-en-annuaire-education/records?where=identifiant_de_l_etablissement%3D%22${code}%22&limit=1`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();

  if (!data.results || data.results.length === 0) return null;
  const f = data.results[0];

  return {
    uai: f.identifiant_de_l_etablissement || code,
    nom: f.nom_etablissement || f.appellation_officielle || code,
    type: detectType(f.nom_etablissement || f.appellation_officielle || '', f.type_etablissement),
    adresse: f.adresse_1 || '',
    codePostal: f.code_postal || '',
    ville: f.nom_commune || '',
    academie: f.libelle_academie || '',
    telephone: f.telephone || '',
    email: f.mail || '',
    latitude: f.latitude || undefined,
    longitude: f.longitude || undefined,
  };
}

// ─── API v1.0 (fallback — full-text search) ────────────────────
async function lookupV1(code: string): Promise<UAIResult | null> {
  const url = `https://data.education.gouv.fr/api/records/1.0/search/?dataset=fr-en-annuaire-education&q=identifiant_de_l_etablissement%3A${code}&rows=1`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.records || data.records.length === 0) return null;

  const f = data.records[0].fields;

  const resultUAI = (f.identifiant_de_l_etablissement || '').toUpperCase();
  if (resultUAI !== code) return null;

  return {
    uai: resultUAI,
    nom: f.nom_etablissement || f.appellation_officielle || code,
    type: detectType(f.nom_etablissement || '', f.type_etablissement),
    adresse: f.adresse_1 || '',
    codePostal: f.code_postal || '',
    ville: f.nom_commune || '',
    academie: f.libelle_academie || '',
    telephone: f.telephone || '',
    email: f.mail || '',
  };
}

// ─── InserJeunes CFA dataset (for CFA/GRETA) ──────────────────
async function lookupCFA(code: string): Promise<UAIResult | null> {
  const url = `https://data.education.gouv.fr/api/explore/v2.1/catalog/datasets/fr-en-inserjeunes-cfa/records?where=uai%3D%22${code}%22&limit=1`;
  const res = await fetch(url);
  if (!res.ok) {
    return lookupCFAv1(code);
  }
  const data = await res.json();
  if (!data.results || data.results.length === 0) {
    return lookupCFAv1(code);
  }

  const f = data.results[0];
  const nom = f.libelle || f.nom_etablissement || '';
  return {
    uai: f.uai || code,
    nom: nom || `CFA ${code}`,
    type: detectType(nom, 'CFA'),
    adresse: '',
    codePostal: '',
    ville: f.commune || f.libelle_commune || '',
    academie: f.region || f.academie || '',
  };
}

async function lookupCFAv1(code: string): Promise<UAIResult | null> {
  const url = `https://data.education.gouv.fr/api/records/1.0/search/?dataset=fr-en-inserjeunes-cfa&q=uai%3A${code}&rows=1`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.records || data.records.length === 0) return null;

  const f = data.records[0].fields;
  const resultUAI = (f.uai || '').toUpperCase();
  if (resultUAI !== code) return null;

  const nom = f.libelle || f.nom_etablissement || '';
  return {
    uai: resultUAI,
    nom: nom || `CFA ${code}`,
    type: detectType(nom, 'CFA'),
    adresse: '',
    codePostal: '',
    ville: f.commune || '',
    academie: f.region || '',
  };
}

// ─── Geolocation dataset (additional fallback) ─────────────────
async function lookupGeoloc(code: string): Promise<UAIResult | null> {
  const url = `https://data.education.gouv.fr/api/explore/v2.1/catalog/datasets/fr-en-adresse-et-geolocalisation-etablissements-premier-et-second-degre/records?where=code_uai%3D%22${code}%22&limit=1`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.results || data.results.length === 0) return null;

  const f = data.results[0];
  const nom = f.appellation_officielle || f.denomination_principale || '';
  return {
    uai: f.code_uai || code,
    nom: nom || `Établissement ${code}`,
    type: detectType(nom, f.nature_uai_libe),
    adresse: f.adresse_uai || '',
    codePostal: f.code_postal_uai || '',
    ville: f.libelle_commune || '',
    academie: f.libelle_academie || '',
    latitude: f.latitude || undefined,
    longitude: f.longitude || undefined,
  };
}

// ─── Main lookup function ──────────────────────────────────────
export async function lookupUAI(uai: string): Promise<UAIResult | null> {
  const code = uai.trim().toUpperCase();
  if (!/^\d{7}[A-Z]$/.test(code)) return null;

  try {
    // 1. Try v2.1 API (most reliable, exact SQL match)
    const v21Result = await lookupV21(code);
    if (v21Result) return v21Result;

    // 2. Fallback to v1.0 API (full-text, verify exact match)
    const v1Result = await lookupV1(code);
    if (v1Result) return v1Result;

    // 3. Try InserJeunes CFA dataset (CFA, GRETA, apprentissage)
    const cfaResult = await lookupCFA(code);
    if (cfaResult) return cfaResult;

    // 4. Try geolocation dataset (first + second degree)
    const geoResult = await lookupGeoloc(code);
    if (geoResult) return geoResult;

    return null;
  } catch (e) {
    console.warn('[CIC Expert Pro] UAI lookup failed:', e);
    return null;
  }
}

// ─── Manual entry helper ───────────────────────────────────────
export function createManualEtablissement(uai: string, nom: string, type: string, ville: string): UAIResult {
  return {
    uai: uai.trim().toUpperCase(),
    nom,
    type,
    adresse: '',
    codePostal: '',
    ville,
    academie: '',
  };
}
