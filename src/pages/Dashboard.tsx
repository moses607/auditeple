import { SECTIONS } from '@/lib/audit-modules';
import { ICON_MAP } from '@/lib/icon-map';
import { useAuditProgress } from '@/hooks/useAuditProgress';
import { useModules } from '@/hooks/useModules';
import { useAuditParams } from '@/hooks/useAuditStore';
import { useAuditProgress } from '@/hooks/useAuditProgress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NavLink } from '@/components/NavLink';
import { CartoRisque, getSelectedEtablissement, getAgenceComptable } from '@/lib/types';
import { loadState } from '@/lib/store';
import {
  FileText, Shield, ChevronRight,
  Users, Activity, ShieldCheck, TrendingDown, AlertTriangle, Building2,
} from 'lucide-react';
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

const SECTION_CONFIG: Record<string, { color: string; bgClass: string; image: string; borderColor: string }> = {
  'CONTRÔLES SUR PLACE': {
    color: 'text-section-controles',
    bgClass: 'from-[#3B82F6] to-[#60A5FA]',
    borderColor: 'border-l-[#3B82F6]',
    image: sectionControles,
  },
  'VÉRIFICATION & ORDONNATEUR': {
    color: 'text-section-verification',
    bgClass: 'from-[#2D8C5A] to-[#3DA96E]',
    borderColor: 'border-l-[#2D8C5A]',
    image: sectionVerification,
  },
  'GESTION COMPTABLE': {
    color: 'text-section-comptable',
    bgClass: 'from-[#7C4DDB] to-[#9B6FE8]',
    borderColor: 'border-l-[#7C4DDB]',
    image: sectionComptable,
  },
  'FINANCES & BUDGET': {
    color: 'text-section-finances',
    bgClass: 'from-[#D4920A] to-[#E5A832]',
    borderColor: 'border-l-[#D4920A]',
    image: sectionFinances,
  },
  'CONTRÔLE INTERNE': {
    color: 'text-section-controle-interne',
    bgClass: 'from-[#168F75] to-[#20B090]',
    borderColor: 'border-l-[#168F75]',
    image: sectionControleInterne,
  },
  'AUDIT & RESTITUTION': {
    color: 'text-section-restitution',
    bgClass: 'from-[#2B4C8C] to-[#3D66B0]',
    borderColor: 'border-l-[#2B4C8C]',
    image: sectionRestitution,
  },
};

