import { SECTIONS } from '@/lib/audit-modules';
import { useModules } from '@/hooks/useModules';
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
  Calendar, ClipboardList, BarChart3, Shield, ChevronRight, RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

import heroImg from '@/assets/hero-audit.png';
import sectionControles from '@/assets/section-controles.png';
import sectionVerification from '@/assets/section-verification.png';
import sectionComptable from '@/assets/section-comptable.png';
import sectionFinances from '@/assets/section-finances.png';
import sectionControleInterne from '@/assets/section-controle-interne.png';
import sectionRestitution from '@/assets/section-restitution.png';

// Module images
import modRegies from '@/assets/mod-regies.png';
import modStocks from '@/assets/mod-stocks.png';
import modRapprochement from '@/assets/mod-rapprochement.png';
import modVerification from '@/assets/mod-verification.png';
import modOrdonnateur from '@/assets/mod-ordonnateur.png';
import modDroitsConstates from '@/assets/mod-droits-constates.png';
import modDepenses from '@/assets/mod-depenses.png';
import modVoyages from '@/assets/mod-voyages.png';
import modRestauration from '@/assets/mod-restauration.png';
import modAnalyseFinanciere from '@/assets/mod-analyse-financiere.png';
import modFondsRoulement from '@/assets/mod-fonds-roulement.png';
import modRecouvrement from '@/assets/mod-recouvrement.png';
import modMarches from '@/assets/mod-marches.png';
import modSubventions from '@/assets/mod-subventions.png';
import modBudgetsAnnexes from '@/assets/mod-budgets-annexes.png';
import modCartographie from '@/assets/mod-cartographie.png';
import modOrganigramme from '@/assets/mod-organigramme.png';
import modPlanAction from '@/assets/mod-plan-action.png';
import modPlanControle from '@/assets/mod-plan-controle.png';
import modPvAudit from '@/assets/mod-pv-audit.png';
import modAnnexeComptable from '@/assets/mod-annexe-comptable.png';
import modPisteAudit from '@/assets/mod-piste-audit.png';
import modParametres from '@/assets/mod-parametres.png';

const ICON_MAP: Record<string, React.ElementType> = {
  Settings, ClipboardCheck, UserCheck, Receipt, CreditCard,
  Plane, FileText, Calculator, BookOpen, TrendingUp,
  Landmark, Package, Scale, GraduationCap, Heart, UtensilsCrossed,
  AlertTriangle, Target, Building, Building2, Map, GitFork, ListChecks,
  Calendar, ClipboardList, BarChart3,
};

const MODULE_IMAGES: Record<string, string> = {
  regies: modRegies, stocks: modStocks, rapprochement: modRapprochement,
  verification: modVerification, ordonnateur: modOrdonnateur,
  'droits-constates': modDroitsConstates, depenses: modDepenses,
  voyages: modVoyages, restauration: modRestauration,
  'analyse-financiere': modAnalyseFinanciere, 'fonds-roulement': modFondsRoulement,
  recouvrement: modRecouvrement, marches: modMarches, subventions: modSubventions,
  'budgets-annexes': modBudgetsAnnexes, cartographie: modCartographie,
  organigramme: modOrganigramme, 'plan-action': modPlanAction,
  'plan-controle': modPlanControle, 'pv-audit': modPvAudit,
  'annexe-comptable': modAnnexeComptable, 'piste-audit': modPisteAudit,
  parametres: modParametres,
};

const RISK_COLORS = ['hsl(0, 72%, 51%)', 'hsl(25, 95%, 53%)', 'hsl(45, 93%, 47%)', 'hsl(142, 71%, 45%)'];

const SECTION_CONFIG: Record<string, { color: string; bgClass: string; image: string }> = {
  'CONTRÔLES SUR PLACE': {
    color: 'text-section-controles',
    bgClass: 'from-[hsl(210,85%,50%)] to-[hsl(210,85%,65%)]',
    image: sectionControles,
  },
  'VÉRIFICATION & ORDONNATEUR': {
    color: 'text-section-verification',
    bgClass: 'from-[hsl(152,60%,40%)] to-[hsl(152,60%,55%)]',
    image: sectionVerification,
  },
  'GESTION COMPTABLE': {
    color: 'text-section-comptable',
    bgClass: 'from-[hsl(270,55%,50%)] to-[hsl(270,55%,65%)]',
    image: sectionComptable,
  },
  'FINANCES & BUDGET': {
    color: 'text-section-finances',
    bgClass: 'from-[hsl(38,92%,50%)] to-[hsl(38,92%,62%)]',
    image: sectionFinances,
  },
  'CONTRÔLE INTERNE': {
    color: 'text-section-controle-interne',
    bgClass: 'from-[hsl(174,65%,40%)] to-[hsl(174,65%,55%)]',
    image: sectionControleInterne,
  },
  'AUDIT & RESTITUTION': {
    color: 'text-section-restitution',
    bgClass: 'from-[hsl(220,72%,42%)] to-[hsl(220,72%,58%)]',
    image: sectionRestitution,
  },
};

