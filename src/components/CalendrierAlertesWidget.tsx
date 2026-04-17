// Widget Dashboard : alertes calendrier annuel pour l'agent comptable
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NavLink } from '@/components/NavLink';
import { CalendarClock, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { loadState } from '@/lib/store';
import { getAlertesAC } from '@/lib/calendrier-mail';
import { MOIS_NOMS, CATEGORIES_COULEURS } from '@/lib/calendrier-activites';
import type { ActiviteCalendrier } from '@/lib/calendrier-types';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'calendrier_annuel_v1';

export function CalendrierAlertesWidget() {
  const activites = useMemo(() => loadState<ActiviteCalendrier[]>(STORAGE_KEY, []), []);
  const alertes = useMemo(() => getAlertesAC(activites), [activites]);
  const moisNom = MOIS_NOMS[new Date().getMonth()];

  if (activites.length === 0) {
    return (
      <Card className="shadow-card hover:shadow-card-hover transition-all duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-primary" />
            Calendrier annuel AC
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">
            Le calendrier annuel n'est pas encore initialisé.
          </p>
          <Button asChild size="sm" variant="outline" className="w-full">
            <NavLink to="/calendrier-annuel" className="gap-1.5">
              Configurer le calendrier <ArrowRight className="h-3 w-3" />
            </NavLink>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card hover:shadow-card-hover transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-primary" />
          Opérations à réaliser — {moisNom}
          {alertes.total > 0 && (
            <Badge variant="destructive" className="ml-auto text-[10px]">
              {alertes.total} alerte{alertes.total > 1 ? 's' : ''}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Résumé */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-md bg-muted/50 p-2">
            <p className="text-xl font-bold tabular-nums">{alertes.duMois.length}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Du mois</p>
          </div>
          <div className={cn(
            'rounded-md p-2',
            alertes.proches7j.length > 0 ? 'bg-amber-100 dark:bg-amber-950/30' : 'bg-muted/50'
          )}>
            <p className="text-xl font-bold tabular-nums text-amber-700 dark:text-amber-400">
              {alertes.proches7j.length}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{'<'} 7 jours</p>
          </div>
          <div className={cn(
            'rounded-md p-2',
            alertes.enRetard.length > 0 ? 'bg-destructive/10' : 'bg-muted/50'
          )}>
            <p className="text-xl font-bold tabular-nums text-destructive">
              {alertes.enRetard.length}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">En retard</p>
          </div>
        </div>

        {/* Liste prioritaire : retard puis proches */}
        {alertes.total > 0 ? (
          <div className="space-y-1.5 max-h-[180px] overflow-y-auto">
            {[...alertes.enRetard, ...alertes.proches7j].slice(0, 5).map((a, i) => {
              const isRetard = alertes.enRetard.includes(a);
              return (
                <div key={a.id + i} className={cn(
                  'flex items-start gap-2 p-2 rounded-md text-xs border-l-2',
                  isRetard ? 'bg-destructive/5 border-l-destructive' : 'bg-amber-50 dark:bg-amber-950/20 border-l-amber-500'
                )}>
                  {isRetard ? (
                    <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                  ) : (
                    <CalendarClock className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">{a.titre}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      {a.dateEcheance && (
                        <span className={cn(
                          'text-[10px] tabular-nums',
                          isRetard ? 'text-destructive font-semibold' : 'text-amber-700 dark:text-amber-400'
                        )}>
                          {new Date(a.dateEcheance).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                      <Badge variant="outline" className={cn('text-[9px] py-0 px-1', CATEGORIES_COULEURS[a.categorie])}>
                        {a.categorie}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
            {alertes.total > 5 && (
              <p className="text-[10px] text-muted-foreground text-center pt-1">
                + {alertes.total - 5} autre{alertes.total - 5 > 1 ? 's' : ''}…
              </p>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 p-3 rounded-md bg-emerald-50 dark:bg-emerald-950/20 text-xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="text-emerald-800 dark:text-emerald-300">
              Aucune alerte. Toutes les échéances sont sous contrôle.
            </span>
          </div>
        )}

        <Button asChild size="sm" variant="outline" className="w-full">
          <NavLink to="/calendrier-annuel" className="gap-1.5">
            Ouvrir le calendrier <ArrowRight className="h-3 w-3" />
          </NavLink>
        </Button>
      </CardContent>
    </Card>
  );
}
