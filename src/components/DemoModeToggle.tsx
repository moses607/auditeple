/**
 * Toggle visible du mode démonstration.
 * Affiche un bouton dans le header + un badge quand le mode est actif.
 * Synchronisé avec localStorage `cic_demo_mode` via lib/demo-mode.ts.
 */
import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isDemoMode, setDemoMode } from '@/lib/demo-mode';
import { toast } from 'sonner';

export function DemoModeToggle() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(isDemoMode());
    const onChange = (e: Event) => {
      const ce = e as CustomEvent<boolean>;
      setActive(!!ce.detail);
    };
    window.addEventListener('demo-mode-changed', onChange);
    return () => window.removeEventListener('demo-mode-changed', onChange);
  }, []);

  const toggle = () => {
    const next = !active;
    setDemoMode(next);
    toast.success(next ? 'Mode démonstration activé' : 'Mode démonstration désactivé', {
      description: next
        ? 'Données fictives Guadeloupe chargées (Lycée Baimbridge).'
        : 'Retour aux données réelles de l\'établissement.',
      duration: 2500,
    });
    // Recharge légère pour que les pages relisent les données démo
    setTimeout(() => window.location.reload(), 400);
  };

  return (
    <Button
      variant={active ? 'default' : 'ghost'}
      size="sm"
      onClick={toggle}
      className={
        active
          ? 'h-8 gap-1.5 bg-amber-500 hover:bg-amber-600 text-white shadow-sm no-print'
          : 'h-8 gap-1.5 text-muted-foreground hover:text-foreground no-print'
      }
      title={active ? 'Désactiver le mode démonstration' : 'Activer le mode démonstration (données fictives)'}
    >
      <Sparkles className="h-3.5 w-3.5" />
      <span className="text-xs font-medium hidden sm:inline">
        {active ? 'Démo active' : 'Mode démo'}
      </span>
    </Button>
  );
}
