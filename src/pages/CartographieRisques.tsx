import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Pencil, Download } from 'lucide-react';
import { CartoRisque, NIVEAUX_RISQUE } from '@/lib/types';
import { CARTOPALE_PROCESSUS } from '@/lib/regulatory-data';
import { loadState, saveState } from '@/lib/store';
import { ModulePageLayout, AnomalyAlert } from '@/components/ModulePageLayout';

const PROCESSUS_LIST = CARTOPALE_PROCESSUS.map(p => `${p.code} — ${p.label}`);

const riskLevel = (r: CartoRisque) => {
  const n = r.probabilite * r.impact * r.maitrise;
  if (n >= 40) return { label: 'CRITIQUE', color: 'destructive' as const, bg: 'bg-destructive/5' };
  if (n >= 20) return { label: 'MAJEUR', color: 'default' as const, bg: 'bg-orange-50 dark:bg-orange-950/20' };
  if (n >= 10) return { label: 'MOYEN', color: 'secondary' as const, bg: '' };
  return { label: 'FAIBLE', color: 'secondary' as const, bg: '' };
};

export default function CartographieRisques() {
  const [items, setItems] = useState<CartoRisque[]>(() => loadState('cartographie', []));
  const [form, setForm] = useState<any>(null);
  const save = (d: CartoRisque[]) => { setItems(d); saveState('cartographie', d); };

  const submit = () => {
    if (!form || !form.risque) return;
    const item: CartoRisque = {
      id: form.id || crypto.randomUUID(), processus: form.processus, risque: form.risque,
      probabilite: parseInt(form.probabilite) || 3, impact: parseInt(form.impact) || 3,
      maitrise: parseInt(form.maitrise) || 3, action: form.action,
      responsable: form.responsable, echeance: form.echeance, statut: form.statut,
    };
    if (form.id) save(items.map(i => i.id === form.id ? item : i));
    else save([...items, item]);
    setForm(null);
  };

  const sorted = [...items].sort((a, b) => (b.probabilite * b.impact * b.maitrise) - (a.probabilite * a.impact * a.maitrise));
  const critiques = items.filter(r => r.probabilite * r.impact * r.maitrise >= 40);
  const majeurs = items.filter(r => { const n = r.probabilite * r.impact * r.maitrise; return n >= 20 && n < 40; });
  const coveredProcessus = [...new Set(items.map(r => r.processus.split(' — ')[0]))];

  return (
    <ModulePageLayout
      title="Cartographie des risques — CICF"
      section="CONTRÔLE INTERNE"
      description="Identification, cotation et traitement des risques comptables et financiers selon la méthodologie Cartop@le / ODICé."
      refs={[
        { code: 'Cartop@le', label: '11 processus CICF' },
        { code: 'Décret 2012-1246 art. 170', label: 'CICF — Contrôle Interne Comptable et Financier' },
        { code: 'ODICé', label: 'Outil de diagnostic' },
      ]}
      headerActions={
        <div className="flex gap-2">
          <Button
            className="bg-white/20 hover:bg-white/30 text-white border-white/25"
            variant="outline"
            onClick={() => setForm({
              processus: PROCESSUS_LIST[0], risque: '', probabilite: '3', impact: '3', maitrise: '3',
              action: '', responsable: '', echeance: 'Permanent', statut: 'À lancer',
            })}
          >
            <Plus className="h-4 w-4 mr-2" /> Nouveau risque
          </Button>
          {items.length > 0 && (
            <Button
              className="bg-white/20 hover:bg-white/30 text-white border-white/25"
              variant="outline"
              onClick={() => {
                const rows = [['Processus','Risque','P','I','M','Note','Action','Responsable','Échéance','Statut'], ...items.map(r => [r.processus, r.risque, r.probabilite, r.impact, r.maitrise, r.probabilite*r.impact*r.maitrise, r.action, r.responsable, r.echeance, r.statut])];
                const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(';')).join('\n');
                const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'})); a.download = `cartographie-risques-${new Date().toISOString().slice(0,10)}.csv`; a.click();
              }}
            >
              <Download className="h-4 w-4 mr-2" /> Export CSV
            </Button>
          )}
        </div>
      }
    >
      {/* ─── KPI ─── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="shadow-card"><CardContent className="p-4">
          <p className="text-2xl font-bold">{items.length}</p>
          <p className="text-xs text-muted-foreground">Risques identifiés</p>
        </CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4">
          <p className="text-2xl font-bold text-destructive">{critiques.length}</p>
          <p className="text-xs text-muted-foreground">Critiques (≥ 40)</p>
        </CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4">
          <p className="text-2xl font-bold text-orange-600">{majeurs.length}</p>
          <p className="text-xs text-muted-foreground">Majeurs (20-39)</p>
        </CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4">
          <p className="text-2xl font-bold">{coveredProcessus.length}/11</p>
          <p className="text-xs text-muted-foreground">Processus couverts</p>
        </CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4">
          <p className="text-2xl font-bold text-primary">{items.filter(r => r.statut === 'À lancer').length}</p>
          <p className="text-xs text-muted-foreground">Issus d'audit</p>
        </CardContent></Card>
      </div>

      {/* ─── Processus coverage ─── */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <p className="text-sm font-bold mb-3">Couverture des 11 processus Cartop@le</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
            {CARTOPALE_PROCESSUS.map(p => {
              const count = items.filter(r => r.processus.startsWith(p.code)).length;
              const hasCritical = items.some(r => r.processus.startsWith(p.code) && r.probabilite * r.impact * r.maitrise >= 40);
              return (
                <div key={p.code} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${count > 0 ? 'bg-muted/50' : 'opacity-50'}`}>
                  <span className={`h-2 w-2 rounded-full shrink-0 ${hasCritical ? 'bg-destructive' : count > 0 ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
                  <span className="font-mono text-xs text-muted-foreground w-7">{p.code}</span>
                  <span className="flex-1 truncate">{p.label}</span>
                  <Badge variant="secondary" className="text-[10px] shrink-0">{count}</Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {critiques.length > 0 && (
        <AnomalyAlert
          title={`${critiques.length} risque${critiques.length > 1 ? 's' : ''} critique${critiques.length > 1 ? 's' : ''} — action immédiate requise`}
          severity="error"
        />
      )}

      {/* ─── Form ─── */}
      {form && (
        <Card className="border-primary shadow-card-hover">
          <CardContent className="pt-6 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Processus Cartop@le</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.processus} onChange={e => setForm({ ...form, processus: e.target.value })}>
                  {PROCESSUS_LIST.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="space-y-1"><Label className="text-xs">Risque identifié</Label><Input value={form.risque} onChange={e => setForm({ ...form, risque: e.target.value })} placeholder="Décrire le risque..." /></div>
              <div className="space-y-1">
                <Label className="text-xs">Probabilité (1-5)</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.probabilite} onChange={e => setForm({ ...form, probabilite: e.target.value })}>
                  {NIVEAUX_RISQUE.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Impact (1-5)</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.impact} onChange={e => setForm({ ...form, impact: e.target.value })}>
                  {NIVEAUX_RISQUE.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Maîtrise (1-5, 5 = non maîtrisé)</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.maitrise} onChange={e => setForm({ ...form, maitrise: e.target.value })}>
                  {NIVEAUX_RISQUE.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
                </select>
              </div>
              <div className="space-y-1"><Label className="text-xs">Action corrective</Label><Input value={form.action} onChange={e => setForm({ ...form, action: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Responsable</Label><Input value={form.responsable} onChange={e => setForm({ ...form, responsable: e.target.value })} /></div>
              <div className="space-y-1">
                <Label className="text-xs">Échéance</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.echeance} onChange={e => setForm({ ...form, echeance: e.target.value })}>
                  {['Permanent', 'Mensuel', 'Trimestriel', 'Semestriel', 'Annuel'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Statut</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.statut} onChange={e => setForm({ ...form, statut: e.target.value })}>
                  {['À lancer', 'Planifié', 'En cours', 'Réalisé'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div className="p-3 bg-muted rounded-lg flex items-center justify-between">
              <span className="text-sm">Note de risque :</span>
              <span className="text-2xl font-bold">{(parseInt(form.probabilite) || 1) * (parseInt(form.impact) || 1) * (parseInt(form.maitrise) || 1)}</span>
            </div>
            <div className="flex gap-2">
              <Button onClick={submit}>Valider</Button>
              <Button variant="outline" onClick={() => setForm(null)}>Annuler</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Table ─── */}
      {items.length === 0 && !form && (
        <Card className="shadow-card"><CardContent className="py-12 text-center text-muted-foreground">
          Aucun risque enregistré. Utilisez « Nouveau risque » pour commencer l'analyse Cartop@le.
        </CardContent></Card>
      )}

      {sorted.length > 0 && (
        <Card className="shadow-card">
          <CardContent className="pt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="text-left p-2">Processus</th>
                  <th className="text-left p-2">Risque</th>
                  <th className="p-2">P</th><th className="p-2">I</th><th className="p-2">M</th>
                  <th className="p-2">Note</th><th className="p-2">Criticité</th>
                  <th className="text-left p-2">Action</th><th className="p-2">Statut</th><th></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(r => {
                  const n = r.probabilite * r.impact * r.maitrise;
                  const rl = riskLevel(r);
                  return (
                    <tr key={r.id} className={`border-b transition-colors ${rl.bg}`}>
                      <td className="p-2 font-bold text-xs">{r.processus}</td>
                      <td className="p-2 max-w-[200px]">{r.risque}</td>
                      <td className="p-2 text-center">{r.probabilite}</td>
                      <td className="p-2 text-center">{r.impact}</td>
                      <td className="p-2 text-center">{r.maitrise}</td>
                      <td className="p-2 text-center font-mono font-bold text-lg">{n}</td>
                      <td className="p-2"><Badge variant={rl.color}>{rl.label}</Badge></td>
                      <td className="p-2 text-xs max-w-[180px]">{r.action}</td>
                      <td className="p-2"><Badge variant={r.statut === 'Réalisé' ? 'secondary' : 'default'}>{r.statut}</Badge></td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setForm({ ...r, probabilite: String(r.probabilite), impact: String(r.impact), maitrise: String(r.maitrise) })}><Pencil className="h-3 w-3" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => save(items.filter(i => i.id !== r.id))}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </ModulePageLayout>
  );
}
