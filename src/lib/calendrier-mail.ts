// Génération d'un fichier .eml (RFC 822) — rappel mensuel aux SG des ER
// + détection des activités du mois courant et des activités en retard.
import { saveAs } from 'file-saver';
import { MOIS_NOMS } from './calendrier-activites';
import type { ActiviteCalendrier } from './calendrier-types';
import type { Etablissement } from './types';

export interface MailContext {
  activites: ActiviteCalendrier[];
  etablissements: Etablissement[]; // ER (sans agence comptable)
  agenceComptable?: Etablissement;
  exercice: string;
  agentComptable: string;
  /** Mois cible (1-12). Défaut : mois courant */
  moisCible?: number;
}

export interface ActivitesGroupees {
  duMois: ActiviteCalendrier[];
  enRetard: ActiviteCalendrier[];
}

// Une activité est "du mois" si son moisDebut..moisFin couvre le mois cible
// ET (pas de date d'échéance OU échéance dans ce mois).
function isInMonth(a: ActiviteCalendrier, m: number): boolean {
  if (a.periodicite === 'mensuelle' && a.moisDebut === 0) return true;
  const debut = a.moisDebut;
  const fin = a.moisFin || a.moisDebut;
  if (debut <= fin) return m >= debut && m <= fin;
  return m >= debut || m <= fin;
}

export function getActivitesGroupees(
  activites: ActiviteCalendrier[],
  moisCible: number,
  refDate: Date = new Date(),
): ActivitesGroupees {
  const today = new Date(refDate);
  today.setHours(0, 0, 0, 0);

  const duMois = activites.filter(a => {
    if (a.realisee) return false;
    if (!isInMonth(a, moisCible)) return false;
    if (a.dateEcheance) {
      const d = new Date(a.dateEcheance);
      // Garder si l'échéance est dans le mois cible
      return d.getMonth() + 1 === moisCible;
    }
    return true;
  });

  const enRetard = activites.filter(a => {
    if (a.realisee) return false;
    if (!a.dateEcheance) return false;
    const d = new Date(a.dateEcheance);
    return d < today && d.getMonth() + 1 !== moisCible;
  });

  return { duMois, enRetard };
}

function critEmoji(c: ActiviteCalendrier['criticite']): string {
  return c === 'haute' ? '🔴' : c === 'moyenne' ? '🟡' : '🔵';
}

function formatActivite(a: ActiviteCalendrier, etabs: Etablissement[]): string {
  const echeance = a.dateEcheance
    ? new Date(a.dateEcheance).toLocaleDateString('fr-FR')
    : '—';
  const erNoms = a.tousEtablissements
    ? `Tous les ER (${etabs.length})`
    : a.etablissementsIds
        .map(id => etabs.find(e => e.id === id)?.nom)
        .filter(Boolean)
        .join(', ') || '—';
  return [
    `${critEmoji(a.criticite)} ${a.titre}`,
    `   • Échéance : ${echeance}`,
    `   • Catégorie : ${a.categorie}`,
    `   • Responsable : ${a.responsable}`,
    `   • Établissement(s) : ${erNoms}`,
    a.reference ? `   • Référence : ${a.reference}` : null,
    a.description ? `   • ${a.description}` : null,
  ].filter(Boolean).join('\n');
}

export function buildMailBody(ctx: MailContext): { subject: string; body: string; recipients: string[] } {
  const mois = ctx.moisCible ?? (new Date().getMonth() + 1);
  const moisNom = MOIS_NOMS[mois - 1];
  const { duMois, enRetard } = getActivitesGroupees(ctx.activites, mois);

  const subject = `[Agence comptable] Rappel ${moisNom} ${ctx.exercice} — opérations à réaliser`;

  const recipients = ctx.etablissements
    .map(e => e.email)
    .filter((e): e is string => !!e && e.trim().length > 0);

  const lines: string[] = [];
  lines.push(`Mesdames et Messieurs les Secrétaires généraux,`);
  lines.push('');
  lines.push(
    `Dans le cadre du calendrier annuel des opérations comptables de l'agence comptable ` +
    `« ${ctx.agenceComptable?.nom || ''} » (exercice ${ctx.exercice}), ` +
    `vous trouverez ci-dessous les opérations à réaliser au cours du mois de ${moisNom}.`
  );
  lines.push('');
  lines.push(
    `IMPORTANT : le non-respect de ce calendrier met l'agent comptable en difficulté ` +
    `et l'empêche de servir correctement le groupement dans les délais réglementaires. ` +
    `Une coordination rigoureuse est indispensable pour garantir la régularité comptable, ` +
    `la sécurité des fonds et la bonne information de tous.`
  );
  lines.push('');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push(`📅 OPÉRATIONS DU MOIS DE ${moisNom.toUpperCase()} (${duMois.length})`);
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('');
  if (duMois.length === 0) {
    lines.push('Aucune opération à réaliser ce mois-ci.');
  } else {
    duMois.forEach((a, i) => {
      lines.push(`${i + 1}. ${formatActivite(a, ctx.etablissements)}`);
      lines.push('');
    });
  }

  if (enRetard.length > 0) {
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push(`⚠️  OPÉRATIONS EN RETARD (${enRetard.length})`);
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push('');
    lines.push("Les opérations suivantes étaient échues et n'ont pas été marquées comme réalisées :");
    lines.push('');
    enRetard.forEach((a, i) => {
      lines.push(`${i + 1}. ${formatActivite(a, ctx.etablissements)}`);
      lines.push('');
    });
  }

  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('');
  lines.push(
    `Sources : décret n° 2012-1246 (GBCP), art. R. 421-64 et s. Code de l'éducation, ` +
    `M9.6, circulaire n° 2011-117 du 03/08/2011, guides DAF A3 / IH2EF, ` +
    `vade-mecum de l'adjoint gestionnaire.`
  );
  lines.push('');
  lines.push(`Cordialement,`);
  lines.push(ctx.agentComptable || `L'agent comptable`);
  lines.push(ctx.agenceComptable?.nom || '');

  return { subject, body: lines.join('\n'), recipients };
}

