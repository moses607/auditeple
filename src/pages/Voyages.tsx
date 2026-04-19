import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { VoyageScolaire, SEUILS_MARCHES } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';
import { CONTROLES_VOYAGES } from '@/lib/regulatory-data';
import { ModulePageLayout , ComplianceCheck, ModuleSection } from '@/components/ModulePageLayout';
import { ControlAlert } from '@/components/ControlAlert';
import { DoctrineEPLE } from '@/components/DoctrineEPLE';

/* ═══ Détection voyages "Erasmus-éligibles" : longue distance ou hors UE ═══ */
const DESTINATIONS_LOINTAINES = /\b(canada|usa|etats[- ]unis|japon|chine|inde|asie|amerique|australie|nouvelle[- ]zelande|bresil|argentine|mexique|afrique|maroc|tunisie|egypte|reunion|guadeloupe|martinique|guyane|nouvelle[- ]caledonie|polynesie)\b/i;
const SEUIL_VOYAGE_LOINTAIN = 1500; // € / élève — proxy financier d'un voyage > 7000 km
function isVoyageLointain(v: VoyageScolaire): boolean {
  if (DESTINATIONS_LOINTAINES.test(v.destination || '')) return true;
  // Proxy : voyage de plusieurs jours et coût/élève élevé → souvent > 7000 km
  if (v.montantTotal >= 30000 && v.dateDepart && v.dateRetour) {
    const j = (new Date(v.dateRetour).getTime() - new Date(v.dateDepart).getTime()) / 86400000;
    if (j >= 5 && v.montantTotal >= SEUIL_VOYAGE_LOINTAIN * 20) return true;
  }
  return false;
}

const PIECES_OBLIGATOIRES = [
  { key: 'listeParticipants', label: 'Liste nominative des participants (élèves et accompagnateurs)' },
  { key: 'budgetVoyage', label: 'Budget prévisionnel détaillé du voyage (recettes/dépenses)' },
  { key: 'acteCA_programmation', label: 'Acte du CA autorisant la programmation annuelle des voyages' },
  { key: 'acteCA_financement', label: 'Acte du CA approuvant le plan de financement (participation familles)' },
  { key: 'acteCA_conventions', label: 'Acte du CA autorisant la signature de conventions (hébergement, transport)' },
  { key: 'acteCA_dons', label: 'Acte du CA autorisant la perception de dons (acte-cadre annuel inclus)' },
] as const;

function calculerScoring(v: VoyageScolaire) {
  if (v.montantTotal <= 0) return null;
  const recettesSures = v.montantEncaisseFamilles + (v.notificationCollectivites ? v.montantNotifie : 0);
  const tauxCouverture = recettesSures / v.montantTotal;
  const risque = 1 - tauxCouverture;
  return {
    tauxCouverture: Math.round(tauxCouverture * 100),
    risque: Math.round(risque * 100),
    niveau: risque > 0.5 ? 'élevé' : risque > 0.25 ? 'modéré' : 'faible',
  };
}

const EMPTY_VOYAGE: Omit<VoyageScolaire, 'id'> = {
  intitule: '', destination: '', dateDepart: '', dateRetour: '',
  montantTotal: 0, montantEncaisseFamilles: 0,
  notificationCollectivites: false, montantNotifie: 0, promessesDons: 0,
  listeParticipants: false, budgetVoyage: false,
  acteCA_programmation: false, acteCA_financement: false,
  acteCA_conventions: false, acteCA_dons: false,
  erasmusSubvention: false, erasmusMontant: 0, observations: '',
};

