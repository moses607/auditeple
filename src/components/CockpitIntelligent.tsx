/**
 * Cockpit Intelligent — composant central du Dashboard.
 * Score de conformité, alertes triées, top actions, distribution par module.
 */
import { useMemo, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Activity, AlertOctagon, AlertTriangle, ArrowRight, CheckCircle2,
  ShieldCheck, Sparkles, Zap, Target, TrendingUp,
} from 'lucide-react';
import { aggregateCockpit, type CockpitAlerte } from '@/lib/cockpit-aggregator';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const SEVERITY_CONFIG: Record<string, { color: string; bg: string; icon: any; border: string; label: string }> = {
  critique: { color: 'text-destructive', bg: 'bg-destructive/10', icon: AlertOctagon, border: 'border-l-destructive', label: 'CRITIQUE' },
  majeur: { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/20', icon: AlertTriangle, border: 'border-l-amber-500', label: 'MAJEUR' },
  moyen: { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/20', icon: Activity, border: 'border-l-blue-500', label: 'MOYEN' },
  info: { color: 'text-muted-foreground', bg: 'bg-muted/40', icon: CheckCircle2, border: 'border-l-muted', label: 'INFO' },
};

export function CockpitIntelligent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  // Recompute on route change for freshness
  useEffect(() => { setRefreshKey(k => k + 1); }, [location.pathname]);

  const summary = useMemo(() => aggregateCockpit(), [refreshKey]);

  const scoreGradient =
    summary.scoreConformite >= 75 ? 'from-emerald-500 to-emerald-600'
    : summary.scoreConformite >= 55 ? 'from-amber-500 to-amber-600'
    : 'from-red-500 to-red-600';

  const scoreText =
    summary.scoreLetter === 'A' ? 'Excellence — agence sous contrôle'
    : summary.scoreLetter === 'B' ? 'Bonne maîtrise — quelques points d\'attention'
    : summary.scoreLetter === 'C' ? 'Vigilance requise — actions prioritaires'
    : summary.scoreLetter === 'D' ? 'Risque élevé — plan d\'action urgent'
    : 'Risque critique — intervention immédiate';

  return (
    <div className="space-y-4">
      {/* ─── Hero Score ─── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="overflow-hidden border-0 shadow-elevated">
          <div className={cn('relative bg-gradient-to-br p-6 md:p-8 text-white', scoreGradient)}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.2),_transparent_60%)]" />
            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Score géant */}
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
                  className="relative"
                >
                  <div className="h-24 w-24 md:h-28 md:w-28 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center border border-white/20">
                    <div className="text-center">
                      <p className="text-4xl md:text-5xl font-black tabular-nums leading-none">{summary.scoreConformite}</p>
                      <p className="text-[9px] uppercase tracking-widest mt-1 opacity-80">/ 100</p>
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2 h-9 w-9 rounded-full bg-white text-foreground font-black text-lg flex items-center justify-center shadow-lg">
                    {summary.scoreLetter}
                  </div>
                </motion.div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest opacity-80 font-semibold">Score conformité agence</p>
                  <h2 className="text-xl md:text-2xl font-bold leading-tight mt-1">{scoreText}</h2>
                  <p className="text-xs opacity-80 mt-1">Calculé en temps réel à partir de tous les modules</p>
                </div>
              </div>

              {/* Mini stats */}
              <div className="md:col-span-2 grid grid-cols-3 gap-2 md:gap-3">
                <StatBlock value={summary.critiques.length} label="Critiques" icon={AlertOctagon} accent="bg-white/20" />
                <StatBlock value={summary.majeurs.length} label="Majeurs" icon={AlertTriangle} accent="bg-white/15" />
                <StatBlock value={summary.totalAlertes} label="Total alertes" icon={Activity} accent="bg-white/10" />
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ─── Top 3 Actions Prioritaires ─── */}
      {summary.topActions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold">Actions prioritaires aujourd'hui</h3>
                  <p className="text-[10px] text-muted-foreground">Hiérarchie automatique par criticité et délai</p>
                </div>
                <Badge variant="secondary" className="text-[10px]">Top 3</Badge>
              </div>
              <div className="space-y-2">
                {summary.topActions.map((a, i) => (
                  <AlerteRow key={a.id} alerte={a} rank={i + 1} onOpen={() => a.modulePath && navigate(a.modulePath)} />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ─── Triptyque Critiques / Majeurs / Conformité ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ColonneAlertes
          titre="🔴 Critiques"
          subtitle="Action immédiate"
          alertes={summary.critiques}
          severity="critique"
          delay={0.2}
        />
        <ColonneAlertes
          titre="🟠 À surveiller"
          subtitle="Sous 7 jours"
          alertes={summary.majeurs}
          severity="majeur"
          delay={0.3}
        />
        <ColonneConformite summary={summary} delay={0.4} />
      </div>

      {/* ─── Distribution par module ─── */}
      {Object.keys(summary.parModule).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
        >
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold">Répartition des alertes par domaine</h3>
              </div>
              <div className="space-y-2">
                {Object.entries(summary.parModule)
                  .sort((a, b) => b[1] - a[1])
                  .map(([source, count]) => {
                    const pct = Math.round((count / summary.totalAlertes) * 100);
                    return (
                      <div key={source} className="flex items-center gap-3">
                        <span className="text-xs font-medium text-foreground w-[180px] truncate">{source}</span>
                        <div className="flex-1">
                          <Progress value={pct} className="h-2" />
                        </div>
                        <span className="text-xs font-bold tabular-nums text-muted-foreground w-12 text-right">{count}</span>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────

function StatBlock({ value, label, icon: Icon, accent }: { value: number; label: string; icon: any; accent: string }) {
  return (
    <div className={cn('rounded-xl p-3 backdrop-blur border border-white/10', accent)}>
      <div className="flex items-center justify-between mb-1">
        <Icon className="h-4 w-4 opacity-80" />
        <span className="text-2xl md:text-3xl font-black tabular-nums">{value}</span>
      </div>
      <p className="text-[10px] uppercase tracking-wider opacity-90 font-semibold">{label}</p>
    </div>
  );
}

function AlerteRow({ alerte, rank, onOpen }: { alerte: CockpitAlerte; rank?: number; onOpen?: () => void }) {
  const cfg = SEVERITY_CONFIG[alerte.severity];
  const Icon = cfg.icon;
  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg border-l-4 transition-colors cursor-pointer',
        cfg.bg, cfg.border,
        'hover:translate-x-0.5 transition-transform duration-150'
      )}
      onClick={onOpen}
    >
      {rank && (
        <div className={cn('h-7 w-7 rounded-full flex items-center justify-center text-xs font-black shrink-0', cfg.color, 'bg-white dark:bg-background border')}>
          {rank}
        </div>
      )}
      <Icon className={cn('h-4 w-4 shrink-0 mt-0.5', cfg.color)} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground leading-tight">{alerte.titre}</p>
        {alerte.description && (
          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{alerte.description}</p>
        )}
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          <Badge variant="outline" className="text-[9px] py-0 px-1.5 h-4">{alerte.source}</Badge>
          {alerte.reference && (
            <span className="text-[10px] text-muted-foreground">📖 {alerte.reference}</span>
          )}
          {alerte.metric && (
            <Badge variant="secondary" className="text-[9px] py-0 px-1.5 h-4">{alerte.metric}</Badge>
          )}
          {alerte.joursRestants !== undefined && (
            <Badge variant="outline" className={cn('text-[9px] py-0 px-1.5 h-4', alerte.joursRestants < 0 && 'text-destructive border-destructive/40')}>
              {alerte.joursRestants < 0 ? `Retard ${Math.abs(alerte.joursRestants)}j` : `Dans ${alerte.joursRestants}j`}
            </Badge>
          )}
        </div>
      </div>
      {alerte.modulePath && (
        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 self-center" />
      )}
    </div>
  );
}

function ColonneAlertes({
  titre, subtitle, alertes, severity, delay,
}: { titre: string; subtitle: string; alertes: CockpitAlerte[]; severity: keyof typeof SEVERITY_CONFIG; delay: number }) {
  const navigate = useNavigate();
  const cfg = SEVERITY_CONFIG[severity];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className={cn('shadow-card hover:shadow-card-hover transition-all h-full', alertes.length > 0 && 'border-l-4', alertes.length > 0 && cfg.border)}>
        <CardContent className="p-4">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold">{titre}</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{subtitle}</p>
            </div>
            <span className={cn('text-2xl font-black tabular-nums', cfg.color)}>{alertes.length}</span>
          </div>
          {alertes.length === 0 ? (
            <div className="flex items-center gap-2 p-3 rounded-md bg-emerald-50 dark:bg-emerald-950/20 text-xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="text-emerald-800 dark:text-emerald-300">Tout est sous contrôle</span>
            </div>
          ) : (
            <div className="space-y-2 max-h-[280px] overflow-y-auto -mx-1 px-1">
              {alertes.slice(0, 5).map(a => (
                <AlerteRow key={a.id} alerte={a} onOpen={() => a.modulePath && navigate(a.modulePath)} />
              ))}
              {alertes.length > 5 && (
                <p className="text-[10px] text-muted-foreground text-center pt-1">+ {alertes.length - 5} autre{alertes.length - 5 > 1 ? 's' : ''}…</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ColonneConformite({ summary, delay }: { summary: ReturnType<typeof aggregateCockpit>; delay: number }) {
  const conforme = summary.totalAlertes === 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className={cn('shadow-card hover:shadow-card-hover transition-all h-full', conforme && 'border-l-4 border-l-emerald-500')}>
        <CardContent className="p-4">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold">🟢 Conformité</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Indicateurs verts</p>
            </div>
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="space-y-2.5">
            <ConformiteIndicator label="Score global" value={`${summary.scoreConformite}/100`} ok={summary.scoreConformite >= 75} />
            <ConformiteIndicator label="Aucune alerte critique" value={`${summary.critiques.length} crit.`} ok={summary.critiques.length === 0} />
            <ConformiteIndicator label="Suivi alertes mineures" value={`${summary.moyens.length} moy.`} ok={summary.moyens.length < 5} />
            <ConformiteIndicator label="Notation lettre" value={summary.scoreLetter} ok={['A', 'B'].includes(summary.scoreLetter)} />
          </div>
          <Button variant="outline" size="sm" className="w-full mt-3 gap-1.5" asChild>
            <a href="/pv-audit"><Sparkles className="h-3.5 w-3.5" /> Générer le PV d'audit</a>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ConformiteIndicator({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="flex items-center gap-1.5">
        <span className={cn('h-2 w-2 rounded-full', ok ? 'bg-emerald-500' : 'bg-amber-500')} />
        <span className="text-foreground/80">{label}</span>
      </span>
      <span className={cn('font-bold tabular-nums', ok ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400')}>
        {value}
      </span>
    </div>
  );
}
