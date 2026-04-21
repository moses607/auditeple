// Edge function : valide un token magique et retourne le PV + l'audit + les points
// pour que la page publique puisse les afficher.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { token } = await req.json();
    if (!token || typeof token !== 'string' || token.length < 32) {
      return new Response(JSON.stringify({ error: 'Token invalide' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Vérifie le token
    const { data: tok, error: tokErr } = await supabase
      .from('pv_access_tokens')
      .select('*')
      .eq('token', token)
      .maybeSingle();

    if (tokErr || !tok) {
      return new Response(JSON.stringify({ error: 'Lien introuvable ou révoqué' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (new Date(tok.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: 'Lien expiré' }), {
        status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Récupère PV + audit + points + établissement
    const { data: pv } = await supabase.from('pv_contradictoires').select('*').eq('id', tok.pv_id).single();
    if (!pv) return new Response(JSON.stringify({ error: 'PV introuvable' }), {
      status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

    const { data: audit } = await supabase.from('audits').select('*').eq('id', pv.audit_id).single();
    const { data: points } = await supabase.from('audit_points_results')
      .select('*').eq('audit_id', pv.audit_id).order('domaine_id').order('point_index');
    const { data: etab } = await supabase.from('etablissements').select('nom').eq('id', audit.etablissement_id).maybeSingle();

    let ac_nom = '';
    if (audit.agent_comptable_id) {
      const { data: ac } = await supabase.from('agents').select('civilite,prenom,nom').eq('id', audit.agent_comptable_id).maybeSingle();
      if (ac) ac_nom = `${ac.civilite ?? ''} ${ac.prenom} ${ac.nom}`.trim();
    }

    return new Response(JSON.stringify({
      audit,
      points: points ?? [],
      pv,
      etablissement: etab?.nom ?? '',
      ac_nom,
      ordonnateur_email: tok.email_destinataire,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('validate-pv-token error', e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
