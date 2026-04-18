/**
 * AlertesConsolidees — Centre d'alertes transverses du Dashboard.
 * Agrège les anomalies de tous les modules (via anomaly-collector) et
 * propose un filtrage par criticité + lien direct vers le module concerné.
 */
import { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldAlert, AlertTriangle, ChevronRight, CheckCircle2, Filter } from 'lucide-react';
import { collectAllAnomalies } from '@/lib/anomaly-collector';
import { cn } from '@/lib/utils';

const MODULE_ROUTES: Record<string, string> = {
  voyages: '/voyages',
  verification: '/verification',
  regies: '/regies',
  stocks: '/stocks',
  rapprochement: '/rapprochement',
  'droits-constates': '/droits-constates',
  subventions: '/subventions',
  restauration: '/restauration',
  cartographie: '/cartographie',
};

type Filter = 'TOUS' | 'MAJEURE' | 'MINEURE';

export function AlertesConsolidees() {
  const [filter, setFilter] = useState<Filter>('MAJEURE');
  const [expanded, setExpanded] = useState<string | null>(null);

  const data = useMemo(() => collectAllAnomalies(), []);

  const stats = useMemo(() => {
    let majeures = 0, mineures = 0;
    data.forEach(m => m.anomalies.forEach(a => {
      if (a.criticite === 'MAJEURE') majeures++;
      else mineures++;
    }));
    return { majeures, mineures, total: majeures + mineures, modules: data.length };
  }, [data]);

  const filtered = useMemo(() => {
    if (filter === 'TOUS') return data;
    return data
      .map(m => ({ ...m, anomalies: m.anomalies.filter(a => a.criticite === filter) }))
      .filter(m => m.anomalies.length > 0);
  }, [data, filter]);

  if (stats.total === 0) {
    return (
      <Card className="shadow-card border-l-4 border-l-emerald-500">
        <CardContent className="p-4 flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="font-bold text-sm">Aucune alerte critique détectée</p>
            <p className="text-xs text-muted-foreground">Tous les modules audités sont conformes.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card border-l-4 border-l-destructive">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            <CardTitle className="text-base">Centre d'alertes consolidées</CardTitle>
            <Badge variant="destructive" className="ml-1">{stats.total}</Badge>
          </div>
          <div className="flex items-center gap-1">
            <Filter className="h-3.5 w-3.5 text-muted-foreground mr-1" />
            {(['MAJEURE', 'MINEURE', 'TOUS'] as Filter[]).map(f => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setFilter(f)}
              >
                {f === 'MAJEURE' && `Critiques (${stats.majeures})`}
                {f === 'MINEURE' && `Mineures (${stats.mineures})`}
                {f === 'TOUS' && `Toutes (${stats.total})`}
              </Button>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {stats.modules} module{stats.modules > 1 ? 's' : ''} concerné{stats.modules > 1 ? 's' : ''} —
          synthèse en temps réel des anomalies détectées dans le périmètre d'audit.
        </p>
      </CardHeader>
      <CardContent className="space-y-2 max-h-[420px] overflow-y-auto">
        {filtered.map(mod => {
          const route = MODULE_ROUTES[mod.moduleId] || '/';
          const isOpen = expanded === mod.moduleId;
          const top3 = mod.anomalies.slice(0, isOpen ? mod.anomalies.length : 3);
          return (
            <div key={mod.moduleId} className="rounded-lg border bg-muted/30">
              <div className="flex items-center justify-between p-2.5 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                    {mod.moduleLabel}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {mod.anomalies.length} anomalie{mod.anomalies.length > 1 ? 's' : ''}
                  </span>
                </div>
                <NavLink to={route}>
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                    Ouvrir <ChevronRight className="h-3 w-3" />
                  </Button>
                </NavLink>
              </div>
              <div className="px-2.5 pb-2.5 space-y-1.5">
                {top3.map((a, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex items-start gap-2 text-xs p-2 rounded border-l-2',
                      a.criticite === 'MAJEURE'
                        ? 'border-l-destructive bg-destructive/5'
                        : 'border-l-amber-500 bg-amber-500/5'
                    )}
                  >
                    <AlertTriangle
                      className={cn(
                        'h-3.5 w-3.5 mt-0.5 flex-shrink-0',
                        a.criticite === 'MAJEURE' ? 'text-destructive' : 'text-amber-600'
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold leading-tight">{a.label}</p>
                      {a.observations && (
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">
                          {a.observations}
                        </p>
                      )}
                      <p className="text-[10px] font-mono text-muted-foreground/80 mt-0.5">
                        {a.reference}
                      </p>
                    </div>
                  </div>
                ))}
                {mod.anomalies.length > 3 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-full text-[11px]"
                    onClick={() => setExpanded(isOpen ? null : mod.moduleId)}
                  >
                    {isOpen
                      ? 'Réduire'
                      : `Voir les ${mod.anomalies.length - 3} autre${mod.anomalies.length - 3 > 1 ? 's' : ''}`}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
