import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { ControleCaisseItem, BILLETS, PIECES, fmt, fmtDate } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';
import { CONTROLES_CAISSE } from '@/lib/regulatory-data';
import { ModulePageLayout, AnomalyAlert , ComplianceCheck, ModuleSection } from '@/components/ModulePageLayout';
import { DoctrineEPLE } from '@/components/DoctrineEPLE';

export default function ControleCaisse() {
  const [items, setItems] = useState<ControleCaisseItem[]>(() => loadState('ctrl_caisse', []));
  const [regChecks, setRegChecks] = useState<Record<string, boolean>>(() => loadState('ctrl_caisse_checks', {}));
  const toggleRegCheck = (id: string) => { const u = { ...regChecks, [id]: !regChecks[id] }; setRegChecks(u); saveState('ctrl_caisse_checks', u); };
  const [form, setForm] = useState<any>(null);

  const save = (d: ControleCaisseItem[]) => { setItems(d); saveState('ctrl_caisse', d); };

  const billetageTotal = (b: Record<string, number>) => {
    let t = 0;
    BILLETS.forEach(v => { t += (b['b' + v] || 0) * v; });
    PIECES.forEach(v => { const k = 'p' + String(v).replace('.', ''); t += (b[k] || 0) * v; });
    return t;
  };

  const submit = () => {
    if (!form) return;
    const reel = parseFloat(form.reel) || 0;
    const theo = parseFloat(form.theorique) || 0;
    const ecart = reel - theo;
    const item: ControleCaisseItem = {
      id: form.id || crypto.randomUUID(), date: form.date, regisseur: form.regisseur,
      type: form.type, plafond: parseFloat(form.plafond) || 0, theorique: theo, reel,
      ecart, statut: Math.abs(ecart) < 0.01 ? 'Conforme' : 'Écart', observations: form.observations,
      journalCaisse: form.journalCaisse, billetage: form.billetage || {},
    };
    if (form.id) save(items.map(i => i.id === form.id ? item : i));
    else save([item, ...items]);
    setForm(null);
  };

  const ecarts = items.filter(x => x.ecart !== 0);
  const journauxAbsents = items.filter(x => x.journalCaisse === false);

  return (
    <ModulePageLayout
      title="Contrôle de caisse"
      section="CONTRÔLES SUR PLACE"
      description="Contrôle inopiné de la caisse de l'agent comptable et des régisseurs. Comptage physique des espèces, vérification du journal de caisse et rapprochement avec le solde théorique."
      refs={[
        { code: 'M9-6 § 3.2.1', label: 'Vérification de la caisse' },
        { code: 'Art. 18 GBCP', label: 'Contrôle inopiné' },
        { code: 'Décret 2019-798', label: 'Art. 17 — Régies' },
      ]}
      headerActions={
        <Button
          className="bg-white/20 hover:bg-white/30 text-white border-white/25"
          variant="outline"
          onClick={() => setForm({ date: new Date().toISOString().split('T')[0], regisseur: '', type: 'Avances restauration', plafond: '', theorique: '', reel: '', observations: '', journalCaisse: null, billetage: {} })}
        >
          <Plus className="h-4 w-4 mr-2" /> Nouveau contrôle
        </Button>
      }
      completedChecks={(CONTROLES_CAISSE).filter(c => regChecks[c.id]).length}
      totalChecks={(CONTROLES_CAISSE).length}
    >
      <DoctrineEPLE theme="controle-caisse" titre="Contrôle inopiné de caisse" resume="Billetage, plafond, PV signé, écart en compte d'attente 476/477" />
      {/* ─── KPI ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold">{items.length}</p><p className="text-xs text-muted-foreground">Contrôles effectués</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className={`text-2xl font-bold ${ecarts.length > 0 ? 'text-destructive' : 'text-green-600'}`}>{ecarts.length}</p><p className="text-xs text-muted-foreground">Écarts détectés</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className={`text-2xl font-bold ${journauxAbsents.length > 0 ? 'text-destructive' : 'text-green-600'}`}>{journauxAbsents.length}</p><p className="text-xs text-muted-foreground">Journaux absents</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold">{items.filter(x => x.statut === 'Conforme').length}</p><p className="text-xs text-muted-foreground">Conformes</p></CardContent></Card>
      </div>

      {journauxAbsents.length > 0 && (
        <AnomalyAlert title="Journal de caisse absent — Anomalie majeure" description="L'absence de journal de caisse constitue un manquement à l'obligation de tenue comptable (M9-6 § 3.2.1)." severity="error" />
      )}

      {form && (
        <Card className="border-primary">
          <CardHeader><CardTitle className="text-lg">Saisie du contrôle</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1"><Label className="text-xs">Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Régisseur</Label><Input value={form.regisseur} onChange={e => setForm({ ...form, regisseur: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Type</Label><Input value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Plafond (€)</Label><Input type="number" value={form.plafond} onChange={e => setForm({ ...form, plafond: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Solde théorique (€)</Label><Input type="number" value={form.theorique} onChange={e => setForm({ ...form, theorique: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Solde réel compté (€)</Label><Input type="number" value={form.reel} onChange={e => setForm({ ...form, reel: e.target.value })} /></div>
            </div>

            {/* Billetage */}
            <div className="p-4 rounded-lg border border-primary bg-primary/5">
              <h4 className="text-sm font-bold text-primary mb-3">Billétage — Comptage des espèces</h4>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold mb-2">Billets</p>
                  {BILLETS.map(v => (
                    <div key={v} className="flex items-center gap-2 mb-1">
                      <span className="text-xs w-12 text-right font-semibold">{v} €</span>
                      <Input type="number" min={0} className="w-16 h-7 text-xs" value={form.billetage?.['b' + v] || ''} onChange={e => setForm({ ...form, billetage: { ...form.billetage, ['b' + v]: parseInt(e.target.value) || 0 } })} />
                      <span className="text-xs text-muted-foreground">{((form.billetage?.['b' + v] || 0) * v).toFixed(2)} €</span>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-bold mb-2">Pièces</p>
                  {PIECES.map(v => {
                    const k = 'p' + String(v).replace('.', '');
                    return (
                      <div key={v} className="flex items-center gap-2 mb-1">
                        <span className="text-xs w-12 text-right font-semibold">{v < 1 ? `${(v * 100).toFixed(0)}c` : `${v} €`}</span>
                        <Input type="number" min={0} className="w-16 h-7 text-xs" value={form.billetage?.[k] || ''} onChange={e => setForm({ ...form, billetage: { ...form.billetage, [k]: parseInt(e.target.value) || 0 } })} />
                        <span className="text-xs text-muted-foreground">{((form.billetage?.[k] || 0) * v).toFixed(2)} €</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="mt-3 p-2 bg-primary/10 rounded flex items-center justify-between">
                <span className="font-bold text-primary">Total compté : {billetageTotal(form.billetage || {}).toFixed(2)} €</span>
                <Button size="sm" variant="outline" onClick={() => setForm({ ...form, reel: billetageTotal(form.billetage || {}).toFixed(2) })}>↓ Reporter</Button>
              </div>
            </div>

            {/* Journal de caisse */}
            <div className={`p-3 rounded-lg border ${form.journalCaisse === false ? 'border-destructive bg-destructive/10' : form.journalCaisse === true ? 'border-green-500 bg-green-50' : 'border-border'}`}>
              <p className="text-xs font-bold mb-2">Journal de caisse — Vérification réglementaire</p>
              <p className="text-xs text-muted-foreground mb-2">Réf.: Décret 2012-1246, art. 18 — M9.6</p>
              <div className="flex gap-2">
                <Button size="sm" variant={form.journalCaisse === true ? 'default' : 'outline'} onClick={() => setForm({ ...form, journalCaisse: true })}>✓ Présent</Button>
                <Button size="sm" variant={form.journalCaisse === false ? 'destructive' : 'outline'} onClick={() => setForm({ ...form, journalCaisse: false })}>✗ Absent</Button>
              </div>
              {form.journalCaisse === false && <p className="text-xs text-destructive mt-2 font-bold">ANOMALIE MAJEURE — Absence de journal de caisse.</p>}
            </div>

            <Textarea value={form.observations} onChange={e => setForm({ ...form, observations: e.target.value })} placeholder="Observations..." rows={2} />
            <div className="flex gap-2">
              <Button onClick={submit}>Valider</Button>
              <Button variant="outline" onClick={() => setForm(null)}>Annuler</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {items.length === 0 && !form && <Card><CardContent className="py-12 text-center text-muted-foreground">Aucun contrôle. Cliquez « Nouveau contrôle ».</CardContent></Card>}

      {items.map(x => (
        <Card key={x.id} className={x.ecart !== 0 ? 'border-destructive' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div><span className="font-bold">{fmtDate(x.date)}</span> — {x.regisseur} <Badge variant={x.statut === 'Conforme' ? 'secondary' : 'destructive'} className="ml-2">{x.statut}</Badge></div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => setForm({ ...x, plafond: String(x.plafond), theorique: String(x.theorique), reel: String(x.reel) })}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => save(items.filter(i => i.id !== x.id))}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3 text-sm">
              <div><span className="text-muted-foreground text-xs">Théorique</span><p className="font-mono font-bold">{fmt(x.theorique)}</p></div>
              <div><span className="text-muted-foreground text-xs">Réel</span><p className="font-mono font-bold">{fmt(x.reel)}</p></div>
              <div><span className="text-muted-foreground text-xs">Écart</span><p className={`font-mono font-bold ${x.ecart === 0 ? 'text-green-600' : 'text-destructive'}`}>{fmt(x.ecart)}</p></div>
              <div><span className="text-muted-foreground text-xs">Journal</span><p className="font-bold">{x.journalCaisse === true ? '✓' : x.journalCaisse === false ? '✗ ABSENT' : '—'}</p></div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Contrôles réglementaires */}
      <ModuleSection title="Contrôles réglementaires — Caisse" description="M9-6 § 3.2.1 — Art. 18 GBCP" badge={`${(CONTROLES_CAISSE).filter(c => regChecks[c.id]).length}/${(CONTROLES_CAISSE).length}`}>
        <Card className="shadow-card">
          <CardContent className="p-3 space-y-2">
            {CONTROLES_CAISSE.map(item => (
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
