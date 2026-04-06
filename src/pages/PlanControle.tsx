import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { PlanControleItem } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';
import { ModulePageLayout } from '@/components/ModulePageLayout';

const TYPES_CONTROLE_M96 = [
  { type: 'Contrôle de caisse et des valeurs inactives', ref: 'M9-6 2026 § 4.3.1 — Vérification de l\'existence et de la concordance des fonds' },
  { type: 'Contrôle du compte DFT', ref: 'M9-6 2026 § 4.3.2 — Rapprochement solde comptable / solde bancaire' },
  { type: 'Rapprochement bancaire', ref: 'M9-6 2026 § 4.3.3 — État de rapprochement mensuel obligatoire' },
  { type: 'Contrôle des régies', ref: 'M9-6 2026 § 4.4 — Vérification des plafonds, comptabilité du régisseur, versements' },
  { type: 'Vérification des stocks et inventaire', ref: 'M9-6 2026 § 4.5 — Inventaire physique, rapprochement stock théorique/réel' },
  { type: 'Contrôle des droits constatés', ref: 'M9-6 2026 § 3.2 — Exhaustivité des recettes, créances non recouvrées' },
  { type: 'Contrôle de la liquidation des dépenses', ref: 'M9-6 2026 § 3.3 — Validité de la créance, service fait, exactitude de la liquidation' },
  { type: 'Suivi du recouvrement', ref: 'M9-6 2026 § 3.2.4 — Diligences de recouvrement, admissions en non-valeur' },
  { type: 'Contrôle des bourses', ref: 'M9-6 2026 § 3.2.2 — Exactitude des liquidations, versements trimestriels' },
  { type: 'Contrôle des voyages scolaires', ref: 'M9-6 2026 § 3.5 — Budget prévisionnel, pièces justificatives, seuils marchés' },
  { type: 'Contrôle de la commande publique', ref: 'M9-6 2026 § 3.3.2 — Respect des seuils, procédures de mise en concurrence' },
  { type: 'Contrôle de la restauration', ref: 'M9-6 2026 § 4.5.2 — Coût denrée, fréquentation, impayés' },
  { type: 'Contrôle des fonds sociaux', ref: 'M9-6 2026 § 3.2.3 — Commissions, justificatifs, comptes dédiés' },
  { type: 'Vérification du patrimoine', ref: 'M9-6 2026 § 4.6 — Inventaire des immobilisations, amortissements' },
  { type: 'Contrôle des subventions', ref: 'M9-6 2026 § 3.2.5 — Notifications, conditions d\'emploi, déchéance quadriennale' },
  { type: 'Contrôle des budgets annexes (SRH, etc.)', ref: 'M9-6 2026 § 2.2 — Équilibre, taux d\'exécution, compte 185' },
  { type: 'Vérification de la piste d\'audit', ref: 'M9-6 2026 § 5.1 — Traçabilité des opérations comptables' },
  { type: 'Contrôle de l\'organigramme fonctionnel', ref: 'M9-6 2026 § 1.2 — Séparation des tâches, habilitations' },
];

