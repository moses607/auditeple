import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useState, useRef, useCallback } from 'react';
import { loadState, saveState } from '@/lib/store';
import { useAuditParams } from '@/contexts/AuditParamsContext';
import { getSelectedEtablissement } from '@/lib/types';
import { FileText, Send, Printer, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

const ITEMS_ORDONNATEUR = [
  { id: 'o1', label: "Qualité de l'ordonnateur (acte de nomination)" },
  { id: 'o2', label: "Délégation de signature à jour" },
  { id: 'o3', label: "Accréditation de l'ordonnateur auprès du comptable" },
  { id: 'o4', label: "Budget voté par le CA" },
  { id: 'o5', label: "Décisions budgétaires modificatives (DBM)" },
  { id: 'o6', label: "Tenue de la comptabilité administrative (mandats, titres)" },
  { id: 'o7', label: "Respect du principe de séparation ordonnateur/comptable" },
  { id: 'o8', label: "Engagements juridiques conformes" },
  { id: 'o9', label: "Certification du service fait" },
  { id: 'o10', label: "Liquidation correcte des dépenses" },
  { id: 'o11', label: "Exactitude des calculs de liquidation" },
];

interface AccreditationData {
  academie: string;
  denomination: string;
  nomOrdonnateur: string;
  prenomOrdonnateur: string;
  rue: string;
  complement: string;
  codePostal: string;
  ville: string;
  email: string;
  telephone: string;
  datePriseEffet: string;
  outilSignature: string;
  lieuCertification: string;
  dateCertification: string;
}

interface DelegationData {
  nomDelegataire: string;
  prenomDelegataire: string;
  qualiteDelegataire: string;
  fonctionDelegataire: string;
  domaines: string;
  lieuCertification: string;
  dateCertification: string;
  dateNotification: string;
}

const DEFAULT_ACCREDITATION: AccreditationData = {
  academie: '', denomination: '', nomOrdonnateur: '', prenomOrdonnateur: '',
  rue: '', complement: '', codePostal: '', ville: '', email: '', telephone: '',
  datePriseEffet: '', outilSignature: "Validation par l'utilisation du seul profil ordonnateur dans le PGI OP@LE",
  lieuCertification: '', dateCertification: '',
};

const DEFAULT_DELEGATION: DelegationData = {
  nomDelegataire: '', prenomDelegataire: '', qualiteDelegataire: '',
  fonctionDelegataire: '', domaines: '', lieuCertification: '',
  dateCertification: '', dateNotification: '',
};

export default function OrdonnateurPage() {
  const { params } = useAuditParams();
  const etab = getSelectedEtablissement(params);

  const [checks, setChecks] = useState<Record<string, boolean>>(() => loadState('ordonnateur_checks', {}));
  const [obs, setObs] = useState(() => loadState('ordonnateur_obs', ''));

  const [accreditation, setAccreditation] = useState<AccreditationData>(() => {
    const saved = loadState<AccreditationData | null>('ordonnateur_accreditation', null);
    if (saved) return saved;
    return {
      ...DEFAULT_ACCREDITATION,
      academie: etab?.academie || '',
      denomination: etab?.nom || '',
      nomOrdonnateur: etab?.ordonnateur?.split(' ').slice(1).join(' ') || '',
      prenomOrdonnateur: etab?.ordonnateur?.split(' ')[0] || '',
      rue: etab?.adresse || '',
      codePostal: etab?.codePostal || '',
      ville: etab?.ville || '',
    };
  });

  const [delegation, setDelegation] = useState<DelegationData>(() =>
    loadState('ordonnateur_delegation', DEFAULT_DELEGATION)
  );

  const printRef = useRef<HTMLDivElement>(null);
  const delegPrintRef = useRef<HTMLDivElement>(null);

  const toggle = (id: string) => {
    const updated = { ...checks, [id]: !checks[id] };
    setChecks(updated);
    saveState('ordonnateur_checks', updated);
  };

  const updateAccreditation = useCallback((field: keyof AccreditationData, value: string) => {
    setAccreditation(prev => {
      const next = { ...prev, [field]: value };
      saveState('ordonnateur_accreditation', next);
      return next;
    });
  }, []);

  const updateDelegation = useCallback((field: keyof DelegationData, value: string) => {
    setDelegation(prev => {
      const next = { ...prev, [field]: value };
      saveState('ordonnateur_delegation', next);
      return next;
    });
  }, []);

  const handlePrint = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) { toast.error("Impossible d'ouvrir la fenêtre d'impression"); return; }
    printWindow.document.write(`
      <!DOCTYPE html><html><head><title>Document</title>
      <style>
        body { font-family: 'Marianne', Arial, sans-serif; padding: 40px; color: #1a1a1a; }
        h1 { font-size: 18px; text-align: center; margin-bottom: 8px; }
        h2 { font-size: 14px; text-align: center; margin-bottom: 24px; color: #444; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        td, th { border: 1px solid #999; padding: 8px 12px; text-align: left; font-size: 13px; }
        th { background: #f0f0f0; font-weight: 600; width: 40%; }
        .signature-block { margin-top: 40px; display: flex; justify-content: space-between; }
        .signature-box { width: 45%; }
        .signature-line { border-bottom: 1px solid #333; height: 60px; margin-top: 8px; }
        .footer { margin-top: 40px; font-size: 11px; color: #666; text-align: center; }
        .ref { font-size: 11px; color: #666; margin-bottom: 16px; text-align: center; }
        @media print { body { padding: 20px; } }
      </style></head><body>
      ${ref.current.innerHTML}
      </body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
  };

  const handleSendByEmail = () => {
    const subject = encodeURIComponent(`Accréditation ordonnateur – ${accreditation.denomination}`);
    const body = encodeURIComponent(
      `Bonjour,\n\nVeuillez trouver ci-joint le formulaire d'accréditation de l'ordonnateur pour l'établissement ${accreditation.denomination}.\n\nCe document est à compléter, signer et retourner à l'agent comptable.\n\nCordialement.`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_self');
    toast.success("Votre client de messagerie va s'ouvrir avec le message pré-rempli.");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Contrôle ordonnateur</h1>

      <Tabs defaultValue="controle" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="controle">Points de contrôle</TabsTrigger>
          <TabsTrigger value="accreditation">
            <FileText className="h-4 w-4 mr-2" />
            Accréditation
          </TabsTrigger>
          <TabsTrigger value="delegation">Délégation de signature</TabsTrigger>
        </TabsList>

        {/* ─── ONGLET 1 : POINTS DE CONTRÔLE ─── */}
        <TabsContent value="controle" className="space-y-6 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Points de contrôle</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {ITEMS_ORDONNATEUR.map(item => (
                <div key={item.id} className="flex items-start gap-3">
                  <Checkbox id={item.id} checked={checks[item.id] || false} onCheckedChange={() => toggle(item.id)} />
                  <Label htmlFor={item.id} className="text-sm cursor-pointer">{item.label}</Label>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">Observations</CardTitle></CardHeader>
            <CardContent>
              <Textarea value={obs} onChange={e => { setObs(e.target.value); saveState('ordonnateur_obs', e.target.value); }} placeholder="Observations..." rows={5} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── ONGLET 2 : FORMULAIRE D'ACCRÉDITATION ─── */}
        <TabsContent value="accreditation" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Formulaire d'accréditation de l'ordonnateur</CardTitle>
              <CardDescription>
                Arrêté du 25 juillet 2013 — Art. 7 — Notification au comptable public assignataire de la qualité d'ordonnateur
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Académie</Label>
                  <Input value={accreditation.academie} onChange={e => updateAccreditation('academie', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Dénomination de l'établissement et cachet</Label>
                  <Input value={accreditation.denomination} onChange={e => updateAccreditation('denomination', e.target.value)} />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom de l'ordonnateur</Label>
                  <Input value={accreditation.nomOrdonnateur} onChange={e => updateAccreditation('nomOrdonnateur', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Prénoms</Label>
                  <Input value={accreditation.prenomOrdonnateur} onChange={e => updateAccreditation('prenomOrdonnateur', e.target.value)} />
                </div>
              </div>

              <Separator />
              <p className="text-sm font-medium text-muted-foreground">Adresse postale</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rue</Label>
                  <Input value={accreditation.rue} onChange={e => updateAccreditation('rue', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Complément</Label>
                  <Input value={accreditation.complement} onChange={e => updateAccreditation('complement', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Code postal</Label>
                  <Input value={accreditation.codePostal} onChange={e => updateAccreditation('codePostal', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Ville</Label>
                  <Input value={accreditation.ville} onChange={e => updateAccreditation('ville', e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Adresse de messagerie électronique</Label>
                  <Input type="email" value={accreditation.email} onChange={e => updateAccreditation('email', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Numéro de téléphone</Label>
                  <Input type="tel" value={accreditation.telephone} onChange={e => updateAccreditation('telephone', e.target.value)} />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date de prise d'effet de la qualité d'ordonnateur</Label>
                  <Input type="date" value={accreditation.datePriseEffet} onChange={e => updateAccreditation('datePriseEffet', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Outil de signature électronique</Label>
                  <Input value={accreditation.outilSignature} onChange={e => updateAccreditation('outilSignature', e.target.value)} />
                </div>
              </div>

              <Separator />
              <p className="text-sm font-medium text-muted-foreground">Certification</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Lieu</Label>
                  <Input value={accreditation.lieuCertification} onChange={e => updateAccreditation('lieuCertification', e.target.value)} placeholder="Certifié exact, à..." />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" value={accreditation.dateCertification} onChange={e => updateAccreditation('dateCertification', e.target.value)} />
                </div>
              </div>

              <p className="text-xs text-muted-foreground italic mt-2">
                Signature de l'ordonnateur servant de spécimen au comptable public pour opérer ses contrôles (décret n° 2012-1246 du 7 novembre 2012).
              </p>

              <Separator />

              <div className="flex flex-wrap gap-3">
                <Button onClick={() => handlePrint(printRef)} variant="outline">
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimer / PDF
                </Button>
                <Button onClick={handleSendByEmail} variant="outline">
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer par e-mail
                </Button>
                <Button variant="ghost" onClick={() => {
                  setAccreditation(DEFAULT_ACCREDITATION);
                  saveState('ordonnateur_accreditation', DEFAULT_ACCREDITATION);
                  toast.info('Formulaire réinitialisé');
                }}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Réinitialiser
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Version imprimable cachée */}
          <div className="hidden">
            <div ref={printRef}>
              <h1>FORMULAIRE D'ACCRÉDITATION DE L'ORDONNATEUR</h1>
              <h2>Arrêté du 25 juillet 2013 — Art. 7</h2>
              <p className="ref">Notification au comptable public assignataire de la qualité d'ordonnateur</p>
              <table>
                <tbody>
                  <tr><th>Académie</th><td>{accreditation.academie}</td></tr>
                  <tr><th>Établissement (dénomination et cachet)</th><td>{accreditation.denomination}</td></tr>
                  <tr><th>Nom de l'ordonnateur</th><td>{accreditation.nomOrdonnateur}</td></tr>
                  <tr><th>Prénoms</th><td>{accreditation.prenomOrdonnateur}</td></tr>
                  <tr><th>Rue</th><td>{accreditation.rue}</td></tr>
                  <tr><th>Complément</th><td>{accreditation.complement}</td></tr>
                  <tr><th>Code postal</th><td>{accreditation.codePostal}</td></tr>
                  <tr><th>Ville</th><td>{accreditation.ville}</td></tr>
                  <tr><th>Adresse de messagerie</th><td>{accreditation.email}</td></tr>
                  <tr><th>Téléphone</th><td>{accreditation.telephone}</td></tr>
                  <tr><th>Date de prise d'effet</th><td>{accreditation.datePriseEffet}</td></tr>
                  <tr><th>Outil de signature électronique</th><td>{accreditation.outilSignature}</td></tr>
                </tbody>
              </table>
              <p>Certifié exact, à {accreditation.lieuCertification || '………………'}, le {accreditation.dateCertification || '………………'}</p>
              <p style={{ marginTop: '16px', fontSize: '12px' }}>
                Signature de l'ordonnateur servant de spécimen au comptable public pour opérer ses contrôles définis par le décret n° 2012-1246 du 7 novembre 2012 relatif à la gestion budgétaire et comptable publique.
              </p>
              <div className="signature-block">
                <div className="signature-box">
                  <p><strong>Signature de l'ordonnateur</strong></p>
                  <div className="signature-line"></div>
                </div>
              </div>
              <p className="footer">Document généré par AuditEPLE</p>
            </div>
          </div>
        </TabsContent>

        {/* ─── ONGLET 3 : DÉLÉGATION DE SIGNATURE ─── */}
        <TabsContent value="delegation" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Délégation de signature de l'ordonnateur</CardTitle>
              <CardDescription>
                Art. R.421-13 du code de l'éducation — Le chef d'établissement peut déléguer sa signature pour l'exercice des fonctions d'ordonnateur
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm font-medium text-muted-foreground">Identité du délégataire</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom</Label>
                  <Input value={delegation.nomDelegataire} onChange={e => updateDelegation('nomDelegataire', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Prénom</Label>
                  <Input value={delegation.prenomDelegataire} onChange={e => updateDelegation('prenomDelegataire', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Qualité</Label>
                  <Input value={delegation.qualiteDelegataire} onChange={e => updateDelegation('qualiteDelegataire', e.target.value)} placeholder="Ex : Chef d'établissement adjoint" />
                </div>
                <div className="space-y-2">
                  <Label>Fonction</Label>
                  <Input value={delegation.fonctionDelegataire} onChange={e => updateDelegation('fonctionDelegataire', e.target.value)} placeholder="Ex : Adjoint gestionnaire" />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Domaines délégués</Label>
                <Textarea value={delegation.domaines} onChange={e => updateDelegation('domaines', e.target.value)}
                  placeholder="Préciser les domaines pour lesquels la signature est déléguée..." rows={3} />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Lieu de certification</Label>
                  <Input value={delegation.lieuCertification} onChange={e => updateDelegation('lieuCertification', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Date de certification</Label>
                  <Input type="date" value={delegation.dateCertification} onChange={e => updateDelegation('dateCertification', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Date de notification (acte exécutoire)</Label>
                  <Input type="date" value={delegation.dateNotification} onChange={e => updateDelegation('dateNotification', e.target.value)} />
                </div>
              </div>

              <Separator />

              <div className="flex flex-wrap gap-3">
                <Button onClick={() => handlePrint(delegPrintRef)} variant="outline">
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimer / PDF
                </Button>
                <Button variant="ghost" onClick={() => {
                  setDelegation(DEFAULT_DELEGATION);
                  saveState('ordonnateur_delegation', DEFAULT_DELEGATION);
                  toast.info('Formulaire réinitialisé');
                }}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Réinitialiser
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Version imprimable cachée */}
          <div className="hidden">
            <div ref={delegPrintRef}>
              <h1>DÉLÉGATION DE SIGNATURE DE L'ORDONNATEUR</h1>
              <h2>Art. R.421-13 du code de l'éducation</h2>
              <p className="ref">Vu le code de l'éducation, notamment les articles L.421-3, R.421-13</p>
              <p style={{ margin: '16px 0' }}>Le Chef d'établissement <strong>{accreditation.nomOrdonnateur} {accreditation.prenomOrdonnateur}</strong> de l'établissement <strong>{accreditation.denomination}</strong> délègue sa signature :</p>
              <table>
                <tbody>
                  <tr><th>Nom du délégataire</th><td>{delegation.nomDelegataire}</td></tr>
                  <tr><th>Prénom</th><td>{delegation.prenomDelegataire}</td></tr>
                  <tr><th>Qualité</th><td>{delegation.qualiteDelegataire}</td></tr>
                  <tr><th>Fonction</th><td>{delegation.fonctionDelegataire}</td></tr>
                  <tr><th>Domaines délégués</th><td>{delegation.domaines}</td></tr>
                </tbody>
              </table>
              <div className="signature-block" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
                <div style={{ width: '45%' }}>
                  <p><strong>Le Chef d'établissement</strong></p>
                  <p>Nom : {accreditation.nomOrdonnateur}</p>
                  <div style={{ borderBottom: '1px solid #333', height: '60px', marginTop: '8px' }}></div>
                  <p style={{ fontSize: '12px' }}>Date : {delegation.dateCertification || '………………'}</p>
                </div>
                <div style={{ width: '45%' }}>
                  <p><strong>Signature du délégataire</strong></p>
                  <div style={{ borderBottom: '1px solid #333', height: '60px', marginTop: '8px' }}></div>
                  <p style={{ fontSize: '12px' }}>Date : {delegation.dateCertification || '………………'}</p>
                </div>
              </div>
              <p style={{ marginTop: '24px', fontSize: '12px' }}>
                Date de publication/notification certifiant l'acte exécutoire : {delegation.dateNotification || '………………'}
              </p>
              <p className="footer" style={{ marginTop: '40px', fontSize: '11px', color: '#666', textAlign: 'center' }}>Document généré par AuditEPLE</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
