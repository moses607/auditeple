/**
 * DoctrineEPLE — bloc compact à poser en tête de chaque module métier.
 *
 * Affiche :
 *  1. Un encadré "Doctrine appliquée" (AnalyseStructuree, replié par défaut)
 *  2. Les 3 références juridiques principales du thème (badges RegRefBadge en popover)
 *  3. Les livrables disponibles pour le thème (LivrableCopiable, repliés)
 *
 * Usage :
 *   <DoctrineEPLE theme="regies" titre="Régies de recettes et d'avances" />
 *
 * Tout est paramétré dans `src/lib/doctrine-eple.ts` + `src/lib/doctrine-livrables.ts`.
 */
import { Card, CardContent } from '@/components/ui/card';
import { RegRefBadge } from '@/components/RegRefBadge';
import { AnalyseStructuree } from '@/components/AnalyseStructuree';
import { LivrableCopiable } from '@/components/LivrableCopiable';
import { Badge } from '@/components/ui/badge';
import { GraduationCap } from 'lucide-react';
import { REFS_PAR_THEME, type ThemeMetier } from '@/lib/doctrine-eple';
import { getDoctrineForTheme } from '@/lib/doctrine-livrables';
import { useAuditParams } from '@/hooks/useAuditStore';
import { getSelectedEtablissement } from '@/lib/types';

interface Props {
  theme: ThemeMetier;
  titre: string;
  /** Sous-titre / description courte. */
  resume?: string;
  /** Cache la section "livrables" si non pertinente. */
  hideLivrables?: boolean;
}

export function DoctrineEPLE({ theme, titre, resume, hideLivrables = false }: Props) {
  const refs = REFS_PAR_THEME[theme] || [];
  const { params } = useAuditParams();
  const etab = getSelectedEtablissement(params);
  const etabLabel = etab?.nom;

  const { analyse, livrables } = getDoctrineForTheme(theme, etabLabel);

  return (
    <div className="space-y-3 print:hidden">
      {/* Bandeau de références juridiques */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardContent className="p-3 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 shrink-0">
            <GraduationCap className="h-4 w-4 text-primary" />
            <Badge variant="outline" className="text-[9px] py-0 px-1.5 h-4 uppercase tracking-wider">
              Doctrine
            </Badge>
            <span className="text-xs font-medium text-foreground">{titre}</span>
          </div>
          {resume && (
            <span className="text-[11px] text-muted-foreground italic">{resume}</span>
          )}
          <div className="flex items-center gap-1.5 flex-wrap ml-auto">
            {refs.map((r, i) => (
              <RegRefBadge
                key={i}
                code={r.ref}
                titre={r.ref}
                resume={r.citation}
                variant="inline"
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analyse 5 étapes (repliée) */}
      {analyse && <AnalyseStructuree titre={`Doctrine appliquée — ${titre}`} analyse={analyse} />}

      {/* Livrables prêts à l'emploi */}
      {!hideLivrables && livrables.length > 0 && (
        <div className="space-y-2">
          {livrables.map((l, i) => (
            <LivrableCopiable
              key={i}
              type={l.type}
              titre={l.titre}
              contenu={l.contenu}
              promptIA={l.promptIA}
            />
          ))}
        </div>
      )}
    </div>
  );
}
