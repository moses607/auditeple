import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Settings, ClipboardCheck, UserCheck, Receipt, CreditCard,
  Plane, FileText, Calculator, BookOpen, TrendingUp, CheckSquare, Square,
  Landmark, Package, Scale, GraduationCap, Heart, UtensilsCrossed,
  AlertTriangle, Target, Building, Building2, Map, GitFork, ListChecks,
  Calendar, ClipboardList, BarChart3, Shield,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel,
  SidebarGroupContent, SidebarMenu, SidebarMenuItem,
  SidebarMenuButton, SidebarHeader, SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';
import { ModuleConfig, saveModules, SECTIONS } from '@/lib/audit-modules';
import { useModules } from '@/hooks/useModules';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const ICON_MAP: Record<string, React.ElementType> = {
  Settings, ClipboardCheck, UserCheck, Receipt, CreditCard,
  Plane, FileText, Calculator, BookOpen, TrendingUp,
  Landmark, Package, Scale, GraduationCap, Heart, UtensilsCrossed,
  AlertTriangle, Target, Building, Building2, Map, GitFork, ListChecks,
  Calendar, ClipboardList, BarChart3,
};

const SECTION_DOT_COLORS: Record<string, string> = {
  'CONTRÔLES SUR PLACE': 'bg-section-controles',
  'VÉRIFICATION & ORDONNATEUR': 'bg-section-verification',
  'GESTION COMPTABLE': 'bg-section-comptable',
  'FINANCES & BUDGET': 'bg-section-finances',
  'CONTRÔLE INTERNE': 'bg-section-controle-interne',
  'AUDIT & RESTITUTION': 'bg-section-restitution',
};

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const [modules, updateModules] = useModules();
  const [editMode, setEditMode] = useState(false);

  const toggleModule = (id: string) => {
    const updated = modules.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m);
    updateModules(updated);
  };

  const enabledCount = modules.filter(m => m.enabled).length;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        {!collapsed ? (
          <div className="px-3 py-4">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
                <Shield className="h-4 w-4 text-sidebar-primary-foreground" />
              </div>
              <div>
                <h2 className="text-sm font-bold tracking-wide text-sidebar-primary-foreground">
                  CIC Expert Pro
                </h2>
                <p className="text-[10px] text-sidebar-foreground/50 mt-0.5 tracking-wider uppercase">
                  Audit comptable EPLE
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-3">
            <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <Shield className="h-4 w-4 text-sidebar-primary-foreground" />
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        {/* Dashboard link */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === '/'}>
                  <NavLink to="/" className="flex items-center gap-2" activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium">
                    <BarChart3 className="h-4 w-4" />
                    {!collapsed && <span>Tableau de Bord</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Module sections */}
        {SECTIONS.map(section => {
          const sectionModules = modules.filter(m => m.section === section);
          const isStructuralSection = section === 'AUDIT & RESTITUTION';
          // In edit mode show all, otherwise only enabled + structural
          const visibleModules = editMode ? sectionModules : sectionModules.filter(m => m.enabled || isStructuralSection);
          if (visibleModules.length === 0) return null;
          const dotColor = SECTION_DOT_COLORS[section] || 'bg-sidebar-primary';

          return (
            <SidebarGroup key={section}>
              <SidebarGroupLabel className="text-[9px] font-extrabold tracking-widest uppercase text-sidebar-foreground/40 flex items-center gap-1.5">
                {!collapsed && (
                  <>
                    <span className={cn('h-1.5 w-1.5 rounded-full', dotColor)} />
                    {section}
                  </>
                )}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleModules.map((mod) => {
                    const Icon = ICON_MAP[mod.icon] || FileText;
                    const isActive = location.pathname === mod.path ||
                      location.pathname.startsWith(mod.path + '/');

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
          );
        })}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {!collapsed && (
          <div className="px-3 py-3 flex items-center justify-between">
            <Badge variant="outline" className="text-[10px] border-sidebar-border text-sidebar-foreground/60">
              {enabledCount} module{enabledCount > 1 ? 's' : ''} actif{enabledCount > 1 ? 's' : ''}
            </Badge>
            <button
              onClick={() => setEditMode(!editMode)}
              className="text-xs text-sidebar-primary hover:underline transition-colors"
            >
              {editMode ? 'Terminé' : 'Sélectionner'}
            </button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
