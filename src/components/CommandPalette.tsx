/**
 * Command Palette (⌘K / Ctrl+K) — recherche globale dans toute l'application.
 * Inclut : modules, calculateurs, domaines d'audit, audits récents, mode démo.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList, CommandSeparator, CommandShortcut,
} from '@/components/ui/command';
import { ICON_MAP } from '@/lib/icon-map';
import { getModules } from '@/lib/audit-modules';
import {
  Sparkles, Settings, FileText, BarChart3, Sun, Moon,
  Presentation, ClipboardList, Calendar, AlertTriangle, Calculator,
  ShieldCheck, Target, Wand2,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { aggregateCockpit } from '@/lib/cockpit-aggregator';
import { CALCULATEURS } from '@/lib/calculateurs';
import { DOMAINES_AUDIT } from '@/lib/audit-parcours';
import { isDemoMode, setDemoMode } from '@/lib/demo-mode';
import { supabase } from '@/integrations/supabase/client';
import { getActiveGroupementId } from '@/hooks/useGroupements';
import { toast } from 'sonner';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [recentAudits, setRecentAudits] = useState<{ id: string; libelle: string; status: string }[]>([]);
  const navigate = useNavigate();
  const { setTheme } = useTheme();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(o => !o);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Charge les 5 derniers audits du groupement actif quand on ouvre
  useEffect(() => {
    if (!open) return;
    const gid = getActiveGroupementId();
    if (!gid) return;
    supabase.from('audits').select('id,libelle,status').eq('groupement_id', gid)
      .order('created_at', { ascending: false }).limit(5)
      .then(({ data }) => setRecentAudits(data ?? []));
  }, [open]);

  const modules = getModules();
  const cockpit = aggregateCockpit();

  const go = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  const togglePresentationMode = () => {
    document.body.classList.toggle('presentation-mode');
    setOpen(false);
  };

  const toggleDemo = () => {
    const next = !isDemoMode();
    setDemoMode(next);
    toast[next ? 'success' : 'info'](next ? '🇬🇵 Mode démo Guadeloupe activé' : 'Mode démo désactivé');
    setOpen(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Rechercher : module, calculateur, domaine, audit, action…" value={search} onValueChange={setSearch} />
      <CommandList className="max-h-[450px]">
        <CommandEmpty>Aucun résultat.</CommandEmpty>

        {/* Actions rapides */}
        <CommandGroup heading="Navigation principale">
          <CommandItem onSelect={() => go('/')} value="tableau de bord cockpit accueil">
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Tableau de bord</span>
            <CommandShortcut>⌘1</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => go('/audit-config')} value="lancer audit nouveau sélectif">
            <ShieldCheck className="mr-2 h-4 w-4" />
            <span>Lancer un nouvel audit sélectif</span>
          </CommandItem>
          <CommandItem onSelect={() => go('/calendrier-annuel')} value="calendrier annuel ac alertes">
            <Calendar className="mr-2 h-4 w-4" />
            <span>Calendrier annuel AC</span>
          </CommandItem>
          <CommandItem onSelect={() => go('/pv-audit')} value="pv audit liste">
            <ClipboardList className="mr-2 h-4 w-4" />
            <span>PV d'audit consolidés</span>
          </CommandItem>
          <CommandItem onSelect={() => go('/parametres')} value="paramètres équipe groupement">
            <Settings className="mr-2 h-4 w-4" />
            <span>Paramètres & équipe</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Top alertes — accès direct */}
        {cockpit.topActions.length > 0 && (
          <>
            <CommandGroup heading="🔴 Alertes prioritaires">
              {cockpit.topActions.map(a => (
                <CommandItem key={a.id} onSelect={() => a.modulePath && go(a.modulePath)} value={`alerte ${a.titre} ${a.source}`}>
                  <AlertTriangle className="mr-2 h-4 w-4 text-destructive" />
                  <span className="truncate">{a.titre}</span>
                  <span className="ml-auto text-[10px] text-muted-foreground">{a.source}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Audits récents */}
        {recentAudits.length > 0 && (
          <>
            <CommandGroup heading="📋 Audits récents">
              {recentAudits.map(a => (
                <CommandItem
                  key={a.id}
                  value={`audit ${a.libelle}`}
                  onSelect={() => go(a.status === 'en_cours' ? `/audit-execution/${a.id}` : `/pv-audit/${a.id}`)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span className="truncate">{a.libelle}</span>
                  <span className="ml-auto text-[10px] text-muted-foreground">{a.status}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Calculateurs */}
        <CommandGroup heading="🧮 Calculateurs (15)">
          {CALCULATEURS.map(c => {
            const Icon = c.icon;
            return (
              <CommandItem
                key={c.id}
                value={`calculateur ${c.label} ${c.categorie} ${(c.keywords ?? []).join(' ')}`}
                onSelect={() => go(`/outils/calculateurs/${c.id}`)}
              >
                <Icon className="mr-2 h-4 w-4" />
                <span className="truncate">{c.label}</span>
                <span className="ml-auto text-[10px] text-muted-foreground">{c.categorie}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        {/* Domaines d'audit M9-6 */}
        <CommandGroup heading="🎯 Domaines d'audit (M9-6)">
          {DOMAINES_AUDIT.map(d => (
            <CommandItem
              key={d.id}
              value={`domaine ${d.label} ${d.lettre}`}
              onSelect={() => go('/audit-config')}
            >
              <Target className="mr-2 h-4 w-4" />
              <span className="font-bold mr-2">{d.lettre}</span>
              <span className="truncate">{d.label}</span>
              <span className="ml-auto text-[10px] text-muted-foreground">{d.checklist.length} pts</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Modules */}
        <CommandGroup heading="Modules d'audit">
          {modules.map(m => {
            const Icon = ICON_MAP[m.icon] || FileText;
            return (
              <CommandItem key={m.id} onSelect={() => go(m.path)} value={`module ${m.label} ${m.section}`}>
                <Icon className="mr-2 h-4 w-4" />
                <span>{m.label}</span>
                <span className="ml-auto text-[10px] text-muted-foreground">{m.section}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        {/* Préférences */}
        <CommandGroup heading="Préférences & démo">
          <CommandItem onSelect={toggleDemo} value="mode demo guadeloupe rectorat">
            <Wand2 className="mr-2 h-4 w-4" />
            <span>{isDemoMode() ? 'Désactiver' : 'Activer'} mode démo Guadeloupe</span>
          </CommandItem>
          <CommandItem onSelect={() => { setTheme('light'); setOpen(false); }}>
            <Sun className="mr-2 h-4 w-4" /><span>Thème clair</span>
          </CommandItem>
          <CommandItem onSelect={() => { setTheme('dark'); setOpen(false); }}>
            <Moon className="mr-2 h-4 w-4" /><span>Thème sombre</span>
          </CommandItem>
          <CommandItem onSelect={togglePresentationMode}>
            <Presentation className="mr-2 h-4 w-4" />
            <span>Mode présentation</span>
            <CommandShortcut>P</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => {
            setOpen(false);
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'j', ctrlKey: true }));
          }}>
            <Sparkles className="mr-2 h-4 w-4" />
            <span>Ouvrir l'assistant IA</span>
            <CommandShortcut>⌘J</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
