// Export PDF + Word pour le Calendrier annuel de l'agent comptable
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, PageOrientation, WidthType, BorderStyle,
  ShadingType,
} from 'docx';
import { saveAs } from 'file-saver';
import { MOIS_NOMS } from './calendrier-activites';
import type { ActiviteCalendrier } from './calendrier-types';
import type { Etablissement } from './types';

interface ExportContext {
  activites: ActiviteCalendrier[];
  etablissements: Etablissement[];
  agenceComptable?: Etablissement;
  exercice: string;
  agentComptable: string;
}

// ─── PDF (paysage A4) ──────────────────────────────────────────────
export function exportCalendrierPDF(ctx: ExportContext) {
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();

  // En-tête
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text(`Calendrier annuel des opérations comptables — Exercice ${ctx.exercice}`, pageWidth / 2, 14, { align: 'center' });
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(
    `Agence comptable : ${ctx.agenceComptable?.nom || '—'}${ctx.agenceComptable?.uai ? ' (' + ctx.agenceComptable.uai + ')' : ''}`,
    pageWidth / 2, 20, { align: 'center' }
  );
  pdf.text(`Agent comptable : ${ctx.agentComptable || '—'}`, pageWidth / 2, 25, { align: 'center' });

  // Avertissement
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'italic');
  const avertissement =
    "Important : le non-respect de ce calendrier met l'agent comptable en difficulté et l'empêche de servir correctement le groupement dans les délais réglementaires.";
  const lines = pdf.splitTextToSize(avertissement, pageWidth - 20);
  pdf.text(lines, 10, 31);

  // Tableau récapitulatif par mois
  const monthlyRows: any[] = [];
  for (let m = 1; m <= 12; m++) {
    const items = ctx.activites
      .filter(a => isInMonth(a, m))
      .sort((a, b) => a.titre.localeCompare(b.titre));
    if (items.length === 0) continue;
    items.forEach((a, idx) => {
      const erNoms = a.etablissementsIds
        .map(id => ctx.etablissements.find(e => e.id === id)?.nom)
        .filter(Boolean)
        .join(', ');
      monthlyRows.push([
        idx === 0 ? MOIS_NOMS[m - 1].toUpperCase() : '',
        a.dateEcheance || '',
        a.titre,
        a.categorie,
        a.responsable,
        erNoms || (a.tousEtablissements ? 'Tous les ER' : '—'),
        a.criticite.toUpperCase(),
      ]);
    });
  }

  autoTable(pdf, {
    startY: 40,
    head: [['Mois', 'Échéance', 'Activité', 'Catégorie', 'Resp.', 'Établissement(s)', 'Crit.']],
    body: monthlyRows,
    styles: { fontSize: 7.5, cellPadding: 1.5, overflow: 'linebreak' },
    headStyles: { fillColor: [43, 76, 140], textColor: 255, fontStyle: 'bold', fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 22, fontStyle: 'bold' },
      1: { cellWidth: 22 },
      2: { cellWidth: 95 },
      3: { cellWidth: 35 },
      4: { cellWidth: 16, halign: 'center' },
      5: { cellWidth: 60 },
      6: { cellWidth: 18, halign: 'center' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 6) {
        const v = String(data.cell.raw);
        if (v === 'HAUTE') data.cell.styles.fillColor = [254, 226, 226];
        else if (v === 'MOYENNE') data.cell.styles.fillColor = [254, 243, 199];
        else if (v === 'INFO') data.cell.styles.fillColor = [219, 234, 254];
      }
    },
    margin: { left: 8, right: 8 },
  });

  pdf.save(`calendrier-annuel-AC-${ctx.exercice}.pdf`);
}

