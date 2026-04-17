/**
 * RegRefBadge — badge réglementaire cliquable avec popover riche.
 * Utilisé dans le header des modules et dans les sections de contrôle.
 *
 * 3 modes :
 *  - <RegRefBadge refKey="gbcp-19" />  → lookup auto dans le moteur réglementaire
 *  - <RegRefBadge code="..." label="..." /> → fallback simple texte
 *  - <RegRefBadge code="..." titre="..." resume="..." source="..." /> → custom
 */
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ExternalLink } from 'lucide-react';
import { getRegle, getSourceBadgeClass, type SourceLegale } from '@/lib/regulatory-engine';
import { cn } from '@/lib/utils';

interface RegRefBadgeProps {
  refKey?: string;
  code?: string;
  label?: string;
  titre?: string;
  resume?: string;
  source?: SourceLegale;
  variant?: 'header' | 'inline';
  className?: string;
}

export function RegRefBadge({
  refKey, code, label, titre, resume, source,
  variant = 'header', className,
}: RegRefBadgeProps) {
  const r = refKey ? getRegle(refKey) : undefined;
  const displayCode = r?.reference || code || '';
  const displayLabel = r?.titre || titre || label || '';
  const displayResume = r?.resume || resume;
  const displaySource = r?.source || source;
  const hasDetails = !!(displayResume || displayLabel);

  const triggerClass = variant === 'header'
    ? 'bg-white/15 border-white/25 text-white text-[10px] font-medium hover:bg-white/30 transition-colors rounded-[20px] cursor-help'
    : 'text-[10px] font-medium hover:bg-muted cursor-help';

  const trigger = (
    <Badge variant="outline" className={cn(triggerClass, className)}>
      <BookOpen className="h-2.5 w-2.5 mr-1 opacity-70" />
      {displayCode}
      {label && variant === 'header' && <span className="ml-1 opacity-70">— {label}</span>}
    </Badge>
  );

  if (!hasDetails) return trigger;

  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="w-[360px] p-0 shadow-elevated">
        <div className="p-4 space-y-3">
          <div className="flex items-start gap-2">
            {displaySource && (
              <Badge variant="outline" className={cn('text-[9px] py-0 px-1.5 h-5 font-bold', getSourceBadgeClass(displaySource))}>
                {displaySource}
              </Badge>
            )}
            <code className="text-[10px] font-mono text-muted-foreground break-all">{displayCode}</code>
          </div>
          {displayLabel && (
            <h4 className="text-sm font-bold leading-tight text-foreground">{displayLabel}</h4>
          )}
          {displayResume && (
            <p className="text-xs text-foreground/80 leading-relaxed">{displayResume}</p>
          )}
          {r?.url && (
            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-primary inline-flex items-center gap-1 hover:underline"
            >
              <ExternalLink className="h-3 w-3" /> Consulter Légifrance
            </a>
          )}
          {r?.motsCles && r.motsCles.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-2 border-t border-border">
              {r.motsCles.slice(0, 6).map(m => (
                <span key={m} className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{m}</span>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
