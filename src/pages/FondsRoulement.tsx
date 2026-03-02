import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { loadState, saveState } from '@/lib/store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function FondsRoulementPage() {
  const [fondsAvant, setFondsAvant] = useState<string>(() => loadState('fdr_avant', ''));
  const [prelevement, setPrelevement] = useState<string>(() => loadState('fdr_prelevement', ''));
  const [chargesAnnuelles, setChargesAnnuelles] = useState<string>(() => loadState('fdr_charges', ''));
  const [observations, setObservations] = useState<string>(() => loadState('fdr_obs', ''));

  const avant = parseFloat(fondsAvant) || 0;
  const prel = parseFloat(prelevement) || 0;
  const apres = avant - prel;
  const charges = parseFloat(chargesAnnuelles) || 0;

  const joursAvant = charges > 0 ? Math.round((avant / charges) * 365) : 0;
  const joursApres = charges > 0 ? Math.round((apres / charges) * 365) : 0;

  const chartData = [
    { name: 'Avant prélèvement', montant: avant, jours: joursAvant },
    { name: 'Après prélèvement', montant: apres, jours: joursApres },
  ];

  const avis = useMemo(() => {
    if (!avant || !charges) return null;
    if (joursApres < 30) return { type: 'critique', text: `Le fonds de roulement résiduel (${joursApres} jours) est critique. L'établissement risque de ne pas pouvoir faire face à ses charges courantes. Il est recommandé de ne pas procéder au prélèvement ou de le réduire significativement.` };
    if (joursApres < 60) return { type: 'vigilance', text: `Le fonds de roulement après prélèvement (${joursApres} jours) est en zone de vigilance. L'établissement dispose d'une marge de sécurité limitée. Un suivi renforcé de la trésorerie est conseillé.` };
    if (joursApres < 90) return { type: 'acceptable', text: `Le fonds de roulement après prélèvement (${joursApres} jours) reste acceptable. L'établissement conserve une capacité d'autofinancement suffisante.` };
    return { type: 'confortable', text: `Le fonds de roulement après prélèvement (${joursApres} jours) est confortable. L'établissement dispose d'une réserve financière importante.` };
  }, [avant, charges, joursApres]);

  const save = (key: string, setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    saveState(key, e.target.value);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Analyse du fonds de roulement</h1>

      <Card>
        <CardHeader><CardTitle className="text-lg">Données financières</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Fonds de roulement avant prélèvement (€)</Label>
            <Input type="number" value={fondsAvant} onChange={save('fdr_avant', setFondsAvant)} />
          </div>
          <div className="space-y-2">
            <Label>Prélèvement envisagé (€)</Label>
            <Input type="number" value={prelevement} onChange={save('fdr_prelevement', setPrelevement)} />
          </div>
          <div className="space-y-2">
            <Label>Charges annuelles de fonctionnement (€)</Label>
            <Input type="number" value={chargesAnnuelles} onChange={save('fdr_charges', setChargesAnnuelles)} />
          </div>
        </CardContent>
      </Card>

      {avant > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Graphique comparatif</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => [`${v.toLocaleString('fr-FR')} €`, 'Montant']} />
                <Bar dataKey="montant" radius={[4, 4, 0, 0]}>
                  <Cell fill="hsl(220, 65%, 38%)" />
                  <Cell fill={apres < 0 ? 'hsl(0, 72%, 51%)' : 'hsl(152, 60%, 40%)'} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4 mt-4 text-center">
              <div className="p-3 rounded-lg bg-primary/10">
                <p className="text-xl font-bold">{joursAvant} jours</p>
                <p className="text-xs text-muted-foreground">Autonomie avant prélèvement</p>
              </div>
              <div className={`p-3 rounded-lg ${joursApres < 30 ? 'bg-destructive/10' : joursApres < 60 ? 'bg-accent/10' : 'bg-green-50'}`}>
                <p className="text-xl font-bold">{joursApres} jours</p>
                <p className="text-xs text-muted-foreground">Autonomie après prélèvement</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {avis && (
        <Card className={`border-l-4 ${avis.type === 'critique' ? 'border-l-destructive' : avis.type === 'vigilance' ? 'border-l-accent' : 'border-l-green-500'}`}>
          <CardHeader><CardTitle className="text-lg">Avis sur le fonds de roulement</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{avis.text}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-lg">Observations</CardTitle></CardHeader>
        <CardContent>
          <Textarea value={observations} onChange={e => { setObservations(e.target.value); saveState('fdr_obs', e.target.value); }} rows={5} placeholder="Observations sur le fonds de roulement..." />
        </CardContent>
      </Card>
    </div>
  );
}
