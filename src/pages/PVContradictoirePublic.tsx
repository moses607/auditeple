/**
 * Page contradictoire publique — accessible via lien magique depuis l'email
 * envoyé à l'ordonnateur. Token validé côté serveur via l'edge function.
 * L'ordonnateur peut saisir ses observations point par point puis valider.
 */
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldCheck, FileSignature, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { DOMAINES_AUDIT } from '@/lib/audit-parcours';
import { toast } from 'sonner';

export default function PVContradictoirePublic() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('t');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [observations, setObservations] = useState<Record<string, string>>({});
  const [globale, setGlobale] = useState('');
  const [signed, setSigned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) { setError('Lien invalide — token manquant.'); setLoading(false); return; }
    (async () => {
      const { data: result, error: e } = await supabase.functions.invoke('validate-pv-token', {
        body: { token },
      });
      if (e || result?.error) {
        setError(result?.error ?? e?.message ?? 'Lien invalide ou expiré.');
      } else {
        setData(result);
        setObservations(result.pv?.observations_ordonnateur ?? {});
        setGlobale(result.pv?.observation_globale ?? '');
      }
      setLoading(false);
    })();
  }, [token]);

  const submit = async () => {
    if (!signed) { toast.error('Veuillez confirmer la signature électronique'); return; }
    setSubmitting(true);
    const { error: e } = await supabase.functions.invoke('submit-pv-observations', {
      body: { token, observations, observation_globale: globale },
    });
    if (e) { toast.error(e.message); setSubmitting(false); return; }
    setDone(true);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-6 text-center space-y-3">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
            <h1 className="text-lg font-semibold">Accès impossible</h1>
            <p className="text-sm text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-6 text-center space-y-3">
            <ShieldCheck className="h-10 w-10 text-emerald-600 mx-auto" />
            <h1 className="text-lg font-semibold">Observations enregistrées</h1>
            <p className="text-sm text-muted-foreground">
              Vos observations ont bien été transmises à l'agent comptable.
              Vous pouvez fermer cette fenêtre.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { audit, points, pv, etablissement, ac_nom, ordonnateur_email } = data;
  const grouped = (points ?? []).reduce((acc: Record<string, any[]>, p: any) => {
    (acc[p.domaine_id] ??= []).push(p);
    return acc;
  }, {});
  const alreadySubmitted = pv?.status === 'observe' || pv?.status === 'finalise';

  return (
    <div className="min-h-screen bg-muted/10 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="text-center space-y-1">
          <ShieldCheck className="h-8 w-8 text-primary mx-auto" />
          <h1 className="text-2xl font-bold">Procédure contradictoire — PV d'audit</h1>
          <p className="text-sm text-muted-foreground">
            Accès sécurisé · {etablissement} · Destinataire : {ordonnateur_email}
          </p>
        </div>

        {alreadySubmitted && (
          <Alert>
            <AlertTitle>Observations déjà transmises</AlertTitle>
            <AlertDescription>
              Vous pouvez consulter vos observations ci-dessous, mais elles ne peuvent plus être modifiées.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{audit.libelle}</CardTitle>
            <CardDescription>
              Période {audit.periode_debut} → {audit.periode_fin} · Audit clôturé le {new Date(pv.envoye_at ?? pv.created_at).toLocaleDateString('fr-FR')}
              <br />Agent comptable : {ac_nom || '—'} · Délai contradictoire : {pv.delai_jours} jours
            </CardDescription>
          </CardHeader>
        </Card>

        {Object.entries(grouped).map(([dId, list]: any) => {
          const d = DOMAINES_AUDIT.find(x => x.id === dId);
          return (
            <Card key={dId}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Badge variant="outline">{d?.lettre}</Badge>
                  {d?.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {list.map((p: any) => (
                  <div key={p.id} className="border rounded-md p-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Badge
                        variant={p.status === 'anomalie_majeure' ? 'destructive' : p.status === 'conforme' ? 'secondary' : 'outline'}
                        className="text-[10px] shrink-0"
                      >
                        {p.status}
                      </Badge>
                      <div className="flex-1 text-sm font-medium">{p.point_libelle}</div>
                    </div>
                    {p.constat && <p className="text-xs text-muted-foreground">📋 {p.constat}</p>}
                    {p.anomalies && <p className="text-xs text-amber-700">⚠ {p.anomalies}</p>}
                    {p.action_corrective && <p className="text-xs text-primary">→ {p.action_corrective}</p>}

                    <div>
                      <label className="text-xs font-medium">Mes observations</label>
                      <Textarea
                        value={observations[p.id] ?? ''}
                        onChange={e => setObservations(prev => ({ ...prev, [p.id]: e.target.value }))}
                        placeholder="Saisissez vos observations sur ce point (facultatif)…"
                        rows={2}
                        disabled={alreadySubmitted}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Observation globale</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={globale}
              onChange={e => setGlobale(e.target.value)}
              placeholder="Vos observations générales sur l'audit (facultatif)…"
              rows={4}
              disabled={alreadySubmitted}
            />
            {!alreadySubmitted && (
              <>
                <div className="flex items-start gap-2 p-3 rounded bg-muted/50">
                  <Checkbox id="sign" checked={signed} onCheckedChange={(v) => setSigned(v === true)} className="mt-0.5" />
                  <label htmlFor="sign" className="text-sm cursor-pointer">
                    Je certifie avoir pris connaissance du PV ci-dessus et je valide la transmission de mes observations.
                    Cette validation vaut signature électronique simple horodatée (art. 1367 Code civil).
                  </label>
                </div>
                <Button onClick={submit} disabled={submitting || !signed} className="w-full">
                  <FileSignature className="h-4 w-4 mr-2" />
                  {submitting ? 'Envoi…' : 'Valider mes observations'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
