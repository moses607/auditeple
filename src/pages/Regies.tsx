import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { BILLETS, PIECES, fmt, fmtDate } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { REGIES_REGLEMENTATION } from '@/lib/regulatory-data';
import { ModulePageLayout, ComplianceCheck, ModuleSection } from '@/components/ModulePageLayout';
import { ControlAlert } from '@/components/ControlAlert';

/* ═══ SEUILS RÉGLEMENTAIRES ═══ */
/* Cautionnement SUPPRIMÉ depuis l'Ord. 2022-408 + Décret 2022-1605 (entrée en vigueur 1er janvier 2023) */
const SEUIL_IR_REGISSEUR = 1220;  // €  — IR (indemnité de responsabilité) demeure due si plafond > 1220 € (arrêté 28/05/1993)

/* ═══ TYPES ═══ */
interface ControleCaisseItem {
  id: string; date: string; regisseur: string; type: string;
  plafond: number; theorique: number; reel: number; ecart: number;
  statut: string; observations: string;
  journalCaisse: boolean | null; billetage: Record<string, number>;
}

interface ChequesCoffre {
  id: string; numero: string; emetteur: string; montant: number; date: string; observations: string;
}

interface ValeurInactive {
  id: string; type: string; serieDebut: string; serieFin: string; quantite: number; valeurUnitaire: number; observations: string;
}

interface ActeConstitutif {
  dateCreation: string; referenceArrete: string; typeRegie: string;
  montantPlafond: number; montantAvance: number; dureeAvance: string;
  objetRegie: string; observations: string;
}

interface NominationRegisseur {
  nom: string; prenom: string; fonction: string; dateNomination: string;
  referenceArrete: string; suppleant: string; dateSuppleance: string;
  formationRegie: boolean; dateFormation: string; observations: string;
  irMontantAnnuel: number; irVersee: boolean;
}

