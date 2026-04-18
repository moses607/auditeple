/**
 * SmartBreadcrumb — Fil d'Ariane intelligent.
 *
 * Affiche : Étape parcours → Module courant
 * Permet de naviguer rapidement vers les autres modules de la même étape.
 */
import { useLocation, Link } from 'react-router-dom';
import { useMemo } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useModules } from '@/hooks/useModules';
import { getEtapeForModule, PARCOURS_ETAPES } from '@/lib/audit-parcours';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuLabel, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ICON_MAP } from '@/lib/icon-map';
import { FileText } from 'lucide-react';

export function SmartBreadcrumb() {
  const location = useLocation();
  const [modules] = useModules();

  const ctx = useMemo(() => {
    if (location.pathname === '/' || location.pathname === '') return null;
    const mod = modules.find(m =>
      location.pathname === m.path || location.pathname.startsWith(m.path + '/')
    );
    if (!mod) return null;
    const etape = getEtapeForModule(mod.id);
    return { mod, etape };
  }, [location.pathname, modules]);

  if (!ctx) return null;

  const { mod, etape } = ctx;
  const ModIcon = ICON_MAP[mod.icon] || FileText;
  const siblings = etape
    ? etape.moduleIds.map(id => modules.find(m => m.id === id)).filter(Boolean).filter(m => m!.id !== mod.id)
    : [];

  return (
    <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-xs text-muted-foreground px-4 py-2 border-b border-border bg-muted/30 no-print overflow-x-auto whitespace-nowrap">
      <Link to="/" className="flex items-center gap-1 hover:text-foreground transition-colors shrink-0">
        <Home className="h-3 w-3" />
        <span>Accueil</span>
      </Link>

      {etape && (
        <>
          <ChevronRight className="h-3 w-3 opacity-50 shrink-0" />
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 hover:text-foreground transition-colors shrink-0 group">
              <span className={cn(
                'flex items-center justify-center h-4 w-4 rounded-full text-[9px] font-bold bg-primary/10 text-primary',
              )}>
                {etape.numero}
              </span>
              <etape.icon className="h-3 w-3" />
              <span className="font-medium">{etape.label}</span>
              <span className="text-[10px] opacity-60 group-hover:opacity-100">▾</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72">
              <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Étape {etape.numero} — {etape.verbe}
              </DropdownMenuLabel>
              <p className="px-2 pb-2 text-xs text-muted-foreground">{etape.description}</p>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Autres modules de l'étape
              </DropdownMenuLabel>
              {siblings.length === 0 && (
                <p className="px-2 py-2 text-xs text-muted-foreground italic">Aucun autre module.</p>
              )}
              {siblings.map(s => {
                const SIcon = ICON_MAP[s!.icon] || FileText;
                return (
                  <DropdownMenuItem key={s!.id} asChild>
                    <Link to={s!.path} className="flex items-center gap-2 cursor-pointer">
                      <SIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs">{s!.label}</span>
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}

      <ChevronRight className="h-3 w-3 opacity-50 shrink-0" />
      <span className="flex items-center gap-1.5 text-foreground font-semibold shrink-0">
        <ModIcon className="h-3 w-3" />
        {mod.label}
      </span>
    </nav>
  );
}
