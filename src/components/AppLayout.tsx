import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { useAuditParams } from '@/hooks/useAuditStore';
import { getSelectedEtablissement } from '@/lib/types';
import { useGroupements, useEtablissements } from '@/hooks/useGroupements';
import { useMemo } from 'react';
import { Building2, MapPin, LogOut, Moon, Sun } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { RegulatoryUpdateBanner } from '@/components/RegulatoryUpdateBanner';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import logoImg from '@/assets/logo-circle.png';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { SmartBreadcrumb } from '@/components/SmartBreadcrumb';
import { OnboardingWizard } from '@/components/OnboardingWizard';
import { EtapeSuivante } from '@/components/EtapeSuivante';
import { DemoModeToggle } from '@/components/DemoModeToggle';
import { isDemoMode } from '@/lib/demo-mode';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { params, update } = useAuditParams();
  const { signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { activeId } = useGroupements();
  const { etablissements: dbEtabs } = useEtablissements(activeId);

  // Fusionne les établissements DB (source de vérité multi-groupements) avec
  // les anciens stockés en localStorage afin de garder la rétro-compatibilité.
  const mergedEtabs = useMemo(() => {
    const fromDb = dbEtabs.map(e => ({
      id: e.id,
      uai: e.uai,
      nom: e.nom,
      ville: e.ville ?? '',
    }));
    const seen = new Set(fromDb.map(e => e.uai));
    const fromLocal = params.etablissements.filter(e => !seen.has(e.uai));
    return [...fromDb, ...fromLocal];
  }, [dbEtabs, params.etablissements]);

  const hasEtabs = mergedEtabs.length > 0;
  const current =
    mergedEtabs.find(e => e.id === params.selectedEtablissementId) ??
    mergedEtabs[0] ??
    getSelectedEtablissement(params);

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-border bg-card/90 backdrop-blur-md px-4 shrink-0 shadow-sm sticky top-0 z-30">
            <SidebarTrigger className="mr-4" />
            <div className="flex items-center gap-2 flex-1">
              <img src={logoImg} alt="CIC Expert Pro" className="h-8 w-8 rounded-md object-contain" />
              <span className="text-sm font-semibold text-foreground tracking-tight hidden sm:inline">
                CIC Expert Pro
              </span>
            </div>
            {hasEtabs ? (
              <>
                {current && (
                  <span className="text-xs font-medium text-foreground truncate max-w-[120px] md:hidden">
                    {current.nom}
                  </span>
                )}
                <div className="hidden md:flex items-center gap-2">
                <Select
                  value={current?.id ?? ''}
                  onValueChange={(id) => update({ selectedEtablissementId: id })}
                >
                  <SelectTrigger className="h-8 w-auto min-w-[220px] max-w-[400px] bg-primary/5 border-primary/20 text-xs rounded-lg">
                    <Building2 className="h-3.5 w-3.5 text-primary mr-1.5 shrink-0" />
                    <SelectValue placeholder="Sélectionner un établissement" />
                  </SelectTrigger>
                  <SelectContent>
                    {mergedEtabs.map(e => (
                      <SelectItem key={e.id} value={e.id} className="text-xs">
                        <span className="font-semibold">{e.nom}</span>
                        <span className="text-muted-foreground ml-2">({e.uai})</span>
                        {e.ville && <span className="text-muted-foreground ml-1">— {e.ville}</span>}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {current && (
                  <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {current.ville}
                  </div>
                )}
                <NavLink to="/parametres" className="text-xs text-primary hover:underline ml-1 font-medium">
                  Gérer
                </NavLink>
                </div>
              </>
            ) : (
              <NavLink to="/parametres" className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-muted transition-colors">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Aucun établissement — Saisir un UAI</span>
              </NavLink>
            )}
            <DemoModeToggle />
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="ml-2 text-muted-foreground hover:text-foreground" title="Basculer le thème">
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <span className="text-[10px] text-green-500 font-mono ml-2 hidden sm:inline">● Session active</span>
            <Button variant="ghost" size="icon" onClick={signOut} className="text-muted-foreground hover:text-destructive" title="Déconnexion">
              <LogOut className="h-4 w-4" />
            </Button>
          </header>
          <RegulatoryUpdateBanner />
          <SmartBreadcrumb />
          <main className="flex-1 overflow-auto p-4 md:p-6 bg-background pb-20 md:pb-6">
            {children}
            <div className="max-w-5xl mx-auto">
              <EtapeSuivante />
            </div>
          </main>
          <footer className="min-h-[2rem] hidden md:flex flex-wrap items-center justify-center border-t border-border bg-card/50 text-[10px] text-muted-foreground/50 shrink-0 px-4 gap-x-4 gap-y-1 py-1 no-print">
            <span>CIC Expert Pro v8.0</span>
            <span>•</span>
            <span>M9-6 · GBCP · Code Éducation · Décrets 2025-1386/1383</span>
            <span>•</span>
            <span>Données locales — Compte Supabase</span>
            <span>•</span>
            <span>Outil d'aide à l'audit — ne se substitue pas aux textes officiels</span>
            <span>•</span>
            <NavLink to="/mentions-legales" className="hover:text-foreground underline">Mentions légales</NavLink>
            <span>•</span>
            <NavLink to="/politique-confidentialite" className="hover:text-foreground underline">Confidentialité</NavLink>
          </footer>
          <MobileBottomNav />
        </div>
        <OnboardingWizard />
      </div>
    </SidebarProvider>
  );
}
