/**
 * AgentSelect — sélecteur d'agent branché sur la table agents du groupement actif.
 * Source unique de vérité Paramètres → zéro double saisie.
 *
 * Filtres optionnels :
 *  - roles    : ne propose que certains rôles (ex. responsables d'action)
 *  - includeText : affiche aussi un champ libre en haut (« Saisir manuellement »)
 *
 * La valeur retournée est le **label affichable** (Civilité PRENOM NOM — Rôle),
 * pour rester compatible avec les modules existants qui stockent un nom en string.
 */
import { useMemo } from 'react';
import { useAgents, useGroupements, getRoleLabel, AgentRole, AgentRow } from '@/hooks/useGroupements';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  value: string;
  onChange: (display: string, agent?: AgentRow) => void;
  roles?: AgentRole[];
  placeholder?: string;
  className?: string;
}

export function formatAgentDisplay(a: AgentRow): string {
  const civ = a.civilite ? `${a.civilite} ` : '';
  return `${civ}${a.prenom} ${a.nom.toUpperCase()} — ${getRoleLabel(a.role)}`;
}

export function AgentSelect({ value, onChange, roles, placeholder = 'Choisir un agent…', className }: Props) {
  const { activeId } = useGroupements();
  const { agents, loading } = useAgents(activeId);

  const filtered = useMemo(() => {
    let list = agents.filter(a => a.actif);
    if (roles && roles.length > 0) list = list.filter(a => roles.includes(a.role));
    return list;
  }, [agents, roles]);

  // Regroupement par rôle
  const groups = useMemo(() => {
    const map = new Map<AgentRole, AgentRow[]>();
    filtered.forEach(a => {
      if (!map.has(a.role)) map.set(a.role, []);
      map.get(a.role)!.push(a);
    });
    return Array.from(map.entries()).sort(([a], [b]) => getRoleLabel(a).localeCompare(getRoleLabel(b)));
  }, [filtered]);

  if (!activeId) {
    return (
      <div className={`text-xs text-muted-foreground italic flex items-center gap-2 ${className ?? ''}`}>
        <Settings className="h-3 w-3" />
        <Link to="/parametres" className="underline">Configurer un groupement</Link>
      </div>
    );
  }

  if (!loading && filtered.length === 0) {
    return (
      <div className={`text-xs text-muted-foreground italic flex items-center gap-2 ${className ?? ''}`}>
        <Users className="h-3 w-3" />
        Aucun agent —{' '}
        <Link to="/parametres" className="underline">en ajouter dans Paramètres</Link>
      </div>
    );
  }

  // Trouver l'agent dont le display correspond (compat ancienne saisie libre = on garde tel quel)
  const matched = filtered.find(a => formatAgentDisplay(a) === value);
  const triggerValue = matched ? matched.id : (value ? '__custom' : '');

  return (
    <Select
      value={triggerValue}
      onValueChange={(v) => {
        if (v === '__custom') return; // ne change rien
        const a = filtered.find(x => x.id === v);
        if (a) onChange(formatAgentDisplay(a), a);
      }}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder}>{value || placeholder}</SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-80">
        {groups.map(([role, list]) => (
          <SelectGroup key={role}>
            <SelectLabel className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {getRoleLabel(role)}
            </SelectLabel>
            {list.map(a => (
              <SelectItem key={a.id} value={a.id}>
                {a.civilite ? `${a.civilite} ` : ''}{a.prenom} {a.nom.toUpperCase()}
                {a.delegation_signature && <span className="ml-2 text-[10px] text-primary">• délégation</span>}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
        {value && !matched && (
          <SelectGroup>
            <SelectLabel className="text-[10px] uppercase tracking-wide text-muted-foreground">Saisie libre (ancienne)</SelectLabel>
            <SelectItem value="__custom">{value}</SelectItem>
          </SelectGroup>
        )}
      </SelectContent>
    </Select>
  );
}