// ─── Word DOCX (paysage A4) ────────────────────────────────────────
export async function exportCalendrierDOCX(ctx: ExportContext) {
  const headerCell = (text: string, width: number) => new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: { fill: '2B4C8C', type: ShadingType.CLEAR, color: 'auto' },
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, bold: true, color: 'FFFFFF', size: 16 })],
    })],
  });

  const bodyCell = (text: string, width: number, opts?: { bold?: boolean; fill?: string; align?: typeof AlignmentType[keyof typeof AlignmentType] }) => new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: opts?.fill ? { fill: opts.fill, type: ShadingType.CLEAR, color: 'auto' } : undefined,
    margins: { top: 50, bottom: 50, left: 80, right: 80 },
    children: [new Paragraph({
      alignment: opts?.align || AlignmentType.LEFT,
      children: [new TextRun({ text: text || '—', bold: opts?.bold, size: 14 })],
    })],
  });

  const widths = [1500, 1500, 6500, 2500, 1100, 4000, 1100]; // sum = 18200
  const totalWidth = widths.reduce((a, b) => a + b, 0);

  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      headerCell('Mois', widths[0]),
      headerCell('Échéance', widths[1]),
      headerCell('Activité', widths[2]),
      headerCell('Catégorie', widths[3]),
      headerCell('Resp.', widths[4]),
      headerCell('Établissement(s)', widths[5]),
      headerCell('Crit.', widths[6]),
    ],
  });

  const rows: TableRow[] = [headerRow];
  for (let m = 1; m <= 12; m++) {
    const items = ctx.activites
      .filter(a => isInMonth(a, m))
      .sort((a, b) => a.titre.localeCompare(b.titre));
    if (items.length === 0) continue;
    items.forEach((a, idx) => {
      const erNoms = a.etablissementsIds
        .map(id => ctx.etablissements.find(e => e.id === id)?.nom)
        .filter(Boolean)
        .join(', ');
      const crit = a.criticite.toUpperCase();
      const fill = crit === 'HAUTE' ? 'FEE2E2' : crit === 'MOYENNE' ? 'FEF3C7' : 'DBEAFE';
      rows.push(new TableRow({
        children: [
          bodyCell(idx === 0 ? MOIS_NOMS[m - 1].toUpperCase() : '', widths[0], { bold: true, fill: 'F1F5F9' }),
          bodyCell(a.dateEcheance || '', widths[1]),
          bodyCell(a.titre, widths[2]),
          bodyCell(a.categorie, widths[3]),
          bodyCell(a.responsable, widths[4], { align: AlignmentType.CENTER }),
          bodyCell(erNoms || (a.tousEtablissements ? 'Tous les ER' : '—'), widths[5]),
          bodyCell(crit, widths[6], { fill, align: AlignmentType.CENTER, bold: true }),
        ],
      }));
    });
  }

  const cellBorder = { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' };
  const table = new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths: widths,
    rows: rows.map(r => r),
    borders: {
      top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder,
      insideHorizontal: cellBorder, insideVertical: cellBorder,
    },
  });

  const doc = new Document({
    styles: {
      default: { document: { run: { font: 'Calibri', size: 20 } } },
    },
    sections: [{
      properties: {
        page: {
          size: {
            width: 11906,
            height: 16838,
            orientation: PageOrientation.LANDSCAPE,
          },
          margin: { top: 720, right: 720, bottom: 720, left: 720 },
        },
      },
      children: [
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          children: [new TextRun({
            text: `Calendrier annuel des opérations comptables — Exercice ${ctx.exercice}`,
            bold: true, size: 28,
          })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({
            text: `Agence comptable : ${ctx.agenceComptable?.nom || '—'}${ctx.agenceComptable?.uai ? ' (' + ctx.agenceComptable.uai + ')' : ''}`,
            size: 22,
          })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: `Agent comptable : ${ctx.agentComptable || '—'}`, size: 22 })],
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [new TextRun({
            text: "Important : le non-respect de ce calendrier met l'agent comptable en difficulté et l'empêche de servir correctement le groupement dans les délais réglementaires.",
            italics: true, size: 18, color: '991B1B',
          })],
          spacing: { after: 240 },
        }),
        table,
        new Paragraph({
          children: [new TextRun({
            text: "Sources : décret n° 2012-1246 (GBCP), art. R. 421-64 et s. Code éducation, M9.6, circ. n° 2011-117 du 03/08/2011, guides DAF A3 / IH2EF, vade-mecum de l'adjoint gestionnaire.",
            italics: true, size: 16, color: '64748B',
          })],
          spacing: { before: 240 },
        }),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `calendrier-annuel-AC-${ctx.exercice}.docx`);
}

// ─── Helper ─────────────────────────────────────────────────────────
function isInMonth(a: ActiviteCalendrier, m: number): boolean {
  if (a.periodicite === 'mensuelle' && a.moisDebut === 0) return true;
  const debut = a.moisDebut;
  const fin = a.moisFin || a.moisDebut;
  if (debut <= fin) return m >= debut && m <= fin;
  // Plage qui traverse l'année (ex: sept à juin)
  return m >= debut || m <= fin;
}
