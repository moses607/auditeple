import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { useAuditParams } from '@/hooks/useAuditStore';
import { getSelectedEtablissement } from '@/lib/types';
import { Building2, MapPin, ChevronDown } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { params, update } = useAuditParams();
  const current = getSelectedEtablissement(params);
  const hasEtabs = params.etablissements.length > 0;

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
            {hasEtabs ? (
              <div className="flex items-center gap-2">
                <Select
                  value={params.selectedEtablissementId}
                  onValueChange={(id) => update({ selectedEtablissementId: id })}
                >
                  <SelectTrigger className="h-8 w-auto min-w-[220px] max-w-[400px] bg-primary/5 border-primary/20 text-xs">
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
                <NavLink to="/parametres" className="text-xs text-primary underline hover:no-underline ml-1">
                  Gérer
                </NavLink>
              </div>
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
