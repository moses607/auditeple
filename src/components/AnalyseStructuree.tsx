/**
 * AnalyseStructuree — encadré "analyse 5 étapes" (doctrine agent comptable EPLE).
 *
 * 5 étapes : Reformulation → Cadre juridique → Analyse → Conclusion & recommandation → Source.
 *
 * Repliable. Posable en tête de n'importe quel module pour formaliser
 * la doctrine appliquée par l'agent comptable.
 */
import { useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChevronDown,
  Lightbulb,
  Scale,
  Search,
  CheckCircle2,
  BookOpen,
  GraduationCap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Analyse5Etapes } from '@/lib/doctrine-eple';

interface Props {
  /** Titre court (ex. "Doctrine appliquée — Régies"). */
  titre: string;
  /** Les 5 étapes structurées. */
  analyse: Analyse5Etapes;
  /** Affichée dépliée si true. */
  defaultOpen?: boolean;
  className?: string;
}

const ETAPES = [
  { key: 'reformulation', label: 'Reformulation', icon: Lightbulb, color: 'text-amber-600 dark:text-amber-400' },
  { key: 'cadre', label: 'Cadre juridique', icon: Scale, color: 'text-primary' },
  { key: 'analyse', label: 'Analyse', icon: Search, color: 'text-accent' },
  { key: 'conclusion', label: 'Conclusion & recommandation', icon: CheckCircle2, color: 'text-success' },
  { key: 'source', label: 'Source', icon: BookOpen, color: 'text-muted-foreground' },
] as const;

export function AnalyseStructuree({ titre, analyse, defaultOpen = false, className }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card
      className={cn(
        'border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent print:hidden',
        className,
      )}
    >
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button className="w-full text-left p-4 hover:bg-muted/30 transition-colors flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <GraduationCap className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-[9px] py-0 px-1.5 h-4 uppercase tracking-wider">
                  Doctrine
                </Badge>
                <span className="text-sm font-semibold text-foreground">{titre}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Analyse en 5 étapes — agent comptable EPLE
              </p>
            </div>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-muted-foreground transition-transform shrink-0',
                open && 'rotate-180',
              )}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-3">
            {ETAPES.map(({ key, label, icon: Icon, color }, idx) => {
              const text = analyse[key as keyof Analyse5Etapes];
              if (!text) return null;
              return (
                <div key={key} className="flex gap-3">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="h-7 w-7 rounded-full bg-card border-2 border-border flex items-center justify-center">
                      <Icon className={cn('h-3.5 w-3.5', color)} />
                    </div>
                    {idx < ETAPES.length - 1 && (
                      <div className="w-px flex-1 bg-border mt-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {idx + 1}. {label}
                    </p>
                    <p className="text-xs text-foreground/90 leading-relaxed mt-0.5 whitespace-pre-line">
                      {text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
