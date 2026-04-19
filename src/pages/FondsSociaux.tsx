import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { FondSocial, fmt } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';
import { CONTROLES_FONDS_SOCIAUX } from '@/lib/regulatory-data';
import { ModulePageLayout , ComplianceCheck, ModuleSection } from '@/components/ModulePageLayout';
import { ControlAlert } from '@/components/ControlAlert';
import { DoctrineEPLE } from '@/components/DoctrineEPLE';

/** Plafond indicatif d'aide individuelle FSL/FSC : au-delà, examen renforcé en commission. */
const PLAFOND_AIDE_INDIVIDUELLE = 600;
/** Une aide annuelle cumulée ne doit pas dépasser le montant de la facture (frais scolaires + DP). */
const PLAFOND_BOURSE_FSC_ANNUEL = 1500;

export default function FondsSociaux() {
  const [items, setItems] = useState<FondSocial[]>(() => loadState('fonds_sociaux', []));
  const [regChecks, setRegChecks] = useState<Record<string, boolean>>(() => loadState('fonds_sociaux_checks', {}));
  const toggleRegCheck = (id: string) => { const u = { ...regChecks, [id]: !regChecks[id] }; setRegChecks(u); saveState('fonds_sociaux_checks', u); };
  const [form, setForm] = useState<any>(null);
  const save = (d: FondSocial[]) => { setItems(d); saveState('fonds_sociaux', d); };

  const submit = () => {
    if (!form || !form.nom) return;
    const item: FondSocial = { id: form.id || crypto.randomUUID(), type: form.type, nom: form.nom, objet: form.objet, montant: parseFloat(form.montant) || 0, decision: form.decision, dateCommission: form.dateCommission, compte: '6576' };
    if (form.id) save(items.map(i => i.id === form.id ? item : i));
    else save([...items, item]);
    setForm(null);
  };

  return (
    <ModulePageLayout
      title="Fonds sociaux"
      section="GESTION COMPTABLE"
      description="Gestion des fonds sociaux lycéens (FSL) et fonds sociaux cantine. Attribution par la commission présidée par le chef d'établissement, respect de l'anonymat et traçabilité."
      refs={[
        { code: "Art. R.531-29 C.Édu", label: "Fonds social lycéen" },
        { code: "Circ. 98-044", label: "Fonds social cantine" },
        { code: "M9-6 § 4.2", label: "Suivi comptable" },
      ]}
      completedChecks={(CONTROLES_FONDS_SOCIAUX).filter(c => regChecks[c.id]).length}
      totalChecks={(CONTROLES_FONDS_SOCIAUX).length}
    >
      <DoctrineEPLE theme="fonds-sociaux" titre="Fonds sociaux (collégien / lycéen / cantine)" resume="Circulaire 2017-122 — commission, plafond bourses + FSC ≤ frais scolaires" />

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold">{items.length}</p><p className="text-xs text-muted-foreground mt-0.5">Demandes traitées</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold">{fmt(items.reduce((s,x) => s + (x.montant || 0), 0))}</p><p className="text-xs text-muted-foreground mt-0.5">Montant attribué</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold text-green-600">{items.filter(x => x.type === 'FSL').length}</p><p className="text-xs text-muted-foreground mt-0.5">Fonds social lycéen</p></CardContent></Card>
      </div>

      {/* Alertes plafonds — Circ. 98-044 et 2017-122 */}
      {(() => {
        const accordes = items.filter(i => i.decision === 'Accordé');
        const depassementUnitaire = accordes.filter(i => (i.montant || 0) > PLAFOND_AIDE_INDIVIDUELLE);
        const cumuls = new Map<string, number>();
        accordes.forEach(i => cumuls.set(i.nom, (cumuls.get(i.nom) || 0) + (i.montant || 0)));
        const depassementCumul = Array.from(cumuls.entries()).filter(([, m]) => m > PLAFOND_BOURSE_FSC_ANNUEL);
        if (depassementUnitaire.length === 0 && depassementCumul.length === 0) return null;
        return (
          <div className="space-y-2">
            {depassementUnitaire.length > 0 && (
              <ControlAlert
                level="alerte"
                title={`${depassementUnitaire.length} aide${depassementUnitaire.length > 1 ? 's' : ''} dépassant le plafond unitaire de ${fmt(PLAFOND_AIDE_INDIVIDUELLE)}`}
                description="Au-delà de ce seuil, l'attribution doit faire l'objet d'un examen renforcé en commission, avec pièces justificatives complètes (avis d'imposition, situation familiale)."
                action="Vérifier la motivation au PV de commission, l'anonymisation du dossier et la traçabilité (compte 6576)."
                refLabel="Circ. 98-044 — Fonds sociaux"
              />
            )}
            {depassementCumul.length > 0 && (
              <ControlAlert
                level="critique"
                title={`${depassementCumul.length} bénéficiaire${depassementCumul.length > 1 ? 's' : ''} : aide cumulée FSC + bourse > ${fmt(PLAFOND_BOURSE_FSC_ANNUEL)}/an`}
                description="Le cumul des aides (bourse nationale + fonds social) ne doit pas excéder le coût total de la scolarité (frais d'internat / DP + fournitures). Tout excédent doit être restitué."
                action="Recalculer la facture annuelle de chaque bénéficiaire concerné et procéder à la régularisation (titre de recette ou réduction de l'aide). Tracer en commission."
                refLabel="Circ. 2017-122 — Aides sociales aux familles"
              />
            )}
          </div>
        );
      })()}

      <div className="flex justify-end">
        <Button onClick={() => setForm({ type: 'FSL', nom: '', objet: '', montant: '', decision: 'Accordé', dateCommission: new Date().toISOString().split('T')[0] })}><Plus className="h-4 w-4 mr-2" /> Nouvelle aide</Button>
      </div>

      {form && (
        <Card className="border-primary">
          <CardContent className="pt-6 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="space-y-1"><Label className="text-xs">Type</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="FSL">Fonds Social Lycéen</option><option value="FSC">Fonds Social Cantine</option><option value="FS">Fonds Social Collégien</option>
                </select>
              </div>
              <div className="space-y-1"><Label className="text-xs">Bénéficiaire</Label><Input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Objet</Label><Input value={form.objet} onChange={e => setForm({ ...form, objet: e.target.value })} placeholder="Fournitures, Cantine..." /></div>
              <div className="space-y-1"><Label className="text-xs">Montant (€)</Label><Input type="number" value={form.montant} onChange={e => setForm({ ...form, montant: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Décision</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.decision} onChange={e => setForm({ ...form, decision: e.target.value })}>
                  <option>Accordé</option><option>Refusé</option><option>En attente</option><option>Accord partiel</option>
                </select>
              </div>
              <div className="space-y-1"><Label className="text-xs">Date commission</Label><Input type="date" value={form.dateCommission} onChange={e => setForm({ ...form, dateCommission: e.target.value })} /></div>
            </div>
            <div className="flex gap-2"><Button onClick={submit}>Valider</Button><Button variant="outline" onClick={() => setForm(null)}>Annuler</Button></div>
          </CardContent>
        </Card>
      )}

      {items.length === 0 && !form && <Card><CardContent className="py-12 text-center text-muted-foreground">Aucune aide enregistrée.</CardContent></Card>}
      {items.length > 0 && (
        <Card><CardContent className="pt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>{items.map(x => (
              <tr key={x.id} className="border-b">
                <td className="p-2"><Badge>{x.type}</Badge></td><td className="p-2 font-bold">{x.nom}</td><td className="p-2">{x.objet}</td>
                <td className="p-2 text-right font-mono font-bold">{fmt(x.montant)}</td>
                <td className="p-2"><Badge variant={x.decision === 'Accordé' ? 'secondary' : x.decision === 'Refusé' ? 'destructive' : 'default'}>{x.decision}</Badge></td>
                <td className="p-2 text-xs">{x.dateCommission}</td>
                <td className="p-2"><div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setForm({ ...x, montant: String(x.montant) })}><Pencil className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => save(items.filter(i => i.id !== x.id))}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        </CardContent></Card>
      )}

      {/* Contrôles réglementaires */}
      <ModuleSection title="Contrôles réglementaires — Fonds sociaux" description="Circ. 98-044" badge={`${(CONTROLES_FONDS_SOCIAUX).filter(c => regChecks[c.id]).length}/${(CONTROLES_FONDS_SOCIAUX).length}`}>
        <Card className="shadow-card">
          <CardContent className="p-3 space-y-2">
            {CONTROLES_FONDS_SOCIAUX.map(item => (
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
