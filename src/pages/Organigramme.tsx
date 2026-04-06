import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { EquipeMembre, FONCTIONS_COMPTABLES, TACHES_COMPTABLES } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';
import { CONTROLES_ORGANIGRAMME } from '@/lib/regulatory-data';
import { ModulePageLayout , ComplianceCheck, ModuleSection } from '@/components/ModulePageLayout';

export default function OrganigrammePage() {
  const [items, setItems] = useState<EquipeMembre[]>(() => loadState('organigramme', []));
  const [regChecks, setRegChecks] = useState<Record<string, boolean>>(() => loadState('organigramme_checks', {}));
  const toggleRegCheck = (id: string) => { const u = { ...regChecks, [id]: !regChecks[id] }; setRegChecks(u); saveState('organigramme_checks', u); };
  const [form, setForm] = useState<any>(null);
  const save = (d: EquipeMembre[]) => { setItems(d); saveState('organigramme', d); };

  const submit = () => {
    if (!form || !form.nom) return;
    const item: EquipeMembre = { id: form.id || crypto.randomUUID(), nom: form.nom, fonction: form.fonction, telephone: form.telephone, email: form.email, taches: form.taches || [] };
    if (form.id) save(items.map(i => i.id === form.id ? item : i));
    else save([...items, item]);
    setForm(null);
  };

  return (
    <ModulePageLayout
      title="Organigramme fonctionnel"
      section="CONTRÔLE INTERNE"
      description="Description des fonctions comptables, des délégations et de la séparation des tâches. Vérification de la matrice de séparation ordonnateur/comptable."
      refs={[
        { code: "M9-6 § 1.2", label: "Organisation du service" },
        { code: "Art. 9 GBCP", label: "Séparation ordonnateur/comptable" },
        { code: "Cartop@le P1", label: "Organisation comptable" },
      ]}
      completedChecks={(CONTROLES_ORGANIGRAMME).filter(c => regChecks[c.id]).length}
      totalChecks={(CONTROLES_ORGANIGRAMME).length}
    >

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold">{items.length}</p><p className="text-xs text-muted-foreground mt-0.5">Agents</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold">{[...new Set(items.map(x => x.fonction))].length}</p><p className="text-xs text-muted-foreground mt-0.5">Fonctions distinctes</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold">{[...new Set(items.flatMap(x => x.taches || []))].length}</p><p className="text-xs text-muted-foreground mt-0.5">Tâches assignées</p></CardContent></Card>
      </div>

        <Button onClick={() => setForm({ nom: '', fonction: 'Agent Comptable', telephone: '', email: '', taches: [] })}><Plus className="h-4 w-4 mr-2" /> Membre</Button>
      </div>

      <div className="grid grid-cols-3 gap-3">

      {form && (
        <Card className="border-primary"><CardContent className="pt-6 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1"><Label className="text-xs">Nom complet</Label><Input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Fonction</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.fonction} onChange={e => setForm({ ...form, fonction: e.target.value })}>
                {FONCTIONS_COMPTABLES.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div className="space-y-1"><Label className="text-xs">Téléphone</Label><Input value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Courriel</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
          </div>
            <Label className="text-xs">Tâches attribuées (Op@le / Cartop@le)</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {TACHES_COMPTABLES.map(t => (
                <button key={t} onClick={() => setForm({ ...form, taches: form.taches.includes(t) ? form.taches.filter((x: string) => x !== t) : [...form.taches, t] })}
                  {t}
                </button>
              ))}
            </div>
          <div className="flex gap-2"><Button onClick={submit}>Valider</Button><Button variant="outline" onClick={() => setForm(null)}>Annuler</Button></div>
        </CardContent></Card>
      )}

      {items.length === 0 && !form && <Card><CardContent className="py-12 text-center text-muted-foreground">Aucun membre enregistré.</CardContent></Card>}
      {items.map(m => (
        <Card key={m.id}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">{m.nom.charAt(0)}</div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-lg">{m.nom}</p>
                <p className="text-sm text-primary font-semibold">{m.fonction}</p>
                <div className="flex flex-wrap gap-1 mt-2">{m.taches.map(t => <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">{t}</span>)}</div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => setForm({ ...m })}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => save(items.filter(i => i.id !== m.id))}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
          </CardContent>
        </Card>
      ))}

      {/* Contrôles réglementaires */}
      <ModuleSection title="Contrôles réglementaires — Organisation" description="M9-6 § 1.2 — Art. 9 GBCP" badge={`${(CONTROLES_ORGANIGRAMME).filter(c => regChecks[c.id]).length}/${(CONTROLES_ORGANIGRAMME).length}`}>
        <Card className="shadow-card">
          <CardContent className="p-3 space-y-2">
            {CONTROLES_ORGANIGRAMME.map(item => (
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
