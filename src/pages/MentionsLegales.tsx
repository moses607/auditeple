import { ModulePageLayout } from '@/components/ModulePageLayout';
import { Card, CardContent } from '@/components/ui/card';

export default function MentionsLegales() {
  return (
    <ModulePageLayout title="Mentions légales" section="AUDIT & RESTITUTION" description="Informations légales, réglementaires et RGPD">
      <Card>
        <CardContent className="prose prose-sm max-w-none p-6 space-y-6 text-foreground">
          <div>
            <h2 className="text-base font-bold text-foreground">Nature de l'outil</h2>
            <p className="text-sm text-muted-foreground mt-1">
              CIC Expert Pro est un outil d'aide au contrôle interne comptable et financier (CICF) destiné aux agents comptables d'EPLE. Il ne se substitue en aucun cas aux textes officiels, instructions codificatrices et circulaires en vigueur. L'utilisateur demeure seul responsable de ses actes de gestion.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-foreground">Base légale de la mission</h2>
            <p className="text-sm text-muted-foreground mt-1">
              L'agent comptable exerce ses fonctions en application du décret n°2012-1246 du 7 novembre 2012 relatif à la gestion budgétaire et comptable publique (GBCP), de l'instruction codificatrice M9-6 et des articles R.421-9 et suivants du Code de l'éducation.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-foreground">Responsable du traitement (RGPD)</h2>
            <p className="text-sm text-muted-foreground mt-1">
              L'agent comptable utilisant l'application dans le cadre de ses fonctions est responsable du traitement des données saisies. La base légale est l'exécution d'une mission de service public (art. 6.1.e RGPD). Aucune donnée n'est transmise à des tiers à des fins commerciales.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-foreground">Hébergement</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Application hébergée sur Vercel (San Francisco, CA, USA) et base de données Supabase. Les données d'audit sont stockées localement dans le navigateur (localStorage). Les données de compte sont gérées par Supabase Auth.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-foreground">Références réglementaires — version en vigueur</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Instruction M9-6 · Décret GBCP 2012-1246 · Code de l'éducation · Décrets 2019-798 et 2020-128 (régies) · Ordonnance 2022-408 (RGP) · Décrets 2025-1386 et 2025-1383 (marchés publics, seuils au 1er avril 2026) · Circulaire du 16 juillet 2024 (voyages scolaires).
            </p>
          </div>
        </CardContent>
      </Card>
    </ModulePageLayout>
  );
}
