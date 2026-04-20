/**
 * Page AUDIT — vue synoptique des 8 domaines du cycle comptable EPLE
 * Conforme M9-6 et décret GBCP 2012-1246.
 */
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle2, ArrowRight, BookOpen } from 'lucide-react';
import { ModulePageLayout } from '@/components/ModulePageLayout';
import { DOMAINES_AUDIT } from '@/lib/audit-parcours';
import { getModules } from '@/lib/audit-modules';
import { useMemo } from 'react';

export default function AuditDomaines() {
  const navigate = useNavigate();
  const modules = useMemo(() => getModules(), []);
  const moduleById = useMemo(() => new Map(modules.map(m => [m.id, m])), [modules]);

  return (
    <ModulePageLayout
      title="AUDIT — 8 domaines du cycle comptable EPLE"
      description="Audit structuré conforme M9-6 et décret GBCP 2012-1246. Chaque domaine regroupe les contrôles obligatoires, leur périodicité et leur référence réglementaire."
    >
      <div className="space-y-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4 text-primary" />
              Mode d'emploi
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            <p>
              Les <strong>8 domaines (A→H)</strong> couvrent l'intégralité du cycle comptable d'un EPLE
              (collège, lycée, LP, CFA). Cliquez sur un domaine pour dérouler sa check-list opérationnelle,
              puis utilisez le bouton « Ouvrir le module » pour accéder aux écrans de saisie.
            </p>
            <p className="text-xs italic">
              Acronymes : <strong>EPLE</strong> = Établissement Public Local d'Enseignement ·
              <strong> CCP</strong> = Code de la Commande Publique ·
              <strong> GBCP</strong> = Gestion Budgétaire et Comptable Publique (décret 2012-1246) ·
              <strong> M9-6</strong> = instruction codificatrice EPLE 2026.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-3">
          {DOMAINES_AUDIT.map(d => {
            const mods = d.moduleIds.map(id => moduleById.get(id)).filter(Boolean);
            return (
              <Card key={d.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10 text-primary font-bold shrink-0">
                      {d.lettre}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base">{d.label}</CardTitle>
                      <CardDescription className="text-xs mt-1">{d.description}</CardDescription>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <Badge variant="outline" className="text-[10px]">{d.periodicite}</Badge>
                        <Badge variant="secondary" className="text-[10px] font-mono">{d.reference}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Accordion type="single" collapsible>
                    <AccordionItem value="check" className="border-b-0">
                      <AccordionTrigger className="text-xs font-semibold text-muted-foreground py-2 hover:no-underline">
                        Check-list opérationnelle ({d.checklist.length} points)
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-1.5 text-sm">
                          {d.checklist.map((c, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  {mods.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
                      {mods.map(m => (
                        <Button
                          key={m!.id}
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => navigate(m!.path)}
                        >
                          {m!.label}
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      ))}
                    </div>
                  )}
                  {mods.length === 0 && (
                    <p className="text-xs text-muted-foreground italic mt-2">
                      Module dédié à venir — utilisez la piste d'audit pour tracer ces contrôles.
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </ModulePageLayout>
  );
}
