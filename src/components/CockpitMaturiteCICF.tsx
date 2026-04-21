/**
 * Cockpit Maturité CICF — widget WOW pour le tableau de bord.
 * Affiche : score global animé, niveau de maturité, 4 KPI animés, radar des 5 axes,
 * et un bouton « Exporter rapport exécutif PDF ».
 */
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ShieldCheck, FileText, AlertTriangle, MailCheck, Sparkles, Download,
  TrendingUp, Building2, Loader2,
} from 'lucide-react';
import { computeMaturiteCICF, NIVEAU_LABEL, type MaturiteCICF } from '@/lib/maturite-cicf';
import { useGroupements } from '@/hooks/useGroupements';
import { isDemoMode, DEMO_MATURITE, DEMO_GROUPEMENT_LABEL } from '@/lib/demo-mode';
import { exportMaturitePDF } from '@/lib/maturite-pdf';
import { toast } from 'sonner';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip,
} from 'recharts';

function useAnimatedNumber(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    const from = 0;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min(1, (ts - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (p < 1) requestAnimationFrame(step);
    };
    const raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

export function CockpitMaturiteCICF() {
  const { activeId, groupements } = useGroupements();
  const [data, setData] = useState<MaturiteCICF | null>(null);
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(isDemoMode());

  useEffect(() => {
    const onChange = () => setDemo(isDemoMode());
    window.addEventListener('demo-mode-changed', onChange);
    return () => window.removeEventListener('demo-mode-changed', onChange);
  }, []);

  useEffect(() => {
    if (demo) {
      setData(DEMO_MATURITE);
      setLoading(false);
      return;
    }
    if (!activeId) { setLoading(false); return; }
    setLoading(true);
    computeMaturiteCICF(activeId).then(d => { setData(d); setLoading(false); });
  }, [activeId, demo]);

  const score = useAnimatedNumber(data?.scoreGlobal ?? 0);
  const couv = useAnimatedNumber(data?.kpis.tauxCouverture ?? 0);
  const anom = useAnimatedNumber(data?.kpis.anomaliesOuvertes ?? 0);
  const pvAtt = useAnimatedNumber(data?.kpis.pvEnAttente ?? 0);
  const audits = useAnimatedNumber(data?.kpis.auditsTotal ?? 0);

  if (loading) {
    return (
      <Card className="shadow-card overflow-hidden">
        <CardContent className="py-6"><Skeleton className="h-32 w-full" /></CardContent>
      </Card>
    );
  }
  if (!data) return null;

  const niveau = NIVEAU_LABEL[data.niveau];
  const radarData = data.axes.map(a => ({ axe: a.label.split(' ')[0], score: a.score }));
  const grpLabel = demo ? DEMO_GROUPEMENT_LABEL : (groupements.find(g => g.id === activeId)?.libelle ?? 'Groupement actif');

  const handleExport = async () => {
    try {
      await exportMaturitePDF(data, grpLabel);
      toast.success('Rapport exécutif PDF téléchargé');
    } catch (e: any) {
      toast.error('Erreur export : ' + e.message);
    }
  };

  return (
    <Card className="shadow-elevated overflow-hidden border-2 border-primary/10 opacity-0 animate-fade-in">
      <div className="bg-gradient-to-br from-primary via-primary/90 to-accent p-5 text-primary-foreground">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center backdrop-blur">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Maturité CICF</p>
              <h2 className="text-lg font-bold">Score de pilotage du contrôle interne</h2>
              <p className="text-[11px] opacity-80">{grpLabel}{demo && ' · données fictives'}</p>
            </div>
          </div>
          <Button onClick={handleExport} variant="secondary" size="sm" className="shrink-0">
            <Download className="h-3.5 w-3.5 mr-1.5" /> Rapport exécutif PDF
          </Button>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Score circulaire */}
          <div className="flex items-center gap-4">
            <div className="relative h-24 w-24 shrink-0">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="10" />
                <circle
                  cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${(score / 100) * 264} 264`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold tabular-nums">{score}</span>
                <span className="text-[9px] uppercase tracking-wider opacity-80">/ 100</span>
              </div>
            </div>
            <div>
              <Badge className={`${niveau.bg} ${niveau.color} border-0 text-xs font-semibold mb-1`}>
                Niveau {niveau.label}
              </Badge>
              <p className="text-[11px] opacity-90 max-w-[200px] leading-snug">{niveau.description}</p>
            </div>
          </div>

          {/* Radar 5 axes */}
          <div className="md:col-span-2 h-[180px] bg-primary-foreground/5 rounded-lg p-2">
            <ResponsiveContainer>
              <RadarChart data={radarData}>
                <PolarGrid stroke="currentColor" strokeOpacity={0.2} />
                <PolarAngleAxis dataKey="axe" tick={{ fill: 'currentColor', fontSize: 10, opacity: 0.9 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: 'currentColor', fontSize: 8, opacity: 0.6 }} />
                <Radar dataKey="score" stroke="currentColor" fill="currentColor" fillOpacity={0.35} />
                <Tooltip contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11, color: 'hsl(var(--foreground))' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <CardContent className="pt-4">
        {/* 4 KPI animés */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiTile icon={ShieldCheck} label="Taux couverture" value={`${couv}%`} sublabel={`${data.kpis.pointsAudites}/${data.kpis.pointsTotal} points`} delay={0} accent="primary" />
          <KpiTile icon={AlertTriangle} label="Anomalies ouvertes" value={anom} sublabel={anom > 0 ? 'à traiter' : 'aucune'} delay={100} accent={anom > 0 ? 'destructive' : 'emerald'} />
          <KpiTile icon={MailCheck} label="PV en attente" value={pvAtt} sublabel={`${data.kpis.pvFinalises} finalisé(s)`} delay={200} accent="amber" />
          <KpiTile icon={FileText} label="Audits réalisés" value={audits} sublabel={`${data.kpis.auditsClotures} clôturés`} delay={300} accent="primary" />
        </div>

        {/* Détail axes */}
        <div className="mt-5 space-y-2">
          {data.axes.map((a, i) => (
            <div key={a.id} className="opacity-0 animate-fade-in" style={{ animationDelay: `${400 + i * 80}ms` }}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium">{a.label}</span>
                <span className="font-mono tabular-nums text-muted-foreground">{a.score}/100</span>
              </div>
              <Progress value={a.score} className="h-1.5" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function KpiTile({ icon: Icon, label, value, sublabel, delay, accent }: {
  icon: React.ElementType; label: string; value: string | number; sublabel?: string;
  delay: number; accent: 'primary' | 'destructive' | 'emerald' | 'amber';
}) {
  const colorMap = {
    primary: 'text-primary bg-primary/10',
    destructive: 'text-destructive bg-destructive/10',
    emerald: 'text-emerald-600 bg-emerald-500/10',
    amber: 'text-amber-600 bg-amber-500/10',
  };
  return (
    <div className="rounded-lg border bg-card p-3 hover-scale opacity-0 animate-fade-in" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center gap-2">
        <div className={`h-8 w-8 rounded-md flex items-center justify-center ${colorMap[accent]}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xl font-bold tabular-nums leading-none">{value}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{label}</p>
        </div>
      </div>
      {sublabel && <p className="text-[10px] text-muted-foreground/70 mt-1.5 truncate">{sublabel}</p>}
    </div>
  );
}
