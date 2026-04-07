import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { loadState, saveState } from '@/lib/store';
import { fmt } from '@/lib/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { CONTROLES_FDR } from '@/lib/regulatory-data';
import { ModulePageLayout , ComplianceCheck, ModuleSection } from '@/components/ModulePageLayout';

const COLORS_CHART = {
  green: 'hsl(152, 60%, 40%)',
  red: 'hsl(0, 72%, 51%)',
  orange: 'hsl(25, 95%, 53%)',
  primary: 'hsl(220, 65%, 38%)',
  purple: 'hsl(270, 50%, 50%)',
};

interface PrelevementDetail {
  id: string; objet: string; montant: number; voteCA: string; dateCA: string;
}

export default function FondsRoulementPage() {
  const [data, setData] = useState(() => loadState('fdr_data_v2', {
    // A — FDR Comptable
    fdrComptable: '',
    // 1 — Provisions et dépréciations (comptes 15,29,39,49,59)
    provisions: '',
    // 2 — Dépôts et cautions reçus (165)
    depotsCautions: '',
    // 3 — Stocks
    stocks: '',
    // 4 — Créances douteuses (416)
    creancesDouteuses: '',
    // 5 — Créances > 1 an non provisionnées
    creancesLongues: '',
    // 6 — Réserve de fonctionnement nécessaire (BFR)
    reserveFonctionnement: '',
    // 7 — Prélèvements FDR votés au BP ou DBM
    prelevementsVotes: '',
    // C — Charges décaissables (comptes 60 à 65 hors 658)
    chargesDecaissables: '',
    // Prélèvement envisagé
    prelevementEnvisage: '',
    motifPrelevement: '',
    // Observations
    obsOrdonnateur: '',
    avisAgentComptable: '',
    dateCA: '',
    obs: '',
  }));

  const [prelevements, setPrelevements] = useState<PrelevementDetail[]>(() => loadState('fdr_prelevements', []));
  const [regChecks, setRegChecks] = useState<Record<string, boolean>>(() => loadState('fdr_checks', {}));
  const toggleRegCheck = (id: string) => { const u = { ...regChecks, [id]: !regChecks[id] }; setRegChecks(u); saveState('fdr_checks', u); };
  const [formPrel, setFormPrel] = useState<any>(null);

  const update = (k: string, v: string) => { const n = { ...data, [k]: v }; setData(n); saveState('fdr_data_v2', n); };
  const savePrel = (d: PrelevementDetail[]) => { setPrelevements(d); saveState('fdr_prelevements', d); };

  const submitPrel = () => {
    if (!formPrel) return;
    const item: PrelevementDetail = { id: formPrel.id || crypto.randomUUID(), objet: formPrel.objet, montant: parseFloat(formPrel.montant) || 0, voteCA: formPrel.voteCA, dateCA: formPrel.dateCA };
    if (formPrel.id) savePrel(prelevements.map(i => i.id === formPrel.id ? item : i));
    else savePrel([...prelevements, item]);
    setFormPrel(null);
  };

  // Calculs FDRM
  const A = parseFloat(data.fdrComptable) || 0;
  const v1 = parseFloat(data.provisions) || 0;
  const v2 = parseFloat(data.depotsCautions) || 0;
  const v3 = parseFloat(data.stocks) || 0;
  const v4 = parseFloat(data.creancesDouteuses) || 0;
  const v5 = parseFloat(data.creancesLongues) || 0;
  const v6 = parseFloat(data.reserveFonctionnement) || 0;
  const v7 = parseFloat(data.prelevementsVotes) || 0;

  // B = A - 1 - 2 - 3 - 4 - 5 - 6 - 7
  const B = A - v1 - v2 - v3 - v4 - v5 - v6 - v7;

  // C = charges décaissables / 360
  const chargesTotal = parseFloat(data.chargesDecaissables) || 0;
  const C = chargesTotal > 0 ? chargesTotal / 360 : 0;

  // Jours de fonctionnement
  const joursDisponibles = C > 0 ? Math.round(B / C) : 0;

  // Prélèvement
  const prel = parseFloat(data.prelevementEnvisage) || 0;
  const totalPrelDetails = prelevements.reduce((s, p) => s + p.montant, 0);
  const BApres = B - prel;
  const joursApres = C > 0 ? Math.round(BApres / C) : 0;

  // Seuil critique : 30 jours
  const seuilCritique = C * 30;
  const margePrelevement = B - seuilCritique;

  const avis = useMemo(() => {
    if (!A || !chargesTotal) return null;
    if (joursApres < 30) return { type: 'critique', text: `AVIS DÉFAVORABLE — Le fonds de roulement disponible résiduel (${joursApres} jours) est inférieur au seuil critique de 30 jours. L'établissement risque de ne pas pouvoir faire face à ses charges courantes. Il est recommandé de ne pas procéder au prélèvement ou de le réduire significativement.` };
    if (joursApres < 60) return { type: 'vigilance', text: `AVIS RÉSERVÉ — Le fonds de roulement disponible après prélèvement (${joursApres} jours) est en zone de vigilance. L'établissement dispose d'une marge de sécurité limitée. Un suivi renforcé de la trésorerie est conseillé.` };
    if (joursApres < 90) return { type: 'acceptable', text: `AVIS FAVORABLE SOUS RÉSERVE — Le fonds de roulement disponible après prélèvement (${joursApres} jours) reste acceptable. L'établissement conserve une capacité d'autofinancement suffisante mais la vigilance reste de mise.` };
    return { type: 'confortable', text: `AVIS FAVORABLE — Le fonds de roulement disponible après prélèvement (${joursApres} jours) est confortable. L'établissement dispose d'une réserve financière importante permettant de faire face aux imprévus.` };
  }, [A, chargesTotal, joursApres]);

  const pieData = prel > 0 ? [
    { name: 'Prélevé', value: prel },
    { name: 'FDR résiduel', value: Math.max(0, BApres) },
  ] : [];

  const barData = [
    { name: 'FDR comptable (A)', montant: A },
    { name: 'FDR disponible (B)', montant: B },
    { name: 'FDR après prélèvement', montant: BApres },
    { name: 'Seuil critique (30j)', montant: seuilCritique },
  ];

  return (
    <ModulePageLayout
      title="Fonds de roulement"
      section="FINANCES & BUDGET"
      description="Analyse du fonds de roulement disponible selon la méthodologie IGAENR 2016-071 (rapport n°2016-071). Note méthodologique : cette page utilise le diviseur C/360 (charges décaissables annuelles / 360 jours) conformément au rapport IGAENR, ce qui est distinct de la méthode M9-6 § 4.5.3 utilisée dans le module Analyse financière (DRFN/365). Les deux méthodes coexistent légitimement : la première sert à évaluer le prélèvement sur FDR, la seconde à produire les indicateurs du compte financier."
      refs={[
        { code: "M9-6 § 4.5.3.1", label: "Fonds de roulement" },
        { code: "M9-6 § 4.5.3", label: "Indicateurs financiers" },
        { code: "DRFN", label: "Dénominateur des jours de FDR" },
      ]}
      completedChecks={(CONTROLES_FDR).filter(c => regChecks[c.id]).length}
      totalChecks={(CONTROLES_FDR).length}
    >

      {/* Paramètres CA */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1"><Label className="text-xs">Date du Conseil d'Administration</Label><Input type="date" value={data.dateCA} onChange={e => update('dateCA', e.target.value)} /></div>
            <div className="space-y-1"><Label className="text-xs">Motif du prélèvement</Label><Input value={data.motifPrelevement} onChange={e => update('motifPrelevement', e.target.value)} placeholder="Ex: Acquisition matériel pédagogique, travaux..." /></div>
          </div>
        </CardContent>
      </Card>

      {/* Tableau FDRM conforme au rapport IGAENR */}
      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-lg">Éléments de calcul — Rapport IGAENR 2016-071</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="p-2 text-left border text-xs w-8">#</th>
                  <th className="p-2 text-left border text-xs">Éléments de calcul</th>
                  <th className="p-2 text-left border text-xs">Comptes</th>
                  <th className="p-2 text-right border text-xs w-40">Montant (€)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-primary/5 font-bold">
                  <td className="p-2 border">A</td>
                  <td className="p-2 border">FONDS DE ROULEMENT COMPTABLE</td>
                  <td className="p-2 border text-xs text-muted-foreground">Arrêté à la clôture de l'exercice précédent</td>
                  <td className="p-2 border"><Input type="number" className="text-right font-bold" value={data.fdrComptable} onChange={e => update('fdrComptable', e.target.value)} /></td>
                </tr>
                <tr>
                  <td className="p-2 border">1</td>
                  <td className="p-2 border">FDR lié à des dépenses futures, probables ou certaines</td>
                  <td className="p-2 border text-xs text-muted-foreground">Provisions et dépréciations : 15, 29, 39, 49, 59</td>
                  <td className="p-2 border"><Input type="number" className="text-right" value={data.provisions} onChange={e => update('provisions', e.target.value)} /></td>
                </tr>
                <tr>
                  <td className="p-2 border">2</td>
                  <td className="p-2 border">Dépôts et cautions reçus</td>
                  <td className="p-2 border text-xs text-muted-foreground">Compte 165</td>
                  <td className="p-2 border"><Input type="number" className="text-right" value={data.depotsCautions} onChange={e => update('depotsCautions', e.target.value)} /></td>
                </tr>
                <tr>
                  <td className="p-2 border">3</td>
                  <td className="p-2 border">FDR affecté à des activités particulières</td>
                  <td className="p-2 border text-xs text-muted-foreground">Stocks</td>
                  <td className="p-2 border"><Input type="number" className="text-right" value={data.stocks} onChange={e => update('stocks', e.target.value)} /></td>
                </tr>
                <tr>
                  <td className="p-2 border">4</td>
                  <td className="p-2 border">Créances douteuses</td>
                  <td className="p-2 border text-xs text-muted-foreground">Compte 416</td>
                  <td className="p-2 border"><Input type="number" className="text-right" value={data.creancesDouteuses} onChange={e => update('creancesDouteuses', e.target.value)} /></td>
                </tr>
                <tr>
                  <td className="p-2 border">5</td>
                  <td className="p-2 border">Créances supérieures à 1 an non provisionnées</td>
                  <td className="p-2 border text-xs text-muted-foreground"></td>
                  <td className="p-2 border"><Input type="number" className="text-right" value={data.creancesLongues} onChange={e => update('creancesLongues', e.target.value)} /></td>
                </tr>
                <tr>
                  <td className="p-2 border">6</td>
                  <td className="p-2 border">Réserve de fonctionnement nécessaire à l'activité</td>
                  <td className="p-2 border text-xs text-muted-foreground">BFR</td>
                  <td className="p-2 border"><Input type="number" className="text-right" value={data.reserveFonctionnement} onChange={e => update('reserveFonctionnement', e.target.value)} /></td>
                </tr>
                <tr>
                  <td className="p-2 border">7</td>
                  <td className="p-2 border">Part du FDR déjà mobilisée</td>
                  <td className="p-2 border text-xs text-muted-foreground">Prélèvements sur FDR votés au BP ou DBM</td>
                  <td className="p-2 border"><Input type="number" className="text-right" value={data.prelevementsVotes} onChange={e => update('prelevementsVotes', e.target.value)} /></td>
                </tr>
                <tr className="bg-primary/10 font-bold">
                  <td className="p-2 border">B</td>
                  <td className="p-2 border">FONDS DE ROULEMENT DISPONIBLE (= A − 1 − 2 − 3 − 4 − 5 − 6 − 7)</td>
                  <td className="p-2 border"></td>
                  <td className="p-2 border text-right"><span className={B >= 0 ? 'text-green-700' : 'text-destructive'}>{fmt(B)}</span></td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="p-2 border">C</td>
                  <td className="p-2 border">Charges décaissables annuelles</td>
                  <td className="p-2 border text-xs text-muted-foreground">Comptes 60 à 65 hors 658</td>
                  <td className="p-2 border"><Input type="number" className="text-right" value={data.chargesDecaissables} onChange={e => update('chargesDecaissables', e.target.value)} /></td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="p-2 border"></td>
                  <td className="p-2 border">Montant d'une journée de fonctionnement (C/360)</td>
                  <td className="p-2 border"></td>
                  <td className="p-2 border text-right font-mono font-bold">{C > 0 ? fmt(C) : '—'}</td>
                </tr>
                <tr className="bg-primary/10 font-bold text-lg">
                  <td className="p-2 border"></td>
                  <td className="p-2 border">ÉVALUATION DU FDR DISPONIBLE EN JOURS (= B / C)</td>
                  <td className="p-2 border"></td>
                  <td className={`p-2 border text-right ${joursDisponibles < 30 ? 'text-destructive' : joursDisponibles < 60 ? 'text-orange-500' : 'text-green-700'}`}>{joursDisponibles} jours</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Synthèse chiffrée */}
      {A > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card className="shadow-card"><CardContent className="p-4"><p className="text-lg font-bold">{fmt(A)}</p><p className="text-xs text-muted-foreground">FDR comptable</p></CardContent></Card>
          <Card className="shadow-card"><CardContent className="p-4"><p className={`text-lg font-bold ${B >= 0 ? 'text-green-600' : 'text-destructive'}`}>{fmt(B)}</p><p className="text-xs text-muted-foreground">FDR disponible</p></CardContent></Card>
          <Card className="shadow-card"><CardContent className="p-4"><p className={`text-lg font-bold ${joursDisponibles < 30 ? 'text-destructive' : joursDisponibles < 60 ? 'text-orange-500' : 'text-green-600'}`}>{joursDisponibles}j</p><p className="text-xs text-muted-foreground">Jours disponibles</p></CardContent></Card>
          <Card className="shadow-card"><CardContent className="p-4"><p className="text-lg font-bold">{fmt(seuilCritique)}</p><p className="text-xs text-muted-foreground">Seuil critique (30j)</p></CardContent></Card>
          <Card className="shadow-card"><CardContent className="p-4"><p className={`text-lg font-bold ${margePrelevement > 0 ? 'text-green-600' : 'text-destructive'}`}>{fmt(margePrelevement)}</p><p className="text-xs text-muted-foreground">Marge de prélèvement</p></CardContent></Card>
        </div>
      )}

      {/* Prélèvement envisagé */}
      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-lg">Prélèvement envisagé</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1"><Label>Montant du prélèvement (€)</Label><Input type="number" value={data.prelevementEnvisage} onChange={e => update('prelevementEnvisage', e.target.value)} /></div>
            <div className="space-y-1">
              <Label>FDR disponible après prélèvement</Label>
              <div className={`h-10 flex items-center px-3 rounded-md border text-sm font-bold ${BApres >= 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-destructive/10 text-destructive border-destructive'}`}>{fmt(BApres)} ({joursApres} jours)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* État détaillé des prélèvements */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">État détaillé des prélèvements</CardTitle>
          <p className="text-xs text-muted-foreground">Détail des propositions de prélèvements à soumettre au CA</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button size="sm" onClick={() => setFormPrel({ objet: '', montant: '', voteCA: 'Proposition', dateCA: data.dateCA })}><Plus className="h-4 w-4 mr-2" /> Ajouter un prélèvement</Button>

          {formPrel && (
            <div className="p-4 border border-primary rounded-lg space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1"><Label className="text-xs">Objet</Label><Input value={formPrel.objet} onChange={e => setFormPrel({ ...formPrel, objet: e.target.value })} /></div>
                <div className="space-y-1"><Label className="text-xs">Montant (€)</Label><Input type="number" value={formPrel.montant} onChange={e => setFormPrel({ ...formPrel, montant: e.target.value })} /></div>
                <div className="space-y-1"><Label className="text-xs">Statut</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formPrel.voteCA} onChange={e => setFormPrel({ ...formPrel, voteCA: e.target.value })}>
                    <option>Proposition</option><option>Voté CA antérieur</option><option>Voté BP</option><option>Voté DBM</option>
                  </select>
                </div>
                <div className="space-y-1"><Label className="text-xs">Date CA</Label><Input type="date" value={formPrel.dateCA} onChange={e => setFormPrel({ ...formPrel, dateCA: e.target.value })} /></div>
              </div>
              <div className="flex gap-2"><Button size="sm" onClick={submitPrel}>Valider</Button><Button size="sm" variant="outline" onClick={() => setFormPrel(null)}>Annuler</Button></div>
            </div>
          )}

          {prelevements.length > 0 && (
            <table className="w-full text-sm">
              <thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">Objet</th><th className="text-right p-2">Montant</th><th className="p-2">Statut</th><th className="p-2">Date CA</th><th></th></tr></thead>
              <tbody>
                {prelevements.map(p => (
                  <tr key={p.id} className="border-b">
                    <td className="p-2 font-bold">{p.objet}</td>
                    <td className="p-2 text-right font-mono font-bold">{fmt(p.montant)}</td>
                    <td className="p-2"><Badge>{p.voteCA}</Badge></td>
                    <td className="p-2 text-xs">{p.dateCA}</td>
                    <td className="p-2"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => savePrel(prelevements.filter(i => i.id !== p.id))}><Trash2 className="h-3 w-3 text-destructive" /></Button></td>
                  </tr>
                ))}
                <tr className="bg-muted/30 font-bold">
                  <td className="p-2">TOTAL</td><td className="p-2 text-right font-mono">{fmt(totalPrelDetails)}</td><td colSpan={3}></td>
                </tr>
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Graphiques */}
      {A > 0 && prel > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="shadow-card">
            <CardHeader><CardTitle className="text-sm text-center">Répartition du FDR disponible</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    <Cell fill={COLORS_CHART.red} />
                    <Cell fill={BApres >= 0 ? COLORS_CHART.green : COLORS_CHART.red} />
                  </Pie>
                  <Tooltip formatter={(v: number) => fmt(v)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardHeader><CardTitle className="text-sm text-center">Comparaison des niveaux</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => [fmt(v), 'Montant']} />
                  <Bar dataKey="montant" radius={[4, 4, 0, 0]}>
                    <Cell fill={COLORS_CHART.primary} />
                    <Cell fill={B >= 0 ? COLORS_CHART.green : COLORS_CHART.red} />
                    <Cell fill={BApres >= 0 ? COLORS_CHART.green : COLORS_CHART.red} />
                    <Cell fill={COLORS_CHART.orange} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Avis */}
      {avis && (
        <Card className={`border-l-4 ${avis.type === 'critique' ? 'border-l-destructive' : avis.type === 'vigilance' ? 'border-l-orange-500' : 'border-l-green-500'}`}>
          <CardHeader><CardTitle className="text-lg">Avis de l'agent comptable</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm leading-relaxed font-medium">{avis.text}</p>
            <Separator />
            <div className="space-y-1"><Label className="text-xs">Observations de l'ordonnateur</Label><Textarea value={data.obsOrdonnateur} onChange={e => update('obsOrdonnateur', e.target.value)} rows={3} placeholder="L'ordonnateur saisit ses observations ici..." /></div>
            <div className="space-y-1"><Label className="text-xs">Avis consultatif de l'agent comptable</Label><Textarea value={data.avisAgentComptable} onChange={e => update('avisAgentComptable', e.target.value)} rows={3} placeholder="L'agent comptable saisit son avis ici..." /></div>
            <p className="text-xs text-muted-foreground italic">Ce document sera transmis au rectorat et présenté aux membres du conseil d'administration, accompagné des éléments de l'analyse financière.</p>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-lg">Observations générales</CardTitle></CardHeader>
        <CardContent>
          <Textarea value={data.obs} onChange={e => update('obs', e.target.value)} rows={4} placeholder="Observations sur le fonds de roulement..." />
        </CardContent>
      </Card>

      {/* Contrôles réglementaires */}
      <ModuleSection title="Contrôles réglementaires — Fonds de roulement" description="M9-6 § 4.5.3 — Recommandation CRC" badge={`${(CONTROLES_FDR).filter(c => regChecks[c.id]).length}/${(CONTROLES_FDR).length}`}>
        <Card className="shadow-card">
          <CardContent className="p-3 space-y-2">
            {CONTROLES_FDR.map(item => (
              <ComplianceCheck
                key={item.id}
                label={item.label}
                checked={regChecks[item.id] || false}
                onChange={() => toggleRegCheck(item.id)}
                severity={item.severity}
                detail={item.ref}
              />
            ))}
          </CardContent>
        </Card>
      </ModuleSection>
    </ModulePageLayout>
  );
}