// Encodage MIME quoted-printable basique pour préserver les accents UTF-8
function encodeQuotedPrintable(input: string): string {
  const utf8 = unescape(encodeURIComponent(input));
  let out = '';
  let lineLen = 0;
  for (let i = 0; i < utf8.length; i++) {
    const c = utf8.charCodeAt(i);
    let chunk: string;
    if (c === 0x3D) chunk = '=3D';
    else if (c === 0x0A) { out += '\r\n'; lineLen = 0; continue; }
    else if (c === 0x0D) continue;
    else if ((c >= 0x20 && c <= 0x7E) || c === 0x09) chunk = utf8[i];
    else chunk = '=' + c.toString(16).toUpperCase().padStart(2, '0');

    if (lineLen + chunk.length > 75) {
      out += '=\r\n';
      lineLen = 0;
    }
    out += chunk;
    lineLen += chunk.length;
  }
  return out;
}

function encodeMimeHeader(value: string): string {
  // RFC 2047 encoded-word (UTF-8, base64) si caractères non-ASCII
  if (/^[\x00-\x7F]*$/.test(value)) return value;
  const utf8 = unescape(encodeURIComponent(value));
  // btoa accepte Latin-1, on lui passe l'UTF-8 escapé
  let bin = '';
  for (let i = 0; i < utf8.length; i++) bin += utf8[i];
  const b64 = btoa(bin);
  return `=?UTF-8?B?${b64}?=`;
}

export function downloadEmlFile(ctx: MailContext): void {
  const { subject, body, recipients } = buildMailBody(ctx);
  const date = new Date().toUTCString();
  const from = `"${encodeMimeHeader(ctx.agentComptable || 'Agence comptable')}" <agence.comptable@example.fr>`;
  const to = recipients.length > 0 ? recipients.join(', ') : 'sg.etablissement@example.fr';

  const headers = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${encodeMimeHeader(subject)}`,
    `Date: ${date}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/plain; charset=UTF-8`,
    `Content-Transfer-Encoding: quoted-printable`,
    `X-Unsent: 1`,
  ].join('\r\n');

  const eml = `${headers}\r\n\r\n${encodeQuotedPrintable(body)}`;
  const blob = new Blob([eml], { type: 'message/rfc822;charset=utf-8' });
  const moisNom = MOIS_NOMS[(ctx.moisCible ?? new Date().getMonth() + 1) - 1];
  saveAs(blob, `rappel-${moisNom}-${ctx.exercice}.eml`);
}

// Calcul global pour le widget Dashboard
export interface AlertesAC {
  duMois: ActiviteCalendrier[];
  proches7j: ActiviteCalendrier[]; // échéance dans <= 7 jours
  enRetard: ActiviteCalendrier[];
  total: number; // pour le badge sidebar (proches + retard)
}

export function getAlertesAC(activites: ActiviteCalendrier[], refDate: Date = new Date()): AlertesAC {
  const today = new Date(refDate);
  today.setHours(0, 0, 0, 0);
  const in7 = new Date(today);
  in7.setDate(in7.getDate() + 7);
  const mois = today.getMonth() + 1;

  const { duMois, enRetard } = getActivitesGroupees(activites, mois, refDate);

  const proches7j = activites.filter(a => {
    if (a.realisee || !a.dateEcheance) return false;
    const d = new Date(a.dateEcheance);
    return d >= today && d <= in7;
  });

  return {
    duMois,
    proches7j,
    enRetard,
    total: proches7j.length + enRetard.length,
  };
}
