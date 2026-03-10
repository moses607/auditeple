import { PVAuditItem, PVVerification, fmtDate, getSelectedEtablissement, AuditParams } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

interface PVPrintDocumentProps {
  pv: PVAuditItem;
  params: AuditParams;
  moduleLabels: Record<string, string>;
}

export default function PVPrintDocument({ pv, params, moduleLabels }: PVPrintDocumentProps) {
  const currentEtab = getSelectedEtablissement(params);
  const anomalies = (pv.verifications || []).filter(v => v.status === 'anomalie');
  const conformes = (pv.verifications || []).filter(v => v.status === 'conforme');
  const nonVerifies = (pv.verifications || []).filter(v => v.status === 'non_verifie');
  const modulesAudites = (pv as any).modulesAudites || [];

  return (
    <div className="pv-print-document hidden print:block" style={{ fontFamily: "'DM Sans', serif", color: '#000', background: '#fff' }}>
      {/* ═══ EN-TÊTE OFFICIELLE ═══ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #1a365d', paddingBottom: '12px', marginBottom: '16px' }}>
        <div style={{ fontSize: '9pt', lineHeight: '1.5' }}>
          <p style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Académie {currentEtab?.academie ? `de ${currentEtab.academie}` : ''}
          </p>
          <p>Direction des services départementaux</p>
          <p>de l'Éducation nationale</p>
          <div style={{ marginTop: '8px' }}>
            <p style={{ fontWeight: 700 }}>{currentEtab?.nom || 'Établissement'}</p>
            {currentEtab?.uai && <p>UAI : {currentEtab.uai}</p>}
            {currentEtab?.adresse && <p>{currentEtab.adresse}</p>}
            {(currentEtab?.codePostal || currentEtab?.ville) && <p>{currentEtab.codePostal} {currentEtab.ville}</p>}
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: '9pt', lineHeight: '1.5' }}>
          <p style={{ fontWeight: 700, fontSize: '10pt' }}>RÉPUBLIQUE FRANÇAISE</p>
          <p style={{ fontStyle: 'italic' }}>Liberté – Égalité – Fraternité</p>
          <div style={{ marginTop: '8px' }}>
            <p style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '8pt' }}>Agence comptable</p>
            <p>{currentEtab?.nom || ''}</p>
          </div>
        </div>
      </div>

      {/* ═══ TITRE DU DOCUMENT ═══ */}
      <div style={{ textAlign: 'center', margin: '24px 0', padding: '16px 0', borderTop: '1px solid #ccc', borderBottom: '1px solid #ccc' }}>
        <h1 style={{ fontSize: '16pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0, fontFamily: "'Space Grotesk', serif" }}>
          Procès-Verbal d'Audit
        </h1>
        <p style={{ fontSize: '10pt', marginTop: '4px', fontWeight: 600 }}>
          {pv.type} — Phase {pv.phase}
        </p>
        <p style={{ fontSize: '9pt', marginTop: '2px' }}>
          Exercice {params.exercice || new Date().getFullYear()}
        </p>
      </div>

      {/* ═══ CARTOUCHE D'IDENTIFICATION ═══ */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '9pt' }}>
        <tbody>
          <tr>
            <td style={{ border: '1px solid #999', padding: '6px 10px', fontWeight: 700, width: '30%', background: '#f5f5f5' }}>Date du contrôle</td>
            <td style={{ border: '1px solid #999', padding: '6px 10px' }}>{fmtDate(pv.date)}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #999', padding: '6px 10px', fontWeight: 700, background: '#f5f5f5' }}>Lieu</td>
            <td style={{ border: '1px solid #999', padding: '6px 10px' }}>{pv.lieu}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #999', padding: '6px 10px', fontWeight: 700, background: '#f5f5f5' }}>Objet</td>
            <td style={{ border: '1px solid #999', padding: '6px 10px' }}>{pv.objet}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #999', padding: '6px 10px', fontWeight: 700, background: '#f5f5f5' }}>Délai de réponse</td>
            <td style={{ border: '1px solid #999', padding: '6px 10px' }}>{pv.delai}</td>
          </tr>
          {modulesAudites.length > 0 && (
            <tr>
              <td style={{ border: '1px solid #999', padding: '6px 10px', fontWeight: 700, background: '#f5f5f5' }}>Modules audités</td>
              <td style={{ border: '1px solid #999', padding: '6px 10px' }}>
                {modulesAudites.map((id: string) => moduleLabels[id] || id).join(' • ')}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ═══ SYNTHÈSE ═══ */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        <div style={{ flex: 1, textAlign: 'center', padding: '10px', border: '1px solid #999', borderRadius: '4px' }}>
          <p style={{ fontSize: '18pt', fontWeight: 700 }}>{(pv.verifications || []).length}</p>
          <p style={{ fontSize: '8pt', textTransform: 'uppercase' }}>Points vérifiés</p>
        </div>
        <div style={{ flex: 1, textAlign: 'center', padding: '10px', border: '1px solid #060', borderRadius: '4px', background: '#f0fff4' }}>
          <p style={{ fontSize: '18pt', fontWeight: 700, color: '#060' }}>{conformes.length}</p>
          <p style={{ fontSize: '8pt', textTransform: 'uppercase' }}>Conformes</p>
        </div>
        <div style={{ flex: 1, textAlign: 'center', padding: '10px', border: '1px solid #c00', borderRadius: '4px', background: '#fff5f5' }}>
          <p style={{ fontSize: '18pt', fontWeight: 700, color: '#c00' }}>{anomalies.length}</p>
          <p style={{ fontSize: '8pt', textTransform: 'uppercase' }}>Anomalies</p>
        </div>
        <div style={{ flex: 1, textAlign: 'center', padding: '10px', border: '1px solid #999', borderRadius: '4px' }}>
          <p style={{ fontSize: '18pt', fontWeight: 700, color: '#666' }}>{nonVerifies.length}</p>
          <p style={{ fontSize: '8pt', textTransform: 'uppercase' }}>Non vérifiés</p>
        </div>
      </div>

      {/* ═══ TABLEAU DES POINTS DE VÉRIFICATION ═══ */}
      {(pv.verifications || []).length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '11pt', fontWeight: 700, textTransform: 'uppercase', borderBottom: '2px solid #1a365d', paddingBottom: '4px', marginBottom: '10px', fontFamily: "'Space Grotesk', serif" }}>
            I. Points de vérification
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9pt' }}>
            <thead>
              <tr style={{ background: '#1a365d', color: '#fff' }}>
                <th style={{ border: '1px solid #999', padding: '6px 8px', textAlign: 'left', width: '5%' }}>N°</th>
                <th style={{ border: '1px solid #999', padding: '6px 8px', textAlign: 'left', width: '30%' }}>Point de contrôle</th>
                <th style={{ border: '1px solid #999', padding: '6px 8px', textAlign: 'left', width: '15%' }}>Réf. réglementaire</th>
                <th style={{ border: '1px solid #999', padding: '6px 8px', textAlign: 'center', width: '10%' }}>Criticité</th>
                <th style={{ border: '1px solid #999', padding: '6px 8px', textAlign: 'center', width: '10%' }}>Résultat</th>
                <th style={{ border: '1px solid #999', padding: '6px 8px', textAlign: 'left', width: '30%' }}>Observations</th>
              </tr>
            </thead>
            <tbody>
              {(pv.verifications || []).map((v: PVVerification, i: number) => (
                <tr key={i} style={{ background: v.status === 'anomalie' ? '#fff5f5' : v.status === 'conforme' ? '#f0fff4' : '#fff' }}>
                  <td style={{ border: '1px solid #ccc', padding: '5px 8px', textAlign: 'center' }}>{i + 1}</td>
                  <td style={{ border: '1px solid #ccc', padding: '5px 8px' }}>{v.label}</td>
                  <td style={{ border: '1px solid #ccc', padding: '5px 8px', fontSize: '8pt' }}>{v.reference || '—'}</td>
                  <td style={{ border: '1px solid #ccc', padding: '5px 8px', textAlign: 'center', fontWeight: 700, fontSize: '8pt', color: v.criticite === 'MAJEURE' ? '#c00' : '#666' }}>
                    {v.criticite}
                  </td>
                  <td style={{ border: '1px solid #ccc', padding: '5px 8px', textAlign: 'center', fontWeight: 700, color: v.status === 'anomalie' ? '#c00' : v.status === 'conforme' ? '#060' : '#666' }}>
                    {v.status === 'anomalie' ? '⚠ ANOMALIE' : v.status === 'conforme' ? '✓ Conforme' : '— N/V'}
                  </td>
                  <td style={{ border: '1px solid #ccc', padding: '5px 8px', fontSize: '8pt' }}>{v.observations || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ═══ CONSTATS COMPLÉMENTAIRES ═══ */}
      {pv.constatsLibres && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '11pt', fontWeight: 700, textTransform: 'uppercase', borderBottom: '2px solid #1a365d', paddingBottom: '4px', marginBottom: '10px', fontFamily: "'Space Grotesk', serif" }}>
            II. Constats complémentaires
          </h2>
          <p style={{ fontSize: '9pt', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{pv.constatsLibres}</p>
        </div>
      )}

      {/* ═══ RECOMMANDATIONS ═══ */}
      {pv.recommandations && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '11pt', fontWeight: 700, textTransform: 'uppercase', borderBottom: '2px solid #1a365d', paddingBottom: '4px', marginBottom: '10px', fontFamily: "'Space Grotesk', serif" }}>
            {pv.constatsLibres ? 'III' : 'II'}. Recommandations
          </h2>
          <div style={{ fontSize: '9pt', lineHeight: '1.6', whiteSpace: 'pre-wrap', padding: '10px', border: '1px solid #e2e8f0', borderLeft: '4px solid #1a365d', background: '#f8fafc' }}>
            {pv.recommandations}
          </div>
        </div>
      )}

      {/* ═══ CONCLUSIONS ═══ */}
      {pv.conclusions && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '11pt', fontWeight: 700, textTransform: 'uppercase', borderBottom: '2px solid #1a365d', paddingBottom: '4px', marginBottom: '10px', fontFamily: "'Space Grotesk', serif" }}>
            {pv.constatsLibres ? 'IV' : 'III'}. Conclusions
          </h2>
          <p style={{ fontSize: '9pt', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{pv.conclusions}</p>
        </div>
      )}

      {/* ═══ PHASE CONTRADICTOIRE ═══ */}
      {(pv.reponseOrdonnateur || pv.phase === 'contradictoire' || pv.phase === 'définitif') && (
        <div style={{ marginBottom: '20px', padding: '10px', border: '2px dashed #1a365d', borderRadius: '4px' }}>
          <h2 style={{ fontSize: '11pt', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', fontFamily: "'Space Grotesk', serif" }}>
            Phase contradictoire — Droit de réponse
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9pt' }}>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #999', padding: '5px 8px', fontWeight: 700, width: '30%', background: '#f5f5f5' }}>Phase actuelle</td>
                <td style={{ border: '1px solid #999', padding: '5px 8px', textTransform: 'capitalize' }}>{pv.phase}</td>
              </tr>
              {pv.dateReponse && (
                <tr>
                  <td style={{ border: '1px solid #999', padding: '5px 8px', fontWeight: 700, background: '#f5f5f5' }}>Date de réponse</td>
                  <td style={{ border: '1px solid #999', padding: '5px 8px' }}>{fmtDate(pv.dateReponse)}</td>
                </tr>
              )}
              {pv.reponseOrdonnateur && (
                <tr>
                  <td style={{ border: '1px solid #999', padding: '5px 8px', fontWeight: 700, background: '#f5f5f5', verticalAlign: 'top' }}>Réponse de l'ordonnateur</td>
                  <td style={{ border: '1px solid #999', padding: '5px 8px', whiteSpace: 'pre-wrap' }}>{pv.reponseOrdonnateur}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ═══ MENTION LÉGALE ═══ */}
      <div style={{ fontSize: '8pt', textAlign: 'center', margin: '20px 0 12px', color: '#666', fontStyle: 'italic' }}>
        Le présent procès-verbal est établi conformément aux dispositions du décret n° 2012-1246 du 7 novembre 2012
        relatif à la gestion budgétaire et comptable publique et de l'instruction codificatrice M9.6.
      </div>

      {/* ═══ SIGNATURES — toujours sur la même page ═══ */}
      <div style={{ borderTop: '2px solid #1a365d', paddingTop: '16px', marginTop: '16px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
        <p style={{ fontSize: '9pt', marginBottom: '8px' }}>
          Fait à {currentEtab?.ville || '_______________'}, le {fmtDate(pv.date)}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          <div style={{ textAlign: 'center', width: '30%' }}>
            <p style={{ fontSize: '9pt', fontWeight: 700, borderBottom: '1px solid #000', paddingBottom: '4px', marginBottom: '100px' }}>L'Agent comptable</p>
            <p style={{ fontSize: '9pt' }}>{pv.signataire1 || '____________________'}</p>
          </div>
          <div style={{ textAlign: 'center', width: '30%' }}>
            <p style={{ fontSize: '9pt', fontWeight: 700, borderBottom: '1px solid #000', paddingBottom: '4px', marginBottom: '100px' }}>Le Secrétaire général</p>
            <p style={{ fontSize: '9pt' }}>{(pv as any).signataire3 || '____________________'}</p>
          </div>
          <div style={{ textAlign: 'center', width: '30%' }}>
            <p style={{ fontSize: '9pt', fontWeight: 700, borderBottom: '1px solid #000', paddingBottom: '4px', marginBottom: '100px' }}>L'Ordonnateur</p>
            <p style={{ fontSize: '9pt' }}>{pv.signataire2 || '____________________'}</p>
          </div>
        </div>
      </div>

      {/* ═══ PIED DE PAGE ═══ */}
      <div style={{ borderTop: '1px solid #ccc', marginTop: '24px', paddingTop: '8px', fontSize: '7pt', color: '#999', display: 'flex', justifyContent: 'space-between' }}>
        <span>CIC Expert Pro — Audit comptable EPLE</span>
        <span>Document généré le {new Date().toLocaleDateString('fr-FR')}</span>
      </div>
    </div>
  );
}
