/**
 * Génération du Rapport de Maturité CICF — PDF officiel A4 portrait.
 * Charte République française. Marianne (fallback Helvetica).
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ScoreGroupement, ScoreEtablissement } from './scoring-engine';
import { niveauScoring } from './scoring-engine';

interface RapportContext {
  groupementLabel: string;
  academie: string;
  lyceeSiegeNom?: string;
  logoLyceeUrl?: string;
  signatureAcUrl?: string;
  agentComptableNom: string;
  destinataires: string[];
  periodeDebut: string;
  periodeFin: string;
  messageAc?: string;
  estConsolide: boolean;
  etablissementCible?: ScoreEtablissement;
  pvNum?: number;
  actionsCritiques?: { libelle: string; criticite: string; echeance?: string; responsable?: string; reference?: string }[];
  inclureAnnexes?: boolean;
}

const RF_BLUE: [number, number, number] = [30, 64, 175];
const RF_RED: [number, number, number] = [220, 38, 38];
const FOOTER_GREY: [number, number, number] = [110, 110, 110];

async function imgToDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise(r => {
      const reader = new FileReader();
      reader.onloadend = () => r(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch { return null; }
}

function header(doc: jsPDF, ctx: RapportContext, logoData?: string) {
  const W = 210;
  doc.setFillColor(...RF_BLUE);
  doc.rect(0, 0, W, 22, 'F');
  if (logoData) {
    try { doc.addImage(logoData, 'PNG', 8, 4, 14, 14); } catch { /* ignore */ }
  }
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold').setFontSize(9);
  doc.text('RÉPUBLIQUE FRANÇAISE', 26, 9);
  doc.setFont('helvetica', 'normal').setFontSize(8);
  doc.text(`Ministère de l'Éducation nationale · Académie de ${ctx.academie}`, 26, 14);
  doc.text(ctx.groupementLabel, 26, 18.5);
  doc.setFont('helvetica', 'bold').setFontSize(7);
  doc.text('CICF', W - 12, 12, { align: 'right' });
}

function footer(doc: jsPDF, ctx: RapportContext, pageNum: number, total: number) {
  const W = 210, H = 297;
  doc.setDrawColor(...RF_BLUE).setLineWidth(0.3).line(15, H - 14, W - 15, H - 14);
  doc.setFont('helvetica', 'italic').setFontSize(7).setTextColor(...FOOTER_GREY);
  doc.text(`Document confidentiel — destiné à l'ordonnateur et au rectorat`, W / 2, H - 10, { align: 'center' });
  doc.setFont('helvetica', 'normal').setFontSize(7);
  doc.text(`${ctx.groupementLabel} · ${new Date().toLocaleDateString('fr-FR')}`, 15, H - 6);
  doc.text(`Page ${pageNum}/${total}`, W - 15, H - 6, { align: 'right' });
}

