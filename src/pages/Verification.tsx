import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { loadState, saveState } from '@/lib/store';
import { ModulePageLayout, ModuleSection, ComplianceCheck, AnomalyAlert } from '@/components/ModulePageLayout';
import { ControlAlert } from '@/components/ControlAlert';
import { RegRefBadge } from '@/components/RegRefBadge';
import { VERIFICATION_QUOTIDIENNE } from '@/lib/regulatory-data';

/* ═══ Les 5 motifs légaux de suspension de paiement (Art. 38 GBCP) ═══ */
const MOTIFS_SUSPENSION_PAIEMENT = [
  {
    id: 'm1', titre: '1 — Qualité de l\'ordonnateur ou du délégataire',
    detail: 'L\'acte d\'ordonnancement n\'émane pas d\'une autorité régulièrement habilitée (défaut de délégation, délégation expirée, signature non conforme à l\'accréditation déposée).',
    indice: 'Vérifier l\'accréditation de l\'ordonnateur et la chaîne des délégations.',
  },
  {
    id: 'm2', titre: '2 — Disponibilité des crédits',
    detail: 'L\'imputation budgétaire est inexistante, le crédit est insuffisant, ou la dépense excède le plafond autorisé par le budget voté.',
    indice: 'Contrôler la cohérence imputation/budget et la consommation actuelle des crédits.',
  },
  {
    id: 'm3', titre: '3 — Exacte imputation comptable',
    detail: 'Le compte d\'imputation choisi ne correspond pas à la nature économique de la dépense au sens de la M9-6 (ex. fonctionnement vs investissement).',
    indice: 'Croiser libellé du marché / nature de la PJ / nomenclature M9-6.',
  },
  {
    id: 'm4', titre: '4 — Validité de la créance (service fait + PJ)',
    detail: 'Service fait non attesté, pièces justificatives manquantes ou non conformes à l\'arrêté du 25/07/2013 (devis, BC, BL, facture, certif. service fait...), liquidation arithmétiquement erronée.',
    indice: 'Vérifier la liste des PJ obligatoires selon la nature de la dépense.',
  },
  {
    id: 'm5', titre: '5 — Caractère libératoire du paiement',
    detail: 'Le RIB du créancier ne correspond pas à l\'identité légale du fournisseur, le mode de règlement ne libère pas la dette (paiement à un tiers non mandaté), opposition reçue.',
    indice: 'Vérifier RIB ↔ raison sociale ↔ SIRET sur l\'extrait Kbis ou via INSEE.',
  },
] as const;

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
        { refKey: 'gbcp-19', label: 'Contrôles AC dépenses' },
        { refKey: 'gbcp-20', label: 'Contrôles AC recettes' },
        { refKey: 'gbcp-38', label: '5 motifs suspension' },
        { refKey: 'arrete-pj-2013', label: 'Pièces justificatives' },
        { refKey: 'm96-2.4', label: 'Comptes d\'attente' },
        { refKey: 'rgp-l131-9', label: 'RGP' },
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
