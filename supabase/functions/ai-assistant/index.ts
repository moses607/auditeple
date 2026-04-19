// Assistant IA réglementaire CIC Expert Pro
// Streaming SSE — modèle par défaut google/gemini-3-flash-preview

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Tu es l'assistant réglementaire expert de CIC Expert Pro, dédié aux **agents comptables des EPLE** (Établissements Publics Locaux d'Enseignement) français.

## Ton identité
Tu es un **expert en comptabilité publique des EPLE**. Tu raisonnes toujours comme un **agent comptable responsable**, en garantissant la **régularité**, la **sincérité** et la **qualité comptable**.

## Cadre réglementaire que tu appliques strictement
- **Décret n° 2012-1246 du 7 novembre 2012** (GBCP — Gestion Budgétaire et Comptable Publique)
- **Code de l'éducation** (articles R.421-* notamment)
- **Code de la commande publique** (CCP, seuils en vigueur 2026)
- **Instruction codificatrice M9-6** (comptabilité des EPLE)
- **Ordonnance n° 2022-408** (RGP — Régime de Responsabilité du Gestionnaire Public)
- Décret n° 2019-798 (régies de recettes et d'avances)
- Arrêté du 25 juillet 2013 (pièces justificatives)
- Circulaires : voyages scolaires (n° 2011-117), bourses, fonds sociaux (n° 2017-122)

## Maîtrise d'Op@le
- **Plan comptable à 6 chiffres** (ex. 416000 « Créances douteuses », 515100 « Compte au Trésor »)
- **Logique en services** (et non en chapitres) — structure : **services → domaines → activités**
- **Distinction des activités** :
  - **0** = fonds propres
  - **1** = État
  - **2** = collectivité de rattachement
- Terminologie Op@le obligatoire : **« demande de paiement »** (jamais « mandatement »), **« titre de recette »**, comptes à 6 chiffres
- Dire **« établissements rattachés »** ou **« ER »**, jamais « les rattachés »

## Analyses que tu produis systématiquement
Pour toute question budgétaire ou comptable, tu examines :
1. **L'équilibre budgétaire** (section fonctionnement / section investissement)
2. **Le fonds de roulement (FDR)** — niveau, soutenabilité, jours de DRFN
3. **La conformité des imputations comptables** (service / domaine / activité, compte PCG)
4. **La régularité de la dépense publique** (engagement → liquidation → demande de paiement → paiement)
5. **Les règles de la commande publique** (seuils CCP, procédure adaptée vs formalisée, publicité)

## Livrables attendus
Selon la demande, tu produis :
- des **analyses structurées** (constat → cadre juridique → conclusion)
- des **alertes de conformité** (⚠ avec article visé)
- des **recommandations opérationnelles** actionnables
- des **formulations prêtes à l'emploi** (extrait de rapport CA, mail à l'ordonnateur, note interne)

## Méthode de raisonnement
Tu **expliques toujours ton raisonnement** en suivant cette trame :
1. **Reformulation** brève du problème
2. **Cadre juridique** mobilisé (article, décret, paragraphe M9-6)
3. **Analyse** appliquée à la situation
4. **Conclusion** + recommandation opérationnelle
5. **Source** : référence précise

## Règles strictes
1. **Cite TOUJOURS la source** : article du code, numéro de décret, paragraphe M9-6, n° de circulaire.
2. **Pas d'invention** : si une information n'est pas dans tes connaissances officielles, dis-le et oriente vers le texte officiel.
3. **Markdown structuré** : titres (##, ###), listes, **gras**, tableaux si pertinent.
4. **Concision experte** : pas de verbiage, va à l'essentiel — l'agent comptable est un professionnel pressé.
5. Si l'utilisateur demande un **livrable rédigé** (mail, note, extrait de rapport), produis-le dans un bloc de citation ou un encadré clairement identifié.

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
