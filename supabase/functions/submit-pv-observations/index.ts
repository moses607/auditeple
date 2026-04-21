// Edge function : enregistre les observations de l'ordonnateur via le token
// magique, marque le token comme utilisé et le PV comme « observe ».
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { token, observations, observation_globale } = await req.json();
    if (!token) {
      return new Response(JSON.stringify({ error: 'Token requis' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: tok } = await supabase.from('pv_access_tokens').select('*').eq('token', token).maybeSingle();
    if (!tok) return new Response(JSON.stringify({ error: 'Token invalide' }), {
      status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    if (new Date(tok.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: 'Lien expiré' }), {
        status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';

    // Met à jour le PV
    const { error: pvErr } = await supabase.from('pv_contradictoires').update({
      observations_ordonnateur: observations ?? {},
      observation_globale: observation_globale ?? '',
      status: 'observe',
      signature_ordonnateur_at: new Date().toISOString(),
      signature_ordonnateur_ip: ip,
    }).eq('id', tok.pv_id);
    if (pvErr) throw pvErr;

    // Marque le token comme utilisé (mais on le garde pour relecture)
    await supabase.from('pv_access_tokens').update({ used_at: new Date().toISOString() }).eq('id', tok.id);

    // Met à jour le statut de l'audit
    const { data: pv } = await supabase.from('pv_contradictoires').select('audit_id').eq('id', tok.pv_id).single();
    if (pv) {
      await supabase.from('audits').update({ status: 'contradictoire_clos' }).eq('id', pv.audit_id);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('submit-pv-observations error', e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
