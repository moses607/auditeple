import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { loadState, saveState } from '@/lib/store';
import { ModulePageLayout, ModuleSection, ComplianceCheck, AnomalyAlert } from '@/components/ModulePageLayout';
import { VERIFICATION_QUOTIDIENNE } from '@/lib/regulatory-data';

const CATEGORIES = [
  { key: 'caisse_tresorerie', title: 'Caisse et trésorerie', icon: '🏦' },
  { key: 'comptabilite', title: 'Comptabilité générale', icon: '📒' },
  { key: 'regies', title: 'Régies', icon: '💰' },
  { key: 'recettes', title: 'Recettes et recouvrement', icon: '📥' },
  { key: 'depenses', title: 'Dépenses', icon: '📤' },
  { key: 'organisation', title: 'Organisation du service', icon: '🏗' },
] as const;

// Flatten all items for counting
const ALL_ITEMS = Object.values(VERIFICATION_QUOTIDIENNE).flat();

export default function VerificationPage() {
  const [checks, setChecks] = useState<Record<string, boolean>>(() => loadState('verification_checks_v2', {}));
  const [observations, setObservations] = useState<string>(() => loadState('verification_obs', ''));

  const toggleCheck = (id: string) => {
    const updated = { ...checks, [id]: !checks[id] };
    setChecks(updated);
    saveState('verification_checks_v2', updated);
  };

  const updateObs = (val: string) => {
    setObservations(val);
    saveState('verification_obs', val);
  };

  const completedCount = useMemo(() => ALL_ITEMS.filter(i => checks[i.id]).length, [checks]);
  const criticalUnchecked = useMemo(
    () => ALL_ITEMS.filter(i => i.severity === 'critique' && !checks[i.id]),
    [checks],
  );

  return (
    <ModulePageLayout
      title="Vérification quotidienne"
      section="VÉRIFICATION & ORDONNATEUR"
      description="Points de contrôle à vérifier lors de la visite sur place ou de l'audit périodique de l'agence comptable."
      refs={[
        { code: 'M9-6 § 3.2', label: 'Contrôle de la caisse' },
        { code: 'Décret 2012-1246', label: 'GBCP art. 18-20' },
        { code: 'Décret 2019-798', label: 'Régies' },
        { code: 'Ord. 2022-408', label: 'RGP' },
      ]}
      completedChecks={completedCount}
      totalChecks={ALL_ITEMS.length}
    >
      {/* ─── KPI Row ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-foreground">{completedCount}/{ALL_ITEMS.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Points vérifiés</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-destructive">{criticalUnchecked.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Critiques restants</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-foreground">{CATEGORIES.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Domaines couverts</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <p className={`text-2xl font-bold ${completedCount === ALL_ITEMS.length ? 'text-green-600' : 'text-foreground'}`}>
              {completedCount === ALL_ITEMS.length ? '✓' : Math.round(completedCount / ALL_ITEMS.length * 100) + '%'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Taux de conformité</p>
          </CardContent>
        </Card>
      </div>

      {/* ─── Anomalies alert ─── */}
      {criticalUnchecked.length > 0 && criticalUnchecked.length <= 3 && (
        <AnomalyAlert
          title={`${criticalUnchecked.length} point${criticalUnchecked.length > 1 ? 's' : ''} critique${criticalUnchecked.length > 1 ? 's' : ''} non vérifié${criticalUnchecked.length > 1 ? 's' : ''}`}
          description={criticalUnchecked.map(c => c.label).join(' • ')}
          severity="error"
        />
      )}

      {/* ─── Check sections ─── */}
      {CATEGORIES.map(cat => {
        const items = VERIFICATION_QUOTIDIENNE[cat.key as keyof typeof VERIFICATION_QUOTIDIENNE];
        const catCompleted = items.filter(i => checks[i.id]).length;

        return (
          <ModuleSection
            key={cat.key}
            title={`${cat.icon} ${cat.title}`}
            badge={`${catCompleted}/${items.length}`}
          >
            <Card className="shadow-card">
              <CardContent className="p-3 space-y-2">
                {items.map(item => (
                  <ComplianceCheck
                    key={item.id}
                    label={item.label}
                    checked={checks[item.id] || false}
                    onChange={() => toggleCheck(item.id)}
                    severity={item.severity}
                    detail={'detail' in item ? (item as any).detail : `Réf. : ${item.ref}`}
                  />
                ))}
              </CardContent>
            </Card>
          </ModuleSection>
        );
      })}

      {/* ─── Observations ─── */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base font-bold">Observations de l'auditeur</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={observations}
            onChange={e => updateObs(e.target.value)}
            placeholder="Constats, anomalies, recommandations..."
            rows={5}
            className="resize-y"
          />
        </CardContent>
      </Card>
    </ModulePageLayout>
  );
}
