import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Search, Printer } from 'lucide-react';
import SignaturePad from '@/components/SignaturePad';
import { PVAuditItem, PVVerification, TYPES_CONTROLE_PV, fmtDate, getSelectedEtablissement, getAgenceComptable } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';
import { toast } from 'sonner';
import { useAuditParams } from '@/hooks/useAuditStore';
import { getModules } from '@/lib/audit-modules';
import { collectAllAnomalies, collectAnomaliesFlat, ModuleAnomalies } from '@/lib/anomaly-collector';
import PVPrintDocument from '@/components/PVPrintDocument';
import { ModulePageLayout } from '@/components/ModulePageLayout';

// Auto-generate recommendations
function generateRecommandations(verifications: PVVerification[]): string {
  const anom = verifications.filter(v => v.status === 'anomalie');
  if (anom.length === 0) return 'Aucune anomalie relevée. L\'agent comptable est invité à maintenir la qualité de ses procédures.';
  const lines = anom.map((a, i) => `${i + 1}. ${a.label}: ${a.observations || 'Régularisation à effectuer dans les meilleurs délais.'}`);
  return `Les anomalies suivantes appellent une régularisation :\n${lines.join('\n')}\n\nL'ordonnateur et l'agent comptable sont invités à mettre en œuvre les mesures correctives dans les délais impartis.`;
}

// Modules auditables (ceux qui ont un collecteur)
// Modules auditables = ceux qui ont un collecteur ET sont activés dans les paramètres
const COLLECTOR_MODULES = [
  'regies', 'stocks', 'rapprochement', 'verification',
  'droits-constates', 'voyages', 'restauration',
  'subventions', 'cartographie',
];