function KpiCard({ icon: Icon, label, value, sublabel, delay }: {
  icon: React.ElementType; label: string; value: string | number; sublabel?: string; delay: number;
}) {
  return (
    <Card
      className="shadow-card hover:shadow-card-hover transition-all duration-300 opacity-0 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold text-foreground leading-none">{value}</p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{label}</p>
          {sublabel && <p className="text-[10px] text-muted-foreground/70 truncate">{sublabel}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const [modules, updateModules] = useModules();
  const { params } = useAuditParams();
  const currentEtab = getSelectedEtablissement(params);
  const agence = getAgenceComptable(params);
  const auditProgress = useAuditProgress();
  const allNonParam = modules.filter(m => m.id !== 'parametres');
  const enabledOnly = allNonParam.filter(m => m.enabled);
  const displayModules = allNonParam;

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

  const criticalCount = riskDistrib[0].value + riskDistrib[1].value;

  const processByRisk = Object.entries(
    risques.reduce<Record<string, number>>((acc, r) => {
      acc[r.processus] = (acc[r.processus] || 0) + r.probabilite * r.impact * r.maitrise;
      return acc;
    }, {})
  ).map(([name, score]) => ({ name: name.length > 15 ? name.substring(0, 15) + '…' : name, score }))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* ─── Hero Banner ─── */}
      <div className="relative rounded-2xl overflow-hidden gradient-hero shadow-elevated opacity-0 animate-fade-in">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/70 to-primary/30" />
        <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden lg:block">
          <img src={heroImg} alt="" className="h-full w-full object-cover object-left opacity-20 mix-blend-luminosity" />
        </div>
        <div className="relative z-10 p-6 md:p-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-primary-foreground/60 text-xs font-semibold tracking-widest uppercase mb-1">
                Tableau de bord
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground tracking-tight">
                {agence ? agence.nom : 'Audit comptable EPLE'}
              </h1>
              {currentEtab && (
                <p className="text-primary-foreground/70 mt-1 text-sm">
                  {currentEtab.nom} ({currentEtab.uai}) — Exercice {params.exercice}
                </p>
              )}
              {!currentEtab && (
                <p className="text-primary-foreground/70 mt-1 text-sm">
                  Commencez par renseigner les{' '}
                  <NavLink to="/parametres" className="underline text-primary-foreground hover:text-primary-foreground/90">
                    paramètres de l'audit
                  </NavLink>.
                </p>
              )}
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Badge variant="outline" className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground text-xs">
                <Shield className="h-3 w-3 mr-1" />
                v7.0
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* ─── KPI Row ─── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KpiCard icon={ShieldCheck} label="Score global" value={auditProgress.totalItems > 0 ? auditProgress.percentage + '%' : '—'} sublabel={auditProgress.totalItems > 0 ? `${auditProgress.totalChecked}/${auditProgress.totalItems} contrôles` : 'conformité audit'} delay={0} />
        <KpiCard icon={Activity} label="Modules actifs" value={enabledOnly.length} sublabel={`sur ${allNonParam.length} disponibles`} delay={50} />
        <KpiCard icon={AlertTriangle} label="Risques identifiés" value={risques.length} sublabel={criticalCount > 0 ? `${criticalCount} critique(s)` : undefined} delay={100} />
        <KpiCard icon={Users} label="Auditeurs" value={params.equipe.filter(m => m.isAuditeur).length} sublabel={params.equipe.length > 0 ? `${params.equipe.length} dans l'équipe` : undefined} delay={150} />
        <KpiCard icon={Building2} label="Établissements" value={params.etablissements.length} sublabel={currentEtab ? currentEtab.ville : undefined} delay={200} />
      </div>

      {/* ─── Risk Charts ─── */}
      {risques.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-0 animate-fade-in" style={{ animationDelay: '250ms' }}>
          <Card className="shadow-card hover:shadow-card-hover transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Répartition des risques
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={riskDistrib.filter(d => d.value > 0)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={40} strokeWidth={2} label={({ name, value }) => `${name}: ${value}`}>
                    {riskDistrib.map((_, i) => <Cell key={i} fill={RISK_COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid hsl(var(--border))' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-card-hover transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-destructive" />
                Score de risque par processus
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={processByRisk} layout="vertical" margin={{ left: 0, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid hsl(var(--border))' }} />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]}>
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

      {/* ─── Section Progress ─── */}
      {auditProgress.totalItems > 0 && (
        <Card className="shadow-card opacity-0 animate-fade-in" style={{ animationDelay: '280ms' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Progression par section
              <Badge variant="secondary" className="ml-auto text-[10px]">{auditProgress.percentage}% global</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {SECTIONS.map(section => {
              const sp = auditProgress.sections[section];
              if (!sp || sp.total === 0) return null;
              const config = SECTION_CONFIG[section];
              const sectionColor = config?.bgClass?.match(/#[0-9A-Fa-f]{6}/)?.[0] || 'hsl(var(--primary))';
              return (
                <div key={section} className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground w-[140px] truncate">{section}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${sp.percentage}%`, background: sectionColor }} />
                  </div>
                  <span className="text-xs font-bold tabular-nums text-muted-foreground w-[36px] text-right">{sp.percentage}%</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* ─── Module Sections ─── */}
      <div className="space-y-4 opacity-0 animate-fade-in" style={{ animationDelay: '300ms' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Modules d'audit</h2>
          {enabledOnly.length < allNonParam.length && (
            <Badge variant="secondary" className="text-[10px]">
              {enabledOnly.length}/{allNonParam.length} dans le périmètre
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {SECTIONS.map(section => {
            const sectionModules = displayModules.filter(m => m.section === section);
            if (sectionModules.length === 0) return null;
            const config = SECTION_CONFIG[section];
            const enabledInSection = sectionModules.filter(m => m.enabled).length;

            return (
              <Card key={section} className="shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden group border-l-4" style={{ borderLeftColor: config.bgClass.match(/#[0-9A-Fa-f]{6}/)?.[0] || '#1A56A8' }}>
                {/* Section header */}
                <div className={`bg-gradient-to-r ${config.bgClass} px-4 py-3 flex flex-col gap-2`}>
                  <div className="flex items-center gap-3">
                    <img src={config.image} alt="" className="h-8 w-8 object-contain rounded-md bg-white/20 p-0.5" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-white tracking-wider uppercase truncate">{section}</h3>
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white border-0 text-[10px] shrink-0">
                    {enabledInSection}/{sectionModules.length}
                  </Badge>
                  </div>
                  {auditProgress.sections[section]?.total > 0 && (
                    <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${auditProgress.sections[section].percentage}%` }} />
                    </div>
                  )}
                </div>
                <CardContent className="p-2">
                  <div className="space-y-0.5">
                    {sectionModules.map(mod => {
                      const Icon = ICON_MAP[mod.icon] || FileText;
                      const modImage = MODULE_IMAGES[mod.id];
                      return (
                        <NavLink
                          key={mod.id}
                          to={mod.path}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors group/item ${!mod.enabled ? 'opacity-40' : ''}`}
                          activeClassName="bg-primary/8"
                        >
                          {modImage ? (
                            <img src={modImage} alt="" className="h-7 w-7 object-contain rounded flex-shrink-0" />
                          ) : (
                            <Icon className={`h-4 w-4 ${config.color} flex-shrink-0`} />
                          )}
                          <span className="text-sm font-medium flex-1 text-foreground truncate">{mod.label}</span>
                          {mod.enabled && (
                            <span className="h-1.5 w-1.5 rounded-full bg-success shrink-0" />
                          )}
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

      {/* ─── Team ─── */}
      {params.equipe.filter(m => m.isAuditeur).length > 0 && (
        <Card className="shadow-card opacity-0 animate-fade-in" style={{ animationDelay: '350ms' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Auditeurs désignés
            </CardTitle>
          </CardHeader>
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
