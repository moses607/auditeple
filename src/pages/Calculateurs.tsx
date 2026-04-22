/**
 * Page de redirection — les calculateurs ont été dispatchés dans leurs modules métier.
 * Conservée temporairement (1-2 mois) le temps que les utilisateurs prennent l'habitude.
 *
 * /outils/calculateurs        → cette page d'index avec liens vers chaque destination
 * /outils/calculateurs/:id    → ouvre le calculateur en standalone (rétro-compatibilité)
 */
import { Link, useParams, useNavigate } from 'react-router-dom';
import { CALCULATEURS, getCalculateur } from '@/lib/calculateurs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, Calculator as CalcIcon, ExternalLink, Info } from 'lucide-react';

import { CalcCaisseRegie, CalcRapprochement } from '@/components/calculateurs/calc-tresorerie';
import { CalcFondsSocialCantine, CalcFondsSocialEleves, CalcVoyageFamille } from '@/components/calculateurs/calc-aides';
import { CalcSeuilsCCP, CalcAmortissements, CalcDBM, CalcDGP } from '@/components/calculateurs/calc-cp-compta';
import { CalcDroitsDP, CalcBourses, CalcTaxeApprentissage } from '@/components/calculateurs/calc-recettes';
import { CalcSurremDOM, CalcHeuresSup, CalcRatiosBilanciels } from '@/components/calculateurs/calc-paie-pilotage';

const REGISTRY: Record<string, () => JSX.Element> = {
  'caisse-regie': CalcCaisseRegie,
  'rapprochement-bancaire': CalcRapprochement,
  'fonds-social-cantine': CalcFondsSocialCantine,
  'fonds-social-eleves': CalcFondsSocialEleves,
  'voyage-famille': CalcVoyageFamille,
  'seuils-ccp': CalcSeuilsCCP,
  'amortissements': CalcAmortissements,
  'dbm': CalcDBM,
  'dgp': CalcDGP,
  'droits-dp': CalcDroitsDP,
  'bourses': CalcBourses,
  'taxe-apprentissage': CalcTaxeApprentissage,
  'surremuneration-dom': CalcSurremDOM,
  'heures-sup': CalcHeuresSup,
  'ratios-bilanciels': CalcRatiosBilanciels,
};

/**
 * Mapping calculateur → destination métier (où trouver l'outil maintenant).
 * Au moins une destination par calculateur (la principale en premier).
 */
const REDIRECTIONS: Record<string, { label: string; path: string }[]> = {
  'caisse-regie': [
    { label: 'Audit → Régies', path: '/regies' },
    { label: 'Contrôle → Caisse', path: '/controle-caisse' },
  ],
  'rapprochement-bancaire': [{ label: 'Contrôle → Rapprochement bancaire', path: '/rapprochement' }],
  'fonds-social-cantine': [{ label: 'Audit → Fonds sociaux', path: '/fonds-sociaux' }],
  'fonds-social-eleves': [{ label: 'Audit → Fonds sociaux', path: '/fonds-sociaux' }],
  'voyage-famille': [{ label: 'Audit → Voyages', path: '/voyages' }],
  'seuils-ccp': [
    { label: 'Audit → Commande publique', path: '/marches' },
  ],
  'amortissements': [{ label: 'Analyser → Annexe comptable', path: '/annexe-comptable' }],
  'dbm': [{ label: 'Analyser → Analyse financière', path: '/analyse-financiere' }],
  'dgp': [{ label: 'Audit → Dépenses', path: '/depenses' }],
  'droits-dp': [
    { label: 'Audit → Droits constatés', path: '/droits-constates' },
    { label: 'Audit → Restauration', path: '/restauration' },
  ],
  'bourses': [{ label: 'Audit → Bourses', path: '/bourses' }],
  'taxe-apprentissage': [{ label: 'Audit → Subventions', path: '/subventions' }],
  'surremuneration-dom': [{ label: 'Audit → Salaires', path: '/salaires' }],
  'heures-sup': [{ label: 'Audit → Salaires', path: '/salaires' }],
  'ratios-bilanciels': [
    { label: 'Analyser → Analyse financière', path: '/analyse-financiere' },
    { label: 'Analyser → Fonds de roulement', path: '/fonds-roulement' },
  ],
};

export default function Calculateurs() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mode standalone : compatibilité ascendante avec d'anciens liens
  if (id) {
    const meta = getCalculateur(id);
    const Comp = REGISTRY[id];
    const dests = REDIRECTIONS[id] ?? [];
    return (
      <div className="container max-w-6xl mx-auto p-4 md:p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/outils/calculateurs')}>
            <ArrowLeft className="h-4 w-4" /> Retour
          </Button>
          {dests.map(d => (
            <Button key={d.path} variant="ghost" size="sm" asChild>
              <Link to={d.path}>{d.label} <ExternalLink className="h-3 w-3 ml-1" /></Link>
            </Button>
          ))}
        </div>
        {meta && Comp ? (
          <>
            <h1 className="text-xl font-bold mb-1">{meta.label}</h1>
            <p className="text-sm text-muted-foreground mb-4">{meta.description}</p>
            <Comp />
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Calculateur introuvable.</p>
        )}
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto p-4 md:p-6">
      <header className="mb-4 flex items-start gap-3 border-b pb-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <CalcIcon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold leading-tight">Calculateurs réglementaires</h1>
          <p className="text-sm text-muted-foreground">
            Les outils de calcul ont été intégrés directement dans leurs modules métier.
          </p>
        </div>
      </header>

      <Alert className="mb-4">
        <Info className="h-4 w-4" />
        <AlertTitle className="text-sm">Nouvelle organisation</AlertTitle>
        <AlertDescription className="text-xs">
          Pour gagner en efficacité, chaque calculateur est désormais accessible directement
          depuis la page métier où son résultat est utilisé (bouton « 🧮 » ou onglet dédié).
          Plus besoin de quitter votre contexte de travail.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {CALCULATEURS.map(c => {
          const Icon = c.icon;
          const dests = REDIRECTIONS[c.id] ?? [];
          return (
            <Card key={c.id} className="h-full">
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-2">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold leading-tight">{c.label}</h3>
                    <Badge variant="outline" className="text-[10px] mt-1">{c.categorie}</Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{c.description}</p>
                <div className="space-y-1 mt-3 pt-2 border-t">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                    Désormais dans :
                  </p>
                  {dests.map(d => (
                    <Button key={d.path} size="sm" variant="ghost" asChild
                      className="w-full justify-start h-7 text-xs">
                      <Link to={d.path}>
                        <ExternalLink className="h-3 w-3 mr-1" />
                        {d.label}
                      </Link>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