export default function VoyagesPage() {
  const [voyages, setVoyages] = useState<VoyageScolaire[]>(() => loadState('voyages', []));
  const [regChecks, setRegChecks] = useState<Record<string, boolean>>(() => loadState('voyages_checks', {}));
  const toggleRegCheck = (id: string) => { const u = { ...regChecks, [id]: !regChecks[id] }; setRegChecks(u); saveState('voyages_checks', u); };

  const save = (v: VoyageScolaire[]) => { setVoyages(v); saveState('voyages', v); };

  const addVoyage = () => {
    save([...voyages, { ...EMPTY_VOYAGE, id: crypto.randomUUID() }]);
  };

  const updateVoyage = (id: string, partial: Partial<VoyageScolaire>) => {
    save(voyages.map(v => v.id === id ? { ...v, ...partial } : v));
  };

  const removeVoyage = (id: string) => {
    save(voyages.filter(v => v.id !== id));
  };

  return (
    <ModulePageLayout
      title="Voyages scolaires"
      section="GESTION COMPTABLE"
      description="Vérification des pièces obligatoires, analyse du risque financier et conformité avec la circulaire du 16 juillet 2024. Aucun voyage ne peut être organisé sans financement intégralement assuré."
      refs={[
        { refKey: 'circ-voyages-2024', label: 'Voyages 2024' },
        { refKey: 'ce-r421-20', label: 'Compétences CA' },
        { refKey: 'circ-voyages-2011', label: 'Actes du CA' },
        { refKey: 'erasmus-7074', label: 'Erasmus+' },
        { refKey: 'ccp-seuils-2026', label: 'Seuils CCP 2026' },
      ]}
      headerActions={
        <Button className="bg-white/20 hover:bg-white/30 text-white border-white/25" variant="outline" onClick={addVoyage}>
          <Plus className="h-4 w-4 mr-2" /> Ajouter un voyage
        </Button>
      }
      completedChecks={(CONTROLES_VOYAGES).filter(c => regChecks[c.id]).length}
      totalChecks={(CONTROLES_VOYAGES).length}
    >
      <DoctrineEPLE theme="voyages" titre="Voyages scolaires" resume="Acte CA, équilibre budget, gratuité accompagnateurs, FSC" />

      {voyages.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="py-12 text-center text-muted-foreground">
            Aucun voyage scolaire enregistré. Cliquez sur « Ajouter un voyage » pour commencer.
          </CardContent>
        </Card>
      )}

      {voyages.map(voyage => {
        const scoring = calculerScoring(voyage);
        const seuilAtteint = SEUILS_MARCHES.filter(s => voyage.montantTotal >= s.seuil).pop();

        return (
          <Card key={voyage.id}>
            <CardHeader className="flex flex-row items-start justify-between">
              <CardTitle className="text-lg">{voyage.intitule || 'Nouveau voyage'}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => removeVoyage(voyage.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Infos générales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Intitulé</Label>
                  <Input value={voyage.intitule} onChange={e => updateVoyage(voyage.id, { intitule: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Destination</Label>
                  <Input value={voyage.destination} onChange={e => updateVoyage(voyage.id, { destination: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Date de départ</Label>
                  <Input type="date" value={voyage.dateDepart} onChange={e => updateVoyage(voyage.id, { dateDepart: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Date de retour</Label>
                  <Input type="date" value={voyage.dateRetour} onChange={e => updateVoyage(voyage.id, { dateRetour: e.target.value })} />
                </div>
              </div>

              {/* Pièces obligatoires */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Pièces obligatoires</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {PIECES_OBLIGATOIRES.map(p => (
                    <div key={p.key} className="flex items-start gap-3">
                      <Checkbox
                        checked={voyage[p.key] as boolean}
                        onCheckedChange={() => updateVoyage(voyage.id, { [p.key]: !voyage[p.key] })}
                      />
                      <Label className="text-sm cursor-pointer">{p.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* ERASMUS+ */}
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={voyage.erasmusSubvention}
                  onCheckedChange={() => updateVoyage(voyage.id, { erasmusSubvention: !voyage.erasmusSubvention })}
                />
                <div className="space-y-2 flex-1">
                  <Label className="cursor-pointer">Subvention ERASMUS+ versée à un ou plusieurs enseignants</Label>
                  {voyage.erasmusSubvention && (
                    <Input type="number" placeholder="Montant ERASMUS+ (€)" value={voyage.erasmusMontant || ''} onChange={e => updateVoyage(voyage.id, { erasmusMontant: parseFloat(e.target.value) || 0 })} />
                  )}
                </div>
              </div>

              {/* ═══ Alerte voyage lointain (>7000 km / hors UE) — éligibilité Erasmus+ ═══ */}
              {isVoyageLointain(voyage) && !voyage.erasmusSubvention && (
                <ControlAlert level="alerte"
                  title="Voyage lointain détecté — éligibilité Erasmus+ à vérifier"
                  description={`Destination « ${voyage.destination} » : voyage potentiellement > 7 000 km. Au-delà, le programme Erasmus+ majore les forfaits de voyage et impose le calcul via le distance calculator officiel.`}
                  refKey="erasmus-7074"
                  action="Vérifier l'éligibilité au programme Erasmus+ et la prise en compte du forfait « voyage longue distance ». Le cas échéant, cocher la subvention Erasmus+ ci-dessus." />
              )}

              {/* Montants */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Montant total du voyage (€)</Label>
                  <Input type="number" value={voyage.montantTotal || ''} onChange={e => updateVoyage(voyage.id, { montantTotal: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="space-y-2">
                  <Label>Montant encaissé familles (€)</Label>
                  <Input type="number" value={voyage.montantEncaisseFamilles || ''} onChange={e => updateVoyage(voyage.id, { montantEncaisseFamilles: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Checkbox
                      checked={voyage.notificationCollectivites}
                      onCheckedChange={() => updateVoyage(voyage.id, { notificationCollectivites: !voyage.notificationCollectivites })}
                    />
                    Notification collectivités reçue
                  </Label>
                  {voyage.notificationCollectivites && (
                    <Input type="number" placeholder="Montant notifié (€)" value={voyage.montantNotifie || ''} onChange={e => updateVoyage(voyage.id, { montantNotifie: parseFloat(e.target.value) || 0 })} />
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Promesses de dons (€)</Label>
                  <Input type="number" value={voyage.promessesDons || ''} onChange={e => updateVoyage(voyage.id, { promessesDons: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>

              {/* Seuils marchés publics */}
              {seuilAtteint && (
                <div className="p-4 rounded-lg bg-accent/10 border border-accent">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-accent" />
                    <Badge className="bg-accent text-accent-foreground">Seuil atteint : {seuilAtteint.label}</Badge>
                  </div>
                  <p className="text-sm">{seuilAtteint.consigne}</p>
                </div>
              )}

              {/* Scoring risque */}
              {scoring && (
                <div className={`p-4 rounded-lg border ${scoring.niveau === 'élevé' ? 'bg-destructive/10 border-destructive' : scoring.niveau === 'modéré' ? 'bg-accent/10 border-accent' : 'bg-green-50 border-green-300'}`}>
                  <h4 className="text-sm font-semibold mb-2">Analyse du risque financier</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold">{scoring.tauxCouverture}%</p>
                      <p className="text-xs text-muted-foreground">Taux de couverture</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{scoring.risque}%</p>
                      <p className="text-xs text-muted-foreground">Taux de risque</p>
                    </div>
                    <div>
                      <Badge variant={scoring.niveau === 'élevé' ? 'destructive' : scoring.niveau === 'modéré' ? 'default' : 'secondary'} className="mt-2">
                        Risque {scoring.niveau}
                      </Badge>
                    </div>
                  </div>
                  {scoring.niveau === 'élevé' && !voyage.notificationCollectivites && (
                    <p className="text-xs text-destructive mt-3">
                      ⚠️ Aucune notification de collectivité reçue et encaissements familles insuffisants. Tout paiement avant réception des recettes inscrites au budget présente un risque financier majeur.
                    </p>
                  )}
                </div>
              )}

              <Textarea
                value={voyage.observations}
                onChange={e => updateVoyage(voyage.id, { observations: e.target.value })}
                placeholder="Observations sur ce voyage..."
                rows={3}
              />
            </CardContent>
          </Card>
        );
      })}

      {/* Contrôles réglementaires */}
      <ModuleSection title="Contrôles réglementaires — Voyages scolaires" description="Circulaire du 16 juillet 2024" badge={`${(CONTROLES_VOYAGES).filter(c => regChecks[c.id]).length}/${(CONTROLES_VOYAGES).length}`}>
        <Card className="shadow-card">
          <CardContent className="p-3 space-y-2">
            {CONTROLES_VOYAGES.map(item => (
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
