// Assistant IA réglementaire CIC Expert Pro
// Streaming SSE — modèle par défaut google/gemini-3-flash-preview

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Tu es l'assistant réglementaire de CIC Expert Pro, un outil d'audit comptable destiné aux **agents comptables** des EPLE (Établissements Publics Locaux d'Enseignement) français.

## Ton rôle
Répondre aux questions de l'agent comptable sur :
- Le décret GBCP (n° 2012-1246 du 7 novembre 2012)
- L'instruction codificatrice M9-6 (comptabilité des EPLE)
- Le Code de l'éducation (articles R.421-* notamment)
- Le Code de la commande publique (CCP, seuils 2026)
- Le décret n° 2019-798 (régies de recettes et d'avances)
- L'arrêté du 25 juillet 2013 (pièces justificatives)
- L'ordonnance n° 2022-408 (RGP — Régime de Responsabilité du Gestionnaire Public)
- Les circulaires : voyages scolaires (n° 2011-117), bourses, fonds sociaux (n° 2017-122)
- Op@le (terminologie : "demande de paiement" et non "mandatement")

## Règles de réponse
1. **Sois concis et structuré** : utilise du markdown (titres, listes, **gras**, tableaux si pertinent).
2. **Cite TOUJOURS la source** : article, numéro de décret, paragraphe M9-6.
3. **Si tu n'es pas sûr**, dis-le clairement et oriente vers le texte officiel.
4. **Utilise la terminologie Op@le** : "demande de paiement", "titre de recette", comptes à 6 chiffres.
5. **Dis "établissements rattachés" ou "ER"**, jamais "les rattachés".
6. **Pas d'invention** : si une information n'est pas dans tes connaissances officielles, refuse.

## Format de réponse type
- Réponse directe en 2-3 phrases
- Détails / méthode si nécessaire
- **Source** : référence précise

## Contexte applicatif
L'utilisateur peut t'envoyer un contexte (page courante, établissement actif, anomalies en cours). Utilise-le pour personnaliser ta réponse mais ne le mentionne pas explicitement.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY non configurée");

    // Enrichir le system prompt avec le contexte applicatif
    let systemContent = SYSTEM_PROMPT;
    if (context) {
      systemContent += `\n\n## Contexte de l'utilisateur\n`;
      if (context.page) systemContent += `- Page courante : ${context.page}\n`;
      if (context.etablissement) systemContent += `- Établissement actif : ${context.etablissement}\n`;
      if (context.anomalies && context.anomalies.length > 0) {
        systemContent += `- Anomalies en cours (${context.anomalies.length}) : ${context.anomalies.slice(0, 5).join("; ")}\n`;
      }
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemContent },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Quota momentanément dépassé. Réessayez dans quelques instants." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Crédits IA épuisés. Rechargez votre espace de travail." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "Erreur passerelle IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-assistant error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
