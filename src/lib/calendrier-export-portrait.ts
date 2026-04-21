// PDF Portrait — 1 mois par page (version détaillée pour diffusion aux ER)
// PDF Paysage annuel — vue affiche 1-2 pages (vue synthétique sur l'année)
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MOIS_NOMS, CATEGORIES_COULEURS } from './calendrier-activites';
import type { ActiviteCalendrier } from './calendrier-types';
import type { Etablissement } from './types';

interface ExportPortraitContext {
  activites: ActiviteCalendrier[];
  etablissements: Etablissement[];
  agenceComptable?: Etablissement;
  exercice: string;
  agentComptable: string;
  /** Message personnalisable de l'AC en en-tête */
  messageAC?: string;
}

function isInMonth(a: ActiviteCalendrier, m: number): boolean {
  if (a.periodicite === 'mensuelle' && a.moisDebut === 0) return true;
  const debut = a.moisDebut;
  const fin = a.moisFin || a.moisDebut;
  if (debut <= fin) return m >= debut && m <= fin;
  return m >= debut || m <= fin;
}

// Couleurs catégories en RGB pour jsPDF
const CAT_RGB: Record<string, [number, number, number]> = {
  'Cloture / Inventaire': [254, 226, 226],
  'Compte financier': [219, 234, 254],
  'Bourses': [254, 243, 199],
  'Voyages scolaires': [233, 213, 255],
  'Budget': [187, 247, 208],
  'Régies': [254, 215, 170],
  'Contrôle interne': [186, 230, 253],
  'Audit ER': [254, 205, 211],
  'Pilotage / Conseil AC': [226, 232, 240],
  'Restauration / SRH': [217, 249, 157],
  'Recouvrement': [253, 230, 138],
  'Marchés / Achats': [153, 246, 228],
  'Ressources': [231, 229, 228],
};

function critLabel(c: ActiviteCalendrier['criticite']): string {
  return c === 'haute' ? '🔴 OBLIGATOIRE' : c === 'moyenne' ? '🟡 RECOMMANDÉ' : '🔵 OPTIONNEL';
}

