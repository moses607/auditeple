import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  FileText, Pencil, Check, BarChart3,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel,
  SidebarGroupContent, SidebarMenu, SidebarMenuItem,
  SidebarMenuButton, SidebarHeader, SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';
import { SECTIONS } from '@/lib/audit-modules';
import { ICON_MAP } from '@/lib/icon-map';
import { useModules } from '@/hooks/useModules';
import { useAuditProgress } from '@/hooks/useAuditProgress';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import logoImg from '@/assets/logo-circle.png';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';

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
  const auditProgress = useAuditProgress();

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

        {/* Module sections — always navigable */}
        {SECTIONS.map(section => {
          const sectionModules = modules.filter(m => m.section === section);
          if (sectionModules.length === 0) return null;
          const dotColor = SECTION_DOT_COLORS[section] || 'bg-sidebar-primary';

          return (
            <SidebarGroup key={section}>
              <SidebarGroupLabel className="text-[9px] font-extrabold tracking-widest uppercase text-sidebar-foreground/40 flex items-center gap-1.5">
                {!collapsed && (
                  <>
                    <span className={cn('h-1.5 w-1.5 rounded-full', dotColor)} />
                    <span className="flex-1">{section}</span>
                    {auditProgress.sections[section]?.total > 0 && (
                      <span className="text-[8px] font-bold text-sidebar-foreground/30 tabular-nums">
                        {auditProgress.sections[section].percentage}%
                      </span>
                    )}
                  </>
                )}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sectionModules.map((mod) => {
                    const Icon = ICON_MAP[mod.icon] || FileText;
                    const isActive = location.pathname === mod.path ||
                      location.pathname.startsWith(mod.path + '/');

                    return (
                      <SidebarMenuItem key={mod.id}>
                        <div className="flex items-center w-full">
                          {/* Checkbox for audit selection — only in edit mode */}
                          {editMode && !collapsed && (
                            <div
                              className="flex items-center pl-2 pr-0 shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Checkbox
                                checked={mod.enabled}
                                onCheckedChange={() => toggleModule(mod.id)}
                                className="h-3.5 w-3.5"
                              />
                            </div>
                          )}
                          {/* Navigation link — always clickable */}
                          <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            className={cn(
                              'flex-1',
                              editMode && !mod.enabled && 'opacity-50',
                            )}
                          >
                            <NavLink
                              to={mod.path}
                              className="flex items-center gap-2"
                              activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            >
                              <Icon className="h-4 w-4" />
                              {!collapsed && <span>{mod.label}</span>}
                              {!editMode && mod.enabled && (
                                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                              )}
                            </NavLink>
                          </SidebarMenuButton>
                        </div>
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
          <div className="px-3 py-3 space-y-2">
            {auditProgress.totalItems > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-sidebar-foreground/50">Score audit global</span>
                  <span className="text-[10px] font-bold text-sidebar-primary">{auditProgress.percentage}%</span>
                </div>
                <Progress value={auditProgress.percentage} className="h-1.5 bg-sidebar-accent [&>div]:bg-sidebar-primary" />
              </div>
            )}
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-[10px] border-sidebar-border text-sidebar-foreground/60">
                {enabledCount} module{enabledCount > 1 ? 's' : ''} actif{enabledCount > 1 ? 's' : ''}
              </Badge>
            <button
              onClick={() => setEditMode(!editMode)}
              className={cn(
                "flex items-center gap-1 text-xs transition-colors",
                editMode
                  ? "text-primary font-medium"
                  : "text-sidebar-primary hover:underline"
              )}
            >
              {editMode ? (
                <>
                  <Check className="h-3 w-3" />
                  Terminé
                </>
              ) : (
                <>
                  <Pencil className="h-3 w-3" />
                  Périmètre audit
                </>
              )}
            </button>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}