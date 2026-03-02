import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Settings, ClipboardCheck, UserCheck, Receipt, CreditCard,
  Plane, FileText, Calculator, BookOpen, TrendingUp, CheckSquare, Square
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel,
  SidebarGroupContent, SidebarMenu, SidebarMenuItem,
  SidebarMenuButton, SidebarHeader, SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';
import { ModuleConfig, getModules, saveModules } from '@/lib/audit-modules';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

const ICON_MAP: Record<string, React.ElementType> = {
  Settings, ClipboardCheck, UserCheck, Receipt, CreditCard,
  Plane, FileText, Calculator, BookOpen, TrendingUp,
};

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const [modules, setModules] = useState<ModuleConfig[]>(getModules);
  const [editMode, setEditMode] = useState(false);

  const toggleModule = (id: string) => {
    const updated = modules.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m);
    setModules(updated);
    saveModules(updated);
  };

  const enabledCount = modules.filter(m => m.enabled).length;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        {!collapsed && (
          <div className="px-2 py-3">
            <h2 className="text-sm font-bold tracking-wide text-sidebar-primary-foreground">
              CIC EXPERT PRO
            </h2>
            <p className="text-xs text-sidebar-foreground/60 mt-0.5">
              Contrôle Interne Comptable
            </p>
          </div>
        )}
        {collapsed && (
          <div className="flex items-center justify-center py-3">
            <span className="text-xs font-bold text-sidebar-primary-foreground">CIC</span>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between">
            <span>Modules d'audit</span>
            {!collapsed && (
              <button
                onClick={() => setEditMode(!editMode)}
                className="text-xs text-sidebar-primary hover:underline"
              >
                {editMode ? 'Terminé' : 'Sélectionner'}
              </button>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {modules.map((mod) => {
                const Icon = ICON_MAP[mod.icon] || FileText;
                const isActive = location.pathname === mod.path || 
                  location.pathname.startsWith(mod.path + '/');
                
                if (!mod.enabled && !editMode) return null;

                return (
                  <SidebarMenuItem key={mod.id}>
                    <SidebarMenuButton
                      asChild={!editMode}
                      isActive={isActive && !editMode}
                      className={cn(!mod.enabled && 'opacity-50')}
                      onClick={editMode ? () => toggleModule(mod.id) : undefined}
                    >
                      {editMode ? (
                        <div className="flex items-center gap-2 w-full cursor-pointer">
                          {mod.enabled ? (
                            <CheckSquare className="h-4 w-4 text-sidebar-primary" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                          {!collapsed && <span className="text-sm">{mod.label}</span>}
                        </div>
                      ) : (
                        <NavLink
                          to={mod.path}
                          className="flex items-center gap-2"
                          activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        >
                          <Icon className="h-4 w-4" />
                          {!collapsed && <span>{mod.label}</span>}
                        </NavLink>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {!collapsed && (
          <div className="px-2 py-2 text-xs text-sidebar-foreground/50">
            <Badge variant="outline" className="text-[10px] border-sidebar-border text-sidebar-foreground/60">
              {enabledCount} module{enabledCount > 1 ? 's' : ''} actif{enabledCount > 1 ? 's' : ''}
            </Badge>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
