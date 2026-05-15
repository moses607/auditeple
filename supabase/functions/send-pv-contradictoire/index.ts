// Edge function : génère un token sécurisé, l'enregistre, et envoie l'email
// à l'ordonnateur avec le lien magique vers /pv-contradictoire?t=...
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function generateToken(len = 48): string {
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { pv_id, email_destinataire, delai_jours, audit_libelle, etablissement_nom, ordonnateur_nom, ac_nom, constats } = await req.json();

    if (!pv_id || !email_destinataire) {
      return new Response(JSON.stringify({ error: 'pv_id et email_destinataire requis' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Génère token magique (expire après delai_jours + 7j de marge)
    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (delai_jours ?? 15) + 7);

    const { error: tokErr } = await supabase.from('pv_access_tokens').insert({
      pv_id,
      token,
      email_destinataire,
      expires_at: expiresAt.toISOString(),
    });
    if (tokErr) throw tokErr;

    // Construit le lien magique vers le frontend public
    const origin = req.headers.get('origin') || req.headers.get('referer')?.replace(/\/[^\/]*$/, '') || 'https://auditac.lovable.app';
    const baseUrl = origin.replace(/\/$/, '');
    const link = `${baseUrl}/pv-contradictoire?t=${token}`;

    // Envoi email via Lovable AI Gateway (utilise le LOVABLE_API_KEY pour
    // un envoi simple via service interne) — sinon log uniquement
    const lovableKey = Deno.env.get('LOVABLE_API_KEY');
    let emailSent = false;
    let emailError: string | null = null;

    if (lovableKey) {
      try {
        // Tentative via la passerelle email Lovable si disponible
        const emailRes = await fetch('https://ai.gateway.lovable.dev/v1/email/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: email_destinataire,
            subject: `[AUDIT CICF] PV contradictoire — ${etablissement_nom} — ${new Date().toLocaleDateString('fr-FR')}`,
            html: buildEmailHtml({ link, audit_libelle, etablissement_nom, ordonnateur_nom, ac_nom, delai_jours, constats }),
          }),
        });
        emailSent = emailRes.ok;
        if (!emailRes.ok) emailError = await emailRes.text();
      } catch (e) {
        emailError = String(e);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      token,
      link,
      email_sent: emailSent,
      email_error: emailError,
      message: emailSent
        ? `Email envoyé à ${email_destinataire}`
        : `Token généré. Lien à transmettre manuellement : ${link}`,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('send-pv-contradictoire error', e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

type Constat = { type: string; libelle: string; domaine: string; constat?: string; action?: string };

function escapeHtml(s: string = ''): string {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function colorForType(t: string): string {
  const x = t.toLowerCase();
  if (x.includes('majeure') || x.includes('critique')) return '#b91c1c';
  if (x.includes('mineure') || x.includes('moyenne')) return '#b45309';
  if (x.includes('faible')) return '#374151';
  return '#1e40af';
}

function buildConstatsHtml(constats: Constat[] = []): string {
  if (!constats || constats.length === 0) {
    return `<p style="font-size:13px;color:#6b7280;font-style:italic">Aucun constat consigné — l'audit n'a pas révélé d'anomalie ni de risque cartographié à signaler.</p>`;
  }
  const rows = constats.map((c, i) => `
    <tr style="border-top:1px solid #e5e7eb">
      <td style="padding:8px 6px;vertical-align:top;font-size:12px;color:#6b7280;width:24px">${i + 1}</td>
      <td style="padding:8px 6px;vertical-align:top;font-size:12px;white-space:nowrap">
        <span style="display:inline-block;padding:2px 8px;border-radius:4px;background:${colorForType(c.type)}1A;color:${colorForType(c.type)};font-weight:600">${escapeHtml(c.type)}</span>
      </td>
      <td style="padding:8px 6px;vertical-align:top;font-size:13px;color:#1f2937">
        <div style="font-weight:600">${escapeHtml(c.libelle)}</div>
        <div style="font-size:11px;color:#6b7280;margin-top:2px">${escapeHtml(c.domaine)}</div>
        ${c.constat ? `<div style="margin-top:4px;color:#374151"><em>Constat :</em> ${escapeHtml(c.constat)}</div>` : ''}
        ${c.action ? `<div style="margin-top:2px;color:#374151"><em>Action :</em> ${escapeHtml(c.action)}</div>` : ''}
      </td>
    </tr>`).join('');
  return `
    <h3 style="margin:24px 0 8px;font-size:14px;color:#111827">Synthèse des constats (${constats.length})</h3>
    <p style="font-size:12px;color:#6b7280;margin:0 0 8px">Reprise intégrale des risques cartographiés et anomalies relevées au PV.</p>
    <table style="width:100%;border-collapse:collapse;background:#fafafa;border:1px solid #e5e7eb;border-radius:6px">
      ${rows}
    </table>`;
}

function buildEmailHtml(p: { link: string; audit_libelle: string; etablissement_nom: string; ordonnateur_nom: string; ac_nom: string; delai_jours: number; constats?: Constat[] }) {
  return `<!doctype html><html><body style="font-family:Arial,sans-serif;background:#f6f7f9;padding:24px;color:#1f2937">
  <div style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:8px;padding:24px;border:1px solid #e5e7eb">
    <h2 style="margin:0 0 12px;color:#1e40af">Procédure contradictoire — PV d'audit</h2>
    <p>Bonjour ${escapeHtml(p.ordonnateur_nom) || ''},</p>
    <p>Un audit interne comptable vient d'être clôturé pour <strong>${escapeHtml(p.etablissement_nom)}</strong> :</p>
    <p style="background:#f3f4f6;padding:12px;border-radius:4px"><strong>${escapeHtml(p.audit_libelle)}</strong></p>
    <p>Conformément à la procédure contradictoire (M9-6), vous disposez d'un délai de
    <strong>${p.delai_jours} jours</strong> pour consulter ce PV et formuler vos observations.</p>
    ${buildConstatsHtml(p.constats)}
    <p style="text-align:center;margin:24px 0">
      <a href="${p.link}" style="background:#1e40af;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:600">
        Accéder au PV et saisir mes observations
      </a>
    </p>
    <p style="font-size:12px;color:#6b7280">Ce lien est personnel et sécurisé. Ne le transmettez pas.</p>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">
    <p style="font-size:12px;color:#6b7280">
      Émetteur : ${escapeHtml(p.ac_nom) || 'Agent comptable'}<br>
      Référence : Décret GBCP 2012-1246 · Instruction M9-6
    </p>
  </div>
  </body></html>`;
}
