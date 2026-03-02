import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { loadState, saveState } from '@/lib/store';

const SECTIONS_M96 = [
  { id: 'bilan', label: 'Bilan', items: ['Immobilisations', 'Stocks', 'Créances', 'Trésorerie', 'Dettes', 'Provisions'] },
  { id: 'resultat', label: "Compte de résultat", items: ['Charges de fonctionnement', 'Produits de fonctionnement', 'Charges exceptionnelles', 'Produits exceptionnels'] },
  { id: 'annexe', label: 'Annexe', items: ['Tableau des immobilisations', 'Tableau des amortissements', 'État des créances', 'État des dettes', 'Engagements hors bilan'] },
];

export default function AnnexeComptablePage() {
  const [data, setData] = useState<Record<string, string>>(() => loadState('annexe_comptable', {}));

  const update = (key: string, value: string) => {
    const updated = { ...data, [key]: value };
    setData(updated);
    saveState('annexe_comptable', updated);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Annexe comptable (M9-6)</h1>
        <p className="text-sm text-muted-foreground mt-1">Vérification des éléments de l'annexe comptable conformément à l'instruction M9-6.</p>
      </div>

      {SECTIONS_M96.map(section => (
        <Card key={section.id}>
          <CardHeader><CardTitle className="text-lg">{section.label}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {section.items.map(item => {
              const key = `${section.id}_${item}`;
              return (
                <div key={key} className="space-y-2">
                  <Label>{item}</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input placeholder="Montant (€)" value={data[`${key}_montant`] || ''} onChange={e => update(`${key}_montant`, e.target.value)} type="number" />
                    <Input placeholder="Observations" value={data[`${key}_obs`] || ''} onChange={e => update(`${key}_obs`, e.target.value)} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
