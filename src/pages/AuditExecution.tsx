/**
 * Exécution d'un audit sélectif : navigation séquentielle sur les points cochés.
 * Sauvegarde auto à chaque modification, barre de progression, possibilité
 * de suspendre et reprendre.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ModulePageLayout } from '@/components/ModulePageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Save, FileSignature, CheckCircle2, AlertTriangle, AlertOctagon, MinusCircle, RefreshCw } from 'lucide-react';
import { DOMAINES_AUDIT } from '@/lib/audit-parcours';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RealtimePulse } from '@/components/RealtimePulse';

type PointStatus = 'non_audite' | 'conforme' | 'anomalie_mineure' | 'anomalie_majeure' | 'non_applicable';

interface PointRow {
  id: string;
  audit_id: string;
  domaine_id: string;
  point_index: number;
  point_libelle: string;
  status: PointStatus;
  constat: string | null;
  anomalies: string | null;
  action_corrective: string | null;
  responsable_action: string | null;
  delai_action: string | null;
  updated_at: string | null;
  updated_by: string | null;
}

const STATUS_META: Record<PointStatus, { label: string; icon: any; color: string }> = {
  non_audite: { label: 'Non audité', icon: MinusCircle, color: 'text-muted-foreground' },
  conforme: { label: 'Conforme', icon: CheckCircle2, color: 'text-emerald-600' },
  anomalie_mineure: { label: 'Anomalie mineure', icon: AlertTriangle, color: 'text-amber-600' },
  anomalie_majeure: { label: 'Anomalie majeure', icon: AlertOctagon, color: 'text-destructive' },
  non_applicable: { label: 'Non applicable', icon: MinusCircle, color: 'text-muted-foreground' },
};

export default function AuditExecution() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [audit, setAudit] = useState<any>(null);
  const [points, setPoints] = useState<PointRow[]>([]);
  const [cursor, setCursor] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [remoteUpdateAt, setRemoteUpdateAt] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [profilesMap, setProfilesMap] = useState<Record<string, string>>({});

  const reloadAuthors = async (rows?: PointRow[]) => {
    const source = rows ?? pointsRef.current ?? [];
    const authorIds = Array.from(new Set(source.map(r => r.updated_by).filter(Boolean) as string[]));
    if (!authorIds.length) return;
    const { data: profs, error } = await supabase
      .from('profiles')
      .select('user_id, display_name')
      .in('user_id', authorIds);
    if (error) {
      toast.error('Impossible de recharger les auteurs');
      return;
    }
    setProfilesMap(prev => {
      const next = { ...prev };
      profs?.forEach((pr: any) => { next[pr.user_id] = pr.display_name || 'Collègue'; });
      return next;
    });
    if (rows === undefined) toast.success('Noms des auteurs rechargés');
  };

  const fetchAll = async () => {
    if (!id) return;
    const [{ data: a }, { data: p }] = await Promise.all([
      supabase.from('audits').select('*').eq('id', id).single(),
      supabase.from('audit_points_results').select('*').eq('audit_id', id).order('domaine_id').order('point_index'),
    ]);
    setAudit(a);
    const rows = (p as PointRow[]) ?? [];
    setPoints(rows);
    await reloadAuthors(rows);
  };

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id ?? null);
      await fetchAll();
      setLoading(false);
    })();
  }, [id]);

  const authorLabel = (userId: string | null | undefined) => {
    if (!userId) return null;
    if (userId === currentUserId) return 'Vous';
    return profilesMap[userId] ?? 'Auteur inconnu';
  };

  // Refs pour exposer le contexte courant au callback realtime sans le ré-abonner
  const pointsRef = useRef<PointRow[]>([]);
  const cursorRef = useRef(0);
  useEffect(() => { pointsRef.current = points; }, [points]);
  useEffect(() => { cursorRef.current = cursor; }, [cursor]);

  // Realtime — synchronisation collaborative sur les points d'audit & l'audit lui-même
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`audit-exec-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'audit_points_results', filter: `audit_id=eq.${id}` }, async (payload) => {
        const row = payload.new as any;
        const author = row?.updated_by ?? null;
        if (!author || author === currentUserId) {
          await fetchAll();
          return;
        }

        // Identifier le point AVANT rafraîchissement pour savoir si je l'ai actuellement ouvert
        const pointId = row?.id;
        const currentlyOpenId = pointsRef.current[cursorRef.current]?.id ?? null;
        const isCurrentlyOpen = pointId && pointId === currentlyOpenId;

        await fetchAll();
        setRemoteUpdateAt(Date.now());

        const name = profilesMap[author] ?? 'Un collègue';
        const libelle = row?.point_libelle ?? 'un point d\'audit';
        const statusLabel = row?.status && STATUS_META[row.status as PointStatus]
          ? ` → ${STATUS_META[row.status as PointStatus].label}`
          : '';

        if (isCurrentlyOpen) {
          // Avertit que la fiche que je consulte vient d'être écrasée
          toast.warning(`${name} a modifié le point en cours${statusLabel}`, {
            description: `« ${libelle} » — l'affichage a été rafraîchi.`,
          });
        } else {
          // Notification claire pour un point que je n'ai pas encore ouvert
          toast.info(`${name} a mis à jour un point d'audit${statusLabel}`, {
            description: `« ${libelle} »`,
            action: pointId ? {
              label: 'Ouvrir',
              onClick: () => {
                const idx = pointsRef.current.findIndex(p => p.id === pointId);
                if (idx >= 0) setCursor(idx);
              },
            } : undefined,
          });
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'audits', filter: `id=eq.${id}` }, async () => {
        await fetchAll();
        setRemoteUpdateAt(Date.now());
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, currentUserId, profilesMap]);

  const current = points[cursor];
  const completed = points.filter(p => p.status !== 'non_audite').length;
  const progress = points.length === 0 ? 0 : Math.round((completed / points.length) * 100);

  const updateField = (field: keyof PointRow, value: any) => {
    setPoints(prev => prev.map((p, i) => i === cursor ? { ...p, [field]: value } : p));
  };

  const saveCurrent = async () => {
    if (!current) return;
    setSaving(true);
    const { error } = await supabase.from('audit_points_results').update({
      status: current.status,
      constat: current.constat,
      anomalies: current.anomalies,
      action_corrective: current.action_corrective,
      responsable_action: current.responsable_action,
      delai_action: current.delai_action,
    }).eq('id', current.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success('Sauvegardé');
  };

  const goNext = async () => {
    await saveCurrent();
    if (cursor < points.length - 1) setCursor(cursor + 1);
  };

  const goPrev = async () => {
    await saveCurrent();
    if (cursor > 0) setCursor(cursor - 1);
  };

  const cloturer = async () => {
    await saveCurrent();
    const { error } = await supabase.from('audits').update({ status: 'cloture' }).eq('id', id!);
    if (error) { toast.error(error.message); return; }
    toast.success('Audit clôturé — génération du PV');
    navigate(`/pv-audit/${id}`);
  };

  const domaine = useMemo(() => current ? DOMAINES_AUDIT.find(d => d.id === current.domaine_id) : null, [current]);

  if (loading) return <ModulePageLayout title="Audit" section="AUDIT & RESTITUTION"><p>Chargement…</p></ModulePageLayout>;
  if (!audit || !current) return <ModulePageLayout title="Audit" section="AUDIT & RESTITUTION"><p>Audit introuvable.</p></ModulePageLayout>;

  const StatusIcon = STATUS_META[current.status].icon;

  return (
    <ModulePageLayout
      title={audit.libelle}
      section="AUDIT & RESTITUTION"
      description={`Période ${audit.periode_debut} → ${audit.periode_fin} · ${points.length} points à contrôler`}
    >
      <div className="space-y-4">
        <Card>
          <CardContent className="py-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium flex items-center gap-2">
                Progression : {completed} / {points.length} points
                <RealtimePulse triggerAt={remoteUpdateAt} label="Audit modifié en direct" />
              </span>
              <span className="text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline">{domaine?.lettre} · {domaine?.label}</Badge>
                  <Badge variant="secondary" className="text-[10px] font-mono">{domaine?.reference}</Badge>
                </div>
                <CardTitle className="text-base">
                  Point {cursor + 1} / {points.length} : {current.point_libelle}
                </CardTitle>
                {current.updated_by && current.updated_at && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center flex-wrap gap-x-1 gap-y-0.5">
                    <span>Dernière modification :</span>
                    <span className="font-medium text-foreground">{authorLabel(current.updated_by)}</span>
                    <span>·</span>
                    <time dateTime={current.updated_at}>
                      {new Date(current.updated_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                    </time>
                    {authorLabel(current.updated_by) === 'Auteur inconnu' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 ml-1 text-xs"
                        onClick={() => reloadAuthors()}
                        title="Recharger les noms des auteurs depuis la base"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Recharger
                      </Button>
                    )}
                  </p>
                )}
              </div>
              <div className={`flex items-center gap-1 text-sm ${STATUS_META[current.status].color}`}>
                <StatusIcon className="h-4 w-4" />
                {STATUS_META[current.status].label}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Statut du contrôle</Label>
              <Select value={current.status} onValueChange={(v: PointStatus) => updateField('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(STATUS_META) as PointStatus[]).map(k => (
                    <SelectItem key={k} value={k}>{STATUS_META[k].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Constat</Label>
              <Textarea
                value={current.constat ?? ''}
                onChange={e => updateField('constat', e.target.value)}
                placeholder="Décrivez ce qui a été contrôlé et le résultat observé…"
                rows={3}
              />
            </div>
            {(current.status === 'anomalie_mineure' || current.status === 'anomalie_majeure') && (
              <>
                <div>
                  <Label>Anomalies relevées</Label>
                  <Textarea
                    value={current.anomalies ?? ''}
                    onChange={e => updateField('anomalies', e.target.value)}
                    placeholder="Détaillez chaque anomalie identifiée…"
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Action corrective recommandée</Label>
                  <Textarea
                    value={current.action_corrective ?? ''}
                    onChange={e => updateField('action_corrective', e.target.value)}
                    placeholder="Action proposée pour corriger l'anomalie…"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Responsable</Label>
                    <Input value={current.responsable_action ?? ''} onChange={e => updateField('responsable_action', e.target.value)} placeholder="Nom de l'agent" />
                  </div>
                  <div>
                    <Label>Délai</Label>
                    <Input type="date" value={current.delai_action ?? ''} onChange={e => updateField('delai_action', e.target.value)} />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="sticky bottom-4 bg-card border-primary/30">
          <CardContent className="py-3 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={goPrev} disabled={cursor === 0}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Précédent
              </Button>
              <Button variant="outline" size="sm" onClick={saveCurrent} disabled={saving}>
                <Save className="h-4 w-4 mr-1" /> {saving ? 'Sauvegarde…' : 'Sauvegarder'}
              </Button>
            </div>
            <div className="flex gap-2">
              {cursor < points.length - 1 ? (
                <Button size="sm" onClick={goNext}>
                  Suivant <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button size="sm" onClick={cloturer} className="bg-emerald-600 hover:bg-emerald-700">
                  <FileSignature className="h-4 w-4 mr-1" /> Clôturer & générer PV
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ModulePageLayout>
  );
}