export default function PlanControle() {
  const [items, setItems] = useState<PlanControleItem[]>(() => loadState('plan_controle', []));
  const [form, setForm] = useState<any>(null);
  const save = (d: PlanControleItem[]) => { setItems(d); saveState('plan_controle', d); };
  const today = new Date().toISOString().split('T')[0];

  const toggleReal = (pId: string, date: string) => {
    save(items.map(p => {
      if (p.id !== pId) return p;
      const has = p.realises.includes(date);
      return { ...p, realises: has ? p.realises.filter(d => d !== date) : [...p.realises, date] };
    }));
  };

  const submit = () => {
    if (!form || !form.type) return;
    const selected = TYPES_CONTROLE_M96.find(t => t.type === form.type);
    const item: PlanControleItem = {
      id: crypto.randomUUID(), type: form.type, frequence: form.frequence,
      risque: form.risque, reference: selected?.ref || form.reference,
      planning: form.dates ? form.dates.split(',').map((d: string) => d.trim()).filter(Boolean) : [],
      realises: [], objectif: form.objectif,
    };
    save([...items, item]);
    setForm(null);
  };

  const pT = items.reduce((s, p) => s + p.planning.length, 0);
  const pR = items.reduce((s, p) => s + p.realises.length, 0);

  return (
    <ModulePageLayout
      title="Plan de contrôle — CICF"
      section="CONTRÔLE INTERNE"
      description="Planification annuelle des contrôles internes comptables et financiers. Définition des contrôles permanents et périodiques, affectation des responsables et suivi des échéances."
      refs={[
        { code: "Décret 2012-1246 art. 170-172", label: "Organisation du CICF" },
        { code: "Cartop@le", label: "11 processus" },
        { code: "ODICé", label: "Outil de diagnostic" },
      ]}
    >

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold">{items.length}</p><p className="text-xs text-muted-foreground mt-0.5">Contrôles planifiés</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold text-green-600">{items.filter(x => x.statut === 'Réalisé').length}</p><p className="text-xs text-muted-foreground mt-0.5">Réalisés</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold text-amber-600">{items.filter(x => x.statut === 'En cours').length}</p><p className="text-xs text-muted-foreground mt-0.5">En cours</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold text-destructive">{items.filter(x => x.statut === 'En retard' || x.statut === 'À lancer').length}</p><p className="text-xs text-muted-foreground mt-0.5">À faire / En retard</p></CardContent></Card>
      </div>

        <Button onClick={() => setForm({ type: TYPES_CONTROLE_M96[0].type, frequence: 'Trimestriel', risque: 'MOYEN', reference: TYPES_CONTROLE_M96[0].ref, dates: '', objectif: '' })}><Plus className="h-4 w-4 mr-2" /> Nouveau contrôle</Button>
      </div>

      <div className="grid grid-cols-3 gap-3">

      {form && (
        <Card className="border-primary"><CardContent className="pt-6 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1 md:col-span-2">
              <Label className="text-xs">Type de contrôle</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.type} onChange={e => {
                const sel = TYPES_CONTROLE_M96.find(t => t.type === e.target.value);
                setForm({ ...form, type: e.target.value, reference: sel?.ref || '' });
              }}>
                {TYPES_CONTROLE_M96.map(t => <option key={t.type} value={t.type}>{t.type}</option>)}
              </select>
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label className="text-xs">Référence M9-6 2026</Label>
            <div className="space-y-1"><Label className="text-xs">Fréquence</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.frequence} onChange={e => setForm({ ...form, frequence: e.target.value })}>
                <option>Mensuel</option><option>Trimestriel</option><option>Semestriel</option><option>Annuel</option>
              </select>
            </div>
            <div className="space-y-1"><Label className="text-xs">Risque</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.risque} onChange={e => setForm({ ...form, risque: e.target.value })}>
                <option>ÉLEVÉ</option><option>MOYEN</option><option>FAIBLE</option>
              </select>
            </div>
            <div className="space-y-1"><Label className="text-xs">Dates planifiées (séparées par des virgules)</Label><Input value={form.dates} onChange={e => setForm({ ...form, dates: e.target.value })} placeholder="2026-03-31, 2026-06-30" /></div>
            <div className="space-y-1"><Label className="text-xs">Objectif</Label><Input value={form.objectif} onChange={e => setForm({ ...form, objectif: e.target.value })} /></div>
          </div>
          <div className="flex gap-2"><Button onClick={submit}>Ajouter</Button><Button variant="outline" onClick={() => setForm(null)}>Annuler</Button></div>
        </CardContent></Card>
      )}

      {items.length === 0 && !form && <Card><CardContent className="py-12 text-center text-muted-foreground">Aucun contrôle planifié.</CardContent></Card>}

      {items.map(p => {
        const retard = p.planning.filter(d => d < today && !p.realises.includes(d)).length;
        return (
          <Card key={p.id} className={retard > 0 ? 'border-destructive' : ''}>
            <CardContent className="pt-6">
                  <Badge variant={p.risque === 'ÉLEVÉ' ? 'destructive' : p.risque === 'MOYEN' ? 'default' : 'secondary'} className="mr-2">{p.risque}</Badge>
                  <span className="font-bold">{p.type}</span>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => save(items.filter(i => i.id !== p.id))}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                </div>
              <div className="flex flex-wrap gap-2">
                {p.planning.map(d => {
                  const done = p.realises.includes(d);
                  const late = d < today && !done;
                  return (
                    <button key={d} onClick={() => toggleReal(p.id, d)}
                      className={`px-3 py-1 rounded-md text-xs font-bold border-2 transition-colors ${done ? 'border-green-500 bg-green-50 text-green-700' : late ? 'border-destructive bg-destructive/10 text-destructive' : 'border-border bg-background text-foreground'}`}>
                      {done ? '✓' : late ? '!' : '○'} {d}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </ModulePageLayout>
  );
}
