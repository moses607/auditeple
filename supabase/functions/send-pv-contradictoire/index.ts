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
    const { pv_id, email_destinataire, delai_jours, audit_libelle, etablissement_nom, ordonnateur_nom, ac_nom } = await req.json();

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
            html: buildEmailHtml({ link, audit_libelle, etablissement_nom, ordonnateur_nom, ac_nom, delai_jours }),
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

function buildEmailHtml(p: { link: string; audit_libelle: string; etablissement_nom: string; ordonnateur_nom: string; ac_nom: string; delai_jours: number }) {
  return `<!doctype html><html><body style="font-family:Arial,sans-serif;background:#f6f7f9;padding:24px;color:#1f2937">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;padding:24px;border:1px solid #e5e7eb">
    <h2 style="margin:0 0 12px;color:#1e40af">Procédure contradictoire — PV d'audit</h2>
    <p>Bonjour ${p.ordonnateur_nom || ''},</p>
    <p>Un audit interne comptable vient d'être clôturé pour <strong>${p.etablissement_nom}</strong> :</p>
    <p style="background:#f3f4f6;padding:12px;border-radius:4px"><strong>${p.audit_libelle}</strong></p>
    <p>Conformément à la procédure contradictoire (M9-6), vous disposez d'un délai de
    <strong>${p.delai_jours} jours</strong> pour consulter ce PV et formuler vos observations.</p>
    <p style="text-align:center;margin:24px 0">
      <a href="${p.link}" style="background:#1e40af;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:600">
        Accéder au PV et saisir mes observations
      </a>
    </p>
    <p style="font-size:12px;color:#6b7280">Ce lien est personnel et sécurisé. Ne le transmettez pas.</p>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">
    <p style="font-size:12px;color:#6b7280">
      Émetteur : ${p.ac_nom || 'Agent comptable'}<br>
      Référence : Décret GBCP 2012-1246 · Instruction M9-6
    </p>
  </div>
  </body></html>`;
}
