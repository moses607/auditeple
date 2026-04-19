/**
 * LivrableCopiable — encadré présentant un livrable prêt à l'emploi
 * (mail à l'ordonnateur, note interne, extrait de rapport CA).
 *
 * Boutons :
 *  - "Copier" : copie le texte dans le presse-papiers
 *  - "Ouvrir dans Assistant IA" : déclenche un événement custom que l'AssistantIA écoute
 *
 * Repliable par défaut pour ne pas surcharger les pages.
 */
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Copy, Check, Mail, FileText, FileSignature, Sparkles, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export type LivrableType = 'mail' | 'note' | 'rapport';

interface Props {
  type: LivrableType;
  titre: string;
  /** Texte complet du livrable (déjà rendu par les helpers de doctrine-eple). */
  contenu: string;
  /** Ouvre déplié si true. */
  defaultOpen?: boolean;
  /** Optionnel — prompt à envoyer à l'Assistant IA (sinon = "Améliore ce livrable : ..."). */
  promptIA?: string;
  className?: string;
}

const TYPE_CONFIG: Record<LivrableType, { icon: typeof Mail; label: string; color: string }> = {
  mail: { icon: Mail, label: 'Mail à l\'ordonnateur', color: 'text-primary' },
  note: { icon: FileText, label: 'Note interne', color: 'text-accent' },
  rapport: { icon: FileSignature, label: 'Extrait de rapport CA', color: 'text-success' },
};

export function LivrableCopiable({
  type,
  titre,
  contenu,
  defaultOpen = false,
  promptIA,
  className,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const cfg = TYPE_CONFIG[type];
  const Icon = cfg.icon;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(contenu);
      setCopied(true);
      toast({ title: 'Copié', description: 'Livrable copié dans le presse-papiers.' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de copier. Sélectionnez et copiez manuellement.',
        variant: 'destructive',
      });
    }
  };

  const handleOpenIA = () => {
    const prompt =
      promptIA ||
      `Améliore ce livrable (ton, précision juridique, formulation) en gardant la doctrine d'agent comptable EPLE :\n\n${contenu}`;
    window.dispatchEvent(new CustomEvent('assistant-ia:open', { detail: { prompt } }));
  };

  return (
    <Card className={cn('border-l-4 border-l-primary/50 print:hidden', className)}>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button className="w-full text-left p-3 hover:bg-muted/40 transition-colors flex items-center gap-3">
            <Icon className={cn('h-4 w-4 shrink-0', cfg.color)} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[9px] py-0 px-1.5 h-4 uppercase">
                  {cfg.label}
                </Badge>
                <span className="text-sm font-medium text-foreground truncate">{titre}</span>
              </div>
            </div>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-muted-foreground transition-transform shrink-0',
                open && 'rotate-180',
              )}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-3 space-y-3">
            <pre className="text-xs whitespace-pre-wrap font-sans bg-muted/40 p-3 rounded border border-border text-foreground/90 leading-relaxed max-h-[320px] overflow-y-auto">
              {contenu}
            </pre>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="outline" onClick={handleCopy} className="text-xs">
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1.5" /> Copié
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 mr-1.5" /> Copier
                  </>
                )}
              </Button>
              <Button size="sm" variant="outline" onClick={handleOpenIA} className="text-xs">
                <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary" />
                Améliorer avec l'Assistant IA
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
