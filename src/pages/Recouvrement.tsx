import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { CreanceItem, fmt, fmtDate } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';
import { CONTROLES_RECOUVREMENT } from '@/lib/regulatory-data';
import { ModulePageLayout, AnomalyAlert, ComplianceCheck, ModuleSection } from '@/components/ModulePageLayout';

export default function Recouvrement() {
  const [items, setItems] = useState<CreanceItem[]>(() => loadState('creances', []));
  const [regChecks, setRegChecks] = useState<Record<string, boolean>>(() => loadState('recouvrement_checks', {}));
  const toggleRegCheck = (id: string) => { const u = { ...regChecks, [id]: !regChecks[id] }; setRegChecks(u); saveState('recouvrement_checks', u); };
  const [form, setForm] = useState<any>(null);
  const save = (d: CreanceItem[]) => { setItems(d); saveState('creances', d); };

  const submit = () => {
    if (!form || !form.debiteur) return;
    const item: CreanceItem = { id: form.id || crypto.randomUUID(), debiteur: form.debiteur, nature: form.nature, montant: parseFloat(form.montant) || 0, dateEmission: form.dateEmission, echeance: form.echeance, relances: parseInt(form.relances) || 0, derniereRelance: form.derniereRelance, statut: form.statut, observations: form.observations };
    if (form.id) save(items.map(i => i.id === form.id ? item : i));
    else save([...items, item]);
    setForm(null);
  };

  const totalMontant = items.reduce((s, x) => s + x.montant, 0);
  const contentieux = items.filter(x => x.statut === 'Contentieux');
  const anciennes = items.filter(x => {
    if (!x.dateEmission) return false;
    return (Date.now() - new Date(x.dateEmission).getTime()) > 60 * 86400000;
  });

  return (
    <ModulePageLayout
      title="Recouvrement des créances"
      section="FINANCES & BUDGET"
      description="Suivi des créances à recouvrer, relances, et procédure de recouvrement contentieux sous le régime RGP. Toute carence dans le recouvrement engage la responsabilité du gestionnaire public."
      refs={[
        { code: 'Ord. 2022-408', label: 'RGP — Responsabilité du gestionnaire public' },
        { code: 'Art. L.131-9 à L.131-15 CJF', label: 'Recouvrement contentieux' },
        { code: 'Art. 20 GBCP', label: 'Recouvrement des recettes' },
        { code: 'M9-6 § 4.2', label: 'Droits constatés et recouvrement' },
      ]}
      headerActions={
        <Button className="bg-white/20 hover:bg-white/30 text-white border-white/25" variant="outline"
          onClick={() => setForm({ debiteur: '', nature: '', montant: '', dateEmission: '', echeance: '', relances: '0', derniereRelance: '', statut: 'Relance amiable', observations: '' })}
        ><Plus className="h-4 w-4 mr-2" /> Nouvelle créance</Button>
      }
      completedChecks={(CONTROLES_RECOUVREMENT).filter(c => regChecks[c.id]).length}
      totalChecks={(CONTROLES_RECOUVREMENT).length}
    >
      {/* ─── KPI ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold">{items.length}</p><p className="text-xs text-muted-foreground">Créances suivies</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold text-destructive">{fmt(totalMontant)}</p><p className="text-xs text-muted-foreground">Montant total</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold text-destructive">{contentieux.length}</p><p className="text-xs text-muted-foreground">Contentieux</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className={`text-2xl font-bold ${anciennes.length > 0 ? 'text-orange-600' : 'text-green-600'}`}>{anciennes.length}</p><p className="text-xs text-muted-foreground">Créances &gt; 60 jours</p></CardContent></Card>
      </div>

      {/* Contrôles réglementaires */}
      <ModuleSection title="Contrôles réglementaires — Recouvrement" description="Art. 20 GBCP — Ordonnance 2022-408 (RGP)" badge={`${(CONTROLES_RECOUVREMENT).filter(c => regChecks[c.id]).length}/${(CONTROLES_RECOUVREMENT).length}`}>
        <Card className="shadow-card">
          <CardContent className="p-3 space-y-2">
            {CONTROLES_RECOUVREMENT.map(item => (
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

      {anciennes.length > 0 && (
        <AnomalyAlert
          title={`${anciennes.length} créance${anciennes.length > 1 ? 's' : ''} de plus de 60 jours sans recouvrement`}
          description="Sous le régime RGP (ordonnance 2022-408), toute carence dans le recouvrement engage la responsabilité du gestionnaire public. Des relances systématiques puis une mise en demeure sont obligatoires."
          severity="error"
        />
      )}

      {form && (
        <Card className="border-primary"><CardContent className="pt-6 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1"><Label className="text-xs">Débiteur</Label><Input value={form.debiteur} onChange={e => setForm({ ...form, debiteur: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Nature</Label><Input value={form.nature} onChange={e => setForm({ ...form, nature: e.target.value })} placeholder="DP T1, Cantine..." /></div>
            <div className="space-y-1"><Label className="text-xs">Montant (€)</Label><Input type="number" value={form.montant} onChange={e => setForm({ ...form, montant: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Date émission</Label><Input type="date" value={form.dateEmission} onChange={e => setForm({ ...form, dateEmission: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Échéance</Label><Input type="date" value={form.echeance} onChange={e => setForm({ ...form, echeance: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Nb relances</Label><Input type="number" value={form.relances} onChange={e => setForm({ ...form, relances: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Dernière relance</Label><Input type="date" value={form.derniereRelance} onChange={e => setForm({ ...form, derniereRelance: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Statut</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.statut} onChange={e => setForm({ ...form, statut: e.target.value })}>
                <option>Relance amiable</option><option>Contentieux</option><option>Titre exécutoire</option><option>ANV</option>
              </select>
            </div>
            <div className="space-y-1"><Label className="text-xs">Observations</Label><Input value={form.observations} onChange={e => setForm({ ...form, observations: e.target.value })} /></div>
          </div>
          <div className="flex gap-2"><Button onClick={submit}>Valider</Button><Button variant="outline" onClick={() => setForm(null)}>Annuler</Button></div>
        </CardContent></Card>
      )}

      {items.length === 0 && !form && <Card><CardContent className="py-12 text-center text-muted-foreground">Aucune créance.</CardContent></Card>}
      {items.length > 0 && (
        <>
          {/* Vue desktop */}
          <Card className="shadow-card hidden md:block"><CardContent className="pt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">Débiteur</th><th className="p-2">Nature</th><th className="text-right p-2">Montant</th><th className="p-2">Relances</th><th className="p-2">Statut</th><th></th></tr></thead>
              <tbody>{items.map(x => (
                <tr key={x.id} className={`border-b ${x.statut === 'Contentieux' ? 'bg-destructive/5' : ''}`}>
                  <td className="p-2 font-bold">{x.debiteur}</td><td className="p-2">{x.nature}</td>
                  <td className="p-2 text-right font-mono font-bold">{fmt(x.montant)}</td>
                  <td className="p-2 text-center">{x.relances}</td>
                  <td className="p-2"><Badge variant={x.statut === 'Contentieux' ? 'destructive' : 'default'}>{x.statut}</Badge></td>
                  <td className="p-2"><div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setForm({ ...x, montant: String(x.montant), relances: String(x.relances) })}><Pencil className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => save(items.filter(i => i.id !== x.id))}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          </CardContent></Card>
          {/* Vue mobile */}
          <div className="md:hidden space-y-2">
            {items.map(x => (
              <Card key={x.id} className={x.statut === 'Contentieux' ? 'border-destructive' : ''}>
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{x.debiteur}</span>
                    <Badge variant={x.statut === 'Contentieux' ? 'destructive' : 'default'} className="text-xs">{x.statut}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                    <span>Nature : {x.nature}</span>
                    <span>Relances : {x.relances}</span>
                    <span className="font-mono font-bold text-foreground col-span-2">{fmt(x.montant)}</span>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setForm({ ...x, montant: String(x.montant), relances: String(x.relances) })}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => save(items.filter(i => i.id !== x.id))}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </ModulePageLayout>
  );
}
