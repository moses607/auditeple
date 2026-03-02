import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CartoRisque } from '@/lib/types';
import { loadState } from '@/lib/store';

export default function PlanAction() {
  const items: CartoRisque[] = loadState('cartographie', []);
  const sorted = [...items].sort((a, b) => (b.probabilite * b.impact * b.maitrise) - (a.probabilite * a.impact * a.maitrise));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Plan d'Action — CICF</h1>
        <p className="text-xs text-muted-foreground mt-1">Réf. : Actions correctives découlant de la cartographie des risques</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{items.filter(r => r.statut === 'À lancer').length}</p><p className="text-xs text-muted-foreground">À lancer</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{items.filter(r => r.statut === 'En cours').length}</p><p className="text-xs text-muted-foreground">En cours</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-green-600">{items.filter(r => r.statut === 'Réalisé').length}</p><p className="text-xs text-muted-foreground">Réalisées</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{items.length}</p><p className="text-xs text-muted-foreground">Total actions</p></CardContent></Card>
      </div>

      {items.length === 0 && <Card><CardContent className="py-12 text-center text-muted-foreground">Aucune action. Alimentez la cartographie des risques pour générer le plan d'action.</CardContent></Card>}

      {sorted.map((r, i) => {
        const n = r.probabilite * r.impact * r.maitrise;
        return (
          <Card key={r.id} className={n >= 40 ? 'border-l-4 border-l-destructive' : n >= 20 ? 'border-l-4 border-l-orange-500' : ''}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground">#{i + 1}</span>
                    <Badge variant={n >= 40 ? 'destructive' : 'default'}>{n}</Badge>
                    <span className="text-xs text-muted-foreground">{r.processus}</span>
                  </div>
                  <p className="font-bold">{r.action || 'Action à définir'}</p>
                  <p className="text-sm text-muted-foreground">{r.risque}</p>
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Resp: <strong>{r.responsable}</strong></span>
                    <span>Éch: <strong>{r.echeance}</strong></span>
                  </div>
                </div>
                <Badge variant={r.statut === 'Réalisé' ? 'secondary' : r.statut === 'En cours' ? 'default' : 'outline'}>{r.statut}</Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
