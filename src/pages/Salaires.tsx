/**
 * Salaires & vacations — module Audit.
 * Vérification de la paie (notamment GRETA / CFA) :
 *  - Surrémunération DOM
 *  - HSA / HSE
 *  - Vérification des vacations GRETA / CFA (saisie libre, ratios)
 *
 * Réf. : décret 86-83 (contractuels), décret 50-1253 (HSA/HSE),
 *        décret 53-1266 (surrémunération DOM), Code travail L6241-1 (CFA).
 */
import { useMemo, useState } from 'react';
import { ModulePageLayout } from '@/components/ModulePageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle2, Sun, Timer, GraduationCap } from 'lucide-react';
import { CalcSurremDOM, CalcHeuresSup } from '@/components/calculateurs/calc-paie-pilotage';
import { fmtEur } from '@/lib/calculateurs';
import { cn } from '@/lib/utils';

// ── Sous-module spécifique : vérification vacations GRETA / CFA ─────
function VacationsGretaCfa() {
  const [tauxHoraire, setTauxHoraire] = useState(0);
  const [nbHeures, setNbHeures] = useState(0);
  const [chargesPatronalesPct, setChargesPatronalesPct] = useState(45);
  const [budgetVote, setBudgetVote] = useState(0);
  const [dejaPaye, setDejaPaye] = useState(0);

  const brut = useMemo(() => tauxHoraire * nbHeures, [tauxHoraire, nbHeures]);
  const chargesPatro = (brut * chargesPatronalesPct) / 100;
  const coutTotal = brut + chargesPatro;
  const restantBudget = budgetVote - dejaPaye - coutTotal;
  const depasseBudget = restantBudget < 0 && budgetVote > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-primary" />
          Vacations GRETA / CFA — contrôle de cohérence
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div>
              <Label className="text-xs">Taux horaire vacataire (€)</Label>
              <Input type="number" step="0.01" value={tauxHoraire || ''}
                onChange={e => setTauxHoraire(+e.target.value)} className="h-8" />
            </div>
            <div>
              <Label className="text-xs">Nombre d'heures effectuées</Label>
              <Input type="number" value={nbHeures || ''}
                onChange={e => setNbHeures(+e.target.value)} className="h-8" />
            </div>
            <div>
              <Label className="text-xs">Taux de charges patronales (%)</Label>
              <Input type="number" step="0.1" value={chargesPatronalesPct}
                onChange={e => setChargesPatronalesPct(+e.target.value)} className="h-8" />
              <p className="text-[10px] text-muted-foreground mt-1">
                ≈ 42-48 % pour un vacataire CFA/GRETA (URSSAF + IRCANTEC + CNRACL le cas échéant)
              </p>
            </div>
            <div>
              <Label className="text-xs">Budget voté (compte 64) — €</Label>
              <Input type="number" value={budgetVote || ''}
                onChange={e => setBudgetVote(+e.target.value)} className="h-8" />
            </div>
            <div>
              <Label className="text-xs">Déjà payé sur l'exercice — €</Label>
              <Input type="number" value={dejaPaye || ''}
                onChange={e => setDejaPaye(+e.target.value)} className="h-8" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span>Brut vacation</span>
                <span className="tabular-nums font-mono">{fmtEur(brut)}</span>
              </div>
              <div className="flex justify-between">
                <span>+ Charges patronales ({chargesPatronalesPct} %)</span>
                <span className="tabular-nums font-mono">{fmtEur(chargesPatro)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t pt-1">
                <span>Coût total employeur</span>
                <span className="tabular-nums font-mono">{fmtEur(coutTotal)}</span>
              </div>
              {budgetVote > 0 && (
                <div className={cn('flex justify-between font-bold border-t pt-1',
                  depasseBudget ? 'text-destructive' : 'text-emerald-700')}>
                  <span>Reste budget après cette vacation</span>
                  <span className="tabular-nums font-mono">{fmtEur(restantBudget)}</span>
                </div>
              )}
            </div>

            {depasseBudget && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <strong>Dépassement budget :</strong> {fmtEur(Math.abs(restantBudget))} de plus que voté.
                  Une DBM (type 22 ou 24) doit être engagée avant paiement (GBCP art. 175).
                </AlertDescription>
              </Alert>
            )}
            {!depasseBudget && budgetVote > 0 && coutTotal > 0 && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Vacation compatible avec le budget voté.
                </AlertDescription>
              </Alert>
            )}

            <p className="text-[10px] text-muted-foreground italic mt-2">
              Réf. : décret 86-83 (contractuels), Code travail L6241-1 (CFA),
              circulaire MEN 2014-128 (GRETA).
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Page principale ────────────────────────────────────────────────
export default function Salaires() {
  return (
    <ModulePageLayout
      title="Salaires & vacations"
      section="VÉRIFICATION & ORDONNATEUR"
      description="Vérification des rémunérations payées sur budget — agents contractuels, vacataires GRETA / CFA, surrémunération DOM, heures supplémentaires"
      refs={[
        { code: 'Décret 86-83', label: 'contractuels' },
        { code: 'Décret 50-1253', label: 'HSA/HSE' },
        { code: 'Décret 53-1266', label: 'surrémunération DOM' },
        { code: 'L6241-1', label: 'CFA' },
      ]}
    >
      <div className="mb-3 flex flex-wrap gap-2">
        <Badge variant="outline" className="gap-1">
          <Sun className="h-3 w-3" /> Surrémunération DOM
        </Badge>
        <Badge variant="outline" className="gap-1">
          <Timer className="h-3 w-3" /> HSA / HSE
        </Badge>
        <Badge variant="outline" className="gap-1">
          <GraduationCap className="h-3 w-3" /> Vacations GRETA / CFA
        </Badge>
      </div>

      <Tabs defaultValue="vacations" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="vacations">Vacations GRETA/CFA</TabsTrigger>
          <TabsTrigger value="dom">Surrémunération DOM</TabsTrigger>
          <TabsTrigger value="hsa">HSA / HSE</TabsTrigger>
        </TabsList>

        <TabsContent value="vacations" className="mt-4">
          <VacationsGretaCfa />
        </TabsContent>

        <TabsContent value="dom" className="mt-4">
          <CalcSurremDOM />
        </TabsContent>

        <TabsContent value="hsa" className="mt-4">
          <CalcHeuresSup />
        </TabsContent>
      </Tabs>
    </ModulePageLayout>
  );
}
