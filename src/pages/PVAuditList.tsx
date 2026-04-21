/**
 * Liste des audits du groupement actif + accès rapide aux PV.
 * Remplace l'ancien PVAudit autonome.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ModulePageLayout } from '@/components/ModulePageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, ArrowRight, Clock, MailCheck, FileSignature } from 'lucide-react';
import { useGroupements, useEtablissements } from '@/hooks/useGroupements';
import { supabase } from '@/integrations/supabase/client';

const STATUS_LABEL: Record<string, { label: string; icon: any; color: string }> = {
  en_cours: { label: 'En cours', icon: Clock, color: 'text-amber-600' },
  cloture: { label: 'Clôturé', icon: FileText, color: 'text-primary' },
  envoye_contradiction: { label: 'En contradiction', icon: MailCheck, color: 'text-blue-600' },
  contradictoire_clos: { label: 'Contradictoire clos', icon: FileSignature, color: 'text-emerald-600' },
};

export default function PVAuditList() {
  const navigate = useNavigate();
  const { activeId } = useGroupements();
  const { etablissements } = useEtablissements(activeId);
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeId) return;
    (async () => {
      const { data } = await supabase
        .from('audits')
        .select('*')
        .eq('groupement_id', activeId)
        .order('created_at', { ascending: false });
      setAudits(data ?? []);
      setLoading(false);
    })();
  }, [activeId]);

  return (
    <ModulePageLayout
      title="PV d'audit consolidés"
      section="AUDIT & RESTITUTION"
      description="Liste de tous vos audits sélectifs et de leur statut de procédure contradictoire."
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">{audits.length} audit{audits.length > 1 ? 's' : ''}</p>
          <Button onClick={() => navigate('/audit-config')}>
            <Plus className="h-4 w-4 mr-2" /> Nouvel audit
          </Button>
        </div>

        {loading && <p className="text-sm text-muted-foreground">Chargement…</p>}
        {!loading && audits.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center space-y-2">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">Aucun audit pour le moment.</p>
              <Button onClick={() => navigate('/audit-config')} variant="outline">
                <Plus className="h-4 w-4 mr-2" /> Lancer mon premier audit
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-2">
          {audits.map(a => {
            const etab = etablissements.find(e => e.id === a.etablissement_id);
            const meta = STATUS_LABEL[a.status] ?? STATUS_LABEL.en_cours;
            const Icon = meta.icon;
            const continueLink = a.status === 'en_cours' ? `/audit-execution/${a.id}` : `/pv-audit/${a.id}`;
            return (
              <Card key={a.id} className="hover:shadow-sm transition-shadow cursor-pointer" onClick={() => navigate(continueLink)}>
                <CardContent className="py-3 flex items-center gap-3 flex-wrap">
                  <Icon className={`h-5 w-5 ${meta.color} shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{a.libelle}</div>
                    <div className="text-xs text-muted-foreground">
                      {etab?.nom ?? '—'} · {a.periode_debut} → {a.periode_fin}
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${meta.color}`}>{meta.label}</Badge>
                  <Button variant="ghost" size="sm">
                    {a.status === 'en_cours' ? 'Reprendre' : 'Voir PV'} <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </ModulePageLayout>
  );
}
