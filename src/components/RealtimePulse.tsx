/**
 * RealtimePulse — pastille animée affichée brièvement quand une mise à jour
 * realtime arrive d'un autre utilisateur du même groupement.
 */
import { useEffect, useState } from 'react';
import { Radio } from 'lucide-react';

interface Props {
  /** Timestamp (ms) de la dernière mise à jour distante. 0 = jamais. */
  triggerAt: number;
  label?: string;
}

export function RealtimePulse({ triggerAt, label = 'Mise à jour collègue' }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!triggerAt) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(t);
  }, [triggerAt]);

  if (!visible) return null;

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 animate-in fade-in slide-in-from-top-1">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
      </span>
      <Radio className="h-3 w-3" />
      {label}
    </span>
  );
}