export async function genererRapportMaturite(score: ScoreGroupement, ctx: RapportContext): Promise<Blob> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210, H = 297, M = 18;

  const logoData = ctx.logoLyceeUrl ? await imgToDataUrl(ctx.logoLyceeUrl) : null;
  const sigData = ctx.signatureAcUrl ? await imgToDataUrl(ctx.signatureAcUrl) : null;

  const cible = ctx.estConsolide ? null : ctx.etablissementCible!;
  const scoreCible = cible ? cible.score_global : score.score_global;
  const rubriquesCible = cible ? cible.rubriques : score.rubriques;
  const niveau = niveauScoring(scoreCible);

  // ─── PAGE DE GARDE ──────────────────────────────────────────
  // Bandeau bleu ministériel
  doc.setFillColor(...RF_BLUE).rect(0, 0, W, 36, 'F');
  doc.setTextColor(255, 255, 255).setFont('helvetica', 'bold').setFontSize(11);
  doc.text('RÉPUBLIQUE FRANÇAISE', M, 14);
  doc.setFont('helvetica', 'normal').setFontSize(9);
  doc.text(`Ministère de l'Éducation nationale, de l'Enseignement supérieur et de la Recherche`, M, 21);
  doc.text(`Académie de ${ctx.academie}`, M, 26);
  doc.text(ctx.groupementLabel, M, 31);
  // Liseré rouge
  doc.setFillColor(...RF_RED).rect(0, 36, W, 1.5, 'F');

  // Logo lycée siège centré
  if (logoData) {
    try { doc.addImage(logoData, 'PNG', W / 2 - 22, 56, 44, 44); } catch { /* ignore */ }
  } else {
    doc.setDrawColor(180, 180, 180).setFillColor(245, 245, 250).roundedRect(W / 2 - 22, 56, 44, 44, 3, 3, 'FD');
    doc.setFont('helvetica', 'italic').setFontSize(8).setTextColor(120, 120, 120);
    doc.text('Logo lycée siège', W / 2, 80, { align: 'center' });
  }
  if (ctx.lyceeSiegeNom) {
    doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(80, 80, 80);
    doc.text(ctx.lyceeSiegeNom, W / 2, 108, { align: 'center' });
  }

  // Titre
  doc.setFont('helvetica', 'bold').setFontSize(20).setTextColor(...RF_BLUE);
  const titre = doc.splitTextToSize('RAPPORT DE MATURITÉ DU CONTRÔLE INTERNE COMPTABLE ET FINANCIER', W - 40);
  doc.text(titre, W / 2, 130, { align: 'center' });

  // Sous-titre
  doc.setFont('helvetica', 'normal').setFontSize(13).setTextColor(60, 60, 60);
  doc.text(ctx.estConsolide ? 'Groupement comptable consolidé' : (cible?.etablissement_label ?? ''), W / 2, 152, { align: 'center' });

  // Score en avant
  doc.setFillColor(...RF_BLUE).roundedRect(W / 2 - 35, 165, 70, 38, 4, 4, 'F');
  doc.setTextColor(255, 255, 255).setFont('helvetica', 'bold').setFontSize(40);
  doc.text(String(scoreCible), W / 2 - 8, 192);
  doc.setFont('helvetica', 'normal').setFontSize(12);
  doc.text('/100', W / 2 + 14, 192);
  doc.setFontSize(10);
  doc.text(niveau.label, W / 2, 200, { align: 'center' });

  // Métadonnées
  doc.setTextColor(40, 40, 40).setFont('helvetica', 'normal').setFontSize(10);
  const metaY = 220;
  doc.text(`Période couverte : du ${new Date(ctx.periodeDebut).toLocaleDateString('fr-FR')} au ${new Date(ctx.periodeFin).toLocaleDateString('fr-FR')}`, M, metaY);
  doc.text(`Auteur : ${ctx.agentComptableNom}`, M, metaY + 6);
  doc.text(`Destinataires : ${ctx.destinataires.join(' · ') || '—'}`, M, metaY + 12);
  doc.text(`Date d'édition : ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}`, M, metaY + 18);

  // Devise pied de page
  doc.setFont('helvetica', 'italic').setFontSize(10).setTextColor(...RF_BLUE);
  doc.text('Liberté · Égalité · Fraternité', W / 2, H - 18, { align: 'center' });
  doc.setDrawColor(...RF_RED).setLineWidth(0.5).line(W / 2 - 30, H - 16, W / 2 + 30, H - 16);
  footer(doc, ctx, 1, 4);

  // ─── PAGE 2 — SYNTHÈSE EXÉCUTIVE ─────────────────────────────
  doc.addPage();
  header(doc, ctx, logoData ?? undefined);
  let y = 32;
  doc.setTextColor(...RF_BLUE).setFont('helvetica', 'bold').setFontSize(16);
  doc.text('Synthèse exécutive', M, y); y += 4;
  doc.setDrawColor(...RF_BLUE).setLineWidth(0.4).line(M, y, M + 50, y); y += 8;

  // Score
  doc.setFillColor(245, 245, 250).roundedRect(M, y, W - 2 * M, 32, 3, 3, 'F');
  doc.setTextColor(...RF_BLUE).setFont('helvetica', 'bold').setFontSize(28);
  doc.text(`${scoreCible}`, M + 8, y + 22);
  doc.setFontSize(11).setFont('helvetica', 'normal').setTextColor(80, 80, 80);
  doc.text('/ 100', M + 8 + doc.getTextWidth(`${scoreCible}`) + 2, y + 22);
  doc.setFont('helvetica', 'bold').setFontSize(14).setTextColor(...RF_BLUE);
  doc.text(`Niveau : ${niveau.label}`, W - M - 8, y + 14, { align: 'right' });
  doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(80, 80, 80);
  doc.text(ctx.estConsolide ? `Moyenne pondérée des ${score.etablissements.length} établissements du groupement.` : '', W - M - 8, y + 22, { align: 'right' });
  y += 38;

  // 3 forts / 3 vigilances
  const sortedRub = [...rubriquesCible].sort((a, b) => b.score - a.score);
  const forts = sortedRub.slice(0, 3);
  const fragiles = [...sortedRub].reverse().slice(0, 3);

  doc.setFont('helvetica', 'bold').setFontSize(11).setTextColor(40, 40, 40);
  doc.text('Points forts', M, y);
  doc.text('Points de vigilance', W / 2 + 4, y);
  y += 5;
  forts.forEach((r, i) => {
    doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(16, 122, 87);
    doc.text(`✓ ${r.label} — ${r.score}/100`, M, y + i * 5);
  });
  fragiles.forEach((r, i) => {
    doc.setFontSize(9).setTextColor(...RF_RED);
    doc.text(`✗ ${r.label} — ${r.score}/100`, W / 2 + 4, y + i * 5);
  });
  y += 22;

  // Message AC
  doc.setFont('helvetica', 'bold').setFontSize(11).setTextColor(40, 40, 40);
  doc.text("Mot de l'agent comptable", M, y); y += 5;
  doc.setFont('helvetica', 'italic').setFontSize(9).setTextColor(60, 60, 60);
  const msg = ctx.messageAc?.trim() ||
    "Le présent rapport synthétise l'état du contrôle interne comptable et financier sur la période visée. Il s'inscrit dans la démarche de maîtrise des risques exigée par l'article 170 du décret GBCP du 7 novembre 2012 et par l'instruction codificatrice M9-6.";
  const msgLines = doc.splitTextToSize(msg, W - 2 * M);
  doc.text(msgLines, M, y);
  y += msgLines.length * 4 + 8;

  // Signature AC
  if (sigData) {
    try { doc.addImage(sigData, 'PNG', W - M - 50, y, 50, 20); } catch { /* ignore */ }
  }
  doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(80, 80, 80);
  doc.text(`L'agent comptable, ${ctx.agentComptableNom}`, W - M, y + 24, { align: 'right' });

  footer(doc, ctx, 2, 4);

  // ─── PAGE 3 — DÉTAIL DES 8 RUBRIQUES ─────────────────────────
  doc.addPage();
  header(doc, ctx, logoData ?? undefined);
  doc.setTextColor(...RF_BLUE).setFont('helvetica', 'bold').setFontSize(16);
  doc.text('Détail par rubrique CICF', M, 32);

  autoTable(doc, {
    startY: 40,
    margin: { left: M, right: M },
    head: [['Rubrique', 'Score', 'Niveau', 'Anomalies maj.', 'Anomalies min.', 'Actions OK', 'Retard']],
    body: rubriquesCible.map(r => [
      r.label,
      `${r.score}/100`,
      niveauScoring(r.score).label,
      String(r.details.anomalies_majeures),
      String(r.details.anomalies_mineures),
      String(r.details.actions_cloturees),
      String(r.details.actions_retard),
    ]),
    theme: 'grid',
    headStyles: { fillColor: RF_BLUE, textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 8.5 },
    columnStyles: { 1: { halign: 'center', fontStyle: 'bold' } },
  });

  let yRubAfter = (doc as any).lastAutoTable.finalY + 8;
  doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(60, 60, 60);
  doc.text(`Méthode : score 100 − pénalités anomalies (maj × 5, min × 2) − actions en retard × 3 − PV non finalisés × 2 + actions clôturées × 1, borné à [0;100].`,
    M, yRubAfter, { maxWidth: W - 2 * M });

  footer(doc, ctx, 3, 4);

  // ─── PAGE 4 — PLAN D'ACTION PRIORITAIRE ─────────────────────
  doc.addPage();
  header(doc, ctx, logoData ?? undefined);
  doc.setTextColor(...RF_BLUE).setFont('helvetica', 'bold').setFontSize(16);
  doc.text("Plan d'action prioritaire", M, 32);

  const actions = ctx.actionsCritiques ?? [];
  if (actions.length === 0) {
    doc.setFont('helvetica', 'italic').setFontSize(10).setTextColor(120, 120, 120);
    doc.text('Aucune action critique ou haute en cours sur la période.', M, 44);
  } else {
    autoTable(doc, {
      startY: 40,
      margin: { left: M, right: M },
      head: [['Action', 'Criticité', 'Échéance', 'Responsable', 'Référence']],
      body: actions.slice(0, 25).map(a => [
        a.libelle,
        a.criticite,
        a.echeance ? new Date(a.echeance).toLocaleDateString('fr-FR') : '—',
        a.responsable ?? '—',
        a.reference ?? '—',
      ]),
      theme: 'striped',
      headStyles: { fillColor: RF_BLUE, textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 8.5, valign: 'middle' },
      columnStyles: { 1: { halign: 'center' } },
    });
  }

  // Filigrane
  doc.setTextColor(220, 220, 220).setFont('helvetica', 'bold').setFontSize(40);
  doc.text('CONFIDENTIEL', W / 2, H / 2 + 60, { align: 'center', angle: -25 });

  footer(doc, ctx, 4, 4);

  return doc.output('blob');
}

export function pdfFileName(ctx: { estConsolide: boolean; libelle: string }): string {
  const slug = ctx.libelle.replace(/[^a-z0-9]+/gi, '-').toLowerCase().slice(0, 40);
  return `rapport-maturite-cicf-${slug}-${new Date().toISOString().slice(0, 10)}.pdf`;
}
