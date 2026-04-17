/**
 * ControlAlert — Alerte métier critique avec référence légale et action recommandée.
 * Utilisée pour les contrôles obligatoires Sprint 3 (saucissonnage, prescription, Erasmus, etc.)
 */
import { AlertTriangle, ShieldAlert, Info, CheckCircle2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getRegle } from '@/lib/regulatory-engine';

type Level = 'critique' | 'alerte' | 'info' | 'ok';

interface ControlAlertProps {
  level: Level;
  title: string;
  description?: string;
  refKey?: string;
  refLabel?: string;
  action?: string;
  className?: string;
}

const STYLES: Record<Level, { wrap: string; icon: React.ElementType; iconCls: string; titleCls: string }> = {
  critique: {
    wrap: 'bg-destructive/10 border-destructive/40 text-destructive-foreground',
    icon: ShieldAlert,
    iconCls: 'text-destructive',
    titleCls: 'text-destructive',
  },
  alerte: {
    wrap: 'bg-amber-500/10 border-amber-500/40',
    icon: AlertTriangle,
    iconCls: 'text-amber-600',
    titleCls: 'text-amber-700 dark:text-amber-400',
  },
  info: {
    wrap: 'bg-primary/5 border-primary/30',
    icon: Info,
    iconCls: 'text-primary',
    titleCls: 'text-primary',
  },
  ok: {
    wrap: 'bg-emerald-500/10 border-emerald-500/40',
    icon: CheckCircle2,
    iconCls: 'text-emerald-600',
    titleCls: 'text-emerald-700 dark:text-emerald-400',
  },
};

export function ControlAlert({ level, title, description, refKey, refLabel, action, className }: ControlAlertProps) {
  const s = STYLES[level];
  const Icon = s.icon;
  const regle = refKey ? getRegle(refKey) : undefined;

  return (
    <div className={cn('rounded-lg border p-3 space-y-2', s.wrap, className)}>
      <div className="flex items-start gap-2">
        <Icon className={cn('h-4 w-4 mt-0.5 flex-shrink-0', s.iconCls)} />
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-bold leading-tight', s.titleCls)}>{title}</p>
          {description && <p className="text-xs text-foreground/80 mt-1 leading-relaxed">{description}</p>}
        </div>
      </div>
      {action && (
        <div className="ml-6 pl-0 border-l-2 border-current/20 pl-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide opacity-70">Action requise</p>
          <p className="text-xs">{action}</p>
        </div>
      )}
      {(regle || refLabel) && (
        <div className="ml-6 flex items-center gap-1 text-[11px] opacity-80">
          <span className="font-mono">{regle?.reference || refLabel}</span>
          {regle?.url && (
            <a href={regle.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 hover:underline">
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
