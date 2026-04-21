/**
 * Plan d'Action — Vue Tableau (filtrable)
 */
import { useState, useMemo } from 'react';
import { ActionPlan, StatutAction, CriticiteAction, STATUT_LABELS, CRITICITE_LABELS, CRITICITE_COLORS, buildMailtoAlerteJ15 } from '@/lib/plan-action-engine';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { useAgents, useGroupements } from '@/hooks/useGroupements';
import { formatAgentDisplay } from '@/components/AgentSelect';

interface Props {
  actions: ActionPlan[];
  onEdit: (a: ActionPlan) => void;
  onDelete: (id: string) => void;
}

export function PlanActionTableau({ actions, onEdit, onDelete }: Props) {
  const [filterCrit, setFilterCrit] = useState<CriticiteAction | 'all'>('all');
  const [filterStatut, setFilterStatut] = useState<StatutAction | 'all'>('all');
  const [search, setSearch] = useState('');
  const { activeId } = useGroupements();
  const { agents } = useAgents(activeId);
  const today = new Date().toISOString().slice(0, 10);

  const filtered = useMemo(() => {
    return actions.filter(a => {
      if (a.statut === 'archive') return false;
      if (filterCrit !== 'all' && a.criticite !== filterCrit) return false;
      if (filterStatut !== 'all' && a.statut !== filterStatut) return false;
      if (search && !`${a.libelle} ${a.origineLabel} ${a.responsable}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [actions, filterCrit, filterStatut, search]);

  const findAgentEmail = (display: string): string => {
    const a = agents.find(ag => formatAgentDisplay(ag) === display);
    return a?.email || '';
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Input className="max-w-xs" placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)} />
        <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={filterCrit} onChange={e => setFilterCrit(e.target.value as any)}>
          <option value="all">Toutes criticités</option>
          {(['critique', 'majeure', 'moyenne', 'faible'] as CriticiteAction[]).map(c => <option key={c} value={c}>{CRITICITE_LABELS[c]}</option>)}
        </select>
        <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={filterStatut} onChange={e => setFilterStatut(e.target.value as any)}>
          <option value="all">Tous statuts</option>
          {(['a_faire', 'en_cours', 'fait', 'abandonne'] as StatutAction[]).map(s => <option key={s} value={s}>{STATUT_LABELS[s]}</option>)}
        </select>
        <span className="self-center text-xs text-muted-foreground">{filtered.length} action(s)</span>
      </div>

      {filtered.length === 0 && (
        <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">Aucune action ne correspond aux filtres.</CardContent></Card>
      )}

      <div className="space-y-2">
        {filtered.map(a => {
          const overdue = a.echeance && a.echeance < today && a.statut !== 'fait';
          const j15 = a.echeance && new Date(a.echeance) <= new Date(Date.now() + 15 * 86400000) && !overdue && a.statut !== 'fait';
          const email = findAgentEmail(a.responsable);
          return (
            <Card key={a.id} className={`${overdue ? 'border-l-4 border-l-destructive bg-destructive/5' : j15 ? 'border-l-4 border-l-amber-500 bg-amber-50/30' : 'border-l-4 border-l-primary/30'}`}>
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge className={`${CRITICITE_COLORS[a.criticite]} text-[10px]`}>{CRITICITE_LABELS[a.criticite]}</Badge>
                      <Badge variant="outline" className="text-[10px]">{a.cycle || '—'}</Badge>
                      <Badge variant="secondary" className="text-[10px]">{STATUT_LABELS[a.statut]}</Badge>
                      {overdue && <Badge variant="destructive" className="text-[10px]">EN RETARD</Badge>}
                      {j15 && <Badge className="bg-amber-500 text-white text-[10px]">J-15</Badge>}
                    </div>
                    <p className="text-sm font-semibold leading-snug">{a.libelle}</p>
                    <p className="text-[11px] text-muted-foreground italic mt-0.5">📌 {a.origineLabel}</p>
                    <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground mt-1">
                      <span>👤 {a.responsable || <em className="text-amber-600">À affecter</em>}</span>
                      <span>📅 {a.echeance || '—'}</span>
                      <span>📖 {a.reference}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {j15 && email && (
                      <a href={buildMailtoAlerteJ15(a, email)} title="Envoyer alerte J-15">
                        <Button variant="ghost" size="icon" className="h-7 w-7"><Mail className="h-3.5 w-3.5 text-amber-600" /></Button>
                      </a>
                    )}
                    {j15 && !email && (
                      <span title="Aucun email pour le responsable"><AlertCircle className="h-4 w-4 text-amber-500" /></span>
                    )}
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(a)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDelete(a.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
