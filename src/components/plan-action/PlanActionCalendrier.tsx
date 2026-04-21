/**
 * Plan d'Action — Vue Calendrier (échéances annuelles)
 */
import { useMemo } from 'react';
import { ActionPlan, CRITICITE_COLORS, CRITICITE_LABELS } from '@/lib/plan-action-engine';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  actions: ActionPlan[];
  onEdit: (a: ActionPlan) => void;
}

const MOIS = ['Janv.', 'Févr.', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'];

export function PlanActionCalendrier({ actions, onEdit }: Props) {
  const annee = new Date().getFullYear();

  const parMois = useMemo(() => {
    const grouped: Record<number, ActionPlan[]> = {};
    for (let i = 0; i < 12; i++) grouped[i] = [];
    actions.forEach(a => {
      if (!a.echeance || a.statut === 'archive' || a.statut === 'fait') return;
      const d = new Date(a.echeance);
      if (d.getFullYear() === annee) grouped[d.getMonth()].push(a);
    });
    return grouped;
  }, [actions, annee]);

  return (
    <div>
      <h3 className="text-sm font-bold mb-3">Échéances {annee}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {MOIS.map((m, i) => {
          const items = parMois[i].sort((x, y) => x.echeance.localeCompare(y.echeance));
          return (
            <Card key={i} className={items.length > 0 ? 'border-primary/30' : 'opacity-60'}>
              <CardContent className="p-3">
                <div className="flex justify-between items-center mb-2 pb-1.5 border-b">
                  <h4 className="font-bold text-sm">{m}</h4>
                  <Badge variant={items.length > 5 ? 'destructive' : 'outline'} className="text-[10px]">{items.length}</Badge>
                </div>
                <div className="space-y-1.5 max-h-[180px] overflow-y-auto">
                  {items.map(a => (
                    <button
                      key={a.id}
                      onClick={() => onEdit(a)}
                      className="w-full text-left text-[11px] p-1.5 rounded hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-1 mb-0.5">
                        <Badge className={`${CRITICITE_COLORS[a.criticite]} text-[9px] px-1.5 py-0`}>
                          {CRITICITE_LABELS[a.criticite]}
                        </Badge>
                        <span className="text-muted-foreground">{a.echeance.slice(8, 10)}/{a.echeance.slice(5, 7)}</span>
                      </div>
                      <p className="line-clamp-2 leading-snug">{a.libelle}</p>
                    </button>
                  ))}
                  {items.length === 0 && <p className="text-[10px] text-muted-foreground italic text-center py-3">Aucune échéance</p>}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
