/**
 * Page « Scoring CICF » — Chantiers 2 + 3 fusionnés.
 *
 * Affiche :
 *   • Score consolidé groupement (jauge)
 *   • Radar des 8 rubriques
 *   • Heatmap établissements × rubriques
 *   • Historique 24 mois
 *   • Quick-wins + alertes
 *   • Bouton « Diffuser le rapport » (PDF maturité)
 *   • Section Archives des rapports envoyés
 */
import { useEffect, useState, useMemo } from 'react';
import { ModulePageLayout } from '@/components/ModulePageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Gauge, Send, Download, AlertTriangle, TrendingUp, Building2, FileBarChart, Archive, Sparkles,
} from 'lucide-react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { useGroupements } from '@/hooks/useGroupements';
import { useEtablissements, useAgents } from '@/hooks/useGroupements';
import { computeScoringGroupement, snapshotScoring, loadHistorique, niveauScoring, type ScoreGroupement } from '@/lib/scoring-engine';
import { RUBRIQUES_SCORING } from '@/lib/mapping-audit-risque-seed';
import { genererRapportMaturite, pdfFileName } from '@/lib/rapport-maturite-pdf';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function ScoringCICF() {
  const { activeId, groupements } = useGroupements();
  const groupement = groupements.find(g => g.id === activeId);
  const { etablissements } = useEtablissements(activeId);
  const { agents } = useAgents(activeId);
  const [score, setScore] = useState<ScoreGroupement | null>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<{ periode: string; score_global: number }[]>([]);
  const [diffuserOpen, setDiffuserOpen] = useState(false);
  const [archives, setArchives] = useState<any[]>([]);

  useEffect(() => {
    if (!activeId) { setLoading(false); return; }
    setLoading(true);
    computeScoringGroupement(activeId, groupement?.seuil_alerte_score ?? 60).then(s => {
      setScore(s);
      snapshotScoring(activeId, s).catch(() => {/* silent */});
      setLoading(false);
    });
    loadHistorique(activeId).then(setHistory);
    loadArchives();
  }, [activeId, groupement?.seuil_alerte_score]);

  const loadArchives = async () => {
    if (!activeId) return;
    const { data } = await (supabase as any).from('rapports_maturite').select('*')
      .eq('groupement_id', activeId).order('created_at', { ascending: false }).limit(20);
    setArchives(data ?? []);
  };

  const niveau = useMemo(() => score ? niveauScoring(score.score_global) : null, [score]);
  const radarData = score?.rubriques.map(r => ({ axe: r.label.split(' ')[0], score: r.score })) ?? [];
  const acAgent = agents.find(a => a.role === 'agent_comptable' && a.actif);
  const lyceeSiege = etablissements.find(e => e.id === groupement?.lycee_siege_id);
  const logoMissing = !groupement?.logo_url && !lyceeSiege;

  if (!activeId) {
    return (
      <ModulePageLayout title="Scoring CICF" section="PILOTAGE">
        <Alert><AlertDescription>Sélectionnez un groupement actif dans Paramètres.</AlertDescription></Alert>
      </ModulePageLayout>
    );
  }

  return (
    <ModulePageLayout
      title="Scoring CICF"
      section="PILOTAGE"
      description="Score consolidé du contrôle interne comptable et financier — agrégation établissements ↔ groupement."
      refs={[
        { code: 'M9-6', label: 'Instruction codificatrice EPLE' },
        { code: 'GBCP art. 170', label: 'Contrôle interne comptable' },
      ]}
      headerActions={
        <Button onClick={() => setDiffuserOpen(true)} className="bg-white/20 hover:bg-white/30 text-white border border-white/25" variant="outline">
          <Send className="h-4 w-4 mr-2" /> Diffuser le rapport
        </Button>
      }
    >
      {logoMissing && (
        <Alert className="border-primary/40 bg-primary/5">
          <Sparkles className="h-4 w-4" />
          <AlertTitle>Personnalisez vos rapports officiels</AlertTitle>
          <AlertDescription>
            Pour donner une allure officielle à vos rapports, déposez le logo du lycée siège de votre groupement dans <strong>Paramètres → Mon groupement</strong>.
          </AlertDescription>
        </Alert>
      )}

      {loading || !score ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <>
          {/* Score consolidé */}
          <Card className="overflow-hidden border-2 border-primary/10 shadow-elevated">
            <div className="bg-gradient-to-br from-primary via-primary/90 to-accent p-6 text-primary-foreground">
              <div className="flex items-center gap-6 flex-wrap">
                <div className="relative h-32 w-32 shrink-0">
                  <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="10" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round"
                      strokeDasharray={`${(score.score_global / 100) * 264} 264`} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold tabular-nums">{score.score_global}</span>
                    <span className="text-[10px] uppercase tracking-wider opacity-80">/ 100</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Score consolidé groupement</p>
                  <h2 className="text-2xl font-bold mb-1">{niveau?.label}</h2>
                  <p className="text-sm opacity-90">{groupement?.libelle} · {score.etablissements.length} établissement(s)</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] opacity-80 uppercase">Seuil d'alerte</p>
                  <p className="text-xl font-bold">{groupement?.seuil_alerte_score ?? 60}</p>
                </div>
              </div>
            </div>

            <CardContent className="pt-5 grid md:grid-cols-2 gap-6">
              <div className="h-[260px]">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Radar des 8 rubriques</p>
                <ResponsiveContainer>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="axe" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 8 }} />
                    <Radar dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.35} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="h-[260px]">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Évolution 24 mois</p>
                {history.length > 1 ? (
                  <ResponsiveContainer>
                    <LineChart data={history}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="periode" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="score_global" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                    Historique en cours de constitution (1 snapshot/mois).
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Alertes */}
          {score.alertes.length > 0 && (
            <div className="space-y-2 mt-4">
              {score.alertes.map((a, i) => (
                <Alert key={i} variant={a.type === 'seuil' ? 'destructive' : 'default'}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{a.message}</AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {/* Heatmap établissements × rubriques */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Building2 className="h-4 w-4" /> Heatmap établissements × rubriques</CardTitle>
              <CardDescription>Vert = excellent · Orange = à consolider · Rouge = critique</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr>
                    <th className="text-left p-2 sticky left-0 bg-card">Établissement</th>
                    <th className="p-2 text-center">Global</th>
                    {RUBRIQUES_SCORING.map(r => (
                      <th key={r.id} className="p-2 text-center text-[10px]">{r.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {score.etablissements.sort((a, b) => b.score_global - a.score_global).map(e => (
                    <tr key={e.etablissement_id} className="border-t">
                      <td className="p-2 font-medium sticky left-0 bg-card">{e.etablissement_label}</td>
                      <td className={`p-2 text-center font-bold tabular-nums ${niveauScoring(e.score_global).color}`}>{e.score_global}</td>
                      {e.rubriques.map(r => {
                        const n = niveauScoring(r.score);
                        return (
                          <td key={r.id} className={`p-2 text-center tabular-nums ${n.bg} ${n.color}`}>{r.score}</td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Quick-wins */}
          {score.quickWins.length > 0 && (
            <Card className="mt-4 border-emerald-500/30 bg-emerald-500/5">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-emerald-700"><TrendingUp className="h-4 w-4" /> Quick wins identifiés</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm">
                  {score.quickWins.map((q, i) => (
                    <li key={i} className="flex items-center justify-between">
                      <span>{q.libelle}</span>
                      <Badge variant="default" className="bg-emerald-600">+{q.gain_estime} pts</Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Archives */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Archive className="h-4 w-4" /> Archives des rapports</CardTitle>
            </CardHeader>
            <CardContent>
              {archives.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun rapport diffusé pour le moment.</p>
              ) : (
                <div className="space-y-2">
                  {archives.map(a => (
                    <div key={a.id} className="flex items-center justify-between p-2 border rounded-md text-sm">
                      <div>
                        <p className="font-medium">Rapport {a.etablissement_id ? 'établissement' : 'consolidé'} — Score {a.score_global}/100</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(a.created_at).toLocaleString('fr-FR')} · {(a.destinataires ?? []).length} destinataire(s) · {a.status}
                        </p>
                      </div>
                      <Badge variant={a.status === 'envoye' ? 'default' : 'secondary'}>{a.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {score && (
        <DiffuserDialog
          open={diffuserOpen}
          onClose={() => { setDiffuserOpen(false); loadArchives(); }}
          score={score}
          groupement={groupement}
          lyceeSiege={lyceeSiege}
          agentComptable={acAgent}
          etablissements={etablissements}
        />
      )}
    </ModulePageLayout>
  );
}

function DiffuserDialog({ open, onClose, score, groupement, lyceeSiege, agentComptable, etablissements }: any) {
  const [target, setTarget] = useState<'consolide' | string>('consolide');
  const [recipients, setRecipients] = useState<Record<string, boolean>>({
    ordonnateur: true, daf: false, inspection: false, crc: false, ac_copie: true,
  });
  const [message, setMessage] = useState('');
  const [autre, setAutre] = useState('');
  const [busy, setBusy] = useState(false);

  const cible = target === 'consolide' ? null : score.etablissements.find((e: any) => e.etablissement_id === target);
  const periodeDebut = new Date(); periodeDebut.setMonth(periodeDebut.getMonth() - 12);
  const periodeFin = new Date();

  const buildRapport = async (download: boolean) => {
    setBusy(true);
    try {
      const destinataires: string[] = [];
      if (recipients.ordonnateur) destinataires.push('Ordonnateur');
      if (recipients.daf && groupement?.email_rectorat_daf) destinataires.push(`Rectorat DAF (${groupement.email_rectorat_daf})`);
      if (recipients.inspection && groupement?.email_rectorat_inspection) destinataires.push(`Inspection (${groupement.email_rectorat_inspection})`);
      if (recipients.crc && groupement?.email_crc) destinataires.push(`CRC (${groupement.email_crc})`);
      if (autre.trim()) destinataires.push(autre.trim());

      const blob = await genererRapportMaturite(score, {
        groupementLabel: groupement?.libelle ?? '',
        academie: groupement?.academie ?? 'Guadeloupe',
        lyceeSiegeNom: lyceeSiege?.nom,
        logoLyceeUrl: groupement?.logo_url ?? undefined,
        signatureAcUrl: groupement?.signature_ac_url ?? undefined,
        agentComptableNom: agentComptable ? `${agentComptable.prenom} ${agentComptable.nom}` : 'Agent comptable',
        destinataires,
        periodeDebut: periodeDebut.toISOString(),
        periodeFin: periodeFin.toISOString(),
        messageAc: message,
        estConsolide: target === 'consolide',
        etablissementCible: cible ?? undefined,
      });

      // Téléchargement local
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = pdfFileName({ estConsolide: target === 'consolide', libelle: cible?.etablissement_label ?? groupement?.libelle ?? 'groupement' });
      a.click();
      URL.revokeObjectURL(url);

      // Archivage en DB
      await (supabase as any).from('rapports_maturite').insert({
        groupement_id: groupement.id,
        etablissement_id: target === 'consolide' ? null : target,
        periode_debut: periodeDebut.toISOString().slice(0, 10),
        periode_fin: periodeFin.toISOString().slice(0, 10),
        score_global: cible?.score_global ?? score.score_global,
        destinataires,
        objet: `[CICF] Rapport de maturité — ${cible?.etablissement_label ?? groupement?.libelle} — ${periodeFin.getFullYear()}`,
        message,
        status: download ? 'brouillon' : 'envoye',
        envoye_at: download ? null : new Date().toISOString(),
      });

      toast.success(download ? 'Rapport téléchargé et archivé' : 'Rapport diffusé (PDF téléchargé) et archivé');
      onClose();
    } catch (e: any) {
      toast.error('Erreur : ' + (e.message ?? e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><FileBarChart className="h-5 w-5" /> Diffuser le rapport de maturité</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Version du rapport</Label>
            <select className="w-full border rounded-md p-2 text-sm" value={target} onChange={e => setTarget(e.target.value)}>
              <option value="consolide">Consolidé groupement</option>
              {etablissements.map((e: any) => (
                <option key={e.id} value={e.id}>{e.uai} — {e.nom}</option>
              ))}
            </select>
          </div>

          <div>
            <Label>Destinataires</Label>
            <div className="space-y-1.5 mt-1">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={recipients.ordonnateur} onCheckedChange={v => setRecipients({ ...recipients, ordonnateur: !!v })} />
                Ordonnateur de l'établissement
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={recipients.daf} onCheckedChange={v => setRecipients({ ...recipients, daf: !!v })} />
                Rectorat — DAF {groupement?.email_rectorat_daf && <Badge variant="secondary" className="text-[10px]">{groupement.email_rectorat_daf}</Badge>}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={recipients.inspection} onCheckedChange={v => setRecipients({ ...recipients, inspection: !!v })} />
                Rectorat — Inspection {groupement?.email_rectorat_inspection && <Badge variant="secondary" className="text-[10px]">{groupement.email_rectorat_inspection}</Badge>}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={recipients.crc} onCheckedChange={v => setRecipients({ ...recipients, crc: !!v })} />
                Chambre régionale des comptes {groupement?.email_crc && <Badge variant="secondary" className="text-[10px]">{groupement.email_crc}</Badge>}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={recipients.ac_copie} onCheckedChange={v => setRecipients({ ...recipients, ac_copie: !!v })} />
                Copie à l'agent comptable
              </label>
            </div>
          </div>

          <div>
            <Label>Autre destinataire (email libre)</Label>
            <Input value={autre} onChange={e => setAutre(e.target.value)} placeholder="email@exemple.fr" />
          </div>

          <div>
            <Label>Mot de l'agent comptable (page synthèse)</Label>
            <Textarea rows={4} value={message} onChange={e => setMessage(e.target.value)}
              placeholder="Message éditable pré-rédigé en cas de blanc." />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button variant="outline" disabled={busy} onClick={() => buildRapport(true)}>
            <Download className="h-4 w-4 mr-2" /> Télécharger
          </Button>
          <Button disabled={busy} onClick={() => buildRapport(false)}>
            <Send className="h-4 w-4 mr-2" /> Diffuser et archiver
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
