import { getModules } from '@/lib/audit-modules';
import { useAuditParams } from '@/hooks/useAuditStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NavLink } from '@/components/NavLink';
import {
  Settings, ClipboardCheck, UserCheck, Receipt, CreditCard,
  Plane, FileText, Calculator, BookOpen, TrendingUp, ArrowRight
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Settings, ClipboardCheck, UserCheck, Receipt, CreditCard,
  Plane, FileText, Calculator, BookOpen, TrendingUp,
};

export default function Dashboard() {
  const modules = getModules();
  const { params } = useAuditParams();
  const enabledModules = modules.filter(m => m.enabled && m.id !== 'parametres');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        {params.etablissement && (
          <p className="text-sm text-muted-foreground mt-1">
            {params.etablissement} — Exercice {params.exercice}
          </p>
        )}
        {!params.etablissement && (
          <p className="text-sm text-muted-foreground mt-1">
            Commencez par renseigner les <NavLink to="/parametres" className="text-primary underline">paramètres de l'audit</NavLink>.
          </p>
        )}
      </div>

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
