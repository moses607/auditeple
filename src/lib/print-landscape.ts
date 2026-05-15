/**
 * Imprime un document A4 paysage institutionnel dans une fenêtre dédiée.
 * Utilisé pour les pièces à joindre au compte financier (cartographie des
 * risques, organigramme fonctionnel, plan d'action).
 */

export interface LandscapeSection {
  /** Titre de la section (ex. "Cartographie des risques — détail"). */
  title: string;
  /** Sous-titre / référence réglementaire optionnel. */
  subtitle?: string;
  /** HTML brut (de préférence un <table>). Le contenu est inséré tel quel. */
  html: string;
}

export interface LandscapePrintOptions {
  /** Titre principal du document (h1). */
  title: string;
  /** Sous-titre (réf. réglementaire, période). */
  subtitle?: string;
  /** Nom de l'établissement / groupement (en-tête). */
  etablissement?: string;
  /** UAI / SIRET / autre identifiant (en-tête). */
  identifiant?: string;
  /** Mention de bas de page (référence document). */
  reference?: string;
  /** Les sections. */
  sections: LandscapeSection[];
}

const escapeHtml = (s: string = ''): string =>
  String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export function escape(s: string | number | undefined | null): string {
  if (s === undefined || s === null) return '';
  return escapeHtml(String(s));
}

/**
 * Construit un tableau HTML formaté (en-tête bleu marine, lignes alternées).
 */
