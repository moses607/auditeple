import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PARCOURS_ETAPES } from '@/lib/audit-parcours';
import { getModules } from '@/lib/audit-modules';

/**
 * Bouton "Étape suivante du parcours →" affiché en bas de chaque module.
 *
 * Logique :
 *  1. Identifie le module courant via location.pathname
 *  2. Cherche le module suivant DANS la même étape (parcours interne)
 *  3. Sinon, première étape suivante avec un module activé
 *  4. Si fin du parcours → message de félicitations + retour Dashboard
 */
export function EtapeSuivante() {
  const navigate = useNavigate();
  const location = useLocation();
  const modules = getModules();

  // Module courant
  const current = modules.find(m => m.path === location.pathname);
  if (!current) return null;

  // Étape courante
  const currentEtapeIdx = PARCOURS_ETAPES.findIndex(e => e.moduleIds.includes(current.id));
  if (currentEtapeIdx === -1) return null;
  const currentEtape = PARCOURS_ETAPES[currentEtapeIdx];

  // Trouver le prochain module activé
  const idxInEtape = currentEtape.moduleIds.indexOf(current.id);
  let nextModuleId: string | undefined;
  let nextEtape = currentEtape;

  // 1. Suivant dans la même étape
  for (let i = idxInEtape + 1; i < currentEtape.moduleIds.length; i++) {
    const candidate = modules.find(m => m.id === currentEtape.moduleIds[i] && m.enabled);
    if (candidate) { nextModuleId = candidate.id; break; }
  }

  // 2. Sinon, première étape suivante avec module activé
  if (!nextModuleId) {
    for (let e = currentEtapeIdx + 1; e < PARCOURS_ETAPES.length; e++) {
      const etape = PARCOURS_ETAPES[e];
      const candidate = etape.moduleIds
        .map(mid => modules.find(m => m.id === mid && m.enabled))
        .find(Boolean);
      if (candidate) {
        nextModuleId = candidate.id;
        nextEtape = etape;
        break;
      }
    }
  }

  // Fin du parcours
  if (!nextModuleId) {
    return (
      <Card className="border-success/30 bg-gradient-to-r from-success/5 to-primary/5 mt-6 print:hidden">
        <CardContent className="p-5 flex items-center gap-4">
          <CheckCircle2 className="h-10 w-10 text-success shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-foreground">Fin du parcours d'audit</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Vous avez atteint le dernier module activé. Retour au tableau de bord.
            </p>
          </div>
          <Button onClick={() => navigate('/')} variant="outline">
            Tableau de bord
          </Button>
        </CardContent>
      </Card>
    );
  }

  const nextModule = modules.find(m => m.id === nextModuleId)!;
  const isNewEtape = nextEtape.id !== currentEtape.id;
  const NextIcon = nextEtape.icon;

  return (
    <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5 mt-6 print:hidden">
      <CardContent className="p-5 flex items-center gap-4">
        <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <NextIcon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
            {isNewEtape
              ? `Étape ${nextEtape.numero}/7 — ${nextEtape.label}`
              : `Étape ${currentEtape.numero}/7 — ${currentEtape.label} (suite)`}
          </p>
          <p className="font-semibold text-foreground truncate">{nextModule.label}</p>
          {isNewEtape && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">{nextEtape.description}</p>
          )}
        </div>
        <Button onClick={() => navigate(nextModule.path)} className="shrink-0">
          Étape suivante
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
