/**
 * Frise horizontale des 7 étapes du parcours d'audit avec progression
 * et bouton « Continuer » menant au prochain module incomplet.
 */
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PARCOURS_ETAPES, type EtapeParcours } from '@/lib/audit-parcours';
import { useAuditProgress } from '@/hooks/useAuditProgress';
import { useModules } from '@/hooks/useModules';
import { Compass, ChevronRight, CheckCircle2, Circle, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Mapping module → clés localStorage de checks (extrait de useAuditProgress) */
const MODULE_CHECK_KEYS: Record<string, string[]> = {
  'verification': ['verification_checks_v2'],
  'ordonnateur': ['ordonnateur_checks'],
  'droits-constates': ['dc_checks'],
  'depenses': ['depenses_controles_ac', 'depenses_suspensions_v2', 'depenses_pieces_v2'],
  'controle-caisse': ['ctrl_caisse_checks'],
  'regies': ['regies_reg_checks'],
  'stocks': ['stocks_checks'],
  'rapprochement': ['rapprochement_checks'],
  'restauration': ['restauration_checks'],
  'voyages': ['voyages_checks'],
  'bourses': ['bourses_checks'],
  'fonds-sociaux': ['fonds_sociaux_checks'],
  'recouvrement': ['recouvrement_checks'],
  'marches': ['marches_checks'],
  'subventions': ['subventions_checks'],
  'budgets-annexes': ['ba_checks'],
  'fonds-roulement': ['fdr_checks'],
  'organigramme': ['organigramme_checks'],
  'annexe-comptable': ['annexe_checks'],
};

function getModuleProgress(moduleId: string): { checked: number; total: number } {
  const keys = MODULE_CHECK_KEYS[moduleId];
  if (!keys) return { checked: 0, total: 0 };
  let checked = 0, total = 0;
  for (const key of keys) {
    try {
      const raw = localStorage.getItem('cic_expert_' + key);
      if (!raw) continue;
      const data = JSON.parse(raw);
      const vals = Object.values(data);
      total += vals.length;
      checked += vals.filter(Boolean).length;
    } catch {}
  }
  return { checked, total };
}

interface EtapeStats {
  etape: EtapeParcours;
  totalModules: number;
  completedModules: number;
  startedModules: number;
  percentage: number;
  /** Premier module non complété (à compléter ensuite) */
  nextModuleId?: string;
  nextModulePath?: string;
  nextModuleLabel?: string;
}

export function ParcoursProgress() {
  const navigate = useNavigate();
  const auditProgress = useAuditProgress(); // forces re-render on changes
  const [modules] = useModules();

  const stats: EtapeStats[] = useMemo(() => {
    void auditProgress; // dépendance implicite : recalcule à chaque tick
    return PARCOURS_ETAPES.map(etape => {
      const etapeModules = etape.moduleIds
        .map(id => modules.find(m => m.id === id))
        .filter((m): m is NonNullable<typeof m> => !!m);

      let completedModules = 0;
      let startedModules = 0;
      let nextModule: typeof etapeModules[number] | undefined;

      for (const mod of etapeModules) {
        const { checked, total } = getModuleProgress(mod.id);
        const hasChecks = total > 0;
        const isComplete = hasChecks && checked === total;
        const isStarted = checked > 0;

        if (isComplete) completedModules++;
        else if (!nextModule) nextModule = mod; // premier non complet

        if (isStarted) startedModules++;
      }

      const totalModules = etapeModules.length;
      const percentage = totalModules > 0
        ? Math.round((completedModules / totalModules) * 100)
        : 0;

      return {
        etape,
        totalModules,
        completedModules,
        startedModules,
        percentage,
        nextModuleId: nextModule?.id,
        nextModulePath: nextModule?.path,
        nextModuleLabel: nextModule?.label,
      };
    });
  }, [modules, auditProgress]);

  /** Première étape non terminée à 100% — sert au bouton « Continuer » global */
  const currentStep = useMemo(
    () => stats.find(s => s.percentage < 100 && s.totalModules > 0) ?? stats[0],
    [stats]
  );

  const globalPercent = useMemo(() => {
    const total = stats.reduce((s, x) => s + x.totalModules, 0);
    const done = stats.reduce((s, x) => s + x.completedModules, 0);
    return total > 0 ? Math.round((done / total) * 100) : 0;
  }, [stats]);

  return (
    <Card className="shadow-card overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Compass className="h-4 w-4 text-primary" />
            Progression du parcours d'audit
            <Badge variant="secondary" className="ml-1 text-[10px]">
              {globalPercent}% global
            </Badge>
          </CardTitle>
          {currentStep && currentStep.nextModulePath && (
            <Button
              size="sm"
              onClick={() => navigate(currentStep.nextModulePath!)}
              className="gap-1.5 h-8"
            >
              <PlayCircle className="h-3.5 w-3.5" />
              Continuer : {currentStep.nextModuleLabel}
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Frise horizontale — desktop */}
        <div className="hidden md:block">
          <div className="relative">
            {/* Ligne de connexion */}
            <div className="absolute top-5 left-[5%] right-[5%] h-0.5 bg-border" />
            <div
              className="absolute top-5 left-[5%] h-0.5 bg-primary transition-all duration-700"
              style={{ width: `${(globalPercent / 100) * 90}%` }}
            />

            <div className="relative grid grid-cols-7 gap-1">
              {stats.map((s) => {
                const Icon = s.etape.icon;
                const isComplete = s.percentage === 100 && s.totalModules > 0;
                const isCurrent = currentStep?.etape.id === s.etape.id;
                const isStarted = s.startedModules > 0 || isComplete;

                return (
                  <button
                    key={s.etape.id}
                    onClick={() => s.nextModulePath && navigate(s.nextModulePath)}
                    disabled={!s.nextModulePath && s.totalModules === 0}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-1.5 rounded-lg transition-all group",
                      "hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed",
                      isCurrent && "bg-primary/5 ring-1 ring-primary/30"
                    )}
                  >
                    {/* Pastille */}
                    <div className={cn(
                      "relative h-10 w-10 rounded-full flex items-center justify-center shrink-0 transition-all border-2",
                      isComplete
                        ? "bg-primary border-primary text-primary-foreground"
                        : isStarted
                          ? "bg-background border-primary text-primary"
                          : "bg-background border-border text-muted-foreground",
                      isCurrent && !isComplete && "ring-2 ring-primary/40 ring-offset-2 ring-offset-background"
                    )}>
                      {isComplete ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-background border border-border flex items-center justify-center text-[9px] font-bold text-foreground">
                        {s.etape.numero}
                      </span>
                    </div>

                    {/* Label + % */}
                    <div className="text-center min-w-0 w-full">
                      <p className={cn(
                        "text-[11px] font-semibold leading-tight truncate",
                        isCurrent ? "text-primary" : "text-foreground"
                      )}>
                        {s.etape.label}
                      </p>
                      <p className="text-[9px] tabular-nums text-muted-foreground">
                        {s.totalModules > 0 ? `${s.percentage}%` : '—'}
                      </p>
                    </div>

                    {/* Mini barre */}
                    <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          isComplete ? "bg-primary" : "bg-primary/60"
                        )}
                        style={{ width: `${s.percentage}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Liste verticale — mobile */}
        <div className="md:hidden space-y-2">
          {stats.map((s) => {
            const Icon = s.etape.icon;
            const isComplete = s.percentage === 100 && s.totalModules > 0;
            const isCurrent = currentStep?.etape.id === s.etape.id;

            return (
              <button
                key={s.etape.id}
                onClick={() => s.nextModulePath && navigate(s.nextModulePath)}
                disabled={!s.nextModulePath && s.totalModules === 0}
                className={cn(
                  "w-full flex items-center gap-3 p-2 rounded-lg transition-all text-left",
                  "hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed",
                  isCurrent && "bg-primary/5 ring-1 ring-primary/30"
                )}
              >
                <div className={cn(
                  "h-9 w-9 rounded-full flex items-center justify-center shrink-0 border-2",
                  isComplete
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-background border-primary/40 text-primary"
                )}>
                  {isComplete ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold truncate">
                      {s.etape.numero}. {s.etape.label}
                    </p>
                    <span className="text-[10px] tabular-nums font-bold text-muted-foreground shrink-0">
                      {s.totalModules > 0 ? `${s.percentage}%` : '—'}
                    </span>
                  </div>
                  <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${s.percentage}%` }}
                    />
                  </div>
                </div>
                {isCurrent && !isComplete && (
                  <ChevronRight className="h-4 w-4 text-primary shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
