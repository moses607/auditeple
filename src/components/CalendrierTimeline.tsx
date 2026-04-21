// Timeline horizontale de la charge mensuelle du calendrier
import { MOIS_NOMS_COURT } from '@/lib/calendrier-activites';
import type { ActiviteCalendrier } from '@/lib/calendrier-types';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriangle, AlertCircle } from 'lucide-react';

function isInMonth(a: ActiviteCalendrier, m: number): boolean {
  if (a.periodicite === 'mensuelle' && a.moisDebut === 0) return true;
  const debut = a.moisDebut;
  const fin = a.moisFin || a.moisDebut;
  if (debut <= fin) return m >= debut && m <= fin;
  return m >= debut || m <= fin;
}

interface Props {
  activites: ActiviteCalendrier[];
  onMonthClick?: (mois: number) => void;
  selectedMois?: number | null;
}

export function CalendrierTimeline({ activites, onMonthClick, selectedMois }: Props) {
  // Compter par mois et par criticité
  const counts = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const items = activites.filter(a => isInMonth(a, m));
    return {
      mois: m,
      total: items.length,
      haute: items.filter(a => a.criticite === 'haute').length,
      moyenne: items.filter(a => a.criticite === 'moyenne').length,
      info: items.filter(a => a.criticite === 'info').length,
      realisees: items.filter(a => a.realisee).length,
    };
  });
  const max = Math.max(...counts.map(c => c.total), 1);

  // Détection charge anormale : > 1.6× la moyenne ou 0
  const moyenne = counts.reduce((s, c) => s + c.total, 0) / 12;
  const surcharge = (c: typeof counts[number]) => c.total > moyenne * 1.6 && c.total >= 5;
  const vide = (c: typeof counts[number]) => c.total === 0;

  return (
    <TooltipProvider delayDuration={150}>
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold">Charge mensuelle</h3>
            <p className="text-xs text-muted-foreground">
              Total : <strong>{activites.length}</strong> opérations · Moyenne : <strong>{moyenne.toFixed(1)}</strong>/mois
            </p>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-destructive" /> Haute</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-500" /> Moyenne</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-sky-500" /> Info</span>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-1.5 items-end h-32">
          {counts.map(c => {
            const ratio = c.total / max;
            const heightPct = Math.max(c.total > 0 ? 12 : 4, ratio * 100);
            const tauxReal = c.total > 0 ? Math.round((c.realisees / c.total) * 100) : 0;
            return (
              <Tooltip key={c.mois}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onMonthClick?.(c.mois)}
                    className={cn(
                      'flex flex-col items-stretch h-full justify-end group relative',
                      'transition-transform hover:scale-105 cursor-pointer',
                    )}
                  >
                    {(surcharge(c) || vide(c)) && (
                      <span className="absolute -top-1 right-0 z-10">
                        {surcharge(c) ? (
                          <AlertTriangle className="h-3 w-3 text-amber-600" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-muted-foreground/60" />
                        )}
                      </span>
                    )}
                    <div
                      className={cn(
                        'w-full flex flex-col-reverse rounded-t overflow-hidden border-2 border-transparent',
                        selectedMois === c.mois && 'border-primary ring-2 ring-primary/30',
                      )}
                      style={{ height: `${heightPct}%` }}
                    >
                      {c.haute > 0 && (
                        <div
                          className="bg-destructive"
                          style={{ flex: c.haute }}
                          title={`${c.haute} haute(s)`}
                        />
                      )}
                      {c.moyenne > 0 && (
                        <div
                          className="bg-amber-500"
                          style={{ flex: c.moyenne }}
                          title={`${c.moyenne} moyenne(s)`}
                        />
                      )}
                      {c.info > 0 && (
                        <div
                          className="bg-sky-500"
                          style={{ flex: c.info }}
                          title={`${c.info} info`}
                        />
                      )}
                      {c.total === 0 && (
                        <div className="bg-muted h-1 rounded-t" />
                      )}
                    </div>
                    <div className="text-[10px] mt-1 text-muted-foreground group-hover:text-foreground">
                      {MOIS_NOMS_COURT[c.mois - 1]}
                    </div>
                    <div className={cn(
                      'text-[11px] font-bold leading-tight',
                      c.total === 0 && 'text-muted-foreground/50',
                    )}>
                      {c.total}
                    </div>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <p className="font-semibold">{['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'][c.mois - 1]}</p>
                  <p>{c.total} opération{c.total > 1 ? 's' : ''}</p>
                  {c.haute > 0 && <p className="text-destructive">{c.haute} obligatoire(s)</p>}
                  {c.moyenne > 0 && <p className="text-amber-600">{c.moyenne} recommandée(s)</p>}
                  {c.total > 0 && <p className="text-emerald-600">Réalisées : {tauxReal}%</p>}
                  {surcharge(c) && <p className="text-amber-700 mt-1">⚠ Mois chargé</p>}
                  {vide(c) && <p className="text-muted-foreground mt-1">ⓘ Mois vide</p>}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
