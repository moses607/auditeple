/**
 * AppSidebar — Parcours d'Audit en 7 étapes (Sprint 4).
 *
 * - Étapes affichées dans l'ordre du workflow (Préparer → Suivre)
 * - Étape contenant la route active : ouverte par défaut
 * - Mini-mode (collapsed) : icônes + numéro d'étape uniquement
 * - Progression par étape calculée depuis useAuditProgress
 */
import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FileText, Pencil, Check, BarChart3, ChevronDown, ShieldCheck, Map as MapIcon, GitFork, ListChecks, Settings as SettingsIcon, Calculator } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel,
  SidebarGroupContent, SidebarMenu, SidebarMenuItem,
  SidebarMenuButton, SidebarHeader, SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ICON_MAP } from '@/lib/icon-map';
import { useModules } from '@/hooks/useModules';
import { useAuditProgress } from '@/hooks/useAuditProgress';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import logoImg from '@/assets/logo-circle.png';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { loadState } from '@/lib/store';
import { getAlertesAC } from '@/lib/calendrier-mail';
import type { ActiviteCalendrier } from '@/lib/calendrier-types';
import { PARCOURS_ETAPES, getOrphanModuleIds, getEtapeForModule } from '@/lib/audit-parcours';

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const [modules, updateModules] = useModules();
  const [editMode, setEditMode] = useState(false);
  const auditProgress = useAuditProgress();
  const [calendrierAlertes, setCalendrierAlertes] = useState(0);

  useEffect(() => {
    const acts = loadState<ActiviteCalendrier[]>('calendrier_annuel_v1', []);
    setCalendrierAlertes(getAlertesAC(acts).total);
  }, [location.pathname]);

  const toggleModule = (id: string) => {
    updateModules(modules.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m));
  };

  const enabledCount = modules.filter(m => m.enabled).length;
  const moduleById = useMemo(() => new Map(modules.map(m => [m.id, m])), [modules]);

  // Étape contenant la route active → ouverte par défaut
  const activeEtapeId = useMemo(() => {
    const activeMod = modules.find(m => location.pathname === m.path || location.pathname.startsWith(m.path + '/'));
    if (!activeMod) return null;
    return getEtapeForModule(activeMod.id)?.id ?? null;
  }, [location.pathname, modules]);

  const [openEtapes, setOpenEtapes] = useState<Record<string, boolean>>({});
  // Garder l'étape active toujours ouverte
  useEffect(() => {
    if (activeEtapeId) setOpenEtapes(prev => ({ ...prev, [activeEtapeId]: true }));
  }, [activeEtapeId]);

  // Progression par étape (basée sur les modules activés et leur completion)
  const etapeStats = useMemo(() => {
    const stats: Record<string, { done: number; total: number; pct: number }> = {};
    PARCOURS_ETAPES.forEach(et => {
      const mods = et.moduleIds.map(id => moduleById.get(id)).filter(Boolean);
      const enabled = mods.filter(m => m!.enabled);
      let done = 0, total = 0;
      enabled.forEach(m => {
        const sec = auditProgress.sections[m!.section];
        if (sec) {
          done += sec.checked / Math.max(1, mods.length);
          total += sec.total / Math.max(1, mods.length);
        }
      });
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;
      stats[et.id] = { done: Math.round(done), total: Math.round(total), pct };
    });
    return stats;
  }, [moduleById, auditProgress]);

  // Tous les modules sont rattachés à une étape ou au Triptyque CICF (plus d'orphelins).
  void getOrphanModuleIds;

  const renderModuleItem = (mod: typeof modules[number]) => {
    const Icon = ICON_MAP[mod.icon] || FileText;
    const isActive = location.pathname === mod.path || location.pathname.startsWith(mod.path + '/');
    return (
      <SidebarMenuItem key={mod.id}>
        <div className="flex items-center w-full">
          {editMode && !collapsed && (
            <div className="flex items-center pl-2 pr-0 shrink-0" onClick={e => e.stopPropagation()}>
              <Checkbox checked={mod.enabled} onCheckedChange={() => toggleModule(mod.id)} className="h-3.5 w-3.5" />
            </div>
          )}
          <SidebarMenuButton asChild isActive={isActive}
            className={cn('flex-1', editMode && !mod.enabled && 'opacity-50')}>
            <NavLink to={mod.path} className="flex items-center gap-2"
              activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium">
              <Icon className="h-4 w-4" />
              {!collapsed && <span className="truncate">{mod.label}</span>}
              {!collapsed && mod.id === 'calendrier-annuel' && calendrierAlertes > 0 && (
                <Badge variant="destructive" className="ml-auto h-4 min-w-4 px-1 text-[9px] font-bold tabular-nums shrink-0">
                  {calendrierAlertes}
                </Badge>
              )}
              {!editMode && mod.enabled && !(mod.id === 'calendrier-annuel' && calendrierAlertes > 0) && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
              )}
            </NavLink>
          </SidebarMenuButton>
        </div>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        {!collapsed ? (
          <div className="px-3 py-4">
            <div className="flex items-center gap-2.5">
              <img src={logoImg} alt="CIC Expert Pro" className="h-9 w-9 rounded-lg object-contain" />
              <div>
                <h2 className="text-sm font-bold tracking-wide text-sidebar-primary-foreground">CIC Expert Pro</h2>
                <p className="text-[10px] text-sidebar-foreground/50 mt-0.5 tracking-wider uppercase">Parcours d'audit en 7 étapes</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-3">
            <img src={logoImg} alt="CIC Expert Pro" className="h-8 w-8 rounded-lg object-contain" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        {/* Paramètres (en tête — multi-groupements) */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === '/parametres'}>
                  <NavLink to="/parametres" className="flex items-center gap-2"
                    activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium">
                    <SettingsIcon className="h-4 w-4" />
                    {!collapsed && <span className="font-medium">Paramètres</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === '/'}>
                  <NavLink to="/" className="flex items-center gap-2"
                    activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium">
                    <BarChart3 className="h-4 w-4" />
                    {!collapsed && <span>Tableau de bord</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname.startsWith('/outils/calculateurs')}>
                  <NavLink to="/outils/calculateurs" className="flex items-center gap-2"
                    activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium">
                    <Calculator className="h-4 w-4" />
                    {!collapsed && <span>Calculateurs <span className="ml-1 text-[9px] text-muted-foreground">(15)</span></span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ═══ Triptyque CICF — Cartographie · Organigramme · Plan d'action ═══ */}
        {(() => {
          const triptyqueIds = ['cartographie', 'organigramme', 'plan-action'] as const;
          const triptyqueMods = triptyqueIds
            .map(id => moduleById.get(id))
            .filter(Boolean) as typeof modules;
          if (triptyqueMods.length === 0) return null;
          return (
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <div className={cn(
                  'w-full flex items-center gap-2 px-2 py-1.5 rounded-md',
                  'bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20',
                )}>
                    <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                  {!collapsed && (
                    <span className="flex-1 text-left text-[11px] font-bold tracking-wide uppercase text-primary">
                      Triptyque CICF · Organigramme · Risques · Plan
                    </span>
                  )}
                </div>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>{triptyqueMods.map(renderModuleItem)}</SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })()}

        {/* ═══ Les 7 étapes du parcours ═══ */}
        {PARCOURS_ETAPES.map(etape => {
          const EtapeIcon = etape.icon;
          const isOpen = openEtapes[etape.id] ?? activeEtapeId === etape.id;
          const isActive = activeEtapeId === etape.id;
          const stats = etapeStats[etape.id];
          const etapeMods = etape.moduleIds
            .map(id => moduleById.get(id))
            .filter(Boolean) as typeof modules;

          if (etapeMods.length === 0) return null;

          return (
            <SidebarGroup key={etape.id}>
              <Collapsible open={isOpen} onOpenChange={(o) => setOpenEtapes(prev => ({ ...prev, [etape.id]: o }))}>
                <SidebarGroupLabel asChild>
                  <CollapsibleTrigger className={cn(
                    'group/etape w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors',
                    'hover:bg-sidebar-accent/40',
                    isActive && 'bg-sidebar-accent/30',
                  )}>
                    <span className={cn(
                      'flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-bold shrink-0',
                      isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'bg-sidebar-accent/60 text-sidebar-foreground/70',
                    )}>
                      {etape.numero}
                    </span>
                    <EtapeIcon className={cn('h-3.5 w-3.5 shrink-0', isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/60')} />
                    {!collapsed && (
                      <>
                        <span className={cn(
                          'flex-1 text-left text-[11px] font-bold tracking-wide uppercase',
                          isActive ? 'text-sidebar-primary-foreground' : 'text-sidebar-foreground/80',
                        )}>
                          {etape.label}
                        </span>
                        {stats?.total > 0 && (
                          <span className="text-[9px] font-mono tabular-nums text-sidebar-foreground/40">
                            {stats.pct}%
                          </span>
                        )}
                        <ChevronDown className={cn(
                          'h-3 w-3 transition-transform text-sidebar-foreground/40',
                          isOpen && 'rotate-180',
                        )} />
                      </>
                    )}
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {etapeMods.map(renderModuleItem)}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </Collapsible>
            </SidebarGroup>
          );
        })}

{/* Modules orphelins masqués : tous les modules sont désormais rattachés à une étape ou au Triptyque CICF. */}
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
              <button onClick={() => setEditMode(!editMode)}
                className={cn('flex items-center gap-1 text-xs transition-colors',
                  editMode ? 'text-primary font-medium' : 'text-sidebar-primary hover:underline')}>
                {editMode ? <><Check className="h-3 w-3" /> Terminé</> : <><Pencil className="h-3 w-3" /> Périmètre</>}
              </button>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
