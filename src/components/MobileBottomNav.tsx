import { useLocation } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
import { BarChart3, Calculator, ClipboardCheck, ClipboardList, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/', icon: BarChart3, label: 'Tableau' },
  { to: '/regies', icon: Calculator, label: 'Régies' },
  { to: '/verification', icon: ClipboardCheck, label: 'Vérif.' },
  { to: '/pv-audit', icon: ClipboardList, label: 'PV' },
  { to: '/parametres', icon: Settings, label: 'Params' },
];

export function MobileBottomNav() {
  const location = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border md:hidden safe-area-inset-bottom">
      <div className="flex items-center justify-around h-14">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
          const isActive = to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                'flex flex-col items-center gap-0.5 text-[10px] px-2 py-1 rounded-md transition-colors',
                isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
