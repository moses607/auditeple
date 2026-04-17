/**
 * Command Palette (⌘K / Ctrl+K) — recherche globale dans toute l'application.
 * Inclut : modules, actions rapides, paramètres, raccourcis présentation.
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
  Sparkles, Settings, Building2, FileText, BarChart3, Sun, Moon,
  Presentation, Search, ClipboardList, Calendar, AlertTriangle, MessageSquare,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { aggregateCockpit } from '@/lib/cockpit-aggregator';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
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

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Rechercher un module, un contrôle, une action…" value={search} onValueChange={setSearch} />
      <CommandList className="max-h-[400px]">
        <CommandEmpty>Aucun résultat.</CommandEmpty>

        {/* Actions rapides */}
        <CommandGroup heading="Navigation principale">
          <CommandItem onSelect={() => go('/')}>
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Tableau de bord cockpit</span>
            <CommandShortcut>⌘1</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => go('/calendrier-annuel')}>
            <Calendar className="mr-2 h-4 w-4" />
            <span>Calendrier annuel AC</span>
          </CommandItem>
          <CommandItem onSelect={() => go('/pv-audit')}>
            <ClipboardList className="mr-2 h-4 w-4" />
            <span>Générer le PV d'audit</span>
          </CommandItem>
          <CommandItem onSelect={() => go('/parametres')}>
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
                <CommandItem key={a.id} onSelect={() => a.modulePath && go(a.modulePath)}>
                  <AlertTriangle className="mr-2 h-4 w-4 text-destructive" />
                  <span className="truncate">{a.titre}</span>
                  <span className="ml-auto text-[10px] text-muted-foreground">{a.source}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Tous les modules */}
        <CommandGroup heading="Modules d'audit">
          {modules.map(m => {
            const Icon = ICON_MAP[m.icon] || FileText;
            return (
              <CommandItem key={m.id} onSelect={() => go(m.path)} value={`${m.label} ${m.section}`}>
                <Icon className="mr-2 h-4 w-4" />
                <span>{m.label}</span>
                <span className="ml-auto text-[10px] text-muted-foreground">{m.section}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        {/* Préférences */}
        <CommandGroup heading="Préférences">
          <CommandItem onSelect={() => { setTheme('light'); setOpen(false); }}>
            <Sun className="mr-2 h-4 w-4" />
            <span>Thème clair</span>
          </CommandItem>
          <CommandItem onSelect={() => { setTheme('dark'); setOpen(false); }}>
            <Moon className="mr-2 h-4 w-4" />
            <span>Thème sombre</span>
          </CommandItem>
          <CommandItem onSelect={togglePresentationMode}>
            <Presentation className="mr-2 h-4 w-4" />
            <span>Mode présentation (P)</span>
            <CommandShortcut>P</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Aide */}
        <CommandGroup heading="Aide">
          <CommandItem onSelect={() => { setOpen(false); /* déclenchera l'ouverture de l'IA */
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'j', ctrlKey: true })); }}>
            <Sparkles className="mr-2 h-4 w-4" />
            <span>Ouvrir l'assistant IA</span>
            <CommandShortcut>⌘J</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => go('/mentions-legales')}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Mentions légales & RGPD</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
