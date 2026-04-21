/**
 * Plan d'Action — Vue Kanban (À faire / En cours / Fait)
 */
import { ActionPlan, StatutAction, STATUT_LABELS, CRITICITE_COLORS, CRITICITE_LABELS } from '@/lib/plan-action-engine';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  actions: ActionPlan[];
  onMove: (id: string, newStatut: StatutAction) => void;
  onEdit: (a: ActionPlan) => void;
}

const COLUMNS: { id: StatutAction; label: string; color: string }[] = [
  { id: 'a_faire', label: 'À faire', color: 'bg-slate-100 dark:bg-slate-900/40' },
  { id: 'en_cours', label: 'En cours', color: 'bg-blue-50 dark:bg-blue-950/40' },
  { id: 'fait', label: 'Fait', color: 'bg-emerald-50 dark:bg-emerald-950/40' },
];

export function PlanActionKanban({ actions, onMove, onEdit }: Props) {
  const grouped = COLUMNS.reduce((acc, c) => {
    acc[c.id] = actions.filter(a => a.statut === c.id);
    return acc;
  }, {} as Record<StatutAction, ActionPlan[]>);

  const handleDrop = (e: React.DragEvent, statut: StatutAction) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id) onMove(id, statut);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {COLUMNS.map(col => (
        <div
          key={col.id}
          className={`rounded-lg p-3 ${col.color} min-h-[300px]`}
          onDragOver={e => e.preventDefault()}
          onDrop={e => handleDrop(e, col.id)}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold">{col.label}</h3>
            <Badge variant="outline" className="text-[10px]">{grouped[col.id].length}</Badge>
          </div>
          <div className="space-y-2">
            {grouped[col.id].map(a => (
              <Card
                key={a.id}
                className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                draggable
                onDragStart={e => e.dataTransfer.setData('text/plain', a.id)}
                onClick={() => onEdit(a)}
              >
                <CardContent className="p-2.5">
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    <Badge className={`${CRITICITE_COLORS[a.criticite]} text-[9px] px-1.5`}>{CRITICITE_LABELS[a.criticite]}</Badge>
                    <Badge variant="outline" className="text-[9px] px-1.5">{a.cycle}</Badge>
                  </div>
                  <p className="text-xs font-medium leading-snug line-clamp-3">{a.libelle}</p>
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
                    <span>👤 {a.responsable || '—'}</span>
                    <span>📅 {a.echeance?.slice(5) || '—'}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {grouped[col.id].length === 0 && (
              <p className="text-[11px] text-muted-foreground text-center italic py-6">Glisser une action ici</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
