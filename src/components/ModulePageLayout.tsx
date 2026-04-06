import { ReactNode, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Shield, BookOpen, Scale, AlertTriangle } from 'lucide-react';

// ─── Section identity ──────────────────────────────────────────
const SECTION_STYLES: Record<string, { gradient: string; accent: string; icon: typeof Shield }> = {
  'CONTRÔLES SUR PLACE': { gradient: 'from-[#3B82F6] to-[#60A5FA]', accent: '#3B82F6', icon: Shield },
  'VÉRIFICATION & ORDONNATEUR': { gradient: 'from-[#2D8C5A] to-[#3DA96E]', accent: '#2D8C5A', icon: BookOpen },
  'GESTION COMPTABLE': { gradient: 'from-[#7C4DDB] to-[#9B6FE8]', accent: '#7C4DDB', icon: Scale },
  'FINANCES & BUDGET': { gradient: 'from-[#D4920A] to-[#E5A832]', accent: '#D4920A', icon: AlertTriangle },
  'CONTRÔLE INTERNE': { gradient: 'from-[#168F75] to-[#20B090]', accent: '#168F75', icon: Shield },
  'AUDIT & RESTITUTION': { gradient: 'from-[#2B4C8C] to-[#3D66B0]', accent: '#2B4C8C', icon: BookOpen },
};

interface RegulatoryRef {
  code: string;   // ex: "M9-6 § 3.2.1"
  label: string;  // ex: "Vérification de la caisse"
}

interface ModulePageLayoutProps {
  title: string;
  section: string;
  description?: string;
  /** Regulatory references displayed in the header */
  refs?: RegulatoryRef[];
  /** 0-100 — auto-calculated from completedChecks/totalChecks if not provided */
  progress?: number;
  /** For auto-progress calculation */
  completedChecks?: number;
  totalChecks?: number;
  /** Header action buttons */
  headerActions?: ReactNode;
  children: ReactNode;
}

export function ModulePageLayout({
  title,
  section,
  description,
  refs = [],
  progress,
  completedChecks,
  totalChecks,
  headerActions,
  children,
}: ModulePageLayoutProps) {
  const style = SECTION_STYLES[section] || SECTION_STYLES['CONTRÔLES SUR PLACE'];

  const pct = useMemo(() => {
    if (progress !== undefined) return progress;
    if (totalChecks && totalChecks > 0) return Math.round((completedChecks || 0) / totalChecks * 100);
    return null;
  }, [progress, completedChecks, totalChecks]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ─── Module Header ─── */}
      <div className={`rounded-xl overflow-hidden bg-gradient-to-r ${style.gradient} p-5 text-white opacity-0 animate-fade-in`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold tracking-widest uppercase opacity-70 mb-1">
              {section}
            </p>
            <h1 className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {title}
            </h1>
            {description && (
              <p className="text-sm mt-1 text-white/80 max-w-2xl">
                {description}
              </p>
            )}

            {/* Regulatory references */}
            {refs.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {refs.map((r, i) => (
                  <Badge key={i} variant="outline" className="bg-white/15 border-white/25 text-white text-[10px] font-medium hover:bg-white/25 transition-colors rounded-[20px]">
                    <BookOpen className="h-2.5 w-2.5 mr-1 opacity-70" />
                    {r.code}
                    {r.label && <span className="ml-1 opacity-70">— {r.label}</span>}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {headerActions && (
            <div className="shrink-0 flex items-center gap-2">
              {headerActions}
            </div>
          )}
        </div>

        {/* Progress bar */}
        {pct !== null && (
          <div className="mt-4 flex items-center gap-3">
            <Progress value={pct} className="flex-1 h-2 bg-white/20 [&>div]:bg-white" />
            <span className="text-sm font-bold tabular-nums min-w-[3ch] text-right">{pct}%</span>
          </div>
        )}
      </div>

      {/* ─── Module Content ─── */}
      {children}
    </div>
  );
}

// ─── Reusable sub-components for modules ────────────────────────

/** Section divider within a module */
export function ModuleSection({ title, description, children, badge }: {
  title: string; description?: string; children: ReactNode; badge?: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground">{title}</h2>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
        {badge && <Badge variant="secondary" className="text-[10px]">{badge}</Badge>}
      </div>
      {children}
    </div>
  );
}

/** Compliance check item with visual status */
export function ComplianceCheck({ label, checked, onChange, severity = 'normal', detail }: {
  label: string;
  checked: boolean;
  onChange: () => void;
  severity?: 'normal' | 'majeur' | 'critique';
  detail?: string;
}) {
  const borderClass = severity === 'critique' ? 'border-l-destructive' : severity === 'majeur' ? 'border-l-orange-400' : 'border-l-transparent';

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border border-border/50 border-l-4 ${borderClass} transition-all cursor-pointer hover:bg-muted/50 ${checked ? 'bg-muted/30' : ''}`}
      onClick={onChange}
    >
      <div className={`mt-0.5 h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
        checked ? 'bg-primary border-primary' : 'border-muted-foreground/30'
      }`}>
        {checked && (
          <svg className="h-3 w-3 text-primary-foreground" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 6l3 3 5-5" />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-relaxed ${checked ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
          {label}
        </p>
        {detail && (
          <p className="text-xs text-muted-foreground/70 mt-0.5 italic">{detail}</p>
        )}
      </div>
      {severity !== 'normal' && (
        <Badge variant={severity === 'critique' ? 'destructive' : 'secondary'} className="text-[9px] shrink-0 mt-0.5">
          {severity === 'critique' ? 'Critique' : 'Majeur'}
        </Badge>
      )}
    </div>
  );
}

/** Alert box for anomalies */
export function AnomalyAlert({ title, description, severity = 'warning' }: {
  title: string; description?: string; severity?: 'warning' | 'error' | 'info';
}) {
  const styles = {
    warning: 'bg-accent/10 border-accent text-accent-foreground',
    error: 'bg-destructive/10 border-destructive text-destructive',
    info: 'bg-primary/10 border-primary text-primary',
  };

  return (
    <div className={`p-3 rounded-lg border ${styles[severity]}`}>
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <p className="text-sm font-medium">{title}</p>
      </div>
      {description && <p className="text-xs mt-1 opacity-80 ml-6">{description}</p>}
    </div>
  );
}