export function table(headers: string[], rows: (string | number)[][]): string {
  const head = headers.map(h => `<th>${escape(h)}</th>`).join('');
  const body = rows.map(r =>
    `<tr>${r.map(c => `<td>${typeof c === 'string' && /<[a-z]/i.test(c) ? c : escape(c)}</td>`).join('')}</tr>`
  ).join('');
  return `<table class="data"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

export function badge(text: string, kind: 'critique' | 'majeure' | 'moyenne' | 'faible' | 'ok' | 'info' = 'info'): string {
  return `<span class="badge b-${kind}">${escape(text)}</span>`;
}

export function printLandscape(opts: LandscapePrintOptions): void {
  const win = window.open('', '_blank', 'width=1280,height=900');
  if (!win) {
    alert('Impossible d\'ouvrir la fenêtre d\'impression. Autorisez les pop-ups pour ce site.');
    return;
  }

  const today = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  const sectionsHtml = opts.sections.map((s, i) => `
    <section class="section ${i > 0 ? 'page-break' : ''}">
      <header class="section-head">
        <h2>${escape(s.title)}</h2>
        ${s.subtitle ? `<p class="section-sub">${escape(s.subtitle)}</p>` : ''}
      </header>
      <div class="section-body">${s.html}</div>
    </section>
  `).join('');

  const html = `<!doctype html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${escape(opts.title)}</title>
  <style>
    @page { size: A4 landscape; margin: 12mm 14mm; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body {
      font-family: 'Libre Franklin', 'Helvetica Neue', Arial, sans-serif;
      font-size: 10.5pt;
      color: #1a202c;
      background: #ffffff;
      line-height: 1.45;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page {
      padding: 0;
      max-width: 100%;
    }
    /* En-tête institutionnel */
    .doc-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-bottom: 3px solid #1e3a8a;
      padding-bottom: 10px;
      margin-bottom: 14px;
    }
    .doc-header .left {
      display: flex; align-items: center; gap: 14px;
    }
    .doc-header .seal {
      width: 38px; height: 38px; border-radius: 50%;
      background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%);
      box-shadow: 0 1px 3px rgba(0,0,0,0.25);
      flex-shrink: 0;
    }
    .doc-header h1 {
      margin: 0;
      font-size: 18pt;
      color: #1e3a8a;
      font-weight: 700;
      letter-spacing: -0.01em;
    }
    .doc-header .subtitle {
      font-size: 10pt;
      color: #475569;
      margin-top: 2px;
    }
    .doc-header .right {
      text-align: right;
      font-size: 9pt;
      color: #475569;
    }
    .doc-header .right strong { color: #1a202c; }
    /* Sections */
    .section { margin-bottom: 18px; }
    .section.page-break { page-break-before: always; }
    .section-head {
      border-left: 4px solid #1e3a8a;
      padding-left: 10px;
      margin-bottom: 8px;
    }
    .section-head h2 {
      margin: 0;
      font-size: 13pt;
      color: #1e3a8a;
      font-weight: 700;
    }
    .section-sub {
      margin: 2px 0 0;
      font-size: 9pt;
      color: #64748b;
      font-style: italic;
    }
    /* Tableaux */
    table.data {
      width: 100%;
      border-collapse: collapse;
      font-size: 9.5pt;
      page-break-inside: auto;
    }
    table.data thead { display: table-header-group; }
    table.data tr { page-break-inside: avoid; }
    table.data th {
      background: #1e3a8a;
      color: #ffffff;
      padding: 7px 8px;
      text-align: left;
      font-weight: 600;
      font-size: 9pt;
      letter-spacing: 0.01em;
      border: 1px solid #1e3a8a;
    }
    table.data td {
      padding: 6px 8px;
      border: 1px solid #cbd5e1;
      vertical-align: top;
    }
    table.data tbody tr:nth-child(even) td { background: #f8fafc; }
    /* Badges */
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 8.5pt;
      font-weight: 700;
      letter-spacing: 0.02em;
      white-space: nowrap;
    }
    .b-critique { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
    .b-majeure  { background: #ffedd5; color: #9a3412; border: 1px solid #fed7aa; }
    .b-moyenne  { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
    .b-faible   { background: #e0f2fe; color: #075985; border: 1px solid #bae6fd; }
    .b-ok       { background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
    .b-info     { background: #e0e7ff; color: #3730a3; border: 1px solid #c7d2fe; }
    /* Note / vide */
    .note {
      padding: 14px;
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      border-radius: 6px;
      color: #64748b;
      font-style: italic;
      text-align: center;
    }
    /* Bloc signatures */
    .signatures {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 28px;
      margin-top: 28px;
      page-break-inside: avoid;
    }
    .signatures .sig {
      border-top: 1px solid #1a202c;
      padding-top: 6px;
      font-size: 9.5pt;
      text-align: center;
    }
    .signatures .sig .role {
      font-weight: 700;
      color: #1e3a8a;
      margin-bottom: 24px;
    }
    /* Pied de page */
    .doc-footer {
      margin-top: 18px;
      padding-top: 8px;
      border-top: 1px solid #cbd5e1;
      font-size: 8pt;
      color: #64748b;
      display: flex;
      justify-content: space-between;
    }
    @media print {
      .no-print { display: none !important; }
    }
    /* Barre d'actions à l'écran */
    .toolbar {
      position: fixed; top: 0; left: 0; right: 0;
      background: #1e3a8a; color: #fff;
      padding: 10px 14px;
      display: flex; justify-content: space-between; align-items: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      z-index: 1000;
    }
    .toolbar button {
      background: #d4af37; color: #1a202c;
      border: 0; padding: 7px 16px; border-radius: 4px;
      font-weight: 700; cursor: pointer; font-size: 11pt;
    }
    .toolbar button.secondary { background: rgba(255,255,255,0.15); color: #fff; margin-right: 8px; }
    .with-toolbar { padding-top: 60px; }
  </style>
</head>
<body>
  <div class="toolbar no-print">
    <span>Document prêt à imprimer — orientation paysage A4</span>
    <div>
      <button class="secondary" onclick="window.close()">Fermer</button>
      <button onclick="window.print()">Imprimer / Enregistrer en PDF</button>
    </div>
  </div>
  <div class="page with-toolbar">
    <header class="doc-header">
      <div class="left">
        <div class="seal" aria-hidden="true"></div>
        <div>
          <h1>${escape(opts.title)}</h1>
          ${opts.subtitle ? `<div class="subtitle">${escape(opts.subtitle)}</div>` : ''}
        </div>
      </div>
      <div class="right">
        ${opts.etablissement ? `<div><strong>${escape(opts.etablissement)}</strong></div>` : ''}
        ${opts.identifiant ? `<div>${escape(opts.identifiant)}</div>` : ''}
        <div>Édité le ${today}</div>
      </div>
    </header>

    ${sectionsHtml}

    <div class="signatures">
      <div class="sig">
        <div class="role">L'Ordonnateur</div>
        <div>Date, signature et cachet</div>
      </div>
      <div class="sig">
        <div class="role">L'Agent comptable</div>
        <div>Date, signature et cachet</div>
      </div>
    </div>

    <footer class="doc-footer">
      <span>${escape(opts.reference || 'Pièce à joindre au compte financier — M9-6 / GBCP 2012-1246')}</span>
      <span>CIC Expert Pro — auditac.lovable.app</span>
    </footer>
  </div>
  <script>
    window.addEventListener('load', () => {
      // Léger délai pour s'assurer du rendu avant impression auto
      setTimeout(() => { try { window.focus(); } catch(e) {} }, 100);
    });
  </script>
</body>
</html>`;

  win.document.open();
  win.document.write(html);
  win.document.close();
}
