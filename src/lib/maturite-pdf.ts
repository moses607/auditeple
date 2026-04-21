/**
 * Export du rapport exécutif "Maturité CICF" au format PDF A4 portrait.
 * 1 page de garde + 1 page synthèse (KPI + axes + recommandations).
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { type MaturiteCICF, NIVEAU_LABEL } from './maturite-cicf';

export async function exportMaturitePDF(data: MaturiteCICF, groupementLabel: string) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210, H = 297, M = 18;
  const niveau = NIVEAU_LABEL[data.niveau];

  // ─── Page 1 : page de garde ───────────────────────────────
  doc.setFillColor(30, 64, 175); // primary
  doc.rect(0, 0, W, 70, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('RAPPORT EXÉCUTIF', M, 20);
  doc.setFontSize(24);
  doc.text('Maturité CICF', M, 32);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Contrôle Interne Comptable et Financier — EPLE', M, 42);
  doc.text(String(groupementLabel), M, 50);
  doc.setFontSize(9);
  doc.text('Édité le ' + new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }), M, 58);

  // Bandeau score
  doc.setFillColor(255, 255, 255);
  doc.setTextColor(30, 64, 175);
  doc.roundedRect(M, 90, W - 2 * M, 60, 4, 4, 'F');
  doc.setDrawColor(30, 64, 175);
  doc.setLineWidth(0.5);
  doc.roundedRect(M, 90, W - 2 * M, 60, 4, 4, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('SCORE GLOBAL', M + 8, 102);

  doc.setFontSize(56);
  doc.setTextColor(30, 64, 175);
  doc.text(`${data.scoreGlobal}`, M + 8, 130);
  doc.setFontSize(14);
  doc.setTextColor(100, 100, 100);
  doc.text('/ 100', M + 8 + doc.getTextWidth(`${data.scoreGlobal}`) + 4, 130);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 64, 175);
  doc.text(`Niveau ${niveau.label}`, W - M - 8, 110, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  const desc = doc.splitTextToSize(niveau.description, 80);
  doc.text(desc, W - M - 8, 120, { align: 'right' });

  // KPI synthèse
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Indicateurs clés', M, 170);

  autoTable(doc, {
    startY: 175,
    margin: { left: M, right: M },
    head: [['Indicateur', 'Valeur']],
    body: [
      ['Taux de couverture des contrôles', `${data.kpis.tauxCouverture} %`],
      ['Points audités / total', `${data.kpis.pointsAudites} / ${data.kpis.pointsTotal}`],
      ['Anomalies ouvertes', `${data.kpis.anomaliesOuvertes}`],
      ['Audits réalisés', `${data.kpis.auditsTotal} (dont ${data.kpis.auditsClotures} clôturés)`],
      ['PV en attente / finalisés', `${data.kpis.pvEnAttente} / ${data.kpis.pvFinalises}`],
      ['Établissements couverts', `${data.kpis.etablissementsCouverts}`],
      ['Agents actifs', `${data.kpis.agentsActifs}`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [30, 64, 175], textColor: 255, fontSize: 10 },
    bodyStyles: { fontSize: 9 },
    columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
  });

  // Footer page 1
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text('Référentiel : Décret GBCP 2012-1246 · Instruction codificatrice M9-6 · CIC Expert Pro', W / 2, H - 10, { align: 'center' });

  // ─── Page 2 : axes & recommandations ─────────────────────
  doc.addPage();
  doc.setFillColor(30, 64, 175);
  doc.rect(0, 0, W, 18, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`Détail des 5 axes — ${groupementLabel}`, M, 12);

  doc.setTextColor(40, 40, 40);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  autoTable(doc, {
    startY: 28,
    margin: { left: M, right: M },
    head: [['Axe', 'Score', 'Poids', 'Description']],
    body: data.axes.map(a => [a.label, `${a.score}/100`, `${Math.round(a.poids * 100)} %`, a.description]),
    theme: 'striped',
    headStyles: { fillColor: [30, 64, 175], textColor: 255, fontSize: 10 },
    bodyStyles: { fontSize: 9, valign: 'middle' },
    columnStyles: { 1: { halign: 'center', fontStyle: 'bold' }, 2: { halign: 'center' } },
  });

  // Recommandations dérivées
  const reco = buildRecommandations(data);
  const yReco = (doc as any).lastAutoTable.finalY + 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text("Recommandations prioritaires", M, yReco);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  let y = yReco + 6;
  reco.forEach((r, i) => {
    const lines = doc.splitTextToSize(`${i + 1}. ${r}`, W - 2 * M);
    doc.text(lines, M, y);
    y += lines.length * 4 + 2;
  });

  // Footer page 2
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(`Page 2/2 — Édité le ${new Date().toLocaleString('fr-FR')}`, W / 2, H - 10, { align: 'center' });

  doc.save(`maturite-cicf-${new Date().toISOString().slice(0, 10)}.pdf`);
}

function buildRecommandations(d: MaturiteCICF): string[] {
  const r: string[] = [];
  d.axes.sort((a, b) => a.score - b.score).slice(0, 3).forEach(a => {
    if (a.id === 'gouvernance' && a.score < 80) r.push("Compléter la fiche Gouvernance dans Paramètres : Agent comptable, Ordonnateur, équipe permanente et délégations de signature.");
    if (a.id === 'perimetre' && a.score < 80) r.push("Étendre le périmètre d'audit aux établissements du groupement non encore couverts (cycle annuel obligatoire M9-6).");
    if (a.id === 'controles' && a.score < 80) r.push("Augmenter le taux de couverture en lançant un audit minimal M9-6 (2 points par domaine) sur les EPLE non audités.");
    if (a.id === 'tracabilite' && a.score < 80) r.push("Documenter chaque anomalie majeure avec un constat, une action corrective, un responsable et un délai (Plan d'action).");
    if (a.id === 'restitution' && a.score < 80) r.push("Finaliser les PV en envoyant la procédure contradictoire à l'ordonnateur (lien magique sécurisé) puis clore le PV.");
  });
  if (d.kpis.anomaliesOuvertes > 5) r.push(`${d.kpis.anomaliesOuvertes} anomalies restent ouvertes : prioriser leur traitement dans le Plan d'action.`);
  if (d.scoreGlobal >= 80) r.push("Excellent niveau : maintenir la dynamique par une supervision continue et un audit thématique trimestriel.");
  return r.length ? r : ['Aucune recommandation prioritaire — continuez sur cette dynamique.'];
}