export default function PVAudit() {
  const { params } = useAuditParams();
  const currentEtab = getSelectedEtablissement(params);
  const [items, setItems] = useState<PVAuditItem[]>(() => loadState('pv_audit', []));
  const [form, setForm] = useState<any>(null);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [previewAnomalies, setPreviewAnomalies] = useState<ModuleAnomalies[]>([]);
  const [showModuleSelector, setShowModuleSelector] = useState(false);
  const [printingPV, setPrintingPV] = useState<PVAuditItem | null>(null);

  const moduleLabels = useMemo(() => {
    const map: Record<string, string> = {};
    getModules().forEach(m => { map[m.id] = m.label; });
    return map;
  }, []);

  const handlePrintPV = useCallback((pv: PVAuditItem) => {
    setPrintingPV(pv);
    const originalTitle = document.title;
    document.title = `PV Audit — ${pv.type} — ${fmtDate(pv.date)}`;
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        setPrintingPV(null);
        document.title = originalTitle;
      }, 500);
    }, 100);
  }, []);

  const save = (d: PVAuditItem[]) => { setItems(d); saveState('pv_audit', d); };

  const allModules = useMemo(() => getModules(), []);
  const AUDITABLE_MODULES = useMemo(() => 
    COLLECTOR_MODULES.filter(id => allModules.find(m => m.id === id)?.enabled),
    [allModules]
  );

  const toggleModule = (id: string) => {
    setSelectedModules(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAllModules = () => setSelectedModules([...AUDITABLE_MODULES]);
  const deselectAllModules = () => setSelectedModules([]);

  // Scan anomalies for selected modules
  const scanAnomalies = () => {
    const results = collectAllAnomalies(selectedModules);
    setPreviewAnomalies(results);
  };

  // Create PV from selected modules
  const createPVFromSelection = () => {
    const flat = collectAnomaliesFlat(selectedModules);
    const reco = generateRecommandations(flat);
    setForm({
      date: new Date().toISOString().split('T')[0],
      type: 'Contrôle global',
      lieu: currentEtab?.nom || '',
      objet: `Audit des modules : ${selectedModules.map(id => allModules.find(m => m.id === id)?.label || id).join(', ')}`,
      verifications: flat,
      constatsLibres: '',
      recommandations: reco,
      conclusions: '',
      signataire1: params.agentComptable || '',
      signataire2: currentEtab?.ordonnateur || '',
      signataire3: currentEtab?.secretaireGeneral || '',
      delai: '30 jours',
      phase: 'provisoire',
      reponseOrdonnateur: '',
      dateReponse: '',
      conforme: false,
      modulesAudites: [...selectedModules],
    });
    setShowModuleSelector(false);
  };

  const submit = () => {
    if (!form || !form.objet) return;
    const item: PVAuditItem = { id: form.id || crypto.randomUUID(), ...form };
    if (form.id) save(items.map(i => i.id === form.id ? item : i));
    else save([item, ...items]);
    setForm(null);
  };

  const updateVerif = (idx: number, updates: Partial<PVVerification>) => {
    const nv = [...(form.verifications || [])];
    nv[idx] = { ...nv[idx], ...updates };
    const reco = generateRecommandations(nv);
    setForm({ ...form, verifications: nv, recommandations: reco });
  };

  const addVerif = () => {
    setForm({ ...form, verifications: [...(form.verifications || []), { label: '', reference: '', criticite: 'MAJEURE', status: 'non_verifie' as const, observations: '' }] });
  };

  const totalAnom = items.reduce((s, p) => s + (p.verifications || []).filter(v => v.status === 'anomalie').length, 0);

    return (
    <>
      {/* ═══ DOCUMENT D'IMPRESSION ═══ */}
      {printingPV && <PVPrintDocument pv={printingPV} params={params} moduleLabels={moduleLabels} />}

      <div className={`${printingPV ? 'print:hidden' : ''}`}>
      <ModulePageLayout
        title="Procès-verbaux d'audit contradictoire"
        section="AUDIT & RESTITUTION"
        description="Génération du PV contradictoire : synthèse des constats, observations de l'audité, recommandations et plan d'action. Document officiel soumis au CA."
        refs={[
          { code: 'Décret 2012-1246 art. 170', label: 'CICF' },
          { code: 'Art. R.421-20 C.Édu', label: 'Présentation au CA' },
          { code: 'Cartop@le', label: 'Restitution' },
        ]}
        headerActions={
          <div className="flex gap-2">
            <Button onClick={() => setShowModuleSelector(true)} className="bg-white/20 hover:bg-white/30 text-white border-white/25 no-print" variant="outline"><Plus className="h-4 w-4 mr-2" /> Nouveau PV</Button>
          </div>
        }
      >

      <div className="grid grid-cols-3 gap-3">
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold">{items.length}</p><p className="text-xs text-muted-foreground">Total PV</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold text-destructive">{totalAnom}</p><p className="text-xs text-muted-foreground">Anomalies</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold text-green-600">{items.filter(p => p.phase === 'définitif').length}</p><p className="text-xs text-muted-foreground">Définitifs</p></CardContent></Card>
      </div>

      {/* ═══ SÉLECTEUR DE MODULES ═══ */}
      {showModuleSelector && !form && (
        <Card className="border-primary border-2">
          <CardHeader>
            <CardTitle className="text-lg">Sélection des modules à auditer</CardTitle>
            <p className="text-xs text-muted-foreground">Cochez les modules sur lesquels porte l'audit. Les anomalies seront automatiquement collectées depuis les modules sélectionnés.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 mb-3">
              <Button size="sm" variant="outline" onClick={selectAllModules}>Tout sélectionner</Button>
              <Button size="sm" variant="outline" onClick={deselectAllModules}>Tout désélectionner</Button>
              <Button size="sm" variant="secondary" onClick={scanAnomalies} disabled={selectedModules.length === 0}>
                <Search className="h-4 w-4 mr-1" /> Pré-visualiser les anomalies
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {AUDITABLE_MODULES.map(moduleId => {
                const mod = allModules.find(m => m.id === moduleId);
                const isSelected = selectedModules.includes(moduleId);
                return (
                  <div
                    key={moduleId}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}
                    onClick={() => toggleModule(moduleId)}
                  >
                    <Checkbox checked={isSelected} onCheckedChange={() => toggleModule(moduleId)} />
                    <div>
                      <p className="text-sm font-medium">{mod?.label || moduleId}</p>
                      <p className="text-xs text-muted-foreground">{mod?.section}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pré-visualisation des anomalies */}
            {previewAnomalies.length > 0 && (
              <div className="mt-4 space-y-3">
                <h4 className="text-sm font-bold">Aperçu des anomalies détectées ({previewAnomalies.reduce((s, m) => s + m.anomalies.length, 0)} au total)</h4>
                {previewAnomalies.map(ma => (
                  <div key={ma.moduleId} className="p-3 rounded-lg border border-destructive/30 bg-destructive/5">
                    <p className="text-sm font-bold text-destructive">{ma.moduleLabel} — {ma.anomalies.length} anomalie(s)</p>
                    <ul className="mt-1 space-y-1">
                      {ma.anomalies.slice(0, 5).map((a, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                          <Badge variant={a.criticite === 'MAJEURE' ? 'destructive' : 'secondary'} className="text-[10px] px-1 h-4 shrink-0">{a.criticite}</Badge>
                          <span>{a.label}</span>
                        </li>
                      ))}
                      {ma.anomalies.length > 5 && <li className="text-xs text-muted-foreground italic">+ {ma.anomalies.length - 5} autre(s)...</li>}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button onClick={createPVFromSelection} disabled={selectedModules.length === 0}>
                Créer le PV ({selectedModules.length} module{selectedModules.length > 1 ? 's' : ''})
              </Button>
              <Button variant="outline" onClick={() => { setShowModuleSelector(false); setPreviewAnomalies([]); }}>Annuler</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {form && (
        <Card className="border-destructive">
          {/* Entête officielle */}
          <CardHeader className="border-b p-0">
            {(() => {
              const ac = getAgenceComptable(params);
              const headerEtab = ac || currentEtab;
              return (
                <>
                  <div className="flex justify-between items-start p-4 bg-muted/30 border-b">
                    <div className="text-xs text-muted-foreground">
                      <p className="font-bold uppercase">Agence comptable</p>
                      <p className="font-semibold">{headerEtab?.nom || ''}</p>
                      {headerEtab?.academie && <p>Académie de {headerEtab.academie}</p>}
                    </div>
                    <div className="text-xs text-muted-foreground text-right">
                      <p className="font-bold">RÉPUBLIQUE FRANÇAISE</p>
                      <p>Liberté – Égalité – Fraternité</p>
                      {ac && currentEtab && ac.id !== currentEtab.id && (
                        <div className="mt-2 pt-1 border-t border-border">
                          <p className="font-semibold uppercase text-[10px]">Établissement audité</p>
                          <p>{currentEtab.nom}</p>
                          {currentEtab.uai && <p>UAI : {currentEtab.uai}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-center py-6 space-y-2">
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-[0.2em]">Agence comptable</p>
                    <p className="font-bold text-xl">{headerEtab?.nom || 'Établissement'}</p>
                    {headerEtab?.uai && <p className="text-xs text-muted-foreground">UAI : {headerEtab.uai}</p>}
                    {headerEtab?.adresse && <p className="text-xs text-muted-foreground">{headerEtab.adresse}</p>}
                    {(headerEtab?.codePostal || headerEtab?.ville) && <p className="text-xs text-muted-foreground">{headerEtab.codePostal} {headerEtab.ville}</p>}
                    {ac && currentEtab && ac.id !== currentEtab.id && (
                      <p className="text-xs text-muted-foreground italic">Audit de : {currentEtab.nom} ({currentEtab.uai})</p>
                    )}
                    <div className="pt-4">
                      <p className="text-sm font-bold uppercase tracking-wider text-primary">Procès-Verbal d'Audit</p>
                      <p className="text-xs text-muted-foreground">Exercice {params.exercice || new Date().getFullYear()}</p>
                    </div>
                  </div>
                </>
              );
            })()}
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {/* Modules audités */}
            {form.modulesAudites && form.modulesAudites.length > 0 && (
              <div className="flex flex-wrap gap-1">
                <span className="text-xs font-bold text-muted-foreground mr-1">Modules audités :</span>
                {form.modulesAudites.map((id: string) => (
                  <Badge key={id} variant="secondary" className="text-[10px]">{allModules.find(m => m.id === id)?.label || id}</Badge>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1"><Label className="text-xs">Date</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
              <div className="space-y-1"><Label className="text-xs">Type</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  {TYPES_CONTROLE_PV.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1"><Label className="text-xs">Lieu</Label><Input value={form.lieu} onChange={e => setForm({ ...form, lieu: e.target.value })} /></div>
            </div>
            <div className="space-y-1"><Label className="text-xs">Objet du contrôle</Label><Input value={form.objet} onChange={e => setForm({ ...form, objet: e.target.value })} /></div>

            {/* Points de vérification */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold">Points de vérification {form.verifications?.length > 0 && `(${form.verifications.filter((v: PVVerification) => v.status === 'anomalie').length} anomalie(s) auto-détectées)`}</h4>
                <Button size="sm" variant="outline" onClick={addVerif}><Plus className="h-3 w-3 mr-1" /> Ajouter</Button>
              </div>
              <p className="text-xs text-muted-foreground">Les anomalies sont automatiquement collectées depuis les modules sélectionnés. Les cases non cochées dans chaque module constituent des anomalies.</p>
              {(form.verifications || []).map((v: PVVerification, i: number) => (
                <div key={i} className={`p-3 rounded border ${v.status === 'anomalie' ? 'border-destructive bg-destructive/5' : v.status === 'conforme' ? 'border-green-500 bg-green-50' : v.status === 'hors_perimetre' ? 'border-muted bg-muted/30 opacity-50' : 'border-border'}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                    <Input placeholder="Point de vérification" value={v.label} onChange={e => updateVerif(i, { label: e.target.value })} className="text-xs h-8" />
                    <Input placeholder="Réf. réglementaire" value={v.reference} onChange={e => updateVerif(i, { reference: e.target.value })} className="text-xs h-8" />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant={v.status === 'conforme' ? 'default' : 'outline'} onClick={() => updateVerif(i, { status: 'conforme' })} className="text-xs h-7">✓ Conforme</Button>
                    <Button size="sm" variant={v.status === 'anomalie' ? 'destructive' : 'outline'} onClick={() => updateVerif(i, { status: 'anomalie' })} className="text-xs h-7">⚠ Anomalie</Button>
                    <Button size="sm" variant="ghost" onClick={() => updateVerif(i, { status: 'non_verifie' })} className="text-xs h-7">— Non vérifié</Button>
                    <Button size="sm" variant="ghost" onClick={() => updateVerif(i, { status: 'hors_perimetre' })} className="text-xs h-7 opacity-60">⊘ Hors périmètre</Button>
                  </div>
                  {v.status === 'anomalie' && <Textarea className="mt-2 text-xs" rows={2} value={v.observations} onChange={e => updateVerif(i, { observations: e.target.value })} placeholder="Détailler l'anomalie..." />}
                </div>
              ))}
              {(form.verifications || []).length > 0 && (
                <div className="flex gap-4 text-xs p-2 bg-muted rounded">
                  <span><strong className="text-green-600">{(form.verifications || []).filter((v: PVVerification) => v.status === 'conforme').length}</strong> conformes</span>
                  <span><strong className="text-destructive">{(form.verifications || []).filter((v: PVVerification) => v.status === 'anomalie').length}</strong> anomalies</span>
                  <span><strong className="text-muted-foreground">{(form.verifications || []).filter((v: PVVerification) => v.status === 'non_verifie').length}</strong> non vérifiés</span>
                  <span><strong className="text-muted-foreground">{(form.verifications || []).filter((v: PVVerification) => v.status === 'hors_perimetre').length}</strong> hors périmètre</span>
                </div>
              )}
            </div>

            <Textarea value={form.constatsLibres} onChange={e => setForm({ ...form, constatsLibres: e.target.value })} rows={2} placeholder="Constats complémentaires..." />
            
            <div className="space-y-1">
              <Label className="text-xs font-bold">Recommandations (générées automatiquement)</Label>
              <Textarea value={form.recommandations} onChange={e => setForm({ ...form, recommandations: e.target.value })} rows={4} />
            </div>
            
            <Textarea value={form.conclusions} onChange={e => setForm({ ...form, conclusions: e.target.value })} rows={2} placeholder="Conclusions..." />

            {/* Bloc signatures */}
            <div className="border-t pt-4 mt-4 space-y-3">
              <h4 className="text-sm font-bold">Signatures</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Agent comptable</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.signataire1} onChange={e => setForm({ ...form, signataire1: e.target.value })}>
                    <option value="">Sélectionner...</option>
                    {params.agentComptable && <option value={params.agentComptable}>{params.agentComptable}</option>}
                    {params.equipe.filter(m => m.isAuditeur).map(m => <option key={m.id} value={`${m.prenom} ${m.nom}`}>{m.prenom} {m.nom} — {m.fonction}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Secrétaire général</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.signataire3 || ''} onChange={e => setForm({ ...form, signataire3: e.target.value })}>
                    <option value="">Sélectionner...</option>
                    {currentEtab?.secretaireGeneral && <option value={currentEtab.secretaireGeneral}>{currentEtab.secretaireGeneral}</option>}
                    {params.equipe.map(m => <option key={`all-${m.id}`} value={`${m.prenom} ${m.nom}`}>{m.prenom} {m.nom} — {m.fonction}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Ordonnateur</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.signataire2} onChange={e => setForm({ ...form, signataire2: e.target.value })}>
                    <option value="">Sélectionner...</option>
                    {currentEtab?.ordonnateur && <option value={currentEtab.ordonnateur}>{currentEtab.ordonnateur}</option>}
                  </select>
                </div>
              </div>

              {/* Signature électronique */}
              <div className="grid grid-cols-3 gap-3 mt-3">
                <SignaturePad label="Signature Agent comptable" value={form.signatureAC || ''} onChange={v => setForm({ ...form, signatureAC: v })} />
                <SignaturePad label="Signature Secrétaire général" value={form.signatureSG || ''} onChange={v => setForm({ ...form, signatureSG: v })} />
                <SignaturePad label="Signature Ordonnateur" value={form.signatureOrdo || ''} onChange={v => setForm({ ...form, signatureOrdo: v })} />
              </div>

              {/* Zone de signature imprimable */}
              <div className="hidden print:grid grid-cols-3 gap-6 pt-8 mt-4 border-t">
                <div className="text-center space-y-12">
                  <p className="text-xs font-bold">L'Agent comptable</p>
                  <p className="text-xs">{form.signataire1 || '____________________'}</p>
                </div>
                <div className="text-center space-y-12">
                  <p className="text-xs font-bold">Le Secrétaire général</p>
                  <p className="text-xs">{form.signataire3 || '____________________'}</p>
                </div>
                <div className="text-center space-y-12">
                  <p className="text-xs font-bold">L'Ordonnateur</p>
                  <p className="text-xs">{form.signataire2 || '____________________'}</p>
                </div>
              </div>
            </div>

            {/* Phase contradictoire */}
            <div className="border-2 border-dashed border-primary rounded-lg p-4 space-y-3">
              <h4 className="text-sm font-bold text-primary">Phase contradictoire — Droit de réponse</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1"><Label className="text-xs">Délai</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.delai} onChange={e => setForm({ ...form, delai: e.target.value })}>
                    {['24 heures', '48 heures', '7 jours', '15 jours', '30 jours', '60 jours'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div className="space-y-1"><Label className="text-xs">Phase</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.phase} onChange={e => setForm({ ...form, phase: e.target.value })}>
                    <option>provisoire</option><option>contradictoire</option><option>définitif</option>
                  </select>
                </div>
                <div className="space-y-1"><Label className="text-xs">Date réponse ordo.</Label><Input type="date" value={form.dateReponse} onChange={e => setForm({ ...form, dateReponse: e.target.value })} /></div>
              </div>
              <Textarea value={form.reponseOrdonnateur} onChange={e => setForm({ ...form, reponseOrdonnateur: e.target.value })} rows={2} placeholder="Réponse de l'ordonnateur..." />
            </div>

            {/* Lien Cartographie des risques */}
            {(form.verifications || []).filter((v: PVVerification) => v.status === 'anomalie').length > 0 && (
              <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🗺</span>
                    <p className="text-sm font-bold">Lien Cartographie des risques — {(form.verifications || []).filter((v: PVVerification) => v.status === 'anomalie').length} anomalie(s) détectée(s)</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Les anomalies de ce PV peuvent être poussées vers la Cartographie des risques Cartop@le. Chaque anomalie créera un risque dans le processus correspondant avec une criticité MAJEURE.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const anomalies = (form.verifications || []).filter((v: PVVerification) => v.status === 'anomalie');
                      const existing: any[] = (() => { try { return JSON.parse(localStorage.getItem('cic_expert_cartographie') || '[]'); } catch { return []; } })();
                      const newRisks = anomalies.map((v: PVVerification) => ({
                        id: crypto.randomUUID(),
                        processus: 'P4 — Dépenses / Charges',
                        risque: v.label,
                        probabilite: 3,
                        impact: 4,
                        maitrise: 4,
                        action: v.observations || 'Régularisation à effectuer',
                        responsable: form.signataire1 || '',
                        echeance: 'Mensuel',
                        statut: 'À lancer',
                      }));
                      localStorage.setItem('cic_expert_cartographie', JSON.stringify([...existing, ...newRisks]));
                      window.dispatchEvent(new Event('storage'));
                      toast.success(`${newRisks.length} risque(s) créé(s) dans la Cartographie`, { description: 'Consultez le module Cartographie des risques pour les affiner.' });
                    }}
                  >
                    Créer {(form.verifications || []).filter((v: PVVerification) => v.status === 'anomalie').length} risque(s) dans la Cartographie
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-2"><Button onClick={submit}>Enregistrer</Button><Button variant="outline" onClick={() => setForm(null)}>Annuler</Button></div>
          </CardContent>
        </Card>
      )}

      {items.length === 0 && !form && !showModuleSelector && <Card><CardContent className="py-12 text-center text-muted-foreground">Aucun PV. Cliquez « Nouveau PV » pour sélectionner les modules à auditer. Les anomalies (cases non cochées, écarts, etc.) seront automatiquement collectées.</CardContent></Card>}

      {items.map(p => {
        const anom = (p.verifications || []).filter(v => v.status === 'anomalie').length;
        return (
          <Card key={p.id} className={p.phase === 'définitif' ? 'border-green-500' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-bold text-lg">{p.type}</span>
                  <Badge className="ml-2" variant={p.phase === 'définitif' ? 'secondary' : 'default'}>{p.phase}</Badge>
                  <p className="text-xs text-muted-foreground">{fmtDate(p.date)} — {p.lieu} — Délai: {p.delai}</p>
                </div>
                <div className="flex gap-1 no-print">
                  <Button variant="ghost" size="icon" onClick={() => handlePrintPV(p)} title="Imprimer ce PV"><Printer className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => setForm({ ...p })}><span className="text-xs">✎</span></Button>
                  <Button variant="ghost" size="icon" onClick={() => save(items.filter(i => i.id !== p.id))}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
              <p className="text-sm"><strong>Objet:</strong> {p.objet}</p>
              {anom > 0 && (
                <p className="text-xs text-destructive font-bold mt-1">
                  {anom} anomalie(s)
                  {(p.verifications || []).filter(v => v.status === 'hors_perimetre').length > 0 && (
                    <span className="text-muted-foreground font-normal"> · {(p.verifications || []).filter(v => v.status === 'hors_perimetre').length} hors périmètre</span>
                  )}
                </p>
              )}
              {(p as any).modulesAudites && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {(p as any).modulesAudites.map((id: string) => (
                    <Badge key={id} variant="outline" className="text-[10px]">{allModules.find(m => m.id === id)?.label || id}</Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Signé par : {p.signataire1 || '—'} (AC) / {(p as any).signataire3 || '—'} (SG) / {p.signataire2 || '—'} (Ordo.)</p>
            </CardContent>
          </Card>
        );
      })}
    </ModulePageLayout>
    </div>
    </>
  );
}
