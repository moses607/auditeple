import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { loadState, saveState } from '@/lib/store';
import { useAuditParams } from '@/hooks/useAuditStore';
import { getSelectedEtablissement } from '@/lib/types';

// Structure conforme au modèle espaceple.org (format paysage, exercice N-1)
const SECTIONS_ANNEXE = [
  {
    id: 'presentation',
    label: '1. Présentation générale de l\'établissement',
    fields: [
      { id: 'contexte', label: 'Contexte et environnement', type: 'textarea', placeholder: 'Type d\'établissement, effectifs, particularités...' },
      { id: 'faits_marquants', label: 'Faits marquants de l\'exercice', type: 'textarea', placeholder: 'Événements significatifs ayant impacté la gestion...' },
      { id: 'structures', label: 'Structures rattachées', type: 'textarea', placeholder: 'Établissements rattachés, services mutualisés...' },
    ]
  },
  {
    id: 'budget',
    label: '2. Exécution budgétaire',
    fields: [
      { id: 'credits_ouverts', label: 'Crédits ouverts (montant global)', type: 'number' },
      { id: 'depenses_realisees', label: 'Dépenses réalisées', type: 'number' },
      { id: 'recettes_realisees', label: 'Recettes réalisées', type: 'number' },
      { id: 'taux_execution_dep', label: 'Taux d\'exécution dépenses (%)', type: 'auto' },
      { id: 'taux_execution_rec', label: 'Taux d\'exécution recettes (%)', type: 'auto' },
      { id: 'commentaire_budget', label: 'Commentaire sur l\'exécution budgétaire', type: 'textarea', placeholder: 'Analyse des écarts entre prévision et réalisation...' },
    ]
  },
  {
    id: 'resultat',
    label: '3. Résultat de l\'exercice',
    fields: [
      { id: 'resultat_fonctionnement', label: 'Résultat de fonctionnement', type: 'number' },
      { id: 'resultat_investissement', label: 'Résultat d\'investissement', type: 'number' },
      { id: 'capacite_autofinancement', label: 'Capacité d\'autofinancement (CAF)', type: 'number' },
      { id: 'commentaire_resultat', label: 'Commentaire sur le résultat', type: 'textarea', placeholder: 'Explication des variations par rapport à N-2...' },
    ]
  },
  {
    id: 'bilan',
    label: '4. Éléments du bilan',
    fields: [
      { id: 'fdr', label: 'Fonds de roulement', type: 'number' },
      { id: 'bfr', label: 'Besoin en fonds de roulement', type: 'number' },
      { id: 'tresorerie', label: 'Trésorerie nette', type: 'number' },
      { id: 'fdr_jours', label: 'FR en jours de fonctionnement', type: 'auto' },
      { id: 'commentaire_bilan', label: 'Analyse du bilan', type: 'textarea', placeholder: 'Évolution du FR, BFR, trésorerie et explications...' },
    ]
  },
  {
    id: 'immobilisations',
    label: '5. Immobilisations et amortissements',
    fields: [
      { id: 'acquisitions', label: 'Acquisitions de l\'exercice', type: 'textarea', placeholder: 'Nature et montant des immobilisations acquises...' },
      { id: 'sorties', label: 'Sorties d\'inventaire', type: 'textarea', placeholder: 'Immobilisations déclassées ou cédées...' },
      { id: 'amortissements', label: 'Dotation aux amortissements', type: 'number' },
      { id: 'commentaire_immo', label: 'Commentaire patrimoine', type: 'textarea', placeholder: 'État du patrimoine, politique d\'investissement...' },
    ]
  },
  {
    id: 'creances_dettes',
    label: '6. Créances et dettes',
    fields: [
      { id: 'creances_total', label: 'Total créances', type: 'number' },
      { id: 'creances_irrecouvrables', label: 'Créances irrécouvrables (ANV)', type: 'number' },
      { id: 'dettes_fournisseurs', label: 'Dettes fournisseurs', type: 'number' },
      { id: 'delai_paiement', label: 'Délai moyen de paiement (jours)', type: 'number' },
      { id: 'commentaire_creances', label: 'Commentaire', type: 'textarea', placeholder: 'Analyse de l\'ancienneté des créances, contentieux...' },
    ]
  },
  {
    id: 'provisions',
    label: '7. Provisions et engagements',
    fields: [
      { id: 'provisions_risques', label: 'Provisions pour risques et charges', type: 'number' },
      { id: 'engagements_hors_bilan', label: 'Engagements hors bilan', type: 'textarea', placeholder: 'Conventions, contrats pluriannuels, emprunts...' },
      { id: 'commentaire_provisions', label: 'Commentaire', type: 'textarea', placeholder: 'Justification des provisions constituées...' },
    ]
  },
  {
    id: 'srh',
    label: '8. Service de restauration et d\'hébergement (SRH)',
    fields: [
      { id: 'effectif_dp', label: 'Effectif demi-pensionnaires', type: 'number' },
      { id: 'cout_denree', label: 'Coût denrée par repas (€)', type: 'number' },
      { id: 'resultat_srh', label: 'Résultat du SRH', type: 'number' },
      { id: 'commentaire_srh', label: 'Commentaire SRH', type: 'textarea', placeholder: 'Analyse de la fréquentation, politique tarifaire...' },
    ]
  },
  {
    id: 'perspectives',
    label: '9. Perspectives et informations complémentaires',
    fields: [
      { id: 'perspectives_n', label: 'Perspectives pour l\'exercice en cours', type: 'textarea', placeholder: 'Projets, risques identifiés, évolutions attendues...' },
      { id: 'informations_complementaires', label: 'Informations complémentaires', type: 'textarea', placeholder: 'Tout élément utile à la compréhension du compte financier...' },
    ]
  },
];

