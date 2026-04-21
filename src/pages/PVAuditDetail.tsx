/**
 * PV d'audit consolidé — vue récapitulative + circuit contradictoire.
 * Liste les points audités, leur statut, anomalies. Bouton « Envoyer à
 * l'ordonnateur » qui crée un PV + token magique + email via edge function.
 */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ModulePageLayout } from '@/components/ModulePageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Send, Printer, Clock, MailCheck, FileSignature, CheckCircle2, AlertTriangle, AlertOctagon, MinusCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useGroupements, useEtablissements, useAgents, getRoleLabel } from '@/hooks/useGroupements';
import { DOMAINES_AUDIT } from '@/lib/audit-parcours';
import { toast } from 'sonner';

const STATUS_META: Record<string, { label: string; icon: any; color: string; variant: any }> = {
  non_audite: { label: 'Non audité', icon: MinusCircle, color: 'text-muted-foreground', variant: 'outline' },
  conforme: { label: 'Conforme', icon: CheckCircle2, color: 'text-emerald-600', variant: 'secondary' },
  anomalie_mineure: { label: 'Anomalie mineure', icon: AlertTriangle, color: 'text-amber-600', variant: 'secondary' },
  anomalie_majeure: { label: 'Anomalie majeure', icon: AlertOctagon, color: 'text-destructive', variant: 'destructive' },
  non_applicable: { label: 'N/A', icon: MinusCircle, color: 'text-muted-foreground', variant: 'outline' },
};

