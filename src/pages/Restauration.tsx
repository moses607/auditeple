import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Pencil, AlertTriangle } from 'lucide-react';
import { RestaurationMois, fmt } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CONTROLES_RESTAURATION } from '@/lib/regulatory-data';
import { ModulePageLayout , ComplianceCheck, ModuleSection } from '@/components/ModulePageLayout';

/* ═══ TYPES LOCAUX ═══ */
interface GrammageVerif {
  id: string; date: string; menu: string; effectifJour: number;
  denree: string; grammageRef: number; quantiteCommandee: number;
  quantiteNecessaire: number; ecart: number; recommandation: string;
}

interface VentesAchats {
  periode: string; totalAchats: number; totalVentes: number;
  ecart: number; observations: string;
}

interface TitreRecetteCuisine {
  id: string; etablissement: string; mois: string; montantTR: number;
  enregistre: boolean; observations: string;
}

interface ContratCuisine {
  existeContrat: boolean; referenceContrat: string;
  existeMarche: boolean; referenceMarche: string;
  prestataire: string; dateDebut: string; dateFin: string;
  montantAnnuel: number; observations: string;
}

export default function Restauration() {
  // ═══ SUIVI MENSUEL (existant) ═══
  const [items, setItems] = useState<RestaurationMois[]>(() => loadState('restauration', []));
  const [form, setForm] = useState<any>(null);
  const save = (d: RestaurationMois[]) => { setItems(d); saveState('restauration', d); };

  // ═══ CALCULATEUR GRAMMAGE ═══
  const [grammages, setGrammages] = useState<GrammageVerif[]>(() => loadState('rest_grammages', []));
  const [formGram, setFormGram] = useState<any>(null);
  const saveGram = (d: GrammageVerif[]) => { setGrammages(d); saveState('rest_grammages', d); };

  // ═══ VENTES VS ACHATS ═══
  const [ventesAchats, setVentesAchats] = useState<VentesAchats>(() => loadState('rest_ventes_achats', { periode: '', totalAchats: 0, totalVentes: 0, ecart: 0, observations: '' }));
  const updateVA = (k: string, v: any) => {
    const n = { ...ventesAchats, [k]: v };
    n.ecart = (parseFloat(String(n.totalVentes)) || 0) - (parseFloat(String(n.totalAchats)) || 0);
    setVentesAchats(n); saveState('rest_ventes_achats', n);
  };

  // ═══ TITRES RECETTES CUISINE CENTRALE ═══
  const [titresRecettes, setTitresRecettes] = useState<TitreRecetteCuisine[]>(() => loadState('rest_titres_recettes', []));
  const [formTR, setFormTR] = useState<any>(null);
  const saveTR = (d: TitreRecetteCuisine[]) => { setTitresRecettes(d); saveState('rest_titres_recettes', d); };

  // ═══ CONTRAT CUISINE LIVRÉE ═══
  const [regChecks, setRegChecks] = useState<Record<string, boolean>>(() => loadState('restauration_checks', {}));
  const toggleRegCheck = (id: string) => { const u = { ...regChecks, [id]: !regChecks[id] }; setRegChecks(u); saveState('restauration_checks', u); };
  const [contrat, setContrat] = useState<ContratCuisine>(() => loadState('rest_contrat', {
    existeContrat: false, referenceContrat: '', existeMarche: false, referenceMarche: '',
    prestataire: '', dateDebut: '', dateFin: '', montantAnnuel: 0, observations: '',
  }));
  const updateContrat = (k: string, v: any) => { const n = { ...contrat, [k]: v }; setContrat(n); saveState('rest_contrat', n); };

  const calcTauxFrequentation = (repas: number, dpInscrits: number, joursService: number) => {
    if (dpInscrits <= 0 || joursService <= 0) return null;
    return (repas / (dpInscrits * joursService)) * 100;
  };

  const submit = () => {
    if (!form || !form.mois) return;
    const cm = parseFloat(form.coutMatieres) || 0, cp = parseFloat(form.coutPersonnel) || 0, ce = parseFloat(form.coutEnergie) || 0;
    const item: RestaurationMois = {
      id: form.id || crypto.randomUUID(), mois: form.mois,
      repas: parseInt(form.repas) || 0,
      effectifTotal: parseInt(form.effectifTotal) || 0,
      dpInscrits: parseInt(form.dpInscrits) || 0,
      joursService: parseInt(form.joursService) || 0,
      coutMatieres: cm, coutPersonnel: cp, coutEnergie: ce, coutTotal: cm + cp + ce,
      tarif: parseFloat(form.tarif) || 3.80,
      impayes: parseFloat(form.impayes) || 0,
      bio: parseFloat(form.bio) || 0, durable: parseFloat(form.durable) || 0,
    };
    if (form.id) save(items.map(i => i.id === form.id ? item : i));
    else save([item, ...items]);
    setForm(null);
  };

  const submitGrammage = () => {
    if (!formGram) return;
    const effectif = parseInt(formGram.effectifJour) || 0;
    const grammageRef = parseFloat(formGram.grammageRef) || 0;
    const qteCommandee = parseFloat(formGram.quantiteCommandee) || 0;
    const qteNecessaire = (effectif * grammageRef) / 1000; // en kg
    const ecart = qteCommandee - qteNecessaire;
    let recommandation = '';
    if (ecart > qteNecessaire * 0.1) recommandation = `⚠️ Sur-commande de ${ecart.toFixed(2)} kg (${((ecart / qteNecessaire) * 100).toFixed(0)}% d'excédent). Vérifier la justification auprès du chef cuisinier. Risque de gaspillage alimentaire.`;
    else if (ecart < -qteNecessaire * 0.05) recommandation = `⚠️ Sous-commande de ${Math.abs(ecart).toFixed(2)} kg. Risque d'insuffisance de portions.`;
    else recommandation = '✅ Commande conforme au grammage réglementaire.';
    const item: GrammageVerif = { id: formGram.id || crypto.randomUUID(), date: formGram.date, menu: formGram.menu, effectifJour: effectif, denree: formGram.denree, grammageRef, quantiteCommandee: qteCommandee, quantiteNecessaire: parseFloat(qteNecessaire.toFixed(2)), ecart: parseFloat(ecart.toFixed(2)), recommandation };
    if (formGram.id) saveGram(grammages.map(i => i.id === formGram.id ? item : i));
    else saveGram([item, ...grammages]);
    setFormGram(null);
  };

  const submitTR = () => {
    if (!formTR) return;
    const item: TitreRecetteCuisine = { id: formTR.id || crypto.randomUUID(), etablissement: formTR.etablissement, mois: formTR.mois, montantTR: parseFloat(formTR.montantTR) || 0, enregistre: formTR.enregistre || false, observations: formTR.observations };
    if (formTR.id) saveTR(titresRecettes.map(i => i.id === formTR.id ? item : i));
    else saveTR([...titresRecettes, item]);
    setFormTR(null);
  };

  const last = items[0];
  const nbTRNonEnregistre = titresRecettes.filter(x => !x.enregistre).length;

  return (
    <ModulePageLayout
      title="Restauration et hébergement"
      section="GESTION COMPTABLE"
      description="Contrôle de la restauration scolaire : tarification (délibération CT), facturation, encaissements, convention d'hébergement, suivi FCSH/FRPI et conformité EGAlim."
      refs={[
        { code: "M9-6 § 4.3", label: "SRH" },
        { code: "Loi EGAlim 2018-938", label: "Approvisionnement durable" },
        { code: "C/185000", label: "Compte de dépôt SRH" },
        { code: "FCSH / FRPI", label: "Fonds communs" },
      ]}
      completedChecks={(CONTROLES_RESTAURATION).filter(c => regChecks[c.id]).length}
      totalChecks={(CONTROLES_RESTAURATION).length}
    >
      <div>
      </div>

      <Tabs defaultValue="suivi" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="suivi">Suivi mensuel</TabsTrigger>
          <TabsTrigger value="grammage">Grammage</TabsTrigger>
          <TabsTrigger value="ventes">Ventes/Achats</TabsTrigger>
          <TabsTrigger value="titres">Titres recettes</TabsTrigger>
          <TabsTrigger value="contrat">Contrat cuisine</TabsTrigger>
        </TabsList>

        {/* ═══ SUIVI MENSUEL ═══ */}
        <TabsContent value="suivi" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setForm({ mois: new Date().toISOString().slice(0, 7), repas: '', effectifTotal: '', dpInscrits: '', joursService: '', coutMatieres: '', coutPersonnel: '', coutEnergie: '', tarif: last?.tarif || 3.80, impayes: '', bio: '', durable: '' })}><Plus className="h-4 w-4 mr-2" /> Nouveau mois</Button>
          </div>

          {last && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <Card className="shadow-card"><CardContent className="p-4"><p className="text-lg font-bold">{last.mois}</p><p className="text-xs text-muted-foreground">Dernier mois</p></CardContent></Card>
              <Card className="shadow-card"><CardContent className="p-4"><p className="text-lg font-bold">{last.coutTotal.toFixed(2)} €</p><p className="text-xs text-muted-foreground">Coût/repas</p></CardContent></Card>
              <Card className="shadow-card"><CardContent className="p-4"><p className={`text-lg font-bold ${last.bio >= 20 ? 'text-green-600' : 'text-destructive'}`}>{last.bio}%</p><p className="text-xs text-muted-foreground">Bio</p></CardContent></Card>
              <Card className="shadow-card"><CardContent className="p-4"><p className={`text-lg font-bold ${last.durable >= 50 ? 'text-green-600' : 'text-destructive'}`}>{last.durable}%</p><p className="text-xs text-muted-foreground">Durable</p></CardContent></Card>
              <Card className="shadow-card"><CardContent className="p-4"><p className={`text-lg font-bold ${last.impayes > 0 ? 'text-destructive' : 'text-green-600'}`}>{fmt(last.impayes)}</p><p className="text-xs text-muted-foreground">Impayés</p></CardContent></Card>
            </div>
          )}

          {form && (
            <Card className="border-primary">
              <CardContent className="pt-6 space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1"><Label className="text-xs">Mois</Label><Input type="month" value={form.mois} onChange={e => setForm({ ...form, mois: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Effectif total élèves</Label><Input type="number" value={form.effectifTotal} onChange={e => setForm({ ...form, effectifTotal: e.target.value })} placeholder="Ex: 850" /></div>
                  <div className="space-y-1"><Label className="text-xs">DP inscrits</Label><Input type="number" value={form.dpInscrits} onChange={e => setForm({ ...form, dpInscrits: e.target.value })} placeholder="Ex: 620" /></div>
                  <div className="space-y-1"><Label className="text-xs">Jours de service</Label><Input type="number" value={form.joursService} onChange={e => setForm({ ...form, joursService: e.target.value })} placeholder="Ex: 20" /></div>
                  <div className="space-y-1"><Label className="text-xs">Nb repas servis</Label><Input type="number" value={form.repas} onChange={e => setForm({ ...form, repas: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Coût matière (€)</Label><Input type="number" value={form.coutMatieres} onChange={e => setForm({ ...form, coutMatieres: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Coût personnel (€)</Label><Input type="number" value={form.coutPersonnel} onChange={e => setForm({ ...form, coutPersonnel: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Coût énergie (€)</Label><Input type="number" value={form.coutEnergie} onChange={e => setForm({ ...form, coutEnergie: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Tarif (€)</Label><Input type="number" value={form.tarif} onChange={e => setForm({ ...form, tarif: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Impayés (€)</Label><Input type="number" value={form.impayes} onChange={e => setForm({ ...form, impayes: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">% Bio</Label><Input type="number" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">% Durable</Label><Input type="number" value={form.durable} onChange={e => setForm({ ...form, durable: e.target.value })} /></div>
                </div>

                {/* Calcul automatique de la fréquentation */}
                {(() => {
                  const repas = parseInt(form.repas) || 0;
                  const dp = parseInt(form.dpInscrits) || 0;
                  const jours = parseInt(form.joursService) || 0;
                  const taux = calcTauxFrequentation(repas, dp, jours);
                  if (taux !== null) {
                    return (
                      <div className="p-3 rounded-lg border bg-muted/50">
                        <p className="text-sm"><strong>Taux de fréquentation calculé :</strong> {taux.toFixed(1)}%
                          <span className="text-xs text-muted-foreground ml-2">({repas} repas / {dp} DP × {jours} jours)</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          ⚠️ En lycée, les DP payant à la prestation, ce taux est indicatif. L'absentéisme et les repas non pris ne sont pas décomptés automatiquement.
                        </p>
                      </div>
                    );
                  }
                  return null;
                })()}

                <div className="flex gap-2"><Button onClick={submit}>Valider</Button><Button variant="outline" onClick={() => setForm(null)}>Annuler</Button></div>
              </CardContent>
            </Card>
          )}

          {items.length === 0 && !form && <Card className="shadow-card"><CardContent className="py-12 text-center text-muted-foreground">Aucun mois enregistré.</CardContent></Card>}
          {items.length > 0 && (
            <Card className="shadow-card"><CardContent className="pt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-xs text-muted-foreground"><th className="p-2">Mois</th><th className="p-2">Repas</th><th className="p-2">DP</th><th className="p-2">Jours</th><th className="p-2">Fréq.</th><th className="text-right p-2">C.mat</th><th className="text-right p-2">C.tot</th><th className="text-right p-2">Tarif</th><th className="text-right p-2">Impayés</th><th className="p-2">Bio%</th><th className="p-2">Dur%</th><th></th></tr></thead>
                <tbody>{items.map(x => {
                  const taux = calcTauxFrequentation(x.repas, x.dpInscrits, x.joursService);
                  return (
                  <tr key={x.id} className="border-b">
                    <td className="p-2 font-bold">{x.mois}</td>
                    <td className="p-2 font-mono">{x.repas.toLocaleString('fr-FR')}</td>
                    <td className="p-2 font-mono">{x.dpInscrits}</td>
                    <td className="p-2 font-mono">{x.joursService}</td>
                    <td className="p-2 font-bold" title="Indicatif — paiement à la prestation en lycée">{taux !== null ? `${taux.toFixed(1)}%` : '—'}</td>
                    <td className="p-2 text-right font-mono">{x.coutMatieres.toFixed(2)}</td>
                    <td className="p-2 text-right font-mono font-bold">{x.coutTotal.toFixed(2)}</td>
                    <td className="p-2 text-right font-mono">{x.tarif.toFixed(2)}</td>
                    <td className={`p-2 text-right font-mono font-bold ${x.impayes > 0 ? 'text-destructive' : 'text-green-600'}`}>{fmt(x.impayes)}</td>
                    <td className={`p-2 font-bold ${x.bio >= 20 ? 'text-green-600' : 'text-destructive'}`}>{x.bio}%</td>
                    <td className={`p-2 font-bold ${x.durable >= 50 ? 'text-green-600' : 'text-destructive'}`}>{x.durable}%</td>
                    <td className="p-2"><div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setForm({ ...x, repas: String(x.repas), effectifTotal: String(x.effectifTotal), dpInscrits: String(x.dpInscrits), joursService: String(x.joursService), coutMatieres: String(x.coutMatieres), coutPersonnel: String(x.coutPersonnel), coutEnergie: String(x.coutEnergie), tarif: String(x.tarif), impayes: String(x.impayes), bio: String(x.bio), durable: String(x.durable) })}><Pencil className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => save(items.filter(i => i.id !== x.id))}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                    </div></td>
                  </tr>
                );})}</tbody>
              </table>
            </CardContent></Card>
          )}
        </TabsContent>

        {/* ═══ CALCULATEUR GRAMMAGE ═══ */}
        <TabsContent value="grammage" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">Calculateur grammage / effectif</p>
              <p className="text-xs text-muted-foreground">Compare la quantité commandée au besoin réel selon l'effectif du jour et le grammage réglementaire.</p>
            </div>
            <Button onClick={() => setFormGram({ date: new Date().toISOString().split('T')[0], menu: '', effectifJour: '', denree: '', grammageRef: '', quantiteCommandee: '' })}><Plus className="h-4 w-4 mr-2" /> Nouvelle vérification</Button>
          </div>

          {formGram && (
            <Card className="border-primary">
              <CardContent className="pt-6 space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="space-y-1"><Label className="text-xs">Date</Label><Input type="date" value={formGram.date} onChange={e => setFormGram({ ...formGram, date: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Menu du jour</Label><Input value={formGram.menu} onChange={e => setFormGram({ ...formGram, menu: e.target.value })} placeholder="Ex: Poulet rôti, haricots verts" /></div>
                  <div className="space-y-1"><Label className="text-xs">Effectif du jour</Label><Input type="number" value={formGram.effectifJour} onChange={e => setFormGram({ ...formGram, effectifJour: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Denrée contrôlée</Label><Input value={formGram.denree} onChange={e => setFormGram({ ...formGram, denree: e.target.value })} placeholder="Ex: Poulet" /></div>
                  <div className="space-y-1"><Label className="text-xs">Grammage réf. (g/portion)</Label><Input type="number" value={formGram.grammageRef} onChange={e => setFormGram({ ...formGram, grammageRef: e.target.value })} placeholder="Ex: 120" /></div>
                  <div className="space-y-1"><Label className="text-xs">Quantité commandée (kg)</Label><Input type="number" value={formGram.quantiteCommandee} onChange={e => setFormGram({ ...formGram, quantiteCommandee: e.target.value })} /></div>
                </div>

                {/* Aperçu calcul en temps réel */}
                {(() => {
                  const eff = parseInt(formGram.effectifJour) || 0;
                  const gr = parseFloat(formGram.grammageRef) || 0;
                  const qte = parseFloat(formGram.quantiteCommandee) || 0;
                  const besoin = (eff * gr) / 1000;
                  if (eff > 0 && gr > 0 && qte > 0) {
                    const ecart = qte - besoin;
                    const pct = ((ecart / besoin) * 100).toFixed(0);
                    return (
                      <div className={`p-3 rounded-lg border ${ecart > besoin * 0.1 ? 'border-destructive bg-destructive/10' : 'border-green-500 bg-green-50'}`}>
                        <p className="text-sm"><strong>Besoin :</strong> {eff} convives × {gr}g = <strong>{besoin.toFixed(2)} kg</strong></p>
                        <p className="text-sm"><strong>Commandé :</strong> {qte} kg → Écart : <strong>{ecart > 0 ? '+' : ''}{ecart.toFixed(2)} kg ({pct}%)</strong></p>
                        {ecart > besoin * 0.1 && <p className="text-sm text-destructive font-bold mt-1">⚠️ Sur-commande significative. Demander la justification au chef cuisinier.</p>}
                      </div>
                    );
                  }
                  return null;
                })()}

                <div className="flex gap-2"><Button onClick={submitGrammage}>Valider</Button><Button variant="outline" onClick={() => setFormGram(null)}>Annuler</Button></div>
              </CardContent>
            </Card>
          )}

          {grammages.length === 0 && !formGram && <Card className="shadow-card"><CardContent className="py-12 text-center text-muted-foreground">Aucune vérification de grammage.</CardContent></Card>}
          {grammages.length > 0 && (
            <Card className="shadow-card"><CardContent className="pt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-xs text-muted-foreground"><th className="p-2">Date</th><th className="text-left p-2">Denrée</th><th className="p-2">Effectif</th><th className="text-right p-2">Besoin (kg)</th><th className="text-right p-2">Commandé (kg)</th><th className="text-right p-2">Écart</th><th className="text-left p-2">Recommandation</th><th></th></tr></thead>
                <tbody>{grammages.map(x => (
                  <tr key={x.id} className={`border-b ${x.ecart > x.quantiteNecessaire * 0.1 ? 'bg-destructive/5' : ''}`}>
                    <td className="p-2 text-xs">{x.date}</td><td className="p-2 font-bold">{x.denree}</td><td className="p-2 text-center">{x.effectifJour}</td>
                    <td className="p-2 text-right font-mono">{x.quantiteNecessaire}</td>
                    <td className="p-2 text-right font-mono font-bold">{x.quantiteCommandee}</td>
                    <td className={`p-2 text-right font-mono font-bold ${x.ecart > 0 ? 'text-destructive' : 'text-green-600'}`}>{x.ecart > 0 ? '+' : ''}{x.ecart}</td>
                    <td className="p-2 text-xs">{x.recommandation}</td>
                    <td className="p-2"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => saveGram(grammages.filter(i => i.id !== x.id))}><Trash2 className="h-3 w-3 text-destructive" /></Button></td>
                  </tr>
                ))}</tbody>
              </table>
            </CardContent></Card>
          )}
        </TabsContent>

        {/* ═══ VENTES VS ACHATS ═══ */}
        <TabsContent value="ventes" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Calculateur Ventes / Achats</CardTitle>
              <p className="text-xs text-muted-foreground">Compare les titres de recettes enregistrés (ventes) avec les mandats de dépenses (achats) pour la restauration.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1"><Label>Période</Label><Input value={ventesAchats.periode} onChange={e => updateVA('periode', e.target.value)} placeholder="Ex: Septembre 2025 - Février 2026" /></div>
                <div className="space-y-1"><Label>Total achats denrées (€)</Label><Input type="number" value={ventesAchats.totalAchats || ''} onChange={e => updateVA('totalAchats', e.target.value)} /></div>
                <div className="space-y-1"><Label>Total titres de recettes (€)</Label><Input type="number" value={ventesAchats.totalVentes || ''} onChange={e => updateVA('totalVentes', e.target.value)} /></div>
              </div>

              {(ventesAchats.totalAchats > 0 || ventesAchats.totalVentes > 0) && (() => {
                const achats = parseFloat(String(ventesAchats.totalAchats)) || 0;
                const ventes = parseFloat(String(ventesAchats.totalVentes)) || 0;
                const ecart = ventes - achats;
                const ratio = achats > 0 ? ((ventes / achats) * 100).toFixed(1) : '—';
                return (
                  <div className={`p-4 rounded-lg border ${ecart < 0 ? 'border-destructive bg-destructive/10' : 'border-green-500 bg-green-50'}`}>
                    <div className="grid grid-cols-3 gap-4 text-center mb-3">
                      <div><p className="text-xs text-muted-foreground">Achats</p><p className="text-xl font-bold">{fmt(achats)}</p></div>
                      <div><p className="text-xs text-muted-foreground">Ventes (TR)</p><p className="text-xl font-bold">{fmt(ventes)}</p></div>
                      <div><p className="text-xs text-muted-foreground">Écart</p><p className={`text-xl font-bold ${ecart >= 0 ? 'text-green-600' : 'text-destructive'}`}>{fmt(ecart)}</p></div>
                    </div>
                    <p className="text-sm text-center">Taux de couverture : <strong>{ratio}%</strong></p>
                    {ecart < 0 && <p className="text-sm text-destructive font-bold mt-2 text-center">⚠️ Les ventes ne couvrent pas les achats. Vérifier les titres de recettes non émis ou les commandes excessives.</p>}
                    {ecart >= 0 && <p className="text-sm text-green-700 font-bold mt-2 text-center">✅ Les titres de recettes couvrent les achats.</p>}
                  </div>
                );
              })()}

              <div className="space-y-1"><Label className="text-xs">Observations</Label><Textarea value={ventesAchats.observations} onChange={e => updateVA('observations', e.target.value)} rows={3} /></div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ TITRES RECETTES CUISINE CENTRALE ═══ */}
        <TabsContent value="titres" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">Vérification des titres de recettes — Cuisine centrale</p>
              <p className="text-xs text-muted-foreground">S'assurer que tous les titres de recettes sont enregistrés pour chaque établissement nourri.</p>
            </div>
            <Button onClick={() => setFormTR({ etablissement: '', mois: new Date().toISOString().slice(0, 7), montantTR: '', enregistre: false, observations: '' })}><Plus className="h-4 w-4 mr-2" /> Ajouter</Button>
          </div>

          {nbTRNonEnregistre > 0 && (
            <div className="p-3 border border-destructive bg-destructive/10 rounded-lg flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
              <p className="text-sm text-destructive"><strong>{nbTRNonEnregistre} titre(s) de recettes non enregistré(s).</strong> Tous les titres doivent être émis et enregistrés pour les établissements rattachés à la cuisine centrale.</p>
            </div>
          )}

          {formTR && (
            <Card className="border-primary">
              <CardContent className="pt-6 space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1"><Label className="text-xs">Établissement nourri</Label><Input value={formTR.etablissement} onChange={e => setFormTR({ ...formTR, etablissement: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Mois</Label><Input type="month" value={formTR.mois} onChange={e => setFormTR({ ...formTR, mois: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Montant TR (€)</Label><Input type="number" value={formTR.montantTR} onChange={e => setFormTR({ ...formTR, montantTR: e.target.value })} /></div>
                  <div className={`p-3 rounded-lg border ${formTR.enregistre ? 'border-green-500 bg-green-50' : 'border-destructive bg-destructive/10'}`}>
                    <p className="text-xs font-bold mb-1">Enregistré ?</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant={formTR.enregistre ? 'default' : 'outline'} onClick={() => setFormTR({ ...formTR, enregistre: true })}>✓ Oui</Button>
                      <Button size="sm" variant={!formTR.enregistre ? 'destructive' : 'outline'} onClick={() => setFormTR({ ...formTR, enregistre: false })}>✗ Non</Button>
                    </div>
                  </div>
                </div>
                <Input placeholder="Observations" value={formTR.observations} onChange={e => setFormTR({ ...formTR, observations: e.target.value })} />
                <div className="flex gap-2"><Button onClick={submitTR}>Valider</Button><Button variant="outline" onClick={() => setFormTR(null)}>Annuler</Button></div>
              </CardContent>
            </Card>
          )}

          {titresRecettes.length === 0 && !formTR && <Card className="shadow-card"><CardContent className="py-12 text-center text-muted-foreground">Aucun titre de recettes vérifié.</CardContent></Card>}
          {titresRecettes.length > 0 && (
            <Card className="shadow-card"><CardContent className="pt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">Établissement</th><th className="p-2">Mois</th><th className="text-right p-2">Montant</th><th className="p-2">Enregistré</th><th className="text-left p-2">Obs.</th><th></th></tr></thead>
                <tbody>{titresRecettes.map(x => (
                  <tr key={x.id} className={`border-b ${!x.enregistre ? 'bg-destructive/5' : ''}`}>
                    <td className="p-2 font-bold">{x.etablissement}</td><td className="p-2">{x.mois}</td>
                    <td className="p-2 text-right font-mono font-bold">{fmt(x.montantTR)}</td>
                    <td className="p-2 text-center">{x.enregistre ? <span className="text-green-600 font-bold">✓</span> : <span className="text-destructive font-bold">✗</span>}</td>
                    <td className="p-2 text-xs">{x.observations}</td>
                    <td className="p-2"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => saveTR(titresRecettes.filter(i => i.id !== x.id))}><Trash2 className="h-3 w-3 text-destructive" /></Button></td>
                  </tr>
                ))}</tbody>
              </table>
            </CardContent></Card>
          )}
        </TabsContent>

        {/* ═══ CONTRAT CUISINE LIVRÉE ═══ */}
        <TabsContent value="contrat" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Cuisine livrée — Contrat et marché</CardTitle>
              <p className="text-xs text-muted-foreground">En cas de livraison de repas par un prestataire extérieur, vérifier l'existence d'un contrat et d'un marché public.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-3 rounded-lg border ${contrat.existeContrat ? 'border-green-500 bg-green-50' : 'border-destructive bg-destructive/10'}`}>
                  <p className="text-xs font-bold mb-2">Contrat de prestation</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant={contrat.existeContrat ? 'default' : 'outline'} onClick={() => updateContrat('existeContrat', true)}>✓ Existe</Button>
                    <Button size="sm" variant={!contrat.existeContrat ? 'destructive' : 'outline'} onClick={() => updateContrat('existeContrat', false)}>✗ Absent</Button>
                  </div>
                  {!contrat.existeContrat && <p className="text-xs text-destructive mt-2 font-bold">⚠️ ANOMALIE — Absence de contrat pour la cuisine livrée.</p>}
                </div>

                <div className={`p-3 rounded-lg border ${contrat.existeMarche ? 'border-green-500 bg-green-50' : 'border-destructive bg-destructive/10'}`}>
                  <p className="text-xs font-bold mb-2">Marché public</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant={contrat.existeMarche ? 'default' : 'outline'} onClick={() => updateContrat('existeMarche', true)}>✓ Existe</Button>
                    <Button size="sm" variant={!contrat.existeMarche ? 'destructive' : 'outline'} onClick={() => updateContrat('existeMarche', false)}>✗ Absent</Button>
                  </div>
                  {!contrat.existeMarche && <p className="text-xs text-destructive mt-2 font-bold">⚠️ ANOMALIE — Absence de marché public pour la prestation de restauration.</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1"><Label className="text-xs">Prestataire</Label><Input value={contrat.prestataire} onChange={e => updateContrat('prestataire', e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">Réf. contrat</Label><Input value={contrat.referenceContrat} onChange={e => updateContrat('referenceContrat', e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">Réf. marché</Label><Input value={contrat.referenceMarche} onChange={e => updateContrat('referenceMarche', e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">Date début</Label><Input type="date" value={contrat.dateDebut} onChange={e => updateContrat('dateDebut', e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">Date fin</Label><Input type="date" value={contrat.dateFin} onChange={e => updateContrat('dateFin', e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">Montant annuel (€)</Label><Input type="number" value={contrat.montantAnnuel || ''} onChange={e => updateContrat('montantAnnuel', parseFloat(e.target.value) || 0)} /></div>
              </div>

              <div className="space-y-1"><Label className="text-xs">Observations</Label><Textarea value={contrat.observations} onChange={e => updateContrat('observations', e.target.value)} rows={3} /></div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Contrôles réglementaires */}
      <ModuleSection title="Contrôles réglementaires — Restauration" description="Loi EGAlim 2018-938 — M9-6 § 4.3 — Règlement CE 852/2004" badge={`${(CONTROLES_RESTAURATION).filter(c => regChecks[c.id]).length}/${(CONTROLES_RESTAURATION).length}`}>
        <Card className="shadow-card">
          <CardContent className="p-3 space-y-2">
            {CONTROLES_RESTAURATION.map(item => (
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
