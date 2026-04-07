import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { useAuditParams } from '@/hooks/useAuditStore';
import { getSelectedEtablissement } from '@/lib/types';
import { Building2, MapPin, LogOut, Moon, Sun } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import logoImg from '@/assets/logo-circle.png';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { params, update } = useAuditParams();
  const { signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const current = getSelectedEtablissement(params);
  const hasEtabs = params.etablissements.length > 0;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-border bg-card/90 backdrop-blur-md px-4 shrink-0 shadow-sm sticky top-0 z-30">
            <SidebarTrigger className="mr-4" />
            <div className="flex items-center gap-2 flex-1">
              <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
                <span className="text-[10px] font-bold text-primary-foreground">CIC</span>
              </div>
              <span className="text-sm font-semibold text-foreground tracking-tight hidden sm:inline">
                CIC Expert Pro
              </span>
            </div>
            {hasEtabs ? (
              <div className="flex items-center gap-2">
                <Select
                  value={params.selectedEtablissementId}
                  onValueChange={(id) => update({ selectedEtablissementId: id })}
                >
                  <SelectTrigger className="h-8 w-auto min-w-[220px] max-w-[400px] bg-primary/5 border-primary/20 text-xs rounded-lg">
                    <Building2 className="h-3.5 w-3.5 text-primary mr-1.5 shrink-0" />
                    <SelectValue placeholder="Sélectionner un établissement" />
                  </SelectTrigger>
                  <SelectContent>
                    {params.etablissements.map(e => (
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
            ) : (
              <NavLink to="/parametres" className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-muted transition-colors">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Aucun établissement — Saisir un UAI</span>
              </NavLink>
            )}
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="ml-2 text-muted-foreground hover:text-foreground" title="Basculer le thème">
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={signOut} className="text-muted-foreground hover:text-destructive" title="Déconnexion">
              <LogOut className="h-4 w-4" />
            </Button>
          </header>
          <main className="flex-1 overflow-auto p-6 bg-background">
            {children}
          </main>
          <footer className="h-8 flex items-center justify-center border-t border-border bg-card/50 text-[10px] text-muted-foreground/50 shrink-0 px-4 gap-4 no-print">
            <span>CIC Expert Pro v7.0</span>
            <span>•</span>
            <span>M9-6 · GBCP · Code Éducation</span>
            <span>•</span>
            <span>Données stockées localement</span>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}