export default function PVAuditDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeId } = useGroupements();
  const { etablissements } = useEtablissements(activeId);
  const { agents } = useAgents(activeId);

  const [audit, setAudit] = useState<any>(null);
  const [points, setPoints] = useState<any[]>([]);
  const [pv, setPv] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [emailOrdo, setEmailOrdo] = useState('');
  const [delai, setDelai] = useState(15);
  const [sending, setSending] = useState(false);

  const refresh = async () => {
    if (!id) return;
    const [{ data: a }, { data: p }, { data: existingPv }] = await Promise.all([
      supabase.from('audits').select('*').eq('id', id).single(),
      supabase.from('audit_points_results').select('*').eq('audit_id', id).order('domaine_id').order('point_index'),
      supabase.from('pv_contradictoires').select('*').eq('audit_id', id).maybeSingle(),
    ]);
    setAudit(a);
    setPoints(p ?? []);
    setPv(existingPv);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, [id]);

  useEffect(() => {
    if (audit && agents.length > 0 && !emailOrdo) {
      const ordo = agents.find(a => a.role === 'ordonnateur' && a.etablissement_id === audit.etablissement_id);
      if (ordo?.email) setEmailOrdo(ordo.email);
    }
  }, [audit, agents]);

  const etab = audit ? etablissements.find(e => e.id === audit.etablissement_id) : null;
  const ac = agents.find(a => a.role === 'agent_comptable');
  const ordo = audit ? agents.find(a => a.role === 'ordonnateur' && a.etablissement_id === audit.etablissement_id) : null;

  const groupedByDomaine = points.reduce((acc: Record<string, any[]>, p) => {
    (acc[p.domaine_id] ??= []).push(p);
    return acc;
  }, {});

  const counts = {
    conforme: points.filter(p => p.status === 'conforme').length,
    mineure: points.filter(p => p.status === 'anomalie_mineure').length,
    majeure: points.filter(p => p.status === 'anomalie_majeure').length,
    na: points.filter(p => p.status === 'non_applicable').length,
    non_audite: points.filter(p => p.status === 'non_audite').length,
  };

  const sendContradiction = async () => {
    if (!emailOrdo) { toast.error('Email de l\'ordonnateur requis'); return; }
    if (!audit || !id) return;

    setSending(true);
    try {
      // 1. Créer ou mettre à jour le PV
      let pvId = pv?.id;
      if (!pvId) {
        const { data: newPv, error } = await supabase.from('pv_contradictoires').insert({
          audit_id: id,
          groupement_id: audit.groupement_id,
          email_ordonnateur: emailOrdo,
          delai_jours: delai,
          status: 'envoye',
          envoye_at: new Date().toISOString(),
        }).select().single();
        if (error) throw error;
        pvId = newPv.id;
      } else {
        await supabase.from('pv_contradictoires').update({
          email_ordonnateur: emailOrdo,
          delai_jours: delai,
          status: 'envoye',
          envoye_at: new Date().toISOString(),
        }).eq('id', pvId);
      }

      // 2. Mettre à jour l'audit
      await supabase.from('audits').update({ status: 'envoye_contradiction' }).eq('id', id);

      // 3. Appeler l'edge function pour générer token + envoyer email
      const { error: fnError } = await supabase.functions.invoke('send-pv-contradictoire', {
        body: {
          pv_id: pvId,
          email_destinataire: emailOrdo,
          delai_jours: delai,
          audit_libelle: audit.libelle,
          etablissement_nom: etab?.nom ?? '',
          ordonnateur_nom: ordo ? `${ordo.civilite ?? ''} ${ordo.prenom} ${ordo.nom}`.trim() : '',
          ac_nom: ac ? `${ac.civilite ?? ''} ${ac.prenom} ${ac.nom}`.trim() : '',
        },
      });
      if (fnError) throw fnError;

      toast.success(`PV envoyé à ${emailOrdo} — délai ${delai} jours`);
      await refresh();
    } catch (e: any) {
      toast.error(e.message ?? 'Erreur d\'envoi');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <ModulePageLayout title="PV d'audit" section="AUDIT & RESTITUTION"><p>Chargement…</p></ModulePageLayout>;
  if (!audit) return <ModulePageLayout title="PV d'audit" section="AUDIT & RESTITUTION"><p>Audit introuvable.</p></ModulePageLayout>;

  return (
    <ModulePageLayout
      title={`PV — ${audit.libelle}`}
      section="AUDIT & RESTITUTION"
      description={`Période ${audit.periode_debut} → ${audit.periode_fin} · ${etab?.nom ?? '—'}`}
    >
      <div className="space-y-4">
        {/* Synthèse */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Synthèse</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Stat label="Conformes" value={counts.conforme} color="text-emerald-600" />
            <Stat label="Anom. mineures" value={counts.mineure} color="text-amber-600" />
            <Stat label="Anom. majeures" value={counts.majeure} color="text-destructive" />
            <Stat label="Non applicables" value={counts.na} color="text-muted-foreground" />
            <Stat label="Non audités" value={counts.non_audite} color="text-muted-foreground" />
          </CardContent>
        </Card>

        {/* Statut PV */}
        {pv && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="py-3 flex items-center gap-3 flex-wrap">
              {pv.status === 'envoye' && <Clock className="h-5 w-5 text-amber-600" />}
              {pv.status === 'observe' && <MailCheck className="h-5 w-5 text-emerald-600" />}
              {pv.status === 'finalise' && <FileSignature className="h-5 w-5 text-primary" />}
              <div className="flex-1 text-sm">
                <strong>Statut PV : </strong>
                {pv.status === 'envoye' && `En attente d'observations (envoyé le ${new Date(pv.envoye_at).toLocaleString('fr-FR')})`}
                {pv.status === 'observe' && `Observations reçues le ${new Date(pv.signature_ordonnateur_at).toLocaleString('fr-FR')}`}
                {pv.status === 'finalise' && 'PV contradictoire clos'}
                {pv.status === 'brouillon' && 'Brouillon'}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Détail par domaine */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Détail des contrôles ({points.length} points)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(groupedByDomaine).map(([dId, list]) => {
              const d = DOMAINES_AUDIT.find(x => x.id === dId);
              const arr = list as any[];
              return (
                <div key={dId}>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{d?.lettre}</Badge>
                    <h4 className="font-semibold text-sm">{d?.label}</h4>
                  </div>
                  <ul className="space-y-2 pl-2">
                    {arr.map((p) => {
                      const meta = STATUS_META[p.status];
                      const Icon = meta.icon;
                      return (
                        <li key={p.id} className="text-sm border-l-2 border-muted pl-3 py-1">
                          <div className="flex items-start gap-2">
                            <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${meta.color}`} />
                            <div className="flex-1">
                              <div className="font-medium">{p.point_libelle}</div>
                              {p.constat && <div className="text-xs text-muted-foreground mt-0.5">📋 {p.constat}</div>}
                              {p.anomalies && <div className="text-xs text-amber-700 mt-0.5">⚠ {p.anomalies}</div>}
                              {p.action_corrective && <div className="text-xs text-primary mt-0.5">→ {p.action_corrective}</div>}
                            </div>
                            <Badge variant={meta.variant} className="text-[10px] shrink-0">{meta.label}</Badge>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Circuit contradictoire */}
        {(!pv || pv.status === 'brouillon') && (
          <Card className="border-primary/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Send className="h-4 w-4" /> Envoyer à l'ordonnateur pour contradiction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <Label>Email ordonnateur</Label>
                  <Input type="email" value={emailOrdo} onChange={e => setEmailOrdo(e.target.value)} placeholder="ordonnateur@etab.fr" />
                  {ordo && <p className="text-xs text-muted-foreground mt-1">Pré-rempli depuis Paramètres : {ordo.prenom} {ordo.nom} ({getRoleLabel(ordo.role)})</p>}
                </div>
                <div>
                  <Label>Délai de réponse (jours)</Label>
                  <Input type="number" min={1} max={60} value={delai} onChange={e => setDelai(parseInt(e.target.value) || 15)} />
                </div>
              </div>
              <Button onClick={sendContradiction} disabled={sending || !emailOrdo} className="w-full">
                <Send className="h-4 w-4 mr-2" />
                {sending ? 'Envoi en cours…' : 'Envoyer à l\'ordonnateur (email + lien sécurisé)'}
              </Button>
              <p className="text-xs text-muted-foreground">
                L'ordonnateur recevra un email avec un lien magique sécurisé pour saisir ses observations.
                Une notification in-app sera également créée. Traçabilité horodatée conservée 10 ans.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" /> Imprimer
          </Button>
          <Button variant="outline" onClick={() => navigate('/pv-audit')}>← Retour à la liste</Button>
        </div>
      </div>
    </ModulePageLayout>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center p-2 rounded border bg-card">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
