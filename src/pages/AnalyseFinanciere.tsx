import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { fmt } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';

export default function AnalyseFinanciere() {
  const [data, setData] = useState(() => loadState('analyse_fin', { fr: '', bfr: '', treso: '', budget: '', frN1: '', frN2: '', obs: '' }));
  const update = (k: string, v: string) => { const n = { ...data, [k]: v }; setData(n); saveState('analyse_fin', n); };

  const fr = parseFloat(data.fr) || 0, budget = parseFloat(data.budget) || 0;
  const frJ = budget > 0 ? Math.round(fr / (budget / 365)) : 0;
  const bfr = parseFloat(data.bfr) || 0, treso = parseFloat(data.treso) || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Analyse Financière</h1>
      <p className="text-xs text-muted-foreground">Réf. : M9-6 § 2.3 — Analyse financière rétrospective — FR ≥ 30j minimum CRC</p>

      <Card>
        <CardHeader><CardTitle className="text-lg">Données financières</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1"><Label className="text-xs">Fonds de Roulement (€)</Label><Input type="number" value={data.fr} onChange={e => update('fr', e.target.value)} /></div>
          <div className="space-y-1"><Label className="text-xs">BFR (€)</Label><Input type="number" value={data.bfr} onChange={e => update('bfr', e.target.value)} /></div>
          <div className="space-y-1"><Label className="text-xs">Trésorerie (€)</Label><Input type="number" value={data.treso} onChange={e => update('treso', e.target.value)} /></div>
          <div className="space-y-1"><Label className="text-xs">Budget annuel (€)</Label><Input type="number" value={data.budget} onChange={e => update('budget', e.target.value)} /></div>
          <div className="space-y-1"><Label className="text-xs">FR N-1 (€)</Label><Input type="number" value={data.frN1} onChange={e => update('frN1', e.target.value)} /></div>
          <div className="space-y-1"><Label className="text-xs">FR N-2 (€)</Label><Input type="number" value={data.frN2} onChange={e => update('frN2', e.target.value)} /></div>
        </CardContent>
      </Card>

      {fr > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{fmt(fr)}</p><p className="text-xs text-muted-foreground">FR</p></CardContent></Card>
          <Card><CardContent className="pt-4 text-center"><p className={`text-2xl font-bold ${frJ >= 60 ? 'text-green-600' : frJ >= 30 ? 'text-orange-500' : 'text-destructive'}`}>{frJ}j</p><p className="text-xs text-muted-foreground">FR en jours</p></CardContent></Card>
          <Card><CardContent className="pt-4 text-center"><p className={`text-2xl font-bold ${bfr >= 0 ? 'text-green-600' : 'text-destructive'}`}>{fmt(bfr)}</p><p className="text-xs text-muted-foreground">BFR</p></CardContent></Card>
          <Card><CardContent className="pt-4 text-center"><p className={`text-2xl font-bold ${treso >= 0 ? 'text-green-600' : 'text-destructive'}`}>{fmt(treso)}</p><p className="text-xs text-muted-foreground">Trésorerie</p></CardContent></Card>
          <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{fmt(budget)}</p><p className="text-xs text-muted-foreground">Budget</p></CardContent></Card>
        </div>
      )}

      {frJ > 0 && frJ < 30 && <Card className="border-l-4 border-l-destructive"><CardContent className="pt-4"><p className="text-sm text-destructive font-bold">CRITIQUE — FR {frJ}j &lt; 30j minimum CRC. Risque de trésorerie majeur.</p></CardContent></Card>}
      {frJ >= 30 && frJ < 60 && <Card className="border-l-4 border-l-orange-500"><CardContent className="pt-4"><p className="text-sm text-orange-600 font-bold">ATTENTION — FR {frJ}j &lt; 60j recommandé CRC.</p></CardContent></Card>}

      <Card>
        <CardHeader><CardTitle className="text-lg">Observations</CardTitle></CardHeader>
        <CardContent><Textarea value={data.obs} onChange={e => update('obs', e.target.value)} rows={4} placeholder="Analyse et commentaires..." /></CardContent>
      </Card>
    </div>
  );
}
