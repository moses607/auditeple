/**
 * Hub Outils / Calculateurs — bibliothèque des 15 calculateurs CICF.
 * Routes :
 *   /outils/calculateurs           → grille
 *   /outils/calculateurs/:id       → calculateur ouvert
 */
import { useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { CALCULATEURS, CALCULATEUR_CATEGORIES, getCalculateur, getHistorique, clearHistorique, type CalculateurCategorie } from '@/lib/calculateurs';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, History, Trash2, Calculator as CalcIcon } from 'lucide-react';

function PageHeader({ title, subtitle, Icon }: { title: string; subtitle: string; Icon: any }) {
  return (
    <header className="mb-4 flex items-start gap-3 border-b pb-3">
      <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <h1 className="text-xl font-bold leading-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </header>
  );
}

// Composants calculateurs
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

export default function Calculateurs() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState<CalculateurCategorie | 'all'>('all');
  const [histoTick, setHistoTick] = useState(0);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return CALCULATEURS.filter(c => {
      if (cat !== 'all' && c.categorie !== cat) return false;
      if (!q) return true;
      return c.label.toLowerCase().includes(q)
        || c.description.toLowerCase().includes(q)
        || c.reference.toLowerCase().includes(q)
        || (c.keywords ?? []).some(k => k.includes(q));
    });
  }, [search, cat]);

  const histo = useMemo(() => getHistorique(), [histoTick]);

  return (
    <ModulePageLayout
      title="Bibliothèque de calculateurs CICF"
      subtitle="15 outils réglementaires conformes M9-6, GBCP 2012-1246, CCP 2026"
      icon={CalcIcon}
    >
      <div className="space-y-4">
        {/* Filtres */}
        <div className="flex flex-col md:flex-row gap-2 md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher (DGP, bourse, FSE, mapa…)" className="pl-9 h-9" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant={cat === 'all' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setCat('all')}>
              Tous ({CALCULATEURS.length})
            </Badge>
            {CALCULATEUR_CATEGORIES.map(c => {
              const n = CALCULATEURS.filter(x => x.categorie === c).length;
              return (
                <Badge key={c} variant={cat === c ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setCat(c)}>
                  {c} ({n})
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Historique */}
        {histo.length > 0 && (
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                  <History className="h-3.5 w-3.5" /> Historique récent
                </h3>
                <button onClick={() => { clearHistorique(); setHistoTick(t => t + 1); }} className="text-[10px] text-muted-foreground hover:text-destructive flex items-center gap-1">
                  <Trash2 className="h-3 w-3" /> Effacer
                </button>
              </div>
              <ul className="space-y-1">
                {histo.map(h => (
                  <li key={h.id} className="text-xs flex items-center justify-between gap-2">
                    <Link to={`/outils/calculateurs/${h.calculateurId}`} className="text-primary hover:underline truncate">
                      {h.label}
                    </Link>
                    <span className="text-muted-foreground truncate">{h.resume}</span>
                    <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
                      {new Date(h.timestamp).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Grille */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(c => {
            const Icon = c.icon;
            return (
              <Link key={c.id} to={`/outils/calculateurs/${c.id}`}>
                <Card className="h-full hover:shadow-md hover:border-primary/40 transition-all cursor-pointer">
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
                    <p className="text-[10px] text-muted-foreground/80 italic truncate">{c.reference}</p>
                    {c.agentComptableOnly && (
                      <Badge className="text-[9px] mt-2 bg-amber-500/15 text-amber-700 border border-amber-500/30">AC uniquement</Badge>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">Aucun calculateur ne correspond à votre recherche.</p>
        )}
      </div>
    </ModulePageLayout>
  );
}
