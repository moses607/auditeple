/**
 * Page de configuration d'un nouvel audit sélectif.
 * - Choix établissement, période, type
 * - Arbre 8 domaines avec cases à cocher
 * - Presets rapides (minimal M9-6, complet, prise de fonction)
 * - Compteur dynamique + estimation temps
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ModulePageLayout } from '@/components/ModulePageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Rocket, Clock, ListChecks } from 'lucide-react';
import { DOMAINES_AUDIT } from '@/lib/audit-parcours';
import { AUDIT_PRESETS, AuditScope, countPoints, totalPoints } from '@/lib/audit-presets';
import { useGroupements, useEtablissements, useAgents } from '@/hooks/useGroupements';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const MIN_PER_POINT = 5;

export default function AuditConfig() {
  const navigate = useNavigate();
  const { groupements, activeId } = useGroupements();
  const groupementActif = groupements.find(g => g.id === activeId) ?? null;
  const { etablissements } = useEtablissements(activeId);
  const { agents } = useAgents(activeId);
  const [scope, setScope] = useState<AuditScope>(() => AUDIT_PRESETS[0].build());
  const [libelle, setLibelle] = useState('Audit ' + new Date().toLocaleDateString('fr-FR'));
  const [etabId, setEtabId] = useState<string>('');
  const [typeAudit, setTypeAudit] = useState<'periodique' | 'thematique' | 'inopine' | 'prise_fonction'>('periodique');
  const [periodeDebut, setPeriodeDebut] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 10);
  });
  const [periodeFin, setPeriodeFin] = useState(() => new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!etabId && etablissements.length > 0) setEtabId(etablissements[0].id);
  }, [etablissements, etabId]);

  const total = totalPoints();
  const selected = countPoints(scope);
  const estimatedMin = selected * MIN_PER_POINT;

  const togglePoint = (domaineId: string, idx: number) => {
    setScope(prev => {
      const cur = new Set(prev[domaineId] ?? []);
      if (cur.has(idx)) cur.delete(idx); else cur.add(idx);
      return { ...prev, [domaineId]: Array.from(cur).sort((a, b) => a - b) };
    });
  };

  const toggleDomaine = (domaineId: string, all: boolean) => {
    const d = DOMAINES_AUDIT.find(x => x.id === domaineId);
    if (!d) return;
    setScope(prev => ({ ...prev, [domaineId]: all ? d.checklist.map((_, i) => i) : [] }));
  };

  const applyPreset = (presetId: string) => {
    const p = AUDIT_PRESETS.find(x => x.id === presetId);
    if (p) setScope(p.build());
  };

  const launch = async () => {
    if (!groupementActif) { toast.error('Aucun groupement actif'); return; }
    if (!etabId) { toast.error('Sélectionnez un établissement'); return; }
    if (selected === 0) { toast.error('Cochez au moins un point à auditer'); return; }

    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Non authentifié');

      const ac = agents.find(a => a.role === 'agent_comptable');
      const ordo = agents.find(a => a.role === 'ordonnateur' && a.etablissement_id === etabId);

      const { data: audit, error } = await supabase
        .from('audits')
        .insert({
          groupement_id: groupementActif.id,
          etablissement_id: etabId,
          user_id: userData.user.id,
          libelle,
          type_audit: typeAudit,
          periode_debut: periodeDebut,
          periode_fin: periodeFin,
          scope,
          agent_comptable_id: ac?.id ?? null,
          ordonnateur_id: ordo?.id ?? null,
        })
        .select()
        .single();

      if (error) throw error;

      // Pré-créer les lignes audit_points_results pour les points cochés
      const rows: Array<{ audit_id: string; domaine_id: string; point_index: number; point_libelle: string }> = [];
      Object.entries(scope).forEach(([dId, indexes]) => {
        const d = DOMAINES_AUDIT.find(x => x.id === dId);
        if (!d) return;
        indexes.forEach(idx => {
          rows.push({ audit_id: audit.id, domaine_id: dId, point_index: idx, point_libelle: d.checklist[idx] });
        });
      });
      if (rows.length > 0) {
        const { error: e2 } = await supabase.from('audit_points_results').insert(rows);
        if (e2) throw e2;
      }

      toast.success(`Audit lancé — ${selected} points à contrôler`);
      navigate(`/audit-execution/${audit.id}`);
    } catch (e: any) {
      toast.error(e.message ?? 'Erreur création audit');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModulePageLayout
      title="Configurer un nouvel audit"
      section="AUDIT & RESTITUTION"
      description="Sélectionnez les points à auditer parmi les 8 domaines M9-6 / GBCP. Vous ne contrôlerez que ce que vous cochez ici."
    >
      <div className="space-y-4">
        {/* Paramètres généraux */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Paramètres de l'audit</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div>
              <Label htmlFor="libelle">Libellé</Label>
              <Input id="libelle" value={libelle} onChange={e => setLibelle(e.target.value)} />
            </div>
            <div>
              <Label>Établissement</Label>
              <Select value={etabId} onValueChange={setEtabId}>
                <SelectTrigger><SelectValue placeholder="Sélectionner…" /></SelectTrigger>
                <SelectContent>
                  {etablissements.map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.uai} — {e.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Type d'audit</Label>
              <Select value={typeAudit} onValueChange={(v: any) => setTypeAudit(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="periodique">Périodique</SelectItem>
                  <SelectItem value="thematique">Thématique</SelectItem>
                  <SelectItem value="inopine">Inopiné</SelectItem>
                  <SelectItem value="prise_fonction">Prise de fonction</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Période début</Label>
                <Input type="date" value={periodeDebut} onChange={e => setPeriodeDebut(e.target.value)} />
              </div>
              <div>
                <Label>Période fin</Label>
                <Input type="date" value={periodeFin} onChange={e => setPeriodeFin(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Presets */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ListChecks className="h-4 w-4" /> Sélection rapide
            </CardTitle>
            <CardDescription>Choisissez un preset, puis affinez ci-dessous.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {AUDIT_PRESETS.map(p => (
              <Button key={p.id} variant="outline" size="sm" onClick={() => applyPreset(p.id)} title={p.description}>
                {p.label}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Arbre des 8 domaines */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">8 domaines M9-6 / GBCP</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="space-y-1">
              {DOMAINES_AUDIT.map(d => {
                const sel = scope[d.id] ?? [];
                const allChecked = sel.length === d.checklist.length;
                const partial = sel.length > 0 && !allChecked;
                return (
                  <AccordionItem key={d.id} value={d.id} className="border rounded-md px-2">
                    <AccordionTrigger className="hover:no-underline py-2">
                      <div className="flex items-center gap-3 flex-1 text-left">
                        <span className="flex h-7 w-7 items-center justify-center rounded bg-primary/10 text-primary font-bold text-sm">
                          {d.lettre}
                        </span>
                        <span className="flex-1 text-sm font-medium">{d.label}</span>
                        <Badge variant={allChecked ? 'default' : partial ? 'secondary' : 'outline'} className="text-[10px]">
                          {sel.length}/{d.checklist.length}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex gap-2 pb-2">
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => toggleDomaine(d.id, true)}>Tout cocher</Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => toggleDomaine(d.id, false)}>Tout décocher</Button>
                      </div>
                      <ul className="space-y-1.5">
                        {d.checklist.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Checkbox
                              id={`${d.id}-${idx}`}
                              checked={sel.includes(idx)}
                              onCheckedChange={() => togglePoint(d.id, idx)}
                              className="mt-0.5"
                            />
                            <label htmlFor={`${d.id}-${idx}`} className="text-sm cursor-pointer flex-1">{point}</label>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </CardContent>
        </Card>

        {/* Bandeau récap fixe en bas */}
        <Card className="sticky bottom-4 bg-primary text-primary-foreground border-primary">
          <CardContent className="py-3 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-4 text-sm">
              <div><strong>{selected}</strong> / {total} points sélectionnés</div>
              <Separator orientation="vertical" className="h-5 bg-primary-foreground/30" />
              <div className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> ~{estimatedMin} min estimées</div>
            </div>
            <Button variant="secondary" onClick={launch} disabled={saving || selected === 0}>
              <Rocket className="h-4 w-4 mr-2" />
              {saving ? 'Création…' : 'Lancer l\'audit'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </ModulePageLayout>
  );
}
