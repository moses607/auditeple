import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Pencil, AlertTriangle } from 'lucide-react';
import { loadState, saveState } from '@/lib/store';
import { fmt, ECHELONS_BOURSES } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/* ═══ TYPES ═══ */
interface EleveVerifie {
  id: string; nom: string; prenom: string; classe: string;
  regime: string; /* internat | demi-pension */
  montantDu: number; montantPaye: number; observations: string;
}

interface BoursierEleve {
  id: string; nom: string; classe: string; echelon: number;
  annuel: number; t1: number; t2: number; t3: number; verse: number;
  reliquat: number; statut: string;
  responsableLegal: string; responsableVerifie: boolean;
}

interface FondSocial {
  id: string; type: string; nom: string; objet: string;
  montant: number; decision: string; dateCommission: string; compte: string;
  // Champs pour le contrôle FSC
  fraisScolaires: number; montantBourse: number;
}

interface PrimeAide {
  id: string; nom: string; type: string; montant: number; dateVersement: string; observations: string;
}

export default function DroitsConstatesPage() {
  // ═══ FRAIS SCOLAIRES ═══
  const [eleves, setEleves] = useState<EleveVerifie[]>(() => loadState('droits_constates_eleves', []));
  const [obsGenerales, setObsGenerales] = useState(() => loadState('droits_constates_obs', ''));

  // ═══ BOURSES ═══
  const [boursiers, setBoursiers] = useState<BoursierEleve[]>(() => loadState('bourses', []));
  const [formBourse, setFormBourse] = useState<any>(null);

  // ═══ FONDS SOCIAUX ═══
  const [fondsSociaux, setFondsSociaux] = useState<FondSocial[]>(() => loadState('fonds_sociaux', []));
  const [formFS, setFormFS] = useState<any>(null);

  // ═══ PRIMES & AUTRES AIDES ═══
  const [primes, setPrimes] = useState<PrimeAide[]>(() => loadState('droits_primes', []));
  const [formPrime, setFormPrime] = useState<any>(null);

  const saveEleves = (d: EleveVerifie[]) => { setEleves(d); saveState('droits_constates_eleves', d); };
  const saveBoursiers = (d: BoursierEleve[]) => { setBoursiers(d); saveState('bourses', d); };
  const saveFS = (d: FondSocial[]) => { setFondsSociaux(d); saveState('fonds_sociaux', d); };
  const savePrimes = (d: PrimeAide[]) => { setPrimes(d); saveState('droits_primes', d); };

  const addEleve = () => saveEleves([...eleves, { id: crypto.randomUUID(), nom: '', prenom: '', classe: '', regime: 'demi-pension', montantDu: 0, montantPaye: 0, observations: '' }]);
  const updateEleve = (id: string, partial: Partial<EleveVerifie>) => saveEleves(eleves.map(e => e.id === id ? { ...e, ...partial } : e));

  // ═══ BOURSE SUBMIT ═══
  const submitBourse = () => {
    if (!formBourse || !formBourse.nom) return;
    const ech = parseInt(formBourse.echelon) || 6;
    const ann = ECHELONS_BOURSES[ech] || 0;
    const t1 = parseFloat(formBourse.t1) || 0, t2 = parseFloat(formBourse.t2) || 0, t3 = parseFloat(formBourse.t3) || 0;
    const verse = t1 + t2 + t3;
    const item: BoursierEleve = {
      id: formBourse.id || crypto.randomUUID(), nom: formBourse.nom, classe: formBourse.classe,
      echelon: ech, annuel: ann, t1, t2, t3, verse, reliquat: ann - verse,
      statut: verse >= ann ? 'Soldé' : verse < ann / 3 ? 'Retard versement' : 'En cours',
      responsableLegal: formBourse.responsableLegal || '',
      responsableVerifie: formBourse.responsableVerifie || false,
    };
    if (formBourse.id) saveBoursiers(boursiers.map(i => i.id === formBourse.id ? item : i));
    else saveBoursiers([...boursiers, item]);
    setFormBourse(null);
  };

  // ═══ FONDS SOCIAL SUBMIT avec contrôle FSC ═══
  const submitFS = () => {
    if (!formFS || !formFS.nom) return;
    const montant = parseFloat(formFS.montant) || 0;
    const fraisScolaires = parseFloat(formFS.fraisScolaires) || 0;
    const montantBourse = parseFloat(formFS.montantBourse) || 0;
    const item: FondSocial = {
      id: formFS.id || crypto.randomUUID(), type: formFS.type, nom: formFS.nom,
      objet: formFS.objet, montant, decision: formFS.decision,
      dateCommission: formFS.dateCommission, compte: '6576',
      fraisScolaires, montantBourse,
    };
    if (formFS.id) saveFS(fondsSociaux.map(i => i.id === formFS.id ? item : i));
    else saveFS([...fondsSociaux, item]);
    setFormFS(null);
  };

  const submitPrime = () => {
    if (!formPrime || !formPrime.nom) return;
    const item: PrimeAide = { id: formPrime.id || crypto.randomUUID(), nom: formPrime.nom, type: formPrime.type, montant: parseFloat(formPrime.montant) || 0, dateVersement: formPrime.dateVersement, observations: formPrime.observations };
    if (formPrime.id) savePrimes(primes.map(i => i.id === formPrime.id ? item : i));
    else savePrimes([...primes, item]);
    setFormPrime(null);
  };

  // Détection anomalie FSC : bourse + FSC > frais scolaires → versement interdit
  const checkFSCAnomalie = (fs: FondSocial) => {
    if (fs.type !== 'FSC' || !fs.fraisScolaires) return null;
    const totalAides = fs.montantBourse + fs.montant;
    if (totalAides > fs.fraisScolaires) {
      const excedent = totalAides - fs.fraisScolaires;
      return `⚠️ ANOMALIE (Circ. 2017-122) : L'aide FSC (${fmt(fs.montant)}) + bourse (${fmt(fs.montantBourse)}) = ${fmt(totalAides)}, ce qui dépasse les frais scolaires (${fmt(fs.fraisScolaires)}) de ${fmt(excedent)}. Cela revient à verser ${fmt(excedent)} à la famille, ce qui est interdit.`;
    }
    return null;
  };

  const totBoursesAnnuel = boursiers.reduce((s, x) => s + x.annuel, 0);
  const totBoursesVerse = boursiers.reduce((s, x) => s + x.verse, 0);
  const nbRetard = boursiers.filter(x => x.statut === 'Retard versement').length;
  const nbRespNonVerifie = boursiers.filter(x => !x.responsableVerifie).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Droits constatés</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Droits de l'établissement (frais scolaires) et droits des élèves (bourses, fonds sociaux, primes).
        </p>
      </div>

      <Tabs defaultValue="frais" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="frais">Frais scolaires</TabsTrigger>
          <TabsTrigger value="bourses">Bourses</TabsTrigger>
          <TabsTrigger value="fonds-sociaux">Fonds sociaux</TabsTrigger>
          <TabsTrigger value="primes">Primes & aides</TabsTrigger>
        </TabsList>

        {/* ═══ FRAIS SCOLAIRES ═══ */}
        <TabsContent value="frais" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Frais d'internat et de demi-pension — vérification des droits constatés</p>
            <Button onClick={addEleve}><Plus className="h-4 w-4 mr-2" /> Ajouter un élève</Button>
          </div>

          {eleves.length === 0 && <Card><CardContent className="py-12 text-center text-muted-foreground">Aucun élève saisi. Ajoutez les élèves dont vous avez vérifié les droits constatés.</CardContent></Card>}

          {eleves.map(eleve => (
            <Card key={eleve.id}>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3 flex-1">
                    <div className="space-y-1"><Label className="text-xs">Nom</Label><Input value={eleve.nom} onChange={e => updateEleve(eleve.id, { nom: e.target.value })} /></div>
                    <div className="space-y-1"><Label className="text-xs">Prénom</Label><Input value={eleve.prenom} onChange={e => updateEleve(eleve.id, { prenom: e.target.value })} /></div>
                    <div className="space-y-1"><Label className="text-xs">Classe</Label><Input value={eleve.classe} onChange={e => updateEleve(eleve.id, { classe: e.target.value })} /></div>
                    <div className="space-y-1"><Label className="text-xs">Régime</Label>
                      <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={eleve.regime} onChange={e => updateEleve(eleve.id, { regime: e.target.value })}>
                        <option value="demi-pension">Demi-pension</option><option value="internat">Internat</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1"><Label className="text-xs">Dû (€)</Label><Input type="number" value={eleve.montantDu || ''} onChange={e => updateEleve(eleve.id, { montantDu: parseFloat(e.target.value) || 0 })} /></div>
                      <div className="space-y-1"><Label className="text-xs">Payé (€)</Label><Input type="number" value={eleve.montantPaye || ''} onChange={e => updateEleve(eleve.id, { montantPaye: parseFloat(e.target.value) || 0 })} /></div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="ml-2" onClick={() => saveEleves(eleves.filter(e => e.id !== eleve.id))}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
                <Input placeholder="Observations" value={eleve.observations} onChange={e => updateEleve(eleve.id, { observations: e.target.value })} />
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardHeader><CardTitle className="text-lg">Observations générales</CardTitle></CardHeader>
            <CardContent>
              <Textarea value={obsGenerales} onChange={e => { setObsGenerales(e.target.value); saveState('droits_constates_obs', e.target.value); }} rows={4} placeholder="Observations sur les droits constatés..." />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ BOURSES ═══ */}
        <TabsContent value="bourses" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">Réf. : M9-6 § 3.2.7.6.2 — Programme 230 — Barème 2024-2025</p>
            <Button onClick={() => setFormBourse({ nom: '', classe: '', echelon: '6', t1: '', t2: '', t3: '', responsableLegal: '', responsableVerifie: false })}><Plus className="h-4 w-4 mr-2" /> Nouvel élève</Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Card><CardContent className="pt-4 text-center"><p className="text-xl font-bold">{fmt(totBoursesAnnuel)}</p><p className="text-xs text-muted-foreground">Total annuel</p></CardContent></Card>
            <Card><CardContent className="pt-4 text-center"><p className="text-xl font-bold text-green-600">{fmt(totBoursesVerse)}</p><p className="text-xs text-muted-foreground">Versé</p></CardContent></Card>
            <Card><CardContent className="pt-4 text-center"><p className="text-xl font-bold">{fmt(totBoursesAnnuel - totBoursesVerse)}</p><p className="text-xs text-muted-foreground">Reliquat</p></CardContent></Card>
            <Card><CardContent className="pt-4 text-center"><p className={`text-xl font-bold ${nbRetard > 0 ? 'text-destructive' : 'text-green-600'}`}>{nbRetard}</p><p className="text-xs text-muted-foreground">Retards</p></CardContent></Card>
            <Card><CardContent className="pt-4 text-center"><p className={`text-xl font-bold ${nbRespNonVerifie > 0 ? 'text-orange-500' : 'text-green-600'}`}>{nbRespNonVerifie}</p><p className="text-xs text-muted-foreground">RL non vérifié</p></CardContent></Card>
          </div>

          {nbRespNonVerifie > 0 && (
            <div className="p-3 border border-orange-400 bg-orange-50 rounded-lg flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
              <p className="text-sm text-orange-800"><strong>Contrôle :</strong> {nbRespNonVerifie} boursier(s) dont le responsable légal percevant la bourse n'a pas été vérifié. Il convient de s'assurer que c'est bien le bon responsable légal qui perçoit les bourses.</p>
            </div>
          )}

          {formBourse && (
            <Card className="border-primary">
              <CardContent className="pt-6 space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="space-y-1"><Label className="text-xs">Nom élève</Label><Input value={formBourse.nom} onChange={e => setFormBourse({ ...formBourse, nom: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Classe</Label><Input value={formBourse.classe} onChange={e => setFormBourse({ ...formBourse, classe: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Échelon</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formBourse.echelon} onChange={e => setFormBourse({ ...formBourse, echelon: e.target.value })}>
                      {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>Éch. {n} — {ECHELONS_BOURSES[n]} €</option>)}
                    </select>
                  </div>
                  <div className="space-y-1"><Label className="text-xs">Versé T1 (€)</Label><Input type="number" value={formBourse.t1} onChange={e => setFormBourse({ ...formBourse, t1: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Versé T2 (€)</Label><Input type="number" value={formBourse.t2} onChange={e => setFormBourse({ ...formBourse, t2: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Versé T3 (€)</Label><Input type="number" value={formBourse.t3} onChange={e => setFormBourse({ ...formBourse, t3: e.target.value })} /></div>
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1"><Label className="text-xs">Responsable légal percevant la bourse</Label><Input value={formBourse.responsableLegal} onChange={e => setFormBourse({ ...formBourse, responsableLegal: e.target.value })} placeholder="Nom du responsable légal" /></div>
                  <div className={`p-3 rounded-lg border ${formBourse.responsableVerifie ? 'border-green-500 bg-green-50' : 'border-orange-400 bg-orange-50'}`}>
                    <p className="text-xs font-bold mb-2">Le bon RL perçoit-il la bourse ?</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant={formBourse.responsableVerifie ? 'default' : 'outline'} onClick={() => setFormBourse({ ...formBourse, responsableVerifie: true })}>✓ Vérifié</Button>
                      <Button size="sm" variant={!formBourse.responsableVerifie ? 'secondary' : 'outline'} onClick={() => setFormBourse({ ...formBourse, responsableVerifie: false })}>✗ Non vérifié</Button>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2"><Button onClick={submitBourse}>Valider</Button><Button variant="outline" onClick={() => setFormBourse(null)}>Annuler</Button></div>
              </CardContent>
            </Card>
          )}

          {boursiers.length === 0 && !formBourse && <Card><CardContent className="py-12 text-center text-muted-foreground">Aucun boursier enregistré.</CardContent></Card>}
          {boursiers.length > 0 && (
            <Card><CardContent className="pt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">Élève</th><th className="p-2">Classe</th><th className="p-2">Éch.</th><th className="text-right p-2">Annuel</th><th className="text-right p-2">Versé</th><th className="text-right p-2">Reliquat</th><th className="p-2">RL</th><th className="p-2">Statut</th><th></th></tr></thead>
                <tbody>{boursiers.map(x => (
                  <tr key={x.id} className={`border-b ${x.statut === 'Retard versement' ? 'bg-destructive/5' : ''}`}>
                    <td className="p-2 font-bold">{x.nom}</td><td className="p-2">{x.classe}</td><td className="p-2 text-center">{x.echelon}</td>
                    <td className="p-2 text-right font-mono">{fmt(x.annuel)}</td><td className="p-2 text-right font-mono font-bold">{fmt(x.verse)}</td>
                    <td className={`p-2 text-right font-mono font-bold ${x.reliquat > 0 ? 'text-orange-600' : 'text-green-600'}`}>{fmt(x.reliquat)}</td>
                    <td className="p-2 text-center">{x.responsableVerifie ? '✓' : <span className="text-orange-500 font-bold">?</span>}</td>
                    <td className="p-2"><Badge variant={x.statut === 'Soldé' ? 'secondary' : x.statut === 'Retard versement' ? 'destructive' : 'default'}>{x.statut}</Badge></td>
                    <td className="p-2"><div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setFormBourse({ ...x, echelon: String(x.echelon), t1: String(x.t1), t2: String(x.t2), t3: String(x.t3) })}><Pencil className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => saveBoursiers(boursiers.filter(i => i.id !== x.id))}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                    </div></td>
                  </tr>
                ))}</tbody>
              </table>
            </CardContent></Card>
          )}
        </TabsContent>

        {/* ═══ FONDS SOCIAUX ═══ */}
        <TabsContent value="fonds-sociaux" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">Réf. : Circ. 2017-122 — Programme 230 — Comptes 6576/7411</p>
            <Button onClick={() => setFormFS({ type: 'FSC', nom: '', objet: '', montant: '', decision: 'Accordé', dateCommission: new Date().toISOString().split('T')[0], fraisScolaires: '', montantBourse: '' })}><Plus className="h-4 w-4 mr-2" /> Nouvelle aide</Button>
          </div>

          <div className="p-3 border border-primary/30 bg-primary/5 rounded-lg">
            <p className="text-sm font-medium">🔍 <strong>Contrôle spécifique FSC :</strong> Pour chaque aide du Fonds Social des Cantines, l'application vérifie que le cumul bourse + FSC ne dépasse pas les frais scolaires de l'élève, conformément à la circulaire 2017-122. Un dépassement reviendrait à verser de l'argent à la famille, ce qui est interdit.</p>
          </div>

          {formFS && (
            <Card className="border-primary">
              <CardContent className="pt-6 space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="space-y-1"><Label className="text-xs">Type</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formFS.type} onChange={e => setFormFS({ ...formFS, type: e.target.value })}>
                      <option value="FSL">Fonds Social Lycéen</option><option value="FSC">Fonds Social Cantine</option><option value="FS">Fonds Social Collégien</option>
                    </select>
                  </div>
                  <div className="space-y-1"><Label className="text-xs">Bénéficiaire</Label><Input value={formFS.nom} onChange={e => setFormFS({ ...formFS, nom: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Objet</Label><Input value={formFS.objet} onChange={e => setFormFS({ ...formFS, objet: e.target.value })} placeholder="Fournitures, Cantine..." /></div>
                  <div className="space-y-1"><Label className="text-xs">Montant aide (€)</Label><Input type="number" value={formFS.montant} onChange={e => setFormFS({ ...formFS, montant: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Décision</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formFS.decision} onChange={e => setFormFS({ ...formFS, decision: e.target.value })}>
                      <option>Accordé</option><option>Refusé</option><option>En attente</option><option>Accord partiel</option>
                    </select>
                  </div>
                  <div className="space-y-1"><Label className="text-xs">Date commission</Label><Input type="date" value={formFS.dateCommission} onChange={e => setFormFS({ ...formFS, dateCommission: e.target.value })} /></div>
                </div>

                {formFS.type === 'FSC' && (
                  <>
                    <Separator />
                    <p className="text-xs font-bold text-primary">Contrôle FSC — Circ. 2017-122</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1"><Label className="text-xs">Frais scolaires de l'élève (€)</Label><Input type="number" value={formFS.fraisScolaires} onChange={e => setFormFS({ ...formFS, fraisScolaires: e.target.value })} placeholder="Ex: 100" /></div>
                      <div className="space-y-1"><Label className="text-xs">Montant bourse nationale (€)</Label><Input type="number" value={formFS.montantBourse} onChange={e => setFormFS({ ...formFS, montantBourse: e.target.value })} placeholder="Ex: 80" /></div>
                    </div>
                    {(() => {
                      const frais = parseFloat(formFS.fraisScolaires) || 0;
                      const bourse = parseFloat(formFS.montantBourse) || 0;
                      const aide = parseFloat(formFS.montant) || 0;
                      if (frais > 0 && (bourse + aide) > frais) {
                        const excedent = bourse + aide - frais;
                        return (
                          <div className="p-3 border border-destructive bg-destructive/10 rounded-lg">
                            <p className="text-sm text-destructive font-bold">⚠️ ANOMALIE : Bourse ({fmt(bourse)}) + FSC ({fmt(aide)}) = {fmt(bourse + aide)} &gt; Frais scolaires ({fmt(frais)})</p>
                            <p className="text-xs text-destructive mt-1">Cela revient à verser {fmt(excedent)} à la famille, ce qui est interdit par la circulaire 2017-122.</p>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </>
                )}

                <div className="flex gap-2"><Button onClick={submitFS}>Valider</Button><Button variant="outline" onClick={() => setFormFS(null)}>Annuler</Button></div>
              </CardContent>
            </Card>
          )}

          {fondsSociaux.length === 0 && !formFS && <Card><CardContent className="py-12 text-center text-muted-foreground">Aucune aide enregistrée.</CardContent></Card>}
          {fondsSociaux.length > 0 && (
            <Card><CardContent className="pt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-xs text-muted-foreground"><th className="p-2">Type</th><th className="text-left p-2">Bénéficiaire</th><th className="p-2">Objet</th><th className="text-right p-2">Montant</th><th className="p-2">Décision</th><th className="p-2">Alerte</th><th></th></tr></thead>
                <tbody>{fondsSociaux.map(x => {
                  const anomalie = checkFSCAnomalie(x);
                  return (
                    <tr key={x.id} className={`border-b ${anomalie ? 'bg-destructive/5' : ''}`}>
                      <td className="p-2"><Badge>{x.type}</Badge></td><td className="p-2 font-bold">{x.nom}</td><td className="p-2">{x.objet}</td>
                      <td className="p-2 text-right font-mono font-bold">{fmt(x.montant)}</td>
                      <td className="p-2"><Badge variant={x.decision === 'Accordé' ? 'secondary' : x.decision === 'Refusé' ? 'destructive' : 'default'}>{x.decision}</Badge></td>
                      <td className="p-2">{anomalie ? <AlertTriangle className="h-4 w-4 text-destructive" /> : '✓'}</td>
                      <td className="p-2"><div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setFormFS({ ...x, montant: String(x.montant), fraisScolaires: String(x.fraisScolaires || ''), montantBourse: String(x.montantBourse || '') })}><Pencil className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => saveFS(fondsSociaux.filter(i => i.id !== x.id))}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                      </div></td>
                    </tr>
                  );
                })}</tbody>
              </table>
            </CardContent></Card>
          )}
        </TabsContent>

        {/* ═══ PRIMES & AIDES ═══ */}
        <TabsContent value="primes" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Primes, aides diverses, gratifications — droits des élèves</p>
            <Button onClick={() => setFormPrime({ nom: '', type: 'Prime d\'équipement', montant: '', dateVersement: '', observations: '' })}><Plus className="h-4 w-4 mr-2" /> Ajouter</Button>
          </div>

          {formPrime && (
            <Card className="border-primary">
              <CardContent className="pt-6 space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1"><Label className="text-xs">Bénéficiaire</Label><Input value={formPrime.nom} onChange={e => setFormPrime({ ...formPrime, nom: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Type</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formPrime.type} onChange={e => setFormPrime({ ...formPrime, type: e.target.value })}>
                      <option>Prime d'équipement</option><option>Prime d'internat</option><option>Bourse au mérite</option><option>Allocation rentrée</option><option>Autre aide</option>
                    </select>
                  </div>
                  <div className="space-y-1"><Label className="text-xs">Montant (€)</Label><Input type="number" value={formPrime.montant} onChange={e => setFormPrime({ ...formPrime, montant: e.target.value })} /></div>
                  <div className="space-y-1"><Label className="text-xs">Date versement</Label><Input type="date" value={formPrime.dateVersement} onChange={e => setFormPrime({ ...formPrime, dateVersement: e.target.value })} /></div>
                </div>
                <Input placeholder="Observations" value={formPrime.observations} onChange={e => setFormPrime({ ...formPrime, observations: e.target.value })} />
                <div className="flex gap-2"><Button onClick={submitPrime}>Valider</Button><Button variant="outline" onClick={() => setFormPrime(null)}>Annuler</Button></div>
              </CardContent>
            </Card>
          )}

          {primes.length === 0 && !formPrime && <Card><CardContent className="py-12 text-center text-muted-foreground">Aucune prime ou aide enregistrée.</CardContent></Card>}
          {primes.length > 0 && (
            <Card><CardContent className="pt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-xs text-muted-foreground"><th className="text-left p-2">Bénéficiaire</th><th className="p-2">Type</th><th className="text-right p-2">Montant</th><th className="p-2">Date</th><th className="text-left p-2">Observations</th><th></th></tr></thead>
                <tbody>{primes.map(x => (
                  <tr key={x.id} className="border-b">
                    <td className="p-2 font-bold">{x.nom}</td><td className="p-2"><Badge>{x.type}</Badge></td>
                    <td className="p-2 text-right font-mono font-bold">{fmt(x.montant)}</td>
                    <td className="p-2 text-xs">{fmtDate(x.dateVersement)}</td><td className="p-2 text-xs">{x.observations}</td>
                    <td className="p-2"><div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setFormPrime({ ...x, montant: String(x.montant) })}><Pencil className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => savePrimes(primes.filter(i => i.id !== x.id))}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                    </div></td>
                  </tr>
                ))}</tbody>
              </table>
            </CardContent></Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
