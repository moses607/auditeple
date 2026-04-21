// Dialogue de diffusion du calendrier annuel aux établissements rattachés
import { useMemo, useState } from 'react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileDown, FileText, Mail, Send, Users } from 'lucide-react';
import { toast } from 'sonner';
import {
  exportCalendrierPDFPortrait, exportCalendrierPDFPaysageAffiche, buildMailtoLink,
} from '@/lib/calendrier-export-portrait';
import type { ActiviteCalendrier } from '@/lib/calendrier-types';
import type { Etablissement } from '@/lib/types';

interface Props {
  activites: ActiviteCalendrier[];
  etablissementsRattaches: Etablissement[];
  agenceComptable?: Etablissement;
  exercice: string;
  agentComptable: string;
  trigger?: React.ReactNode;
}

export function DiffuserCalendrierDialog({
  activites, etablissementsRattaches, agenceComptable, exercice, agentComptable, trigger,
}: Props) {
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(etablissementsRattaches.map(e => e.id))
  );
  const [messageAC, setMessageAC] = useState(
    `Madame, Monsieur le Secrétaire général,\n\n` +
    `Veuillez trouver ci-joint le calendrier annuel des opérations comptables ` +
    `pour l'exercice ${exercice}.\n\n` +
    `Je vous remercie de votre coopération pour le respect des échéances.`
  );

  const recipients = useMemo(() => {
    return etablissementsRattaches
      .filter(e => selectedIds.has(e.id))
      .map(e => e.email)
      .filter((e): e is string => !!e && e.trim().length > 0);
  }, [etablissementsRattaches, selectedIds]);

  const ctx = {
    activites, etablissements: etablissementsRattaches,
    agenceComptable, exercice, agentComptable, messageAC,
  };

  const dlPortrait = () => {
    if (activites.length === 0) { toast.error('Aucune activité à exporter'); return; }
    exportCalendrierPDFPortrait(ctx);
    toast.success('PDF portrait généré (1 mois par page)');
  };

  const dlPaysage = () => {
    if (activites.length === 0) { toast.error('Aucune activité à exporter'); return; }
    exportCalendrierPDFPaysageAffiche(ctx);
    toast.success('PDF paysage annuel généré (vue affiche)');
  };

  const sendEmails = () => {
    if (recipients.length === 0) {
      toast.error('Aucun destinataire avec email valide. Renseignez les emails dans Paramètres → Établissements.');
      return;
    }
    const link = buildMailtoLink({
      recipients,
      subject: `[Agence comptable] Calendrier annuel des opérations comptables — Exercice ${exercice}`,
      body:
        messageAC + '\n\n' +
        '— — —\n' +
        `Le calendrier complet est joint au format PDF (à télécharger séparément depuis l'application).\n\n` +
        `Cordialement,\n${agentComptable || "L'agent comptable"}\n${agenceComptable?.nom || ''}`,
    });
    window.location.href = link;
    toast.success(`Brouillon ouvert pour ${recipients.length} destinataire(s)`);
    // Historique
    const historyKey = `calendrier_diffusions_${exercice}`;
    try {
      const prev = JSON.parse(localStorage.getItem(historyKey) || '[]');
      prev.push({
        date: new Date().toISOString(),
        nbActivites: activites.length,
        destinataires: recipients,
        message: messageAC.slice(0, 200),
      });
      localStorage.setItem(historyKey, JSON.stringify(prev.slice(-10)));
    } catch { /* ignore */ }
  };

  const allSelected = selectedIds.size === etablissementsRattaches.length;
  const toggleAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(etablissementsRattaches.map(e => e.id)));
  };

  const erSansEmail = etablissementsRattaches.filter(e => selectedIds.has(e.id) && !e.email);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="gap-1.5">
            <Send className="h-4 w-4" /> Diffuser aux ER
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" /> Diffuser le calendrier annuel
          </DialogTitle>
          <DialogDescription>
            Choisissez les destinataires, personnalisez le message d'accompagnement,
            téléchargez le PDF puis ouvrez votre client mail.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* ─── Destinataires ─── */}
          <Card className="p-3">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Users className="h-4 w-4" /> Établissements destinataires
                <Badge variant="secondary">{selectedIds.size} / {etablissementsRattaches.length}</Badge>
              </Label>
              <Button size="sm" variant="outline" onClick={toggleAll}>
                {allSelected ? 'Tout décocher' : 'Tout cocher'}
              </Button>
            </div>
            {etablissementsRattaches.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                Aucun établissement rattaché. Ajoutez-en dans Paramètres → Mes établissements.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {etablissementsRattaches.map(e => (
                  <div key={e.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-muted/30">
                    <Checkbox
                      id={`diff-${e.id}`}
                      checked={selectedIds.has(e.id)}
                      onCheckedChange={(c) => {
                        const next = new Set(selectedIds);
                        if (c) next.add(e.id); else next.delete(e.id);
                        setSelectedIds(next);
                      }}
                    />
                    <Label htmlFor={`diff-${e.id}`} className="text-xs cursor-pointer flex-1 min-w-0">
                      <div className="truncate">{e.nom}</div>
                      <div className={`text-[10px] truncate ${e.email ? 'text-muted-foreground' : 'text-destructive'}`}>
                        {e.email || '⚠ pas d\'email renseigné'}
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            )}
            {erSansEmail.length > 0 && (
              <p className="text-xs text-amber-700 mt-2">
                ⚠ {erSansEmail.length} ER sélectionné(s) sans email — ils ne recevront pas le brouillon.
                Renseignez les emails dans Paramètres.
              </p>
            )}
          </Card>

          {/* ─── Message d'accompagnement ─── */}
          <div>
            <Label className="text-sm font-semibold">Message d'accompagnement (corps du mail)</Label>
            <Textarea
              value={messageAC}
              onChange={e => setMessageAC(e.target.value)}
              rows={6}
              className="text-sm mt-1"
            />
          </div>

          {/* ─── Téléchargement PDF ─── */}
          <Card className="p-3 bg-primary/5 border-primary/30">
            <p className="text-xs font-semibold mb-2">📎 Téléchargez d'abord les PDF à joindre :</p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={dlPortrait} size="sm" variant="secondary" className="gap-1.5">
                <FileDown className="h-4 w-4" /> PDF portrait — 1 mois/page
              </Button>
              <Button onClick={dlPaysage} size="sm" variant="secondary" className="gap-1.5">
                <FileText className="h-4 w-4" /> PDF paysage — vue affiche
              </Button>
            </div>
          </Card>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Fermer</Button>
          <Button
            onClick={sendEmails}
            disabled={recipients.length === 0}
            className="gap-1.5"
          >
            <Mail className="h-4 w-4" />
            Ouvrir le brouillon ({recipients.length} destinataire{recipients.length > 1 ? 's' : ''})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