export default function Dashboard() {
  const [modules, updateModules] = useModules();
  const { params } = useAuditParams();
  const currentEtab = getSelectedEtablissement(params);
  const allNonParam = modules.filter(m => m.id !== 'parametres');
  const enabledOnly = allNonParam.filter(m => m.enabled);
  // Always display all modules; the "enabled" flag is audit scope only (visual indicator)
  const displayModules = allNonParam;

  const handleReset = () => {
    updateModules(modules.map(m => ({ ...m, enabled: true })));
  };
  const risques: CartoRisque[] = loadState('cartographie', []);

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

  const processByRisk = Object.entries(
    risques.reduce<Record<string, number>>((acc, r) => {
      acc[r.processus] = (acc[r.processus] || 0) + r.probabilite * r.impact * r.maitrise;
      return acc;
    }, {})
  ).map(([name, score]) => ({ name: name.length > 15 ? name.substring(0, 15) + '…' : name, score }))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden gradient-hero p-8 md:p-10 shadow-elevated">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/40" />
        <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden lg:block">
          <img src={heroImg} alt="" className="h-full w-full object-cover object-left opacity-30 mix-blend-luminosity" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground tracking-tight">
            Tableau de bord
          </h1>
          {currentEtab ? (
            <p className="text-primary-foreground/80 mt-2 text-sm md:text-base">
              {currentEtab.nom} ({currentEtab.uai}) — Exercice {params.exercice}
            </p>
          ) : (
            <p className="text-primary-foreground/80 mt-2 text-sm">
              Commencez par renseigner les{' '}
              <NavLink to="/parametres" className="underline text-primary-foreground hover:text-primary-foreground/90">
                paramètres de l'audit
              </NavLink>.
            </p>
          )}
          <div className="flex flex-wrap gap-3 mt-5">
            <div className="glass rounded-lg px-4 py-2 text-sm">
              <span className="text-primary-foreground/60">Modules actifs</span>
              <span className="text-primary-foreground font-bold ml-2">{enabledOnly.length}</span>
            </div>
            <div className="glass rounded-lg px-4 py-2 text-sm">
              <span className="text-primary-foreground/60">Risques identifiés</span>
              <span className="text-primary-foreground font-bold ml-2">{risques.length}</span>
            </div>
            {params.equipe.length > 0 && (
              <div className="glass rounded-lg px-4 py-2 text-sm">
                <span className="text-primary-foreground/60">Équipe</span>
                <span className="text-primary-foreground font-bold ml-2">{params.equipe.length} membre{params.equipe.length > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Risk Charts */}
      {risques.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-300">
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

          <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-300">
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

      {/* Section Cards with images */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Modules d'audit</h2>
        </div>
        {enabledOnly.length < allNonParam.length && (
          <p className="text-sm text-muted-foreground">
            Périmètre d'audit : {enabledOnly.length} module{enabledOnly.length > 1 ? 's' : ''} sélectionné{enabledOnly.length > 1 ? 's' : ''} sur {allNonParam.length}
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {SECTIONS.map(section => {
            const sectionModules = displayModules.filter(m => m.section === section);
            if (sectionModules.length === 0) return null;
            const config = SECTION_CONFIG[section];

            return (
              <Card key={section} className="shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden group">
                {/* Section header with gradient */}
                <div className={`bg-gradient-to-r ${config.bgClass} p-4 flex items-center gap-3`}>
                  <img src={config.image} alt="" className="h-10 w-10 object-contain rounded-lg bg-white/20 p-1" />
                  <h3 className="text-sm font-bold text-white tracking-wide uppercase">{section}</h3>
                </div>
                <CardContent className="p-3">
                  <div className="space-y-1">
                    {sectionModules.map(mod => {
                      const Icon = ICON_MAP[mod.icon] || FileText;
                      const modImage = MODULE_IMAGES[mod.id];
                      return (
                        <NavLink
                          key={mod.id}
                          to={mod.path}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors group/item ${!mod.enabled ? 'opacity-50' : ''}`}
                          activeClassName="bg-primary/10"
                        >
                          {modImage ? (
                            <img src={modImage} alt="" className="h-8 w-8 object-contain rounded-md flex-shrink-0" />
                          ) : (
                            <Icon className={`h-5 w-5 ${config.color} flex-shrink-0`} />
                          )}
                          <span className="text-sm font-medium flex-1 text-foreground">{mod.label}</span>
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-opacity" />
                        </NavLink>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Team */}
      {params.equipe.filter(m => m.isAuditeur).length > 0 && (
        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-lg">Auditeurs désignés</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {params.equipe.filter(m => m.isAuditeur).map(m => (
                <Badge key={m.id} variant="secondary" className="text-xs px-3 py-1.5">
                  {m.prenom} {m.nom} — {m.fonction}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
