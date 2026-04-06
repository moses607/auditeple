import { PVAuditItem, PVVerification, fmtDate, getSelectedEtablissement, getAgenceComptable, AuditParams } from '@/lib/types';

interface PVPrintDocumentProps {
  pv: PVAuditItem;
  params: AuditParams;
  moduleLabels: Record<string, string>;
}

export default function PVPrintDocument({ pv, params, moduleLabels }: PVPrintDocumentProps) {
  const currentEtab = getSelectedEtablissement(params);
  const agenceComptable = getAgenceComptable(params);
  const anomalies = (pv.verifications || []).filter(v => v.status === 'anomalie');
  const conformes = (pv.verifications || []).filter(v => v.status === 'conforme');
  const nonVerifies = (pv.verifications || []).filter(v => v.status === 'non_verifie');
  const modulesAudites = (pv as any).modulesAudites || [];
  const headerEtab = agenceComptable || currentEtab;

  // Section numbering
  let sectionNum = 0;
  const nextSection = () => { sectionNum++; return toRoman(sectionNum); };

  return (
    <div className="pv-print-document hidden print:block" style={{ fontFamily: "'Times New Roman', 'Georgia', serif", color: '#1a1a1a', background: '#fff', fontSize: '10pt', lineHeight: '1.5' }}>

      {/* ═══ EN-TÊTE OFFICIELLE ═══ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '14px', marginBottom: '6px', borderBottom: '3px double #1a365d' }}>
        {/* Bloc gauche — AC */}
        <div style={{ fontSize: '9pt', lineHeight: '1.6', maxWidth: '55%' }}>
          <p style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '8pt', color: '#1a365d', marginBottom: '2px' }}>
            Agence comptable
          </p>
          <p style={{ fontWeight: 700, fontSize: '11pt' }}>{headerEtab?.nom || 'Établissement'}</p>
          {headerEtab?.uai && <p style={{ fontFamily: "'Courier New', monospace", fontSize: '8pt', color: '#555' }}>UAI : {headerEtab.uai}</p>}
          {headerEtab?.adresse && <p>{headerEtab.adresse}</p>}
          {(headerEtab?.codePostal || headerEtab?.ville) && <p>{headerEtab.codePostal} {headerEtab.ville}</p>}
          {headerEtab?.academie && <p style={{ marginTop: '2px', fontStyle: 'italic' }}>Académie de {headerEtab.academie}</p>}
        </div>
        {/* Bloc droit — République */}
        <div style={{ textAlign: 'right', fontSize: '9pt', lineHeight: '1.6' }}>
          <p style={{ fontWeight: 700, fontSize: '10pt', letterSpacing: '0.08em', color: '#1a365d' }}>RÉPUBLIQUE FRANÇAISE</p>
          <p style={{ fontStyle: 'italic', fontSize: '9pt', color: '#555' }}>Liberté – Égalité – Fraternité</p>
          <p style={{ fontSize: '8pt', color: '#777', marginTop: '4px' }}>Ministère de l'Éducation nationale</p>
          {agenceComptable && currentEtab && agenceComptable.id !== currentEtab.id && (
            <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #bbb' }}>
              <p style={{ fontWeight: 700, fontSize: '8pt', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1a365d' }}>Établissement audité</p>
              <p style={{ fontWeight: 600 }}>{currentEtab.nom}</p>
              {currentEtab.uai && <p style={{ fontFamily: "'Courier New', monospace", fontSize: '8pt', color: '#555' }}>UAI : {currentEtab.uai}</p>}
              {currentEtab.ville && <p>{currentEtab.codePostal} {currentEtab.ville}</p>}
            </div>
          )}
        </div>
      </div>

      {/* ═══ TITRE DU DOCUMENT ═══ */}
      <div style={{ textAlign: 'center', margin: '28px 0 24px', padding: '18px 0' }}>
        <div style={{ borderTop: '2px solid #1a365d', borderBottom: '2px solid #1a365d', padding: '14px 0' }}>
          <h1 style={{ fontSize: '18pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', margin: 0, fontFamily: "'Georgia', serif", color: '#1a365d' }}>
            Procès-Verbal
          </h1>
          <p style={{ fontSize: '13pt', fontWeight: 600, marginTop: '4px', letterSpacing: '0.1em', color: '#1a365d' }}>
            {pv.type}
          </p>
        </div>
        <div style={{ marginTop: '10px', fontSize: '10pt' }}>
          <p style={{ fontWeight: 600 }}>Phase : <span style={{ textTransform: 'capitalize', fontStyle: 'italic' }}>{pv.phase}</span></p>
          <p style={{ color: '#555' }}>Exercice {params.exercice || new Date().getFullYear()}</p>
        </div>
      </div>

      {/* ═══ CARTOUCHE D'IDENTIFICATION ═══ */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '9pt' }}>
        <tbody>
          {[
            ['Date du contrôle', fmtDate(pv.date)],
            ['Lieu', pv.lieu],
            ['Objet', pv.objet],
            ['Agent comptable', params.agentComptable || '—'],
            ['Ordonnateur', currentEtab?.ordonnateur || '—'],
            ['Délai de réponse', pv.delai],
          ].map(([label, value], i) => (
            <tr key={i}>
              <td style={{ border: '1px solid #999', padding: '7px 12px', fontWeight: 700, width: '28%', background: '#edf2f7', color: '#1a365d', fontSize: '8.5pt', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{label}</td>
              <td style={{ border: '1px solid #999', padding: '7px 12px' }}>{value}</td>
            </tr>
          ))}
          {modulesAudites.length > 0 && (
            <tr>
              <td style={{ border: '1px solid #999', padding: '7px 12px', fontWeight: 700, background: '#edf2f7', color: '#1a365d', fontSize: '8.5pt', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Modules audités</td>
              <td style={{ border: '1px solid #999', padding: '7px 12px' }}>
                {modulesAudites.map((id: string) => moduleLabels[id] || id).join(' • ')}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ═══ SYNTHÈSE CHIFFRÉE ═══ */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '24px', border: '2px solid #1a365d', borderRadius: '4px', overflow: 'hidden' }}>
        {[
          { n: (pv.verifications || []).length, label: 'Points vérifiés', bg: '#fff', color: '#1a365d', borderColor: '#1a365d' },
          { n: conformes.length, label: 'Conformes', bg: '#f0fff4', color: '#22543d', borderColor: '#38a169' },
          { n: anomalies.length, label: 'Anomalies', bg: '#fff5f5', color: '#c53030', borderColor: '#e53e3e' },
          { n: nonVerifies.length, label: 'Non vérifiés', bg: '#fafafa', color: '#718096', borderColor: '#a0aec0' },
        ].map((item, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', padding: '12px 8px', background: item.bg, borderRight: i < 3 ? '1px solid #ccc' : 'none' }}>
            <p style={{ fontSize: '22pt', fontWeight: 700, color: item.color, lineHeight: 1 }}>{item.n}</p>
            <p style={{ fontSize: '7.5pt', textTransform: 'uppercase', letterSpacing: '0.08em', color: item.color, marginTop: '4px', fontWeight: 600 }}>{item.label}</p>
          </div>
        ))}
      </div>

      {/* ═══ TABLEAU DES POINTS DE VÉRIFICATION ═══ */}
      {(pv.verifications || []).length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <SectionTitle num={nextSection()} title="Points de vérification" />
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5pt' }}>
            <thead>
              <tr>
                <th style={thStyle({ width: '4%' })}>N°</th>
                <th style={thStyle({ width: '30%', textAlign: 'left' })}>Point de contrôle</th>
                <th style={thStyle({ width: '14%', textAlign: 'left' })}>Réf. réglementaire</th>
                <th style={thStyle({ width: '10%' })}>Criticité</th>
                <th style={thStyle({ width: '12%' })}>Résultat</th>
                <th style={thStyle({ width: '30%', textAlign: 'left' })}>Observations</th>
              </tr>
            </thead>
            <tbody>
              {(pv.verifications || []).map((v: PVVerification, i: number) => (
                <tr key={i} style={{ background: v.status === 'anomalie' ? '#fff5f5' : v.status === 'conforme' ? '#f0fff4' : '#fff' }}>
                  <td style={tdStyle({ textAlign: 'center', fontWeight: 600 })}>{i + 1}</td>
                  <td style={tdStyle({})}>{v.label}</td>
                  <td style={tdStyle({ fontSize: '7.5pt', color: '#555' })}>{v.reference || '—'}</td>
                  <td style={tdStyle({ textAlign: 'center', fontWeight: 700, fontSize: '7.5pt', color: v.criticite === 'MAJEURE' ? '#c53030' : '#718096' })}>
                    {v.criticite}
                  </td>
                  <td style={tdStyle({ textAlign: 'center', fontWeight: 700, fontSize: '8pt' })}>
                    <span style={{ color: v.status === 'anomalie' ? '#c53030' : v.status === 'conforme' ? '#22543d' : '#718096' }}>
                      {v.status === 'anomalie' ? '⚠ ANOMALIE' : v.status === 'conforme' ? '✓ Conforme' : '— N/V'}
                    </span>
                  </td>
                  <td style={tdStyle({ fontSize: '8pt' })}>{v.observations || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ═══ CONSTATS COMPLÉMENTAIRES ═══ */}
      {pv.constatsLibres && (
        <div style={{ marginBottom: '24px' }}>
          <SectionTitle num={nextSection()} title="Constats complémentaires" />
          <p style={{ fontSize: '9.5pt', lineHeight: '1.7', whiteSpace: 'pre-wrap', textAlign: 'justify' }}>{pv.constatsLibres}</p>
        </div>
      )}

      {/* ═══ RECOMMANDATIONS ═══ */}
      {pv.recommandations && (
        <div style={{ marginBottom: '24px' }}>
          <SectionTitle num={nextSection()} title="Recommandations" />
          <div style={{ fontSize: '9.5pt', lineHeight: '1.7', whiteSpace: 'pre-wrap', padding: '12px 16px', border: '1px solid #cbd5e0', borderLeft: '4px solid #1a365d', background: '#f7fafc', textAlign: 'justify' }}>
            {pv.recommandations}
          </div>
        </div>
      )}

      {/* ═══ CONCLUSIONS ═══ */}
      {pv.conclusions && (
        <div style={{ marginBottom: '24px' }}>
          <SectionTitle num={nextSection()} title="Conclusions" />
          <p style={{ fontSize: '9.5pt', lineHeight: '1.7', whiteSpace: 'pre-wrap', textAlign: 'justify' }}>{pv.conclusions}</p>
        </div>
      )}

      {/* ═══ PHASE CONTRADICTOIRE ═══ */}
      <div style={{ marginBottom: '24px', padding: '14px 16px', border: '2px solid #1a365d', borderRadius: '4px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
        <SectionTitle num={nextSection()} title="Phase contradictoire — Droit de réponse de l'ordonnateur" />
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9pt', marginTop: '8px' }}>
          <tbody>
            <tr>
              <td style={{ ...tdLabelStyle, width: '30%' }}>Phase actuelle</td>
              <td style={tdValueStyle}><span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{pv.phase}</span></td>
            </tr>
            <tr>
              <td style={tdLabelStyle}>Délai de réponse accordé</td>
              <td style={tdValueStyle}>{pv.delai}</td>
            </tr>
            {pv.dateReponse && (
              <tr>
                <td style={tdLabelStyle}>Date de réponse</td>
                <td style={tdValueStyle}>{fmtDate(pv.dateReponse)}</td>
              </tr>
            )}
            <tr>
              <td style={{ ...tdLabelStyle, verticalAlign: 'top' }}>Réponse de l'ordonnateur</td>
              <td style={{ ...tdValueStyle, whiteSpace: 'pre-wrap', minHeight: '60px' }}>
                {pv.reponseOrdonnateur || (
                  <span style={{ fontStyle: 'italic', color: '#a0aec0' }}>
                    {pv.phase === 'provisoire'
                      ? `En attente — L'ordonnateur dispose d'un délai de ${pv.delai} pour formuler ses observations.`
                      : 'Aucune réponse formulée.'}
                  </span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ═══ MENTION LÉGALE ═══ */}
      <div style={{ fontSize: '8pt', textAlign: 'justify', margin: '24px 0 16px', color: '#555', fontStyle: 'italic', lineHeight: '1.5', padding: '8px 12px', borderTop: '1px solid #cbd5e0', borderBottom: '1px solid #cbd5e0' }}>
        Le présent procès-verbal est établi conformément aux dispositions du décret n° 2012-1246 du 7 novembre 2012
        relatif à la gestion budgétaire et comptable publique, de l'instruction codificatrice M9.6 et du cadre
        de référence du contrôle interne comptable et financier (CICF) des EPLE.
      </div>

      {/* ═══ SIGNATURES ═══ */}
      <div style={{ borderTop: '3px double #1a365d', paddingTop: '20px', marginTop: '20px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
        <p style={{ fontSize: '9.5pt', marginBottom: '6px' }}>
          Fait à <strong>{currentEtab?.ville || '_______________'}</strong>, le <strong>{fmtDate(pv.date)}</strong>
        </p>
        <p style={{ fontSize: '8pt', color: '#555', marginBottom: '20px', fontStyle: 'italic' }}>
          En trois exemplaires originaux
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
          {[
            { title: "L'Agent comptable", sig: (pv as any).signatureAC, name: pv.signataire1 },
            { title: 'Le Secrétaire général', sig: (pv as any).signatureSG, name: (pv as any).signataire3 },
            { title: "L'Ordonnateur", sig: (pv as any).signatureOrdo, name: pv.signataire2 },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', width: '30%' }}>
              <p style={{ fontWeight: 700, borderBottom: '2px solid #1a365d', paddingBottom: '6px', marginBottom: '10px', color: '#1a365d', textTransform: 'uppercase', fontSize: '8pt', letterSpacing: '0.05em' }}>
                {s.title}
              </p>
              {s.sig ? (
                <img src={s.sig} alt={`Signature ${s.title}`} style={{ maxWidth: '180px', maxHeight: '80px', margin: '0 auto 10px' }} />
              ) : (
                <div style={{ height: '80px' }} />
              )}
              <p style={{ fontSize: '9pt', fontWeight: 600 }}>{s.name || '____________________'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ PIED DE PAGE ═══ */}
      <div style={{ borderTop: '1px solid #cbd5e0', marginTop: '28px', paddingTop: '8px', fontSize: '7pt', color: '#a0aec0', display: 'flex', justifyContent: 'space-between' }}>
        <span>CIC Expert Pro — Contrôle interne comptable et financier des EPLE</span>
        <span>Document généré le {new Date().toLocaleDateString('fr-FR')} — Page 1</span>
      </div>
    </div>
  );
}

/* ═══ Composants utilitaires ═══ */

function SectionTitle({ num, title }: { num: string; title: string }) {
  return (
    <h2 style={{
      fontSize: '11pt',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      color: '#1a365d',
      borderBottom: '2px solid #1a365d',
      paddingBottom: '5px',
      marginBottom: '12px',
      fontFamily: "'Georgia', serif",
    }}>
      {num}. {title}
    </h2>
  );
}

function toRoman(n: number): string {
  const romanNumerals: [number, string][] = [
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
  let result = '';
  for (const [value, numeral] of romanNumerals) {
    while (n >= value) { result += numeral; n -= value; }
  }
  return result;
}

const thStyle = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  background: '#1a365d',
  color: '#fff',
  border: '1px solid #2d4a7a',
  padding: '7px 8px',
  textAlign: 'center',
  fontSize: '8pt',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  ...extra,
});

const tdStyle = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  border: '1px solid #cbd5e0',
  padding: '6px 8px',
  ...extra,
});

const tdLabelStyle: React.CSSProperties = {
  border: '1px solid #999',
  padding: '7px 12px',
  fontWeight: 700,
  background: '#edf2f7',
  color: '#1a365d',
  fontSize: '8.5pt',
  textTransform: 'uppercase',
  letterSpacing: '0.03em',
};

const tdValueStyle: React.CSSProperties = {
  border: '1px solid #999',
  padding: '7px 12px',
};
