import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface Update { id: string; date: string; message: string; severity: 'info' | 'warning' }

const UPDATES: Update[] = [
  { id: 'mp2026', date: '2026-04-01', message: 'Nouveaux seuils marchés publics en vigueur depuis le 1er avril 2026 : 60 000 € HT fournitures/services, 100 000 € HT travaux (Décrets 2025-1386/1383).', severity: 'info' },
  { id: 'bourses2526', date: '2025-09-01', message: 'Vérifiez les montants des bourses 2025-2026 : les taux sont révisés chaque année par arrêté. Mettez à jour les échelons si nécessaire.', severity: 'warning' },
  { id: 'rgp2023', date: '2023-01-01', message: 'Régime RGP (Ordonnance 2022-408) en vigueur depuis le 1er janvier 2023 — remplace définitivement le régime RPP.', severity: 'info' },
];

const DISMISSED_KEY = 'cic_expert_dismissed_banners';

export function RegulatoryUpdateBanner() {
  const [dismissed, setDismissed] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]'); } catch { return []; }
  });

  const dismiss = (id: string) => {
    const next = [...dismissed, id];
    setDismissed(next);
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(next));
  };

  const visible = UPDATES.filter(u => !dismissed.includes(u.id));
  if (visible.length === 0) return null;

  return (
    <div className="space-y-1 px-6 pt-4">
      {visible.map(u => (
        <div key={u.id} className={`flex items-start gap-2 rounded-lg px-3 py-2 text-xs ${u.severity === 'warning' ? 'bg-orange-50 text-orange-800 dark:bg-orange-950/30 dark:text-orange-300 border border-orange-200 dark:border-orange-800' : 'bg-primary/5 text-primary border border-primary/20'}`}>
          <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span className="flex-1"><strong>{u.date}</strong> — {u.message}</span>
          <button onClick={() => dismiss(u.id)} className="shrink-0 hover:opacity-70"><X className="h-3.5 w-3.5" /></button>
        </div>
      ))}
    </div>
  );
}
