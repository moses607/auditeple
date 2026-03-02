import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { loadState, saveState } from '@/lib/store';

interface CheckItem {
  id: string;
  label: string;
  category: string;
}

const ITEMS: CheckItem[] = [
  // Caisse
  { id: 'v1', label: "Comptage de la caisse de l'agent comptable", category: 'Caisse et trésorerie' },
  { id: 'v2', label: "Vérification du solde du compte DFT", category: 'Caisse et trésorerie' },
  { id: 'v3', label: "Rapprochement bancaire à jour", category: 'Caisse et trésorerie' },
  { id: 'v4', label: "Vérification des chéquiers (souches, numéros)", category: 'Caisse et trésorerie' },
  { id: 'v5', label: "Contrôle des remises de chèques", category: 'Caisse et trésorerie' },
  // Comptabilité
  { id: 'v6', label: "Vérification de la balance générale", category: 'Comptabilité générale' },
  { id: 'v7', label: "Contrôle des journaux (achats, banque, OD)", category: 'Comptabilité générale' },
  { id: 'v8', label: "Suivi des comptes d'attente et d'imputation provisoire", category: 'Comptabilité générale' },
  { id: 'v9', label: "Vérification de la concordance GFC/Op@le", category: 'Comptabilité générale' },
  { id: 'v10', label: "Contrôle du compte 472 (recettes à classer)", category: 'Comptabilité générale' },
  { id: 'v11', label: "Vérification du compte 515 (compte au Trésor)", category: 'Comptabilité générale' },
  // Régies
  { id: 'v12', label: "Vérification des régies d'avances", category: 'Régies' },
  { id: 'v13', label: "Vérification des régies de recettes", category: 'Régies' },
  { id: 'v14', label: "Actes constitutifs des régies à jour", category: 'Régies' },
  { id: 'v15', label: "Cautionnement des régisseurs vérifié", category: 'Régies' },
  // Recettes
  { id: 'v16', label: "État des créances à recouvrer", category: 'Recettes' },
  { id: 'v17', label: "Suivi des titres de recettes émis", category: 'Recettes' },
  { id: 'v18', label: "Contrôle des encaissements du jour", category: 'Recettes' },
  { id: 'v19', label: "Relances effectuées (créances anciennes)", category: 'Recettes' },
  // Dépenses
  { id: 'v20', label: "Mandats en attente de paiement", category: 'Dépenses' },
  { id: 'v21', label: "Vérification des pièces justificatives du jour", category: 'Dépenses' },
  { id: 'v22', label: "Contrôle des oppositions (ATD, saisies)", category: 'Dépenses' },
  // Organisation
  { id: 'v23', label: "Organigramme fonctionnel du service", category: 'Organisation du service' },
  { id: 'v24', label: "Séparation des tâches vérifiée", category: 'Organisation du service' },
  { id: 'v25', label: "Accès aux applications sécurisés", category: 'Organisation du service' },
  { id: 'v26', label: "Coffre-fort vérifié (accès, contenu)", category: 'Organisation du service' },
];

export default function VerificationPage() {
  const [checks, setChecks] = useState<Record<string, boolean>>(() => loadState('verification_checks', {}));
  const [observations, setObservations] = useState<string>(() => loadState('verification_obs', ''));

  const toggleCheck = (id: string) => {
    const updated = { ...checks, [id]: !checks[id] };
    setChecks(updated);
    saveState('verification_checks', updated);
  };

  const updateObs = (val: string) => {
    setObservations(val);
    saveState('verification_obs', val);
  };

  const categories = [...new Set(ITEMS.map(i => i.category))];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Vérification quotidienne</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Points de contrôle à vérifier lors de la visite sur place.
        </p>
      </div>

      {categories.map(cat => (
        <Card key={cat}>
          <CardHeader>
            <CardTitle className="text-lg">{cat}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ITEMS.filter(i => i.category === cat).map(item => (
              <div key={item.id} className="flex items-start gap-3">
                <Checkbox
                  id={item.id}
                  checked={checks[item.id] || false}
                  onCheckedChange={() => toggleCheck(item.id)}
                />
                <Label htmlFor={item.id} className="text-sm leading-relaxed cursor-pointer">
                  {item.label}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader><CardTitle className="text-lg">Observations</CardTitle></CardHeader>
        <CardContent>
          <Textarea
            value={observations}
            onChange={e => updateObs(e.target.value)}
            placeholder="Observations complémentaires..."
            rows={5}
          />
        </CardContent>
      </Card>
    </div>
  );
}
