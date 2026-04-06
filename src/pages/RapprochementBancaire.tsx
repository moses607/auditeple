import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { RapprochementItem, fmt, fmtDate } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';
import { CONTROLES_RAPPROCHEMENT } from '@/lib/regulatory-data';
import { ModulePageLayout, AnomalyAlert, ComplianceCheck, ModuleSection } from '@/components/ModulePageLayout';

export default function RapprochementBancaire() {
  const [items, setItems] = useState<RapprochementItem[]>(() => loadState('rapprochement', []));
  const [regChecks, setRegChecks] = useState<Record<string, boolean>>(() => loadState('rapprochement_checks', {}));
  const toggleRegCheck = (id: string) => { const u = { ...regChecks, [id]: !regChecks[id] }; setRegChecks(u); saveState('rapprochement_checks', u); };
  const [form, setForm] = useState<any>(null);
  const save = (d: RapprochementItem[]) => { setItems(d); saveState('rapprochement', d); };

  const submit = () => {
    if (!form) return;
    const dft = parseFloat(form.dft) || 0, compta = parseFloat(form.compta) || 0;
    const item: RapprochementItem = { id: form.id || crypto.randomUUID(), date: form.date, dft, compta, ecart: +(dft - compta).toFixed(2), suspens: parseInt(form.suspens) || 0, statut: Math.abs(dft - compta) < 0.01 ? 'Concordant' : 'Écart', observations: form.observations };
    if (form.id) save(items.map(i => i.id === form.id ? item : i));
    else save([item, ...items]);
    setForm(null);
  };

  const ecarts = items.filter(x => x.ecart !== 0);

  return (
    <ModulePageLayout
      title="Rapprochement bancaire"
      section="CONTRÔLES SUR PLACE"
      description="État de rapprochement entre le solde du compte au Trésor (DFT, compte 515) et la comptabilité de l'EPLE dans Op@le. Identification et justification des suspens."
      refs={[
        { code: 'M9-6 § 3.1.3', label: 'Rapprochement bancaire' },
        { code: 'Art. 18 GBCP', label: 'Contrôle du comptable' },
        { code: 'C/515100', label: 'Compte au Trésor' },
      ]}
      headerActions={
        <Button className="bg-white/20 hover:bg-white/30 text-white border-white/25" variant="outline"
          onClick={() => setForm({ date: new Date().toISOString().split('T')[0], dft: '', compta: '', suspens: '0', observations: '' })}
        ><Plus className="h-4 w-4 mr-2" /> Nouveau rapprochement</Button>
      }
      completedChecks={(CONTROLES_RAPPROCHEMENT).filter(c => regChecks[c.id]).length}
      totalChecks={(CONTROLES_RAPPROCHEMENT).length}
    >
      {/* ─── KPI ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold">{items.length}</p><p className="text-xs text-muted-foreground">Rapprochements</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className={`text-2xl font-bold ${ecarts.length > 0 ? 'text-destructive' : 'text-green-600'}`}>{ecarts.length}</p><p className="text-xs text-muted-foreground">Écarts</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold">{items.reduce((s, x) => s + x.suspens, 0)}</p><p className="text-xs text-muted-foreground">Suspens totaux</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold text-green-600">{items.filter(x => x.statut === 'Concordant').length}</p><p className="text-xs text-muted-foreground">Concordants</p></CardContent></Card>
      </div>

      {/* Contrôles réglementaires */}
      <ModuleSection title="Contrôles réglementaires — Rapprochement" description="M9-6 § 3.1.3" badge={`${(CONTROLES_RAPPROCHEMENT).filter(c => regChecks[c.id]).length}/${(CONTROLES_RAPPROCHEMENT).length}`}>
        <Card className="shadow-card">
          <CardContent className="p-3 space-y-2">
            {CONTROLES_RAPPROCHEMENT.map(item => (
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

      {ecarts.length > 0 && (
        <AnomalyAlert title={`${ecarts.length} rapprochement${ecarts.length > 1 ? 's' : ''} avec écart non justifié`}
          description="Tout écart entre le solde DFT et la comptabilité doit être justifié par des opérations en suspens identifiées."
          severity="error" />
      )}

      {form && (
        <Card className="border-primary">
          <CardContent className="pt-6 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1"><Label className="text-xs">Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Solde DFT (€)</Label><Input type="number" value={form.dft} onChange={e => setForm({ ...form, dft: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Solde comptabilité (€)</Label><Input type="number" value={form.compta} onChange={e => setForm({ ...form, compta: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Suspens</Label><Input type="number" value={form.suspens} onChange={e => setForm({ ...form, suspens: e.target.value })} /></div>
            </div>
            <Textarea value={form.observations} onChange={e => setForm({ ...form, observations: e.target.value })} placeholder="Observations..." rows={2} />
            <div className="flex gap-2"><Button onClick={submit}>Valider</Button><Button variant="outline" onClick={() => setForm(null)}>Annuler</Button></div>
          </CardContent>
        </Card>
      )}

      {items.length === 0 && !form && <Card><CardContent className="py-12 text-center text-muted-foreground">Aucun rapprochement enregistré.</CardContent></Card>}

      {items.map(x => (
        <Card key={x.id} className={x.ecart !== 0 ? 'border-destructive' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div><span className="font-bold">{fmtDate(x.date)}</span> <Badge variant={x.statut === 'Concordant' ? 'secondary' : 'destructive'} className="ml-2">{x.statut}</Badge></div>
              <Button variant="ghost" size="icon" onClick={() => save(items.filter(i => i.id !== x.id))}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
            <div className="grid grid-cols-4 gap-3 text-sm">
              <div><span className="text-muted-foreground text-xs">DFT</span><p className="font-mono font-bold">{fmt(x.dft)}</p></div>
              <div><span className="text-muted-foreground text-xs">Comptabilité</span><p className="font-mono font-bold">{fmt(x.compta)}</p></div>
              <div><span className="text-muted-foreground text-xs">Écart</span><p className={`font-mono font-bold ${x.ecart === 0 ? 'text-green-600' : 'text-destructive'}`}>{fmt(x.ecart)}</p></div>
              <div><span className="text-muted-foreground text-xs">Suspens</span><p className="font-bold">{x.suspens}</p></div>
            </div>
            {x.observations && <p className="text-xs text-muted-foreground mt-2">{x.observations}</p>}
          </CardContent>
        </Card>
      ))}
    </ModulePageLayout>
  );
}
