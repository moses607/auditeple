import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { PVAuditItem, PVVerification, TYPES_CONTROLE_PV, fmtDate } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';
import { useAuditParams } from '@/hooks/useAuditStore';

// Collect anomalies from all modules
function collectAnomalies(): PVVerification[] {
  const anomalies: PVVerification[] = [];

  // Cartographie risques critiques
  const risques = loadState<any[]>('cartographie', []);
  risques.filter(r => r.probabilite * r.impact * r.maitrise >= 40).forEach(r => {
    anomalies.push({ label: `Risque critique: ${r.risque}`, reference: `Processus: ${r.processus}`, criticite: 'MAJEURE', status: 'anomalie', observations: `Score ${r.probabilite * r.impact * r.maitrise} — Action: ${r.action || 'Non définie'}` });
  });

  // Stocks écarts
  const stocks = loadState<any[]>('stocks', []);
  stocks.filter(s => s.ecart !== 0).forEach(s => {
    anomalies.push({ label: `Écart stock: ${s.nom}`, reference: 'Inventaire physique', criticite: s.ecart > 5 ? 'MAJEURE' : 'MINEURE', status: 'anomalie', observations: `Théorique: ${s.theo}, Physique: ${s.phys}, Écart: ${s.ecart}` });
  });

  // Rapprochement bancaire écarts
  const rappro = loadState<any[]>('rapprochement', []);
  rappro.filter(r => r.ecart !== 0).forEach(r => {
    anomalies.push({ label: `Écart rapprochement bancaire du ${r.date}`, reference: 'M9-6 § 4.3.3', criticite: 'MAJEURE', status: 'anomalie', observations: `DFT: ${r.dft}, Compta: ${r.compta}, Écart: ${r.ecart}` });
  });

  // Subventions sous-consommées
  const subv = loadState<any[]>('subventions', []);
  subv.filter(s => s.statut === 'Sous-consommé' || s.reliquat > 0).forEach(s => {
    anomalies.push({ label: `Subvention ${s.type} sous-consommée`, reference: 'Suivi subventions', criticite: 'MINEURE', status: 'anomalie', observations: `Reliquat: ${s.reliquat}€` });
  });

  return anomalies;
}

// Auto-generate recommendations
function generateRecommandations(verifications: PVVerification[]): string {
  const anom = verifications.filter(v => v.status === 'anomalie');
  if (anom.length === 0) return 'Aucune anomalie relevée. L\'agent comptable est invité à maintenir la qualité de ses procédures.';
  const lines = anom.map((a, i) => `${i + 1}. ${a.label}: ${a.observations || 'Régularisation à effectuer dans les meilleurs délais.'}`);
  return `Les anomalies suivantes appellent une régularisation :\n${lines.join('\n')}\n\nL'ordonnateur et l'agent comptable sont invités à mettre en œuvre les mesures correctives dans les délais impartis.`;
}

