import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { loadState, saveState } from '@/lib/store';

const ITEMS_ORDONNATEUR = [
  { id: 'o1', label: "Qualité de l'ordonnateur (acte de nomination)" },
  { id: 'o2', label: "Délégation de signature à jour" },
  { id: 'o3', label: "Budget voté par le CA" },
  { id: 'o4', label: "Décisions budgétaires modificatives (DBM)" },
  { id: 'o5', label: "Tenue de la comptabilité administrative (mandats, titres)" },
  { id: 'o6', label: "Respect du principe de séparation ordonnateur/comptable" },
  { id: 'o7', label: "Engagements juridiques conformes" },
  { id: 'o8', label: "Certification du service fait" },
  { id: 'o9', label: "Liquidation correcte des dépenses" },
  { id: 'o10', label: "Exactitude des calculs de liquidation" },
];

export default function OrdonnateurPage() {
  const [checks, setChecks] = useState<Record<string, boolean>>(() => loadState('ordonnateur_checks', {}));
  const [obs, setObs] = useState(() => loadState('ordonnateur_obs', ''));

  const toggle = (id: string) => {
    const updated = { ...checks, [id]: !checks[id] };
    setChecks(updated);
    saveState('ordonnateur_checks', updated);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Contrôle ordonnateur</h1>

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
    </div>
  );
}