export default function RegiesPage() {
  // ═══ COMPTAGE CAISSE ═══
  const [controles, setControles] = useState<ControleCaisseItem[]>(() => loadState('ctrl_caisse', []));
  const [formCtrl, setFormCtrl] = useState<any>(null);

  // ═══ CHÈQUES COFFRE ═══
  const [cheques, setCheques] = useState<ChequesCoffre[]>(() => loadState('regies_cheques', []));
  const [formCheque, setFormCheque] = useState<any>(null);

  // ═══ VALEURS INACTIVES ═══
  const [valeurs, setValeurs] = useState<ValeurInactive[]>(() => loadState('regies_valeurs_inactives', []));
  const [formValeur, setFormValeur] = useState<any>(null);

  // ═══ ACTE CONSTITUTIF ═══
  const [acte, setActe] = useState<ActeConstitutif>(() => loadState('regies_acte_constitutif', {
    dateCreation: '', referenceArrete: '', typeRegie: 'Avances', montantPlafond: 0,
    montantAvance: 0, dureeAvance: '', objetRegie: '', observations: '',
  }));

  // ═══ NOMINATION RÉGISSEUR ═══
  const [nomination, setNomination] = useState<NominationRegisseur>(() => loadState('regies_nomination', {
    nom: '', prenom: '', fonction: '', dateNomination: '', referenceArrete: '',
    suppleant: '', dateSuppleance: '', formationRegie: false, dateFormation: '', observations: '',
    irMontantAnnuel: 0, irVersee: false,
  }));

  // ═══ DFT ═══
  const [dftMontant, setDftMontant] = useState<string>(() => loadState('regies_dft_montant', ''));
  const [dftDateEncaissement, setDftDateEncaissement] = useState<string>(() => loadState('regies_dft_date_enc', ''));
  const [dftDateVersement, setDftDateVersement] = useState<string>(() => loadState('regies_dft_date_ver', ''));
  const [regChecks, setRegChecks] = useState<Record<string, boolean>>(() => loadState('regies_reg_checks', {}));
  const toggleRegCheck = (id: string) => { const u = { ...regChecks, [id]: !regChecks[id] }; setRegChecks(u); saveState('regies_reg_checks', u); };

  const saveControles = (d: ControleCaisseItem[]) => { setControles(d); saveState('ctrl_caisse', d); };
  const saveCheques = (d: ChequesCoffre[]) => { setCheques(d); saveState('regies_cheques', d); };
  const saveValeurs = (d: ValeurInactive[]) => { setValeurs(d); saveState('regies_valeurs_inactives', d); };
  const updateActe = (k: string, v: any) => { const n = { ...acte, [k]: v }; setActe(n); saveState('regies_acte_constitutif', n); };
  const updateNom = (k: string, v: any) => { const n = { ...nomination, [k]: v }; setNomination(n); saveState('regies_nomination', n); };

  const billetageTotal = (b: Record<string, number>) => {
    let t = 0;
    BILLETS.forEach(v => { t += (b['b' + v] || 0) * v; });
    PIECES.forEach(v => { const k = 'p' + String(v).replace('.', ''); t += (b[k] || 0) * v; });
    return t;
  };

  const submitCtrl = () => {
    if (!formCtrl) return;
    const reel = parseFloat(formCtrl.reel) || 0;
    const theo = parseFloat(formCtrl.theorique) || 0;
    const ecart = reel - theo;
    const item: ControleCaisseItem = {
      id: formCtrl.id || crypto.randomUUID(), date: formCtrl.date, regisseur: formCtrl.regisseur,
      type: formCtrl.type, plafond: parseFloat(formCtrl.plafond) || 0, theorique: theo, reel,
      ecart, statut: Math.abs(ecart) < 0.01 ? 'Conforme' : 'Écart', observations: formCtrl.observations,
      journalCaisse: formCtrl.journalCaisse, billetage: formCtrl.billetage || {},
    };
    if (formCtrl.id) saveControles(controles.map(i => i.id === formCtrl.id ? item : i));
    else saveControles([item, ...controles]);
    setFormCtrl(null);
  };

  const submitCheque = () => {
    if (!formCheque) return;
    const item: ChequesCoffre = { id: formCheque.id || crypto.randomUUID(), numero: formCheque.numero, emetteur: formCheque.emetteur, montant: parseFloat(formCheque.montant) || 0, date: formCheque.date, observations: formCheque.observations };
    if (formCheque.id) saveCheques(cheques.map(i => i.id === formCheque.id ? item : i));
    else saveCheques([...cheques, item]);
    setFormCheque(null);
  };

  const submitValeur = () => {
    if (!formValeur) return;
    const item: ValeurInactive = { id: formValeur.id || crypto.randomUUID(), type: formValeur.type, serieDebut: formValeur.serieDebut, serieFin: formValeur.serieFin, quantite: parseInt(formValeur.quantite) || 0, valeurUnitaire: parseFloat(formValeur.valeurUnitaire) || 0, observations: formValeur.observations };
    if (formValeur.id) saveValeurs(valeurs.map(i => i.id === formValeur.id ? item : i));
    else saveValeurs([...valeurs, item]);
    setFormValeur(null);
  };

  const totalCheques = cheques.reduce((s, c) => s + c.montant, 0);
  const totalValeurs = valeurs.reduce((s, v) => s + v.quantite * v.valeurUnitaire, 0);

  const joursDFT = useMemo(() => {
    if (!dftDateEncaissement || !dftDateVersement) return null;
    const d1 = new Date(dftDateEncaissement);
    const d2 = new Date(dftDateVersement);
    const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? diff : null;
  }, [dftDateEncaissement, dftDateVersement]);

  return (
    <ModulePageLayout
      title="Régies"
      section="CONTRÔLES SUR PLACE"
      description="Contrôle des régies d'avances et de recettes : acte constitutif, nomination, comptage de caisse, chèques en coffre, valeurs inactives et délai de versement au comptable. (Cautionnement supprimé depuis l'Ord. 2022-408 — RGP)"
      refs={[
        { refKey: 'reg-2019-798', label: 'Plafonds' },
        { refKey: 'reg-acte-constitutif', label: 'Acte constitutif' },
        { refKey: 'reg-nomination', label: 'Nomination' },
        { refKey: 'reg-controle-inopine', label: 'Contrôle inopiné' },
        { refKey: 'reg-dft', label: 'DFT' },
        { refKey: 'm96-3.2', label: 'M9-6 § 3.2' },
      ]}
      completedChecks={(REGIES_REGLEMENTATION.controles_obligatoires).filter(c => regChecks[c.id]).length}
      totalChecks={(REGIES_REGLEMENTATION.controles_obligatoires).length}
    >

      <Tabs defaultValue="comptage" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="comptage">Comptage caisse</TabsTrigger>
          <TabsTrigger value="cheques">Chèques coffre</TabsTrigger>
          <TabsTrigger value="valeurs">Valeurs inactives</TabsTrigger>
          <TabsTrigger value="acte">Acte constitutif</TabsTrigger>
          <TabsTrigger value="nomination">Nomination</TabsTrigger>
        </TabsList>

        {/* ═══ ONGLET COMPTAGE CAISSE ═══ */}
        <TabsContent value="comptage" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setFormCtrl({ date: new Date().toISOString().split('T')[0], regisseur: '', type: 'Avances restauration', plafond: '', theorique: '', reel: '', observations: '', journalCaisse: null, billetage: {} })}>
              <Plus className="h-4 w-4 mr-2" /> Nouveau contrôle
            </Button>
          </div>

          {formCtrl && (
            <Card className="border-primary">
              <CardHeader><CardTitle className="text-lg">Saisie du contrôle</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1"><Label className="text-xs">Date</Label><Input type="date" value={formCtrl.date} onChange={e => setFormCtrl({ ...formCtrl, date: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Régisseur</Label><Input value={formCtrl.regisseur} onChange={e => setFormCtrl({ ...formCtrl, regisseur: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Type</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formCtrl.type} onChange={e => setFormCtrl({ ...formCtrl, type: e.target.value })}>
                      <option>Avances restauration</option><option>Avances voyages</option><option>Recettes restauration</option><option>Recettes voyages</option><option>Menues dépenses</option><option>Autre</option>
                    </select>
                  </div>
                  <div className="space-y-1"><Label className="text-xs">Plafond (€)</Label><Input type="number" value={formCtrl.plafond} onChange={e => setFormCtrl({ ...formCtrl, plafond: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Solde théorique (€)</Label><Input type="number" value={formCtrl.theorique} onChange={e => setFormCtrl({ ...formCtrl, theorique: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Solde réel compté (€)</Label><Input type="number" value={formCtrl.reel} onChange={e => setFormCtrl({ ...formCtrl, reel: e.target.value })} /></div>
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
                          <Input type="number" min={0} className="w-16 h-7 text-xs" value={formCtrl.billetage?.['b' + v] || ''} onChange={e => setFormCtrl({ ...formCtrl, billetage: { ...formCtrl.billetage, ['b' + v]: parseInt(e.target.value) || 0 } })} />
                          <span className="text-xs text-muted-foreground">{((formCtrl.billetage?.['b' + v] || 0) * v).toFixed(2)} €</span>
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
                            <Input type="number" min={0} className="w-16 h-7 text-xs" value={formCtrl.billetage?.[k] || ''} onChange={e => setFormCtrl({ ...formCtrl, billetage: { ...formCtrl.billetage, [k]: parseInt(e.target.value) || 0 } })} />
                            <span className="text-xs text-muted-foreground">{((formCtrl.billetage?.[k] || 0) * v).toFixed(2)} €</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="mt-3 p-2 bg-primary/10 rounded flex items-center justify-between">
                    <span className="font-bold text-primary">Total compté : {billetageTotal(formCtrl.billetage || {}).toFixed(2)} €</span>
                    <Button size="sm" variant="outline" onClick={() => setFormCtrl({ ...formCtrl, reel: billetageTotal(formCtrl.billetage || {}).toFixed(2) })}>↓ Reporter</Button>
                  </div>
                </div>

                {/* Journal de caisse */}
                <div className={`p-3 rounded-lg border ${formCtrl.journalCaisse === false ? 'border-destructive bg-destructive/10' : formCtrl.journalCaisse === true ? 'border-green-500 bg-green-50' : 'border-border'}`}>
                  <p className="text-xs font-bold mb-2">Journal de caisse — Vérification réglementaire</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant={formCtrl.journalCaisse === true ? 'default' : 'outline'} onClick={() => setFormCtrl({ ...formCtrl, journalCaisse: true })}>✓ Présent</Button>
                    <Button size="sm" variant={formCtrl.journalCaisse === false ? 'destructive' : 'outline'} onClick={() => setFormCtrl({ ...formCtrl, journalCaisse: false })}>✗ Absent</Button>
                  </div>
                  {formCtrl.journalCaisse === false && <p className="text-xs text-destructive mt-2 font-bold">ANOMALIE MAJEURE — Absence de journal de caisse.</p>}
                </div>

                <Textarea value={formCtrl.observations} onChange={e => setFormCtrl({ ...formCtrl, observations: e.target.value })} placeholder="Observations..." rows={2} />
                <div className="flex gap-2">
                  <Button onClick={submitCtrl}>Valider</Button>
                  <Button variant="outline" onClick={() => setFormCtrl(null)}>Annuler</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {controles.length === 0 && !formCtrl && <Card className="shadow-card"><CardContent className="py-12 text-center text-muted-foreground">Aucun contrôle de caisse. Cliquez « Nouveau contrôle ».</CardContent></Card>}

          {controles.map(x => (
            <Card key={x.id} className={x.ecart !== 0 ? 'border-destructive' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div><span className="font-bold">{fmtDate(x.date)}</span> — {x.regisseur} <Badge variant={x.statut === 'Conforme' ? 'secondary' : 'destructive'} className="ml-2">{x.statut}</Badge></div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setFormCtrl({ ...x, plafond: String(x.plafond), theorique: String(x.theorique), reel: String(x.reel) })}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => saveControles(controles.filter(i => i.id !== x.id))}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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

          {/* DFT */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Délai de versement DFT</CardTitle>
              <p className="text-xs text-muted-foreground">Nombre de jours durant lesquels un montant est resté sur le compte DFT du régisseur sans être versé.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Montant (€)</Label><Input type="number" value={dftMontant} onChange={e => { setDftMontant(e.target.value); saveState('regies_dft_montant', e.target.value); }} /></div>
                <div className="space-y-2"><Label>Date d'encaissement</Label><Input type="date" value={dftDateEncaissement} onChange={e => { setDftDateEncaissement(e.target.value); saveState('regies_dft_date_enc', e.target.value); }} /></div>
                <div className="space-y-2"><Label>Date de versement</Label><Input type="date" value={dftDateVersement} onChange={e => { setDftDateVersement(e.target.value); saveState('regies_dft_date_ver', e.target.value); }} /></div>
              </div>
              {joursDFT !== null && (
                <div className={`p-4 rounded-lg border ${joursDFT > 7 ? 'bg-destructive/10 border-destructive' : 'bg-green-50 border-green-300'}`}>
                  <p className="text-2xl font-bold text-center">{joursDFT} jour{joursDFT > 1 ? 's' : ''}</p>
                  <p className="text-sm text-center text-muted-foreground">
                    {joursDFT > 7 ? '⚠️ Délai supérieur à 7 jours — rappeler les obligations réglementaires au régisseur.' : '✅ Délai de versement conforme.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ ONGLET CHÈQUES COFFRE ═══ */}
        <TabsContent value="cheques" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Chèques trouvés dans le coffre-fort lors du contrôle</p>
            <Button onClick={() => setFormCheque({ numero: '', emetteur: '', montant: '', date: new Date().toISOString().split('T')[0], observations: '' })}><Plus className="h-4 w-4 mr-2" /> Ajouter un chèque</Button>
          </div>

          {formCheque && (
            <Card className="border-primary">
              <CardContent className="pt-6 space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1"><Label className="text-xs">N° chèque</Label><Input value={formCheque.numero} onChange={e => setFormCheque({ ...formCheque, numero: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Émetteur</Label><Input value={formCheque.emetteur} onChange={e => setFormCheque({ ...formCheque, emetteur: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Montant (€)</Label><Input type="number" value={formCheque.montant} onChange={e => setFormCheque({ ...formCheque, montant: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Date</Label><Input type="date" value={formCheque.date} onChange={e => setFormCheque({ ...formCheque, date: e.target.value })} /></div>
                </div>
                <Input placeholder="Observations" value={formCheque.observations} onChange={e => setFormCheque({ ...formCheque, observations: e.target.value })} />
                <div className="flex gap-2"><Button onClick={submitCheque}>Valider</Button><Button variant="outline" onClick={() => setFormCheque(null)}>Annuler</Button></div>
              </CardContent>
            </Card>
          )}

          {cheques.length === 0 && !formCheque && <Card className="shadow-card"><CardContent className="py-12 text-center text-muted-foreground">Aucun chèque trouvé dans le coffre-fort.</CardContent></Card>}

          {cheques.length > 0 && (
            <>
              <Card className="shadow-card"><CardContent className="pt-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b text-xs text-muted-foreground"><th className="p-2">N°</th><th className="text-left p-2">Émetteur</th><th className="text-right p-2">Montant</th><th className="p-2">Date</th><th className="text-left p-2">Observations</th><th></th></tr></thead>
                  <tbody>{cheques.map(x => (
                    <tr key={x.id} className="border-b">
                      <td className="p-2 font-mono">{x.numero}</td><td className="p-2 font-bold">{x.emetteur}</td>
                      <td className="p-2 text-right font-mono font-bold">{fmt(x.montant)}</td>
                      <td className="p-2 text-xs">{fmtDate(x.date)}</td><td className="p-2 text-xs">{x.observations}</td>
                      <td className="p-2"><div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setFormCheque({ ...x, montant: String(x.montant) })}><Pencil className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => saveCheques(cheques.filter(i => i.id !== x.id))}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                      </div></td>
                    </tr>
                  ))}</tbody>
                </table>
              </CardContent></Card>
              <Card className="shadow-card"><CardContent className="pt-4 text-center"><p className="text-lg font-bold">Total chèques dans le coffre : {fmt(totalCheques)}</p></CardContent></Card>
            </>
          )}
        </TabsContent>

        {/* ═══ ONGLET VALEURS INACTIVES ═══ */}
        <TabsContent value="valeurs" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Tickets restaurant, timbres, bons d'essence, tickets de cantine, etc.</p>
            <Button onClick={() => setFormValeur({ type: 'Tickets restaurant', serieDebut: '', serieFin: '', quantite: '', valeurUnitaire: '', observations: '' })}><Plus className="h-4 w-4 mr-2" /> Ajouter</Button>
          </div>

          {formValeur && (
            <Card className="border-primary">
              <CardContent className="pt-6 space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="space-y-1"><Label className="text-xs">Type</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formValeur.type} onChange={e => setFormValeur({ ...formValeur, type: e.target.value })}>
                      <option>Tickets restaurant</option><option>Timbres fiscaux</option><option>Bons d'essence</option><option>Tickets cantine</option><option>Cartes de photocopie</option><option>Autre</option>
                    </select>
                  </div>
                  <div className="space-y-1"><Label className="text-xs">Série début</Label><Input value={formValeur.serieDebut} onChange={e => setFormValeur({ ...formValeur, serieDebut: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Série fin</Label><Input value={formValeur.serieFin} onChange={e => setFormValeur({ ...formValeur, serieFin: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Quantité</Label><Input type="number" value={formValeur.quantite} onChange={e => setFormValeur({ ...formValeur, quantite: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Valeur unitaire (€)</Label><Input type="number" value={formValeur.valeurUnitaire} onChange={e => setFormValeur({ ...formValeur, valeurUnitaire: e.target.value })} /></div>
                </div>
                <Input placeholder="Observations" value={formValeur.observations} onChange={e => setFormValeur({ ...formValeur, observations: e.target.value })} />
                <div className="flex gap-2"><Button onClick={submitValeur}>Valider</Button><Button variant="outline" onClick={() => setFormValeur(null)}>Annuler</Button></div>
              </CardContent>
            </Card>
          )}

          {valeurs.length === 0 && !formValeur && <Card className="shadow-card"><CardContent className="py-12 text-center text-muted-foreground">Aucune valeur inactive enregistrée.</CardContent></Card>}

          {valeurs.length > 0 && (
            <>
              <Card className="shadow-card"><CardContent className="pt-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">Type</th><th className="p-2">Série</th><th className="text-right p-2">Qté</th><th className="text-right p-2">Val. unit.</th><th className="text-right p-2">Total</th><th></th></tr></thead>
                  <tbody>{valeurs.map(x => (
                    <tr key={x.id} className="border-b">
                      <td className="p-2 font-bold">{x.type}</td>
                      <td className="p-2 font-mono text-xs">{x.serieDebut} → {x.serieFin}</td>
                      <td className="p-2 text-right font-mono">{x.quantite}</td>
                      <td className="p-2 text-right font-mono">{fmt(x.valeurUnitaire)}</td>
                      <td className="p-2 text-right font-mono font-bold">{fmt(x.quantite * x.valeurUnitaire)}</td>
                      <td className="p-2"><div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setFormValeur({ ...x, quantite: String(x.quantite), valeurUnitaire: String(x.valeurUnitaire) })}><Pencil className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => saveValeurs(valeurs.filter(i => i.id !== x.id))}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                      </div></td>
                    </tr>
                  ))}</tbody>
                </table>
              </CardContent></Card>
              <Card className="shadow-card"><CardContent className="pt-4 text-center"><p className="text-lg font-bold">Total valeurs inactives : {fmt(totalValeurs)}</p></CardContent></Card>
            </>
          )}
        </TabsContent>

        {/* ═══ ONGLET ACTE CONSTITUTIF ═══ */}
        <TabsContent value="acte" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader><CardTitle className="text-lg">Acte constitutif de la régie</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1"><Label className="text-xs">Date de création</Label><Input type="date" value={acte.dateCreation} onChange={e => updateActe('dateCreation', e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">Référence arrêté</Label><Input value={acte.referenceArrete} onChange={e => updateActe('referenceArrete', e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">Type de régie</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={acte.typeRegie} onChange={e => updateActe('typeRegie', e.target.value)}>
                    <option>Avances</option><option>Recettes</option><option>Avances et recettes</option>
                  </select>
                </div>
                <div className="space-y-1"><Label className="text-xs">Montant plafond de la régie (€)</Label><Input type="number" value={acte.montantPlafond || ''} onChange={e => updateActe('montantPlafond', parseFloat(e.target.value) || 0)} /></div>
                <div className="space-y-1"><Label className="text-xs">Montant de l'avance (€)</Label><Input type="number" value={acte.montantAvance || ''} onChange={e => updateActe('montantAvance', parseFloat(e.target.value) || 0)} /></div>
                <div className="space-y-1"><Label className="text-xs">Durée de l'avance</Label><Input value={acte.dureeAvance} onChange={e => updateActe('dureeAvance', e.target.value)} placeholder="Ex: 1 mois" /></div>
              </div>
              <div className="space-y-1"><Label className="text-xs">Objet de la régie</Label><Textarea value={acte.objetRegie} onChange={e => updateActe('objetRegie', e.target.value)} rows={2} placeholder="Ex: Menues dépenses de fonctionnement..." /></div>
              <div className="space-y-1"><Label className="text-xs">Observations</Label><Textarea value={acte.observations} onChange={e => updateActe('observations', e.target.value)} rows={3} /></div>

              {!acte.dateCreation && (
                <ControlAlert level="critique" title="Acte constitutif manquant"
                  description="L'acte constitutif de la régie n'est pas renseigné. Sa production est obligatoire avant tout fonctionnement."
                  refKey="reg-acte-constitutif" action="Récupérer l'arrêté du chef d'établissement et saisir la date de création." />
              )}

              {/* Alerte cautionnement automatique selon plafond */}
              {acte.montantPlafond > SEUIL_CAUTIONNEMENT && (
                <ControlAlert level="alerte" title={`Cautionnement obligatoire (plafond ${fmt(acte.montantPlafond)} > ${SEUIL_CAUTIONNEMENT} €)`}
                  description="Au-delà de 1 220 € de plafond, le régisseur doit obligatoirement souscrire un cautionnement (caution mutuelle ou personnelle) avant son entrée en fonction."
                  refKey="arrete-cautionnement"
                  action="Vérifier l'attestation de cautionnement dans l'onglet Nomination, et que son montant est cohérent avec le barème de l'arrêté du 28/05/1993." />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ ONGLET NOMINATION RÉGISSEUR ═══ */}
        <TabsContent value="nomination" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader><CardTitle className="text-lg">Acte de nomination du régisseur</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1"><Label className="text-xs">Nom</Label><Input value={nomination.nom} onChange={e => updateNom('nom', e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">Prénom</Label><Input value={nomination.prenom} onChange={e => updateNom('prenom', e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">Fonction</Label><Input value={nomination.fonction} onChange={e => updateNom('fonction', e.target.value)} placeholder="Ex: Secrétaire d'intendance" /></div>
                <div className="space-y-1"><Label className="text-xs">Date de nomination</Label><Input type="date" value={nomination.dateNomination} onChange={e => updateNom('dateNomination', e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs">Référence arrêté</Label><Input value={nomination.referenceArrete} onChange={e => updateNom('referenceArrete', e.target.value)} /></div>
                <div className="space-y-1">
                  <Label className="text-xs">Suppléant désigné (Art. 10 Décret 2019-798)</Label>
                  <Input value={nomination.suppleant} onChange={e => updateNom('suppleant', e.target.value)} placeholder="Nom et prénom du suppléant" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Date de nomination du suppléant</Label>
                  <Input type="date" value={nomination.dateSuppleance} onChange={e => updateNom('dateSuppleance', e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg border border-border bg-muted/30">
                  <p className="text-xs font-bold mb-1">Suppléant</p>
                  <p className="text-sm">{nomination.suppleant || '—'}</p>
                  {nomination.dateSuppleance && <p className="text-xs text-muted-foreground mt-1">Nommé le {nomination.dateSuppleance}</p>}
                </div>

                <div className={`p-3 rounded-lg border ${nomination.formationRegie ? 'border-green-500 bg-green-50' : 'border-orange-400 bg-orange-50'}`}>
                  <p className="text-xs font-bold mb-2">Formation régie</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant={nomination.formationRegie ? 'default' : 'outline'} onClick={() => updateNom('formationRegie', true)}>✓ Suivie</Button>
                    <Button size="sm" variant={!nomination.formationRegie ? 'secondary' : 'outline'} onClick={() => updateNom('formationRegie', false)}>✗ Non suivie</Button>
                  </div>
                  {nomination.formationRegie && (
                    <div className="mt-2 space-y-1"><Label className="text-xs">Date de formation</Label><Input type="date" value={nomination.dateFormation} onChange={e => updateNom('dateFormation', e.target.value)} /></div>
                  )}
                </div>
              </div>

              {/* ═══ Cautionnement & IR (Sprint 3) ═══ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-3 rounded-lg border ${acte.montantPlafond > SEUIL_CAUTIONNEMENT && !nomination.cautionnementSouscrit ? 'border-destructive bg-destructive/10' : 'border-border bg-muted/30'}`}>
                  <p className="text-xs font-bold mb-2">Cautionnement {acte.montantPlafond > SEUIL_CAUTIONNEMENT && <span className="text-destructive">(obligatoire)</span>}</p>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button size="sm" variant={nomination.cautionnementSouscrit ? 'default' : 'outline'} onClick={() => updateNom('cautionnementSouscrit', true)}>✓ Souscrit</Button>
                      <Button size="sm" variant={!nomination.cautionnementSouscrit ? 'secondary' : 'outline'} onClick={() => updateNom('cautionnementSouscrit', false)}>✗ Non souscrit</Button>
                    </div>
                    {nomination.cautionnementSouscrit && (
                      <div className="space-y-1"><Label className="text-xs">Montant du cautionnement (€)</Label>
                        <Input type="number" value={nomination.cautionnementMontant || ''} onChange={e => updateNom('cautionnementMontant', parseFloat(e.target.value) || 0)} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-border bg-muted/30">
                  <p className="text-xs font-bold mb-2">Indemnité de responsabilité (IR)</p>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button size="sm" variant={nomination.irVersee ? 'default' : 'outline'} onClick={() => updateNom('irVersee', true)}>✓ Versée</Button>
                      <Button size="sm" variant={!nomination.irVersee ? 'secondary' : 'outline'} onClick={() => updateNom('irVersee', false)}>✗ Non versée</Button>
                    </div>
                    <div className="space-y-1"><Label className="text-xs">Montant annuel IR (€)</Label>
                      <Input type="number" value={nomination.irMontantAnnuel || ''} onChange={e => updateNom('irMontantAnnuel', parseFloat(e.target.value) || 0)} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Alertes croisées plafond ↔ cautionnement / IR */}
              {acte.montantPlafond > SEUIL_CAUTIONNEMENT && !nomination.cautionnementSouscrit && (
                <ControlAlert level="critique"
                  title="Cautionnement absent — manquement réglementaire majeur"
                  description={`Le plafond de la régie (${fmt(acte.montantPlafond)}) excède 1 220 € : le régisseur DOIT avoir souscrit un cautionnement avant prise de fonction. Sa responsabilité personnelle et pécuniaire (RPP) est engagée sans filet.`}
                  refKey="arrete-cautionnement"
                  action="Suspendre le fonctionnement de la régie ou faire produire l'attestation de cautionnement sous 8 jours." />
              )}
              {acte.montantPlafond > SEUIL_IR_REGISSEUR && !nomination.irVersee && (
                <ControlAlert level="alerte"
                  title="Indemnité de responsabilité (IR) non versée"
                  description="Au-delà de 1 220 € de plafond de régie, le régisseur a droit à une indemnité de responsabilité annuelle calculée selon le barème de l'arrêté du 28/05/1993."
                  refKey="arrete-ir-regisseur"
                  action="Vérifier la mise en paiement de l'IR par l'ordonnateur et son rattachement au bon exercice." />
              )}

              <div className="space-y-1"><Label className="text-xs">Observations</Label><Textarea value={nomination.observations} onChange={e => updateNom('observations', e.target.value)} rows={3} /></div>

              {!nomination.dateNomination && (
                <ControlAlert level="critique" title="Acte de nomination manquant"
                  description="Aucun acte de nomination du régisseur n'est renseigné — le régisseur ne peut pas légalement exercer."
                  refKey="reg-nomination" action="Récupérer l'arrêté de nomination signé conjointement par l'ordonnateur et l'agent comptable." />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Contrôles réglementaires */}
      <ModuleSection title="Contrôles réglementaires — Régies" description="Décret 2019-798 — Décret 2020-128 — M9-6 § 3.2" badge={`${(REGIES_REGLEMENTATION.controles_obligatoires).filter(c => regChecks[c.id]).length}/${(REGIES_REGLEMENTATION.controles_obligatoires).length}`}>
        <Card className="shadow-card">
          <CardContent className="p-3 space-y-2">
            {REGIES_REGLEMENTATION.controles_obligatoires.map(item => (
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
