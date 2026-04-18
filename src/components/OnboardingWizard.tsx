/**
 * OnboardingWizard — Modal guidé de première connexion (Sprint 4).
 *
 * 5 étapes :
 *  1. Bienvenue + présentation du parcours
 *  2. Saisie d'un premier établissement (UAI / Nom / Ville)
 *  3. Choix de l'exercice audité
 *  4. Périmètre (rappel : tous modules accessibles, sélection facultative)
 *  5. Lancement → redirection vers le Tableau de bord
 *
 * Affiché si le flag `cic_onboarding_done_v1` n'est pas posé dans localStorage.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, ArrowRight, ArrowLeft, Sparkles, Building2, CalendarRange, Compass, Rocket } from 'lucide-react';
import { PARCOURS_ETAPES } from '@/lib/audit-parcours';
import { useAuditParams } from '@/hooks/useAuditStore';
import { cn } from '@/lib/utils';

const FLAG_KEY = 'cic_onboarding_done_v1';

export function OnboardingWizard() {
  const navigate = useNavigate();
  const { params, update } = useAuditParams();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [uai, setUai] = useState('');
  const [nom, setNom] = useState('');
  const [ville, setVille] = useState('');
  const [exercice, setExercice] = useState(String(new Date().getFullYear()));

  useEffect(() => {
    const done = localStorage.getItem(FLAG_KEY);
    // N'afficher que si pas encore fait ET qu'aucun établissement n'est saisi
    if (!done && params.etablissements.length === 0) {
      // Délai pour laisser le layout se monter
      const t = setTimeout(() => setOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, [params.etablissements.length]);

  const finish = () => {
    localStorage.setItem(FLAG_KEY, new Date().toISOString());
    setOpen(false);
    navigate('/');
  };

  const skipForever = () => {
    localStorage.setItem(FLAG_KEY, 'skipped');
    setOpen(false);
  };

  const saveEtab = () => {
    if (!uai.trim() || !nom.trim()) return;
    const newEtab = {
      id: crypto.randomUUID(),
      uai: uai.trim().toUpperCase(),
      nom: nom.trim(),
      ville: ville.trim(),
    };
    update({
      etablissements: [...params.etablissements, newEtab],
      selectedEtablissementId: newEtab.id,
    });
  };

  const STEPS = [
    { title: 'Bienvenue', icon: Sparkles },
    { title: 'Établissement', icon: Building2 },
    { title: 'Exercice', icon: CalendarRange },
    { title: 'Parcours', icon: Compass },
    { title: 'Lancement', icon: Rocket },
  ];

  const canNext =
    step === 0 ? true :
    step === 1 ? (uai.trim().length >= 7 && nom.trim().length >= 2) :
    step === 2 ? exercice.length === 4 :
    true;

  const next = () => {
    if (step === 1) saveEtab();
    if (step < STEPS.length - 1) setStep(step + 1);
    else finish();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) skipForever(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground shadow-md">
              {(() => {
                const I = STEPS[step].icon;
                return <I className="h-5 w-5" />;
              })()}
            </div>
            <div>
              <DialogTitle className="text-xl">{STEPS[step].title}</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                Étape {step + 1} sur {STEPS.length} — Configuration initiale
              </DialogDescription>
            </div>
          </div>
          <Progress value={((step + 1) / STEPS.length) * 100} className="h-1 mt-3" />
        </DialogHeader>

        <div className="py-4 min-h-[280px]">
          {step === 0 && (
            <div className="space-y-4">
              <p className="text-sm leading-relaxed">
                Bienvenue dans <strong>CIC Expert Pro</strong>, l'outil professionnel d'audit comptable des EPLE structuré autour d'un <strong>parcours en 7 étapes</strong>.
              </p>
              <div className="grid grid-cols-7 gap-2">
                {PARCOURS_ETAPES.map(et => {
                  const I = et.icon;
                  return (
                    <div key={et.id} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50 border border-border">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        {et.numero}
                      </div>
                      <I className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-[10px] text-center font-medium leading-tight">{et.label}</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Chaque étape regroupe les modules pertinents : Préparer le dossier, Cadrer le périmètre, Contrôler sur place, Vérifier les opérations, Analyser les comptes, Restituer le PV, Suivre les recommandations.
              </p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Saisissez le premier établissement à auditer. Vous pourrez en ajouter d'autres dans <em>Paramètres &amp; Équipe</em>.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 col-span-1">
                  <Label className="text-xs">Code UAI <span className="text-destructive">*</span></Label>
                  <Input value={uai} onChange={e => setUai(e.target.value.toUpperCase())} placeholder="0123456A" maxLength={8} className="font-mono uppercase" />
                  <p className="text-[10px] text-muted-foreground">7 chiffres + 1 lettre</p>
                </div>
                <div className="space-y-1 col-span-1">
                  <Label className="text-xs">Ville</Label>
                  <Input value={ville} onChange={e => setVille(e.target.value)} placeholder="Paris" />
                </div>
                <div className="space-y-1 col-span-2">
                  <Label className="text-xs">Nom de l'établissement <span className="text-destructive">*</span></Label>
                  <Input value={nom} onChange={e => setNom(e.target.value)} placeholder="Lycée Henri-IV" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Sur quel <strong>exercice budgétaire</strong> souhaitez-vous porter votre audit ?
              </p>
              <div className="space-y-1 max-w-xs">
                <Label className="text-xs">Exercice</Label>
                <Input type="number" value={exercice} onChange={e => setExercice(e.target.value)} min="2020" max="2099" className="font-mono text-lg" />
              </div>
              <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md border border-border">
                💡 L'exercice par défaut est l'année civile en cours. Pour auditer un exercice clos (N-1), saisissez l'année correspondante. Vous pourrez modifier ce choix à tout moment dans <em>Paramètres</em>.
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm">
                <strong>Tous les modules</strong> de l'application sont accessibles en permanence depuis la barre latérale, organisés selon le parcours en 7 étapes.
              </p>
              <div className="grid grid-cols-1 gap-2">
                {PARCOURS_ETAPES.map(et => {
                  const I = et.icon;
                  return (
                    <div key={et.id} className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px] shrink-0 mt-0.5">
                        {et.numero}
                      </div>
                      <I className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                      <div className="flex-1">
                        <p className="text-xs font-bold">{et.label}</p>
                        <p className="text-[11px] text-muted-foreground leading-tight">{et.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 text-center py-6">
              <div className="mx-auto h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Tout est prêt !</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Votre espace d'audit est configuré pour <strong>{nom || 'votre établissement'}</strong> — exercice <strong>{exercice}</strong>.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 text-[11px] pt-2">
                <span className="px-2 py-1 rounded-full bg-primary/10 text-primary">⌘ K — Recherche globale</span>
                <span className="px-2 py-1 rounded-full bg-primary/10 text-primary">⌘ J — Assistant IA</span>
                <span className="px-2 py-1 rounded-full bg-primary/10 text-primary">P — Mode présentation</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={skipForever} className="text-xs text-muted-foreground">
            Passer l'introduction
          </Button>
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="outline" size="sm" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Précédent
              </Button>
            )}
            <Button size="sm" onClick={next} disabled={!canNext}
              className={cn(step === STEPS.length - 1 && 'bg-gradient-to-r from-primary to-primary/80')}>
              {step === STEPS.length - 1 ? <>Démarrer l'audit <Rocket className="h-3.5 w-3.5 ml-1" /></> : <>Suivant <ArrowRight className="h-3.5 w-3.5 ml-1" /></>}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