export default function AnnexeComptablePage() {
  const { params } = useAuditParams();
  const currentEtab = getSelectedEtablissement(params);
  const exerciceN1 = params.exercice ? String(parseInt(params.exercice) - 1) : String(new Date().getFullYear() - 1);
  const [data, setData] = useState<Record<string, string>>(() => loadState('annexe_comptable', {}));

  const update = (key: string, value: string) => {
    const updated = { ...data, [key]: value };
    setData(updated);
    saveState('annexe_comptable', updated);
  };

  // Auto-calculated fields
  const creditsOuverts = parseFloat(data['budget_credits_ouverts']) || 0;
  const depRealisees = parseFloat(data['budget_depenses_realisees']) || 0;
  const recRealisees = parseFloat(data['budget_recettes_realisees']) || 0;
  const txDep = creditsOuverts > 0 ? ((depRealisees / creditsOuverts) * 100).toFixed(1) : '—';
  const txRec = creditsOuverts > 0 ? ((recRealisees / creditsOuverts) * 100).toFixed(1) : '—';

  const fdr = parseFloat(data['bilan_fdr']) || 0;
  const budget = depRealisees || 1;
  const fdrJours = fdr > 0 ? Math.round((fdr / budget) * 365) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Annexe au compte financier — Exercice {exerciceN1}</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Réf. : M9-6 — Modèle espaceple.org — Document rédigé pour l'exercice N-1 afin d'accompagner le compte financier soumis au conseil d'administration.
        </p>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-4">
          <div className="text-center space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Annexe au compte financier</p>
            <p className="font-bold text-lg">{currentEtab?.nom || 'Établissement'}</p>
            {currentEtab?.uai && <p className="text-xs text-muted-foreground">UAI : {currentEtab.uai} — {currentEtab.type}</p>}
            <p className="text-sm font-bold">Exercice {exerciceN1}</p>
          </div>
        </CardContent>
      </Card>

      {SECTIONS_ANNEXE.map(section => (
        <Card key={section.id}>
          <CardHeader><CardTitle className="text-lg">{section.label}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {section.fields.map(field => {
              const key = `${section.id}_${field.id}`;
              
              if (field.type === 'auto') {
                let autoValue = '—';
                if (field.id === 'taux_execution_dep') autoValue = `${txDep} %`;
                if (field.id === 'taux_execution_rec') autoValue = `${txRec} %`;
                if (field.id === 'fdr_jours') autoValue = `${fdrJours} jours`;
                return (
                  <div key={key} className="space-y-1">
                    <Label className="text-xs">{field.label}</Label>
                    <div className="h-10 flex items-center px-3 rounded-md border bg-muted text-sm font-bold">{autoValue}</div>
                  </div>
                );
              }

              if (field.type === 'textarea') {
                return (
                  <div key={key} className="space-y-1">
                    <Label className="text-xs">{field.label}</Label>
                    <Textarea value={data[key] || ''} onChange={e => update(key, e.target.value)} rows={3} placeholder={field.placeholder} />
                  </div>
                );
              }

              return (
                <div key={key} className="space-y-1">
                  <Label className="text-xs">{field.label}</Label>
                  <Input type="number" value={data[key] || ''} onChange={e => update(key, e.target.value)} placeholder={field.placeholder || 'Montant en €'} />
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