// ─── PDF Portrait : 1 mois par page ─────────────────────────────────
export function exportCalendrierPDFPortrait(ctx: ExportPortraitContext) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const w = pdf.internal.pageSize.getWidth();
  const h = pdf.internal.pageSize.getHeight();

  // Page de garde
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(20);
  pdf.text('Calendrier annuel', w / 2, 50, { align: 'center' });
  pdf.text("des opérations comptables", w / 2, 60, { align: 'center' });
  pdf.setFontSize(16);
  pdf.text(`Exercice ${ctx.exercice}`, w / 2, 75, { align: 'center' });

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Agence comptable : ${ctx.agenceComptable?.nom || '—'}`, w / 2, 100, { align: 'center' });
  if (ctx.agenceComptable?.uai) pdf.text(`(UAI : ${ctx.agenceComptable.uai})`, w / 2, 107, { align: 'center' });
  pdf.text(`Agent comptable : ${ctx.agentComptable || '—'}`, w / 2, 117, { align: 'center' });

  if (ctx.messageAC) {
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'italic');
    const msgLines = pdf.splitTextToSize(ctx.messageAC, w - 40);
    pdf.text(msgLines, w / 2, 145, { align: 'center' });
  }

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'italic');
  pdf.setTextColor(120);
  const avert = "Important : le non-respect de ce calendrier met l'agent comptable en difficulté et l'empêche de servir correctement le groupement dans les délais réglementaires. Une coordination rigoureuse entre l'AC et les SG des ER est indispensable.";
  const avertLines = pdf.splitTextToSize(avert, w - 30);
  pdf.text(avertLines, 15, h - 50);
  pdf.setTextColor(0);

  // Une page par mois
  for (let m = 1; m <= 12; m++) {
    const items = ctx.activites
      .filter(a => isInMonth(a, m))
      .sort((a, b) => {
        const ca = a.criticite === 'haute' ? 0 : a.criticite === 'moyenne' ? 1 : 2;
        const cb = b.criticite === 'haute' ? 0 : b.criticite === 'moyenne' ? 1 : 2;
        return ca - cb || a.titre.localeCompare(b.titre);
      });
    if (items.length === 0) continue;

    pdf.addPage();

    // Bandeau mois
    pdf.setFillColor(43, 76, 140);
    pdf.rect(0, 0, w, 22, 'F');
    pdf.setTextColor(255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.text(MOIS_NOMS[m - 1].toUpperCase(), 15, 15);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${items.length} opération${items.length > 1 ? 's' : ''} à réaliser — Exercice ${ctx.exercice}`, w - 15, 15, { align: 'right' });
    pdf.setTextColor(0);

    // Liste détaillée
    let y = 32;
    pdf.setFontSize(10);
    items.forEach((a, idx) => {
      // Saut de page si plus de place
      if (y > h - 35) {
        pdf.addPage();
        y = 20;
      }

      // Bandeau catégorie
      const rgb = CAT_RGB[a.categorie] || [240, 240, 240];
      pdf.setFillColor(rgb[0], rgb[1], rgb[2]);
      pdf.rect(15, y - 4, w - 30, 6, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.text(`${a.categorie}  •  ${critLabel(a.criticite)}  •  Resp. : ${a.responsable}`, 17, y);
      y += 5;

      // Titre
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      const titreLines = pdf.splitTextToSize(`${idx + 1}. ${a.titre}`, w - 32);
      pdf.text(titreLines, 17, y);
      y += titreLines.length * 4.5;

      // Échéance + ER concernés
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.5);
      const echeance = a.dateEcheance
        ? new Date(a.dateEcheance).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
        : 'À programmer';
      pdf.text(`📅 Échéance : ${echeance}`, 17, y);
      y += 4;
      const erTxt = a.tousEtablissements
        ? `Tous les ER (${ctx.etablissements.length})`
        : a.etablissementsIds
            .map(id => ctx.etablissements.find(e => e.id === id)?.nom)
            .filter(Boolean)
            .join(', ') || '—';
      const erLines = pdf.splitTextToSize(`🏫 Établissement(s) : ${erTxt}`, w - 32);
      pdf.text(erLines, 17, y);
      y += erLines.length * 4;

      // Description
      if (a.description) {
        const descLines = pdf.splitTextToSize(a.description, w - 32);
        pdf.text(descLines, 17, y);
        y += descLines.length * 4;
      }

      // Référence
      if (a.reference) {
        pdf.setTextColor(43, 76, 140);
        pdf.setFont('helvetica', 'italic');
        pdf.text(`📖 ${a.reference}`, 17, y);
        pdf.setTextColor(0);
        y += 4;
      }

      y += 4;

      // Trait séparateur
      pdf.setDrawColor(220);
      pdf.line(15, y - 2, w - 15, y - 2);
      pdf.setDrawColor(0);
    });
  }

  // Pied de page
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(7);
    pdf.setTextColor(150);
    pdf.text(
      `${ctx.agenceComptable?.nom || ''} — Calendrier annuel ${ctx.exercice} — Page ${i}/${pageCount}`,
      w / 2, h - 8, { align: 'center' }
    );
    pdf.setTextColor(0);
  }

  pdf.save(`calendrier-portrait-${ctx.exercice}.pdf`);
}

