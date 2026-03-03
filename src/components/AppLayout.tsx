import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { useAuditParams } from '@/hooks/useAuditStore';
import { Building2, MapPin } from 'lucide-react';
import { NavLink } from '@/components/NavLink';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { params } = useAuditParams();
  const hasEtablissement = !!params.etablissement && !!params.uai;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b border-border bg-card px-4 shrink-0">
            <SidebarTrigger className="mr-4" />
            <span className="text-sm font-medium text-muted-foreground flex-1">
              CIC Expert Pro — Audit comptable EPLE
            </span>
            {hasEtablissement ? (
              <NavLink to="/parametres" className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors">
                <Building2 className="h-4 w-4 text-primary" />
                <div className="text-xs leading-tight">
                  <span className="font-semibold text-foreground">{params.etablissement}</span>
                  <span className="text-muted-foreground ml-2">UAI {params.uai}</span>
                  {params.ville && (
                    <span className="text-muted-foreground flex items-center gap-0.5 inline-flex ml-2">
                      <MapPin className="h-3 w-3" />
                      {params.ville}
                    </span>
                  )}
                </div>
              </NavLink>
            ) : (
              <NavLink to="/parametres" className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-muted transition-colors">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Aucun établissement — Saisir un UAI</span>
              </NavLink>
            )}
          </header>
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
