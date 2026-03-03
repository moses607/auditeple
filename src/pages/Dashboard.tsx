import { getModules } from '@/lib/audit-modules';
import { useAuditParams } from '@/hooks/useAuditStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NavLink } from '@/components/NavLink';
import { CartoRisque, getSelectedEtablissement } from '@/lib/types';
import { loadState } from '@/lib/store';
import {
  Settings, ClipboardCheck, UserCheck, Receipt, CreditCard,
  Plane, FileText, Calculator, BookOpen, TrendingUp, ArrowRight,
  Landmark, Package, Scale, GraduationCap, Heart, UtensilsCrossed,
  AlertTriangle, Target, Building, Building2, Map, GitFork, ListChecks,
  Calendar, ClipboardList, BarChart3,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const ICON_MAP: Record<string, React.ElementType> = {
  Settings, ClipboardCheck, UserCheck, Receipt, CreditCard,
  Plane, FileText, Calculator, BookOpen, TrendingUp,
  Landmark, Package, Scale, GraduationCap, Heart, UtensilsCrossed,
  AlertTriangle, Target, Building, Building2, Map, GitFork, ListChecks,
  Calendar, ClipboardList, BarChart3,
};

const RISK_COLORS = ['hsl(0, 72%, 51%)', 'hsl(25, 95%, 53%)', 'hsl(45, 93%, 47%)', 'hsl(142, 71%, 45%)'];

export default function Dashboard() {
  const modules = getModules();
  const { params } = useAuditParams();
  const currentEtab = getSelectedEtablissement(params);
  const enabledModules = modules.filter(m => m.enabled && m.id !== 'parametres');
  const risques: CartoRisque[] = loadState('cartographie', []);

  // Risk level distribution
  const riskDistrib = risques.reduce((acc, r) => {
    const n = r.probabilite * r.impact * r.maitrise;
    if (n >= 40) acc[0].value++;
    else if (n >= 20) acc[1].value++;
    else if (n >= 10) acc[2].value++;
    else acc[3].value++;
    return acc;
  }, [
    { name: 'Critique', value: 0 },
    { name: 'Majeur', value: 0 },
    { name: 'Moyen', value: 0 },
    { name: 'Faible', value: 0 },
  ]);

  // Risk by process
  const processByRisk = Object.entries(
    risques.reduce<Record<string, number>>((acc, r) => {
      acc[r.processus] = (acc[r.processus] || 0) + r.probabilite * r.impact * r.maitrise;
      return acc;
    }, {})
  ).map(([name, score]) => ({ name: name.length > 15 ? name.substring(0, 15) + '…' : name, score }))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        {currentEtab ? (
          <p className="text-sm text-muted-foreground mt-1">
            {currentEtab.nom} ({currentEtab.uai}) — Exercice {params.exercice}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground mt-1">
            Commencez par renseigner les <NavLink to="/parametres" className="text-primary underline">paramètres de l'audit</NavLink>.
          </p>
        )}
      </div>

      {/* Risk Charts */}
      {risques.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Répartition des risques</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={riskDistrib.filter(d => d.value > 0)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                    {riskDistrib.map((_, i) => <Cell key={i} fill={RISK_COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Score de risque par processus</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={processByRisk} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="score" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]}>
                    {processByRisk.map((entry, i) => (
                      <Cell key={i} fill={entry.score >= 40 ? RISK_COLORS[0] : entry.score >= 20 ? RISK_COLORS[1] : 'hsl(var(--primary))'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            Modules sélectionnés
            <Badge variant="outline">{enabledModules.length} actif{enabledModules.length > 1 ? 's' : ''}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {enabledModules.map(mod => {
              const Icon = ICON_MAP[mod.icon] || FileText;
              return (
                <NavLink
                  key={mod.id}
                  to={mod.path}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted transition-colors group"
                >
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium flex-1">{mod.label}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </NavLink>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {params.equipe.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Équipe d'audit</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {params.equipe.map(m => (
                <Badge key={m.id} variant="secondary">{m.prenom} {m.nom} — {m.fonction}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