// ─── PDF Paysage annuel — vue affiche synthétique ───────────────────
export function exportCalendrierPDFPaysageAffiche(ctx: ExportPortraitContext) {
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const w = pdf.internal.pageSize.getWidth();
  const h = pdf.internal.pageSize.getHeight();

  // Bandeau
  pdf.setFillColor(43, 76, 140);
  pdf.rect(0, 0, w, 18, 'F');
  pdf.setTextColor(255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.text(`📅 Calendrier annuel des opérations comptables — Exercice ${ctx.exercice}`, w / 2, 8, { align: 'center' });
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text(
    `${ctx.agenceComptable?.nom || ''}${ctx.agenceComptable?.uai ? ' (' + ctx.agenceComptable.uai + ')' : ''}  •  Agent comptable : ${ctx.agentComptable || '—'}`,
    w / 2, 14, { align: 'center' }
  );
  pdf.setTextColor(0);

  // Grille 4 colonnes × 3 lignes (12 mois)
  const startY = 22;
  const cellW = (w - 16) / 4;
  const cellH = (h - startY - 8) / 3;
  for (let m = 1; m <= 12; m++) {
    const col = (m - 1) % 4;
    const row = Math.floor((m - 1) / 4);
    const x = 8 + col * cellW;
    const y = startY + row * cellH;

    // Fond mois
    pdf.setFillColor(248, 250, 252);
    pdf.rect(x, y, cellW - 2, cellH - 2, 'F');
    pdf.setDrawColor(43, 76, 140);
    pdf.setLineWidth(0.4);
    pdf.rect(x, y, cellW - 2, cellH - 2, 'S');
    pdf.setLineWidth(0.2);

    // Titre mois
    pdf.setFillColor(43, 76, 140);
    pdf.rect(x, y, cellW - 2, 6, 'F');
    pdf.setTextColor(255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.text(MOIS_NOMS[m - 1].toUpperCase(), x + 2, y + 4.3);
    pdf.setTextColor(0);

    const items = ctx.activites
      .filter(a => isInMonth(a, m))
      .sort((a, b) => {
        const ca = a.criticite === 'haute' ? 0 : a.criticite === 'moyenne' ? 1 : 2;
        const cb = b.criticite === 'haute' ? 0 : b.criticite === 'moyenne' ? 1 : 2;
        return ca - cb;
      });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6.5);
    let cy = y + 9;
    const maxY = y + cellH - 4;
    let truncated = false;
    items.forEach(a => {
      if (cy >= maxY - 2) { truncated = true; return; }
      const dot = a.criticite === 'haute' ? '●' : a.criticite === 'moyenne' ? '◆' : '○';
      const txt = `${dot} ${a.titre}`;
      const lines = pdf.splitTextToSize(txt, cellW - 6);
      const linesToShow = lines.slice(0, Math.max(1, Math.floor((maxY - cy) / 2.4)));
      if (a.criticite === 'haute') pdf.setTextColor(185, 28, 28);
      else if (a.criticite === 'moyenne') pdf.setTextColor(180, 83, 9);
      else pdf.setTextColor(30, 64, 175);
      pdf.text(linesToShow, x + 2, cy);
      pdf.setTextColor(0);
      cy += linesToShow.length * 2.4 + 0.6;
    });
    if (truncated) {
      pdf.setTextColor(120);
      pdf.setFontSize(6);
      pdf.text(`+ autres opérations…`, x + 2, maxY);
      pdf.setTextColor(0);
    }
  }

  // Légende
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Légende :', 8, h - 4);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(185, 28, 28);
  pdf.text('● Obligatoire réglementaire', 25, h - 4);
  pdf.setTextColor(180, 83, 9);
  pdf.text('◆ Recommandé', 70, h - 4);
  pdf.setTextColor(30, 64, 175);
  pdf.text('○ Optionnel', 100, h - 4);
  pdf.setTextColor(120);
  pdf.text(`Sources : GBCP 2012-1246, M9.6, Code éducation R.421-64+`, w - 8, h - 4, { align: 'right' });
  pdf.setTextColor(0);

  pdf.save(`calendrier-affiche-${ctx.exercice}.pdf`);
}

// ─── Mailto multi-destinataires (ouvre client mail par défaut) ──────
export function buildMailtoLink(opts: {
  recipients: string[];
  subject: string;
  body: string;
}): string {
  const to = encodeURIComponent(opts.recipients.join(','));
  const sub = encodeURIComponent(opts.subject);
  // mailto a une limite ~2000 caractères — on tronque le corps si besoin
  const maxBody = 1500;
  const truncated = opts.body.length > maxBody
    ? opts.body.slice(0, maxBody) + '\n\n[... voir PDF joint pour la version complète ...]'
    : opts.body;
  const body = encodeURIComponent(truncated);
  return `mailto:${to}?subject=${sub}&body=${body}`;
}
