/**
 * Mode Présentation — touche P pour basculer.
 * Cache la sidebar, agrandit les polices, masque les éléments accessoires.
 * Idéal pour démos académiques en grand écran.
 */
import { useEffect, useState } from 'react';
import { Presentation, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function PresentationModeToggle() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore quand l'utilisateur tape dans un input
      const target = e.target as HTMLElement;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable) return;
      if (e.key === 'p' || e.key === 'P') {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        setActive(a => !a);
      }
      if (e.key === 'Escape' && active) {
        setActive(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [active]);

  useEffect(() => {
    if (active) {
      document.documentElement.classList.add('presentation-mode');
      toast.success('Mode présentation activé', {
        description: 'Appuyez sur P ou Echap pour quitter',
        duration: 2000,
      });
    } else {
      document.documentElement.classList.remove('presentation-mode');
    }
    return () => document.documentElement.classList.remove('presentation-mode');
  }, [active]);

  if (!active) return null;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 bg-primary text-primary-foreground px-3 py-1.5 rounded-full shadow-elevated flex items-center gap-2 text-xs no-print">
      <Presentation className="h-3.5 w-3.5" />
      <span className="font-semibold">Mode présentation</span>
      <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-primary-foreground/20" onClick={() => setActive(false)}>
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}
