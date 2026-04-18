import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { StockItem, fmt } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';

import { CONTROLES_STOCKS } from '@/lib/regulatory-data';
import { ModulePageLayout, AnomalyAlert, ComplianceCheck, ModuleSection } from '@/components/ModulePageLayout';
import { ControlAlert } from '@/components/ControlAlert';

/** Seuil critique : un article sans mouvement depuis > 12 mois doit être déclassé (M9-6 § 2.1.4). */
const SEUIL_ROTATION_MOIS = 12;

export default function Stocks() {
  const [items, setItems] = useState<StockItem[]>(() => loadState('stocks', []));
  const [regChecks, setRegChecks] = useState<Record<string, boolean>>(() => loadState('stocks_checks', {}));
  const toggleRegCheck = (id: string) => { const u = { ...regChecks, [id]: !regChecks[id] }; setRegChecks(u); saveState('stocks_checks', u); };
  const [form, setForm] = useState<any>(null);
  const save = (d: StockItem[]) => { setItems(d); saveState('stocks', d); };

  const submit = () => {
    if (!form || !form.nom) return;
    const phys = parseInt(form.phys) || 0, cu = parseFloat(form.cump) || 0;
    const ecart = phys - (parseInt(form.theo) || 0);
    const dlcAlert = form.dlc && (new Date(form.dlc).getTime() - Date.now()) < 7 * 86400000;
    const item: StockItem = { id: form.id || crypto.randomUUID(), ref: form.ref, nom: form.nom, categorie: form.categorie, theo: parseInt(form.theo) || 0, phys, ecart, cump: cu, valeur: phys * cu, dlc: form.dlc, statut: dlcAlert ? 'Alerte DLC' : 'Normal', fournisseur: form.fournisseur };
    if (form.id) save(items.map(i => i.id === form.id ? item : i));
    else save([...items, item]);
    setForm(null);
  };

  const ecarts = items.filter(x => x.ecart !== 0);
  const alertesDLC = items.filter(x => x.statut !== 'Normal');

  // Rotation > 12 mois : DLC dépassée de plus d'un an OU pas de DLC + valeur résiduelle = stock dormant
  const dormants = items.filter(x => {
    if (!x.dlc) return false;
    const moisDepuisDLC = (Date.now() - new Date(x.dlc).getTime()) / (30 * 86400000);
    return moisDepuisDLC > SEUIL_ROTATION_MOIS && x.valeur > 0;
  });

  return (
    <ModulePageLayout
      title="Stocks denrées"
      section="CONTRÔLES SUR PLACE"
      description="Inventaire physique des denrées alimentaires, rapprochement avec le stock théorique (comptable), valorisation au CUMP et contrôle des dates limites de consommation."
      refs={[
        { code: 'M9-6 § 2.1.4', label: 'Inventaire physique' },
        { code: 'M9-6 § 4.4', label: 'Valorisation CUMP' },
        { code: 'PCG art. 213-33', label: 'Méthode du coût moyen pondéré' },
      ]}
      headerActions={
        <Button className="bg-white/20 hover:bg-white/30 text-white border-white/25" variant="outline"
          onClick={() => setForm({ ref: 'D-' + String(items.length + 1).padStart(3, '0'), nom: '', categorie: 'Viandes', theo: '', phys: '', cump: '', dlc: '', fournisseur: '' })}
        ><Plus className="h-4 w-4 mr-2" /> Ajouter</Button>
      }
      completedChecks={(CONTROLES_STOCKS).filter(c => regChecks[c.id]).length}
      totalChecks={(CONTROLES_STOCKS).length}
    >
      {/* ─── KPI ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold">{items.length}</p><p className="text-xs text-muted-foreground">Articles</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold">{fmt(items.reduce((s, x) => s + x.valeur, 0))}</p><p className="text-xs text-muted-foreground">Valeur stock</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className={`text-2xl font-bold ${ecarts.length > 0 ? 'text-destructive' : 'text-green-600'}`}>{ecarts.length}</p><p className="text-xs text-muted-foreground">Écarts</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className={`text-2xl font-bold ${alertesDLC.length > 0 ? 'text-destructive' : 'text-green-600'}`}>{alertesDLC.length}</p><p className="text-xs text-muted-foreground">Alertes DLC</p></CardContent></Card>
      </div>

      {/* Contrôles réglementaires */}
      <ModuleSection title="Contrôles réglementaires — Stocks" description="M9-6 § 2.1.4 — PCG art. 213-33" badge={`${(CONTROLES_STOCKS).filter(c => regChecks[c.id]).length}/${(CONTROLES_STOCKS).length}`}>
        <Card className="shadow-card">
          <CardContent className="p-3 space-y-2">
            {CONTROLES_STOCKS.map(item => (
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
        <AnomalyAlert title={`${ecarts.length} écart${ecarts.length > 1 ? 's' : ''} entre stock physique et théorique`} description="Tout écart doit être justifié et régularisé comptablement (manquant = charge exceptionnelle C/6718)." severity="warning" />
      )}

      {dormants.length > 0 && (
        <ControlAlert
          level="alerte"
          title={`${dormants.length} article${dormants.length > 1 ? 's' : ''} sans rotation depuis plus de ${SEUIL_ROTATION_MOIS} mois`}
          description={`Stock dormant valorisé à ${fmt(dormants.reduce((s, x) => s + x.valeur, 0))}. Tout article sans mouvement depuis plus d'un an doit être analysé : déclassement, dépréciation (C/6817) ou destruction (PV à joindre).`}
          action="Établir un PV de destruction ou constater une dépréciation pour les articles concernés. Vérifier la fiabilité du fichier inventaire."
          refKey="m96-2-1-4"
          refLabel="M9-6 § 2.1.4 — Inventaire physique"
        />
      )}

      {form && (
        <Card className="border-primary">
          <CardContent className="pt-6 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1"><Label className="text-xs">Référence</Label><Input value={form.ref} onChange={e => setForm({ ...form, ref: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Désignation</Label><Input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Catégorie</Label><Input value={form.categorie} onChange={e => setForm({ ...form, categorie: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Fournisseur</Label><Input value={form.fournisseur} onChange={e => setForm({ ...form, fournisseur: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Qté théorique</Label><Input type="number" value={form.theo} onChange={e => setForm({ ...form, theo: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Qté physique</Label><Input type="number" value={form.phys} onChange={e => setForm({ ...form, phys: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">CUMP (€)</Label><Input type="number" value={form.cump} onChange={e => setForm({ ...form, cump: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">DLC</Label><Input type="date" value={form.dlc} onChange={e => setForm({ ...form, dlc: e.target.value })} /></div>
            </div>
            <div className="flex gap-2"><Button onClick={submit}>Valider</Button><Button variant="outline" onClick={() => setForm(null)}>Annuler</Button></div>
          </CardContent>
        </Card>
      )}

      {items.length === 0 && !form && <Card className="shadow-card"><CardContent className="py-12 text-center text-muted-foreground">Aucun article en stock.</CardContent></Card>}

      {items.length > 0 && (
        <Card className="shadow-card">
          <CardContent className="pt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">Réf</th><th className="text-left p-2">Désignation</th><th className="p-2">Théo</th><th className="p-2">Phys</th><th className="p-2">Écart</th><th className="text-right p-2">CUMP</th><th className="text-right p-2">Valeur</th><th className="p-2">DLC</th><th className="p-2">Statut</th><th></th></tr></thead>
              <tbody>{items.map(x => (
                <tr key={x.id} className="border-b hover:bg-muted/50">
                  <td className="p-2 font-mono text-xs">{x.ref}</td>
                  <td className="p-2 font-medium">{x.nom}<br /><span className="text-xs text-muted-foreground">{x.categorie} — {x.fournisseur}</span></td>
                  <td className="p-2 text-center font-mono">{x.theo}</td>
                  <td className="p-2 text-center font-mono font-bold">{x.phys}</td>
                  <td className={`p-2 text-center font-mono font-bold ${x.ecart === 0 ? 'text-green-600' : 'text-destructive'}`}>{x.ecart >= 0 ? '+' : ''}{x.ecart}</td>
                  <td className="p-2 text-right font-mono">{fmt(x.cump)}</td>
                  <td className="p-2 text-right font-mono font-bold">{fmt(x.valeur)}</td>
                  <td className="p-2 text-xs">{x.dlc}</td>
                  <td className="p-2"><Badge variant={x.statut === 'Normal' ? 'secondary' : 'destructive'}>{x.statut}</Badge></td>
                  <td className="p-2"><div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setForm({ ...x, theo: String(x.theo), phys: String(x.phys), cump: String(x.cump) })}><Pencil className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => save(items.filter(i => i.id !== x.id))}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </ModulePageLayout>
  );
}
