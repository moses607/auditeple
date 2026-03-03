import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { loadState, saveState } from '@/lib/store';
import { fmt } from '@/lib/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = {
  primary: 'hsl(220, 65%, 38%)',
  green: 'hsl(152, 60%, 40%)',
  red: 'hsl(0, 72%, 51%)',
  orange: 'hsl(25, 95%, 53%)',
  blue: 'hsl(210, 70%, 50%)',
  purple: 'hsl(270, 50%, 50%)',
  teal: 'hsl(180, 50%, 40%)',
};

export default function FondsRoulementPage() {
  const [data, setData] = useState(() => loadState('fdr_data', {
    // Rubrique Académie de Marseille
    ressStables: '', emploisImmo: '',
    dettesCT: '', creancesCT: '', stocksVal: '',
    tresoDisp: '',
    chargesAnnuelles: '',
    prelevement: '',
    motifPrelevement: '',
    // Observations
    obs: '',
  }));

  const update = (k: string, v: string) => { const n = { ...data, [k]: v }; setData(n); saveState('fdr_data', n); };

  const ressStables = parseFloat(data.ressStables) || 0;
  const emploisImmo = parseFloat(data.emploisImmo) || 0;
  const fr = ressStables - emploisImmo;

  const creancesCT = parseFloat(data.creancesCT) || 0;
  const stocksVal = parseFloat(data.stocksVal) || 0;
  const dettesCT = parseFloat(data.dettesCT) || 0;
  const bfr = (creancesCT + stocksVal) - dettesCT;

  const tresoDisp = parseFloat(data.tresoDisp) || 0;
  const tresoNette = fr - bfr;

  const charges = parseFloat(data.chargesAnnuelles) || 0;
  const prel = parseFloat(data.prelevement) || 0;
  const frApres = fr - prel;

  const joursAvant = charges > 0 ? Math.round((fr / charges) * 365) : 0;
  const joursApres = charges > 0 ? Math.round((frApres / charges) * 365) : 0;

  // Pie chart data: avant prélèvement
  const pieAvant = [
    { name: 'FR utilisé', value: Math.max(0, charges > 0 ? charges - fr : 0) },
    { name: 'FR disponible', value: Math.max(0, fr) },
  ];
  const pieApres = [
    { name: 'FR utilisé', value: Math.max(0, prel) },
    { name: 'FR restant', value: Math.max(0, frApres) },
  ];

  const barData = [
    { name: 'Avant', montant: fr, jours: joursAvant },
    { name: 'Après', montant: frApres, jours: joursApres },
  ];

  const avis = useMemo(() => {
    if (!fr || !charges) return null;
    if (joursApres < 30) return { type: 'critique', text: `AVIS DÉFAVORABLE — Le fonds de roulement résiduel (${joursApres} jours) est critique. L'établissement risque de ne pas pouvoir faire face à ses charges courantes. Il est recommandé de ne pas procéder au prélèvement ou de le réduire significativement.` };
    if (joursApres < 60) return { type: 'vigilance', text: `AVIS RÉSERVÉ — Le fonds de roulement après prélèvement (${joursApres} jours) est en zone de vigilance. L'établissement dispose d'une marge de sécurité limitée. Un suivi renforcé de la trésorerie est conseillé.` };
    if (joursApres < 90) return { type: 'acceptable', text: `AVIS FAVORABLE SOUS RÉSERVE — Le fonds de roulement après prélèvement (${joursApres} jours) reste acceptable. L'établissement conserve une capacité d'autofinancement suffisante mais la vigilance reste de mise.` };
    return { type: 'confortable', text: `AVIS FAVORABLE — Le fonds de roulement après prélèvement (${joursApres} jours) est confortable. L'établissement dispose d'une réserve financière importante permettant de faire face aux imprévus.` };
  }, [fr, charges, joursApres]);

  const PIE_COLORS = [COLORS.orange, COLORS.green];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Analyse du fonds de roulement</h1>
      <p className="text-xs text-muted-foreground">Réf. : Document Académie de Marseille — Demande de prélèvement sur fonds de roulement</p>

      {/* Rubriques complètes */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Bilan fonctionnel</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1"><Label className="text-xs">Ressources stables (€)</Label><Input type="number" value={data.ressStables} onChange={e => update('ressStables', e.target.value)} placeholder="Classe 1 (hors c/15)" /></div>
          <div className="space-y-1"><Label className="text-xs">Emplois immobilisés (€)</Label><Input type="number" value={data.emploisImmo} onChange={e => update('emploisImmo', e.target.value)} placeholder="Classe 2 net" /></div>
          <div className="space-y-1 md:col-span-1">
            <Label className="text-xs">Fonds de roulement (calculé)</Label>
            <div className={`h-10 flex items-center px-3 rounded-md border text-sm font-bold ${fr >= 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-destructive/10 text-destructive border-destructive'}`}>
              {fmt(fr)}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Besoin en fonds de roulement</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1"><Label className="text-xs">Créances CT (€)</Label><Input type="number" value={data.creancesCT} onChange={e => update('creancesCT', e.target.value)} /></div>
          <div className="space-y-1"><Label className="text-xs">Stocks (€)</Label><Input type="number" value={data.stocksVal} onChange={e => update('stocksVal', e.target.value)} /></div>
          <div className="space-y-1"><Label className="text-xs">Dettes CT (€)</Label><Input type="number" value={data.dettesCT} onChange={e => update('dettesCT', e.target.value)} /></div>
          <div className="space-y-1">
            <Label className="text-xs">BFR (calculé)</Label>
            <div className={`h-10 flex items-center px-3 rounded-md border text-sm font-bold ${bfr <= 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
              {fmt(bfr)}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Trésorerie et prélèvement</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1"><Label className="text-xs">Trésorerie disponible (€)</Label><Input type="number" value={data.tresoDisp} onChange={e => update('tresoDisp', e.target.value)} /></div>
          <div className="space-y-1"><Label className="text-xs">Charges annuelles de fonctionnement (€)</Label><Input type="number" value={data.chargesAnnuelles} onChange={e => update('chargesAnnuelles', e.target.value)} /></div>
          <div className="space-y-1"><Label className="text-xs">Prélèvement envisagé (€)</Label><Input type="number" value={data.prelevement} onChange={e => update('prelevement', e.target.value)} /></div>
          <div className="md:col-span-3 space-y-1">
            <Label className="text-xs">Motif du prélèvement</Label>
            <Input value={data.motifPrelevement} onChange={e => update('motifPrelevement', e.target.value)} placeholder="Ex: Acquisition de matériel pédagogique, travaux..." />
          </div>
        </CardContent>
      </Card>

      {/* Synthèse chiffrée */}
      {fr !== 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card><CardContent className="pt-4 text-center"><p className="text-xl font-bold">{fmt(fr)}</p><p className="text-xs text-muted-foreground">FR avant</p></CardContent></Card>
          <Card><CardContent className="pt-4 text-center"><p className={`text-xl font-bold ${frApres >= 0 ? 'text-green-600' : 'text-destructive'}`}>{fmt(frApres)}</p><p className="text-xs text-muted-foreground">FR après</p></CardContent></Card>
          <Card><CardContent className="pt-4 text-center"><p className="text-xl font-bold">{joursAvant}j</p><p className="text-xs text-muted-foreground">Autonomie avant</p></CardContent></Card>
          <Card><CardContent className="pt-4 text-center"><p className={`text-xl font-bold ${joursApres < 30 ? 'text-destructive' : joursApres < 60 ? 'text-orange-500' : 'text-green-600'}`}>{joursApres}j</p><p className="text-xs text-muted-foreground">Autonomie après</p></CardContent></Card>
        </div>
      )}

      {/* Camemberts avant / après */}
      {fr > 0 && prel > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-sm text-center">Situation avant prélèvement</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={[{ name: 'Prélèvement', value: prel }, { name: 'FR restant', value: Math.max(0, fr - prel) }]} dataKey="value" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    <Cell fill={COLORS.orange} />
                    <Cell fill={COLORS.green} />
                  </Pie>
                  <Tooltip formatter={(v: number) => fmt(v)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm text-center">Situation après prélèvement</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={[{ name: 'Prélevé', value: prel }, { name: 'FR résiduel', value: Math.max(0, frApres) }]} dataKey="value" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    <Cell fill={COLORS.red} />
                    <Cell fill={frApres >= 0 ? COLORS.green : COLORS.red} />
                  </Pie>
                  <Tooltip formatter={(v: number) => fmt(v)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Histogramme comparatif */}
      {fr > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Comparaison avant / après prélèvement</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => [fmt(v), 'Montant']} />
                <Bar dataKey="montant" radius={[4, 4, 0, 0]}>
                  <Cell fill={COLORS.primary} />
                  <Cell fill={frApres < 0 ? COLORS.red : COLORS.green} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Avis */}
      {avis && (
        <Card className={`border-l-4 ${avis.type === 'critique' ? 'border-l-destructive' : avis.type === 'vigilance' ? 'border-l-orange-500' : 'border-l-green-500'}`}>
          <CardHeader><CardTitle className="text-lg">Avis sur le prélèvement</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed font-medium">{avis.text}</p>
            <p className="text-xs text-muted-foreground mt-2 italic">Cet avis sera intégré au document PDF à destination du rectorat et du conseil d'administration, accompagné des éléments de l'analyse financière.</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-lg">Observations</CardTitle></CardHeader>
        <CardContent>
          <Textarea value={data.obs} onChange={e => update('obs', e.target.value)} rows={5} placeholder="Observations sur le fonds de roulement..." />
        </CardContent>
      </Card>
    </div>
  );
}