export default function PVAudit() {
  const { params } = useAuditParams();
  const [items, setItems] = useState<PVAuditItem[]>(() => loadState('pv_audit', []));
  const [form, setForm] = useState<any>(null);
  const save = (d: PVAuditItem[]) => { setItems(d); saveState('pv_audit', d); };

  const newPV = () => {
    const autoAnomalies = collectAnomalies();
    const reco = generateRecommandations(autoAnomalies);
    setForm({
      date: new Date().toISOString().split('T')[0], type: 'Contrôle global', lieu: params.etablissement || '', objet: '',
      verifications: autoAnomalies, constatsLibres: '', recommandations: reco, conclusions: '',
      signataire1: params.agentComptable || '', signataire2: params.ordonnateur || '',
      delai: '30 jours', phase: 'provisoire',
      reponseOrdonnateur: '', dateReponse: '', conforme: false,
    });
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Procès-Verbaux d'Audit</h1>
          <p className="text-xs text-muted-foreground mt-1">Réf. : CRC / DGFiP / Rectorat — PV contradictoire — Double signature — Anomalies auto-détectées</p>
        </div>
        <Button onClick={newPV}><Plus className="h-4 w-4 mr-2" /> Nouveau PV</Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{items.length}</p><p className="text-xs text-muted-foreground">Total PV</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-destructive">{totalAnom}</p><p className="text-xs text-muted-foreground">Anomalies</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-green-600">{items.filter(p => p.phase === 'définitif').length}</p><p className="text-xs text-muted-foreground">Définitifs</p></CardContent></Card>
      </div>

      {form && (
        <Card className="border-destructive">
          {/* Entête agence comptable */}
          <CardHeader className="bg-muted/50 border-b">
            <div className="text-center space-y-1">
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Agence comptable</p>
              <p className="font-bold text-lg">{params.etablissement || 'Établissement'}</p>
              {params.uai && <p className="text-xs text-muted-foreground">UAI : {params.uai}</p>}
              {params.adresse && <p className="text-xs text-muted-foreground">{params.adresse} — {params.codePostal} {params.ville}</p>}
              <p className="text-xs text-muted-foreground">Académie : {params.academie || '—'}</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
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
              <p className="text-xs text-muted-foreground">Les anomalies sont automatiquement collectées depuis les modules. Seules les anomalies apparaîtront sur le PV imprimable.</p>
              {(form.verifications || []).map((v: PVVerification, i: number) => (
                <div key={i} className={`p-3 rounded border ${v.status === 'anomalie' ? 'border-destructive bg-destructive/5' : v.status === 'conforme' ? 'border-green-500 bg-green-50' : 'border-border'}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                    <Input placeholder="Point de vérification" value={v.label} onChange={e => updateVerif(i, { label: e.target.value })} className="text-xs h-8" />
                    <Input placeholder="Réf. réglementaire" value={v.reference} onChange={e => updateVerif(i, { reference: e.target.value })} className="text-xs h-8" />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant={v.status === 'conforme' ? 'default' : 'outline'} onClick={() => updateVerif(i, { status: 'conforme' })} className="text-xs h-7">✓ Conforme</Button>
                    <Button size="sm" variant={v.status === 'anomalie' ? 'destructive' : 'outline'} onClick={() => updateVerif(i, { status: 'anomalie' })} className="text-xs h-7">⚠ Anomalie</Button>
                    <Button size="sm" variant="ghost" onClick={() => updateVerif(i, { status: 'non_verifie' })} className="text-xs h-7">— Non vérifié</Button>
                  </div>
                  {v.status === 'anomalie' && <Textarea className="mt-2 text-xs" rows={2} value={v.observations} onChange={e => updateVerif(i, { observations: e.target.value })} placeholder="Détailler l'anomalie..." />}
                </div>
              ))}
              {(form.verifications || []).length > 0 && (
                <div className="flex gap-4 text-xs p-2 bg-muted rounded">
                  <span><strong className="text-green-600">{(form.verifications || []).filter((v: PVVerification) => v.status === 'conforme').length}</strong> conformes</span>
                  <span><strong className="text-destructive">{(form.verifications || []).filter((v: PVVerification) => v.status === 'anomalie').length}</strong> anomalies</span>
                  <span><strong className="text-muted-foreground">{(form.verifications || []).filter((v: PVVerification) => v.status === 'non_verifie').length}</strong> non vérifiés</span>
                </div>
              )}
            </div>

            <Textarea value={form.constatsLibres} onChange={e => setForm({ ...form, constatsLibres: e.target.value })} rows={2} placeholder="Constats complémentaires..." />
            
            <div className="space-y-1">
              <Label className="text-xs font-bold">Recommandations (générées automatiquement)</Label>
              <Textarea value={form.recommandations} onChange={e => setForm({ ...form, recommandations: e.target.value })} rows={4} />
            </div>
            
            <Textarea value={form.conclusions} onChange={e => setForm({ ...form, conclusions: e.target.value })} rows={2} placeholder="Conclusions..." />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Signataire — Agent comptable</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.signataire1} onChange={e => setForm({ ...form, signataire1: e.target.value })}>
                  <option value="">Sélectionner...</option>
                  {params.agentComptable && <option value={params.agentComptable}>{params.agentComptable} (AC)</option>}
                  {params.equipe.map(m => <option key={m.id} value={`${m.prenom} ${m.nom}`}>{m.prenom} {m.nom} — {m.fonction}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Signataire — Ordonnateur</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.signataire2} onChange={e => setForm({ ...form, signataire2: e.target.value })}>
                  <option value="">Sélectionner...</option>
                  {params.ordonnateur && <option value={params.ordonnateur}>{params.ordonnateur} (Ordonnateur)</option>}
                </select>
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

            <div className="flex gap-2"><Button onClick={submit}>Enregistrer</Button><Button variant="outline" onClick={() => setForm(null)}>Annuler</Button></div>
          </CardContent>
        </Card>
      )}

      {items.length === 0 && !form && <Card><CardContent className="py-12 text-center text-muted-foreground">Aucun PV. Cliquez « Nouveau PV » pour commencer. Les anomalies seront automatiquement collectées depuis tous les modules.</CardContent></Card>}

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
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => setForm({ ...p })}><span className="text-xs">✎</span></Button>
                  <Button variant="ghost" size="icon" onClick={() => save(items.filter(i => i.id !== p.id))}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
              <p className="text-sm"><strong>Objet:</strong> {p.objet}</p>
              {anom > 0 && <p className="text-xs text-destructive font-bold mt-1">{anom} anomalie(s)</p>}
              <p className="text-xs text-muted-foreground mt-1">Signé par : {p.signataire1 || '—'} / {p.signataire2 || '—'}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
