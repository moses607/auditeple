import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Pencil, AlertTriangle } from 'lucide-react';
import { SubventionItem, fmt, fmtDate } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';
import { CONTROLES_SUBVENTIONS } from '@/lib/regulatory-data';
import { ModulePageLayout , ComplianceCheck, ModuleSection } from '@/components/ModulePageLayout';
import { ControlAlert } from '@/components/ControlAlert';

export default function Subventions() {
  const [items, setItems] = useState<SubventionItem[]>(() => loadState('subventions', []));
  const [regChecks, setRegChecks] = useState<Record<string, boolean>>(() => loadState('subventions_checks', {}));
  const toggleRegCheck = (id: string) => { const u = { ...regChecks, [id]: !regChecks[id] }; setRegChecks(u); saveState('subventions_checks', u); };
  const [form, setForm] = useState<any>(null);
  const save = (d: SubventionItem[]) => { setItems(d); saveState('subventions', d); };

  const submit = () => {
    if (!form || !form.type) return;
    const notif = parseFloat(form.notifie) || 0, conso = parseFloat(form.consomme) || 0;
    const item: SubventionItem = {
      id: form.id || crypto.randomUUID(), type: form.type, programme: form.programme,
      notifie: notif, recu: parseFloat(form.recu) || 0, conditionsEmploi: form.conditionsEmploi || false,
      consomme: conso, reliquat: notif - conso, statut: form.statut,
      dateVersement: form.dateVersement || '', observations: form.observations || '',
    };
    if (form.id) save(items.map(i => i.id === form.id ? item : i));
    else save([...items, item]);
    setForm(null);
  };

  // Déchéance quadriennale check
  const checkDecheance = (dateVersement: string) => {
    if (!dateVersement) return null;
    const d = new Date(dateVersement);
    const now = new Date();
    const diffYears = (now.getTime() - d.getTime()) / (365.25 * 24 * 3600 * 1000);
    if (diffYears >= 4) return 'PRESCRITE';
    if (diffYears >= 3) return 'ALERTE';
    return null;
  };

  return (
    <ModulePageLayout
      title="Subventions"
      section="FINANCES & BUDGET"
      description="Suivi des notifications de subventions, vérification de l'emploi conforme à l'objet, et justification auprès des financeurs (Région, Département, État, Europe)."
      refs={[
        { code: "Art. R.421-58 C.Édu", label: "Budget de l'EPLE" },
        { code: "Art. 10 loi 2000-321", label: "Obligation de justification" },
        { code: "M9-6 § 4.2", label: "Constatation des recettes" },
      ]}
      completedChecks={(CONTROLES_SUBVENTIONS).filter(c => regChecks[c.id]).length}
      totalChecks={(CONTROLES_SUBVENTIONS).length}
    >

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold">{items.length}</p><p className="text-xs text-muted-foreground mt-0.5">Subventions suivies</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold">{fmt(items.reduce((s,x) => s + (x.notifie || 0), 0))}</p><p className="text-xs text-muted-foreground mt-0.5">Total notifié</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold text-green-600">{items.filter(x => x.conditionsEmploi).length}</p><p className="text-xs text-muted-foreground mt-0.5">Emploi justifié</p></CardContent></Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => setForm({ type: 'DGF État', programme: 'P141', notifie: '', recu: '', consomme: '', conditionsEmploi: false, statut: 'En cours', dateVersement: '', observations: '' })}><Plus className="h-4 w-4 mr-2" /> Ajouter</Button>
      </div>

      {form && (
        <Card className="border-primary"><CardContent className="pt-6 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="space-y-1"><Label className="text-xs">Type</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                {['DGF État', 'Bourses', 'Fonds sociaux', 'Région', 'Département', 'Taxe apprentissage', 'Subv. européenne', 'Autre'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1"><Label className="text-xs">Programme</Label><Input value={form.programme} onChange={e => setForm({ ...form, programme: e.target.value })} placeholder="P141, P230..." /></div>
            <div className="space-y-1"><Label className="text-xs">Notifié (€)</Label><Input type="number" value={form.notifie} onChange={e => setForm({ ...form, notifie: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Reçu (€)</Label><Input type="number" value={form.recu} onChange={e => setForm({ ...form, recu: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Consommé (€)</Label><Input type="number" value={form.consomme} onChange={e => setForm({ ...form, consomme: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Date de versement</Label><Input type="date" value={form.dateVersement} onChange={e => setForm({ ...form, dateVersement: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Statut</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.statut} onChange={e => setForm({ ...form, statut: e.target.value })}>
                <option>En cours</option><option>Soldé</option><option>Sous-consommé</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2"><Checkbox checked={form.conditionsEmploi} onCheckedChange={v => setForm({ ...form, conditionsEmploi: v })} /><Label className="text-xs">Conditions d'emploi</Label></div>
          <div className="space-y-1"><Label className="text-xs">Observations</Label><Textarea value={form.observations || ''} onChange={e => setForm({ ...form, observations: e.target.value })} rows={2} placeholder="Observations..." /></div>
          <div className="flex gap-2"><Button onClick={submit}>Valider</Button><Button variant="outline" onClick={() => setForm(null)}>Annuler</Button></div>
        </CardContent></Card>
      )}

      {items.length === 0 && !form && <Card><CardContent className="py-12 text-center text-muted-foreground">Aucune subvention.</CardContent></Card>}
      {items.length > 0 && (
        <Card><CardContent className="pt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>{items.map(x => {
              const tx = x.notifie > 0 ? x.consomme / x.notifie * 100 : 0;
              const dech = checkDecheance(x.dateVersement);
              return (
                <tr key={x.id} className={`border-b ${dech === 'PRESCRITE' ? 'bg-destructive/5' : ''}`}>
                  <td className="p-2 font-bold">{x.type}</td><td className="p-2 font-mono">{x.programme}</td>
                  <td className="p-2 text-right font-mono">{fmt(x.notifie)}</td><td className="p-2 text-right font-mono font-bold">{fmt(x.consomme)}</td>
                  <td className={`p-2 font-bold ${tx < 50 ? 'text-destructive' : 'text-green-600'}`}>{tx.toFixed(1)}%</td>
                  <td className={`p-2 text-right font-mono ${x.reliquat > 0 ? 'text-orange-600' : 'text-green-600'}`}>{fmt(x.reliquat)}</td>
                  <td className="p-2 text-xs">{x.dateVersement ? fmtDate(x.dateVersement) : '—'}</td>
                  <td className="p-2">
                    {dech === 'PRESCRITE' && <Badge variant="destructive">Prescrite</Badge>}
                    {dech === 'ALERTE' && <Badge className="bg-orange-500 text-white">3 ans+</Badge>}
                    {!dech && x.dateVersement && <span className="text-xs text-green-600">OK</span>}
                  </td>
                  <td className="p-2"><Badge variant={x.statut === 'Sous-consommé' ? 'destructive' : 'default'}>{x.statut}</Badge></td>
                  <td className="p-2"><div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setForm({ ...x, notifie: String(x.notifie), recu: String(x.recu), consomme: String(x.consomme) })}><Pencil className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => save(items.filter(i => i.id !== x.id))}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                  </div></td>
                </tr>
              );
            })}</tbody>
          </table>
        </CardContent></Card>
      )}

      {/* Alerte reliquats */}
      {items.filter(x => x.reliquat > 0 && x.statut !== 'Soldé').length > 0 && (
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="pt-4 space-y-2">
            <div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-orange-500" /><p className="font-bold text-sm">Reliquats de subventions non apurés</p></div>
            {items.filter(x => x.reliquat > 0 && x.statut !== 'Soldé').map(x => (
              <div key={x.id} className="text-sm p-2 rounded bg-orange-50 border border-orange-200">
                <p className="font-bold">{x.type} — {x.programme} — Reliquat : {fmt(x.reliquat)}</p>
                <p className="text-xs text-orange-700 italic mt-1">Qu'est-ce qui vous empêche d'apurer ce reliquat de subvention ?</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Contrôles réglementaires */}
      <ModuleSection title="Contrôles réglementaires — Subventions" description="Art. 10 Loi 2000-321" badge={`${(CONTROLES_SUBVENTIONS).filter(c => regChecks[c.id]).length}/${(CONTROLES_SUBVENTIONS).length}`}>
        <Card className="shadow-card">
          <CardContent className="p-3 space-y-2">
            {CONTROLES_SUBVENTIONS.map(item => (
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
