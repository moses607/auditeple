/**
 * WhyTooltip — affiche la base réglementaire d'un contrôle.
 * Usage : <WhyTooltip refKey="gbcp-38" /> ou <WhyTooltip article="Art. 38 GBCP" titre="..." resume="..." />
 */
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getRegle, getSourceBadgeClass, type RegleArticle } from '@/lib/regulatory-engine';
import { cn } from '@/lib/utils';

interface WhyTooltipProps {
  refKey?: string;
  article?: string;
  titre?: string;
  resume?: string;
  className?: string;
}

export function WhyTooltip({ refKey, article, titre, resume, className }: WhyTooltipProps) {
  const fromBase: RegleArticle | undefined = refKey ? getRegle(refKey) : undefined;
  const r = fromBase || (article && titre ? {
    id: 'custom', source: 'M9-6' as const, reference: article, titre,
    resume: resume || '', motsCles: [],
  } : undefined);
  if (!r) return null;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              'inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors',
              className
            )}
            onClick={(e) => e.preventDefault()}
            aria-label={`Pourquoi ce contrôle : ${r.titre}`}
          >
            <Info className="h-3 w-3" />
            <span className="hidden sm:inline">Pourquoi ?</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-sm p-3">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Badge variant="outline" className={cn('text-[9px] py-0 px-1.5 h-4', getSourceBadgeClass(r.source))}>
                {r.source}
              </Badge>
              <p className="text-[10px] font-mono text-muted-foreground">{r.reference}</p>
            </div>
            <p className="text-xs font-bold leading-tight">{r.titre}</p>
            <p className="text-[11px] text-foreground/80 leading-relaxed">{r.resume}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
