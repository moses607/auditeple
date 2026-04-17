import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Plus, Trash2, Pencil } from 'lucide-react';
import { MarchePublic, SEUILS_MARCHES, fmt } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';
import { CONTROLES_MARCHES } from '@/lib/regulatory-data';
import { ModulePageLayout, ComplianceCheck, ModuleSection } from '@/components/ModulePageLayout';
import { ControlAlert } from '@/components/ControlAlert';

/* ═══ Détection saucissonnage : marchés de même nature dont le cumul 12 mois dépasse un seuil formalisé ═══ */
const SEUIL_FORMALISE = 143000;            // € HT — seuil procédure formalisée fournitures/services
const SEUIL_CUMUL_SUSPECT = 40000;         // € HT — au-dessus, risque de fractionnement à signaler

function normaliseObjet(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]/g, ' ').trim();
}
function similarite(a: string, b: string): number {
  const sa = new Set(normaliseObjet(a).split(/\s+/).filter(w => w.length > 3));
  const sb = new Set(normaliseObjet(b).split(/\s+/).filter(w => w.length > 3));
  if (!sa.size || !sb.size) return 0;
  let inter = 0; sa.forEach(w => { if (sb.has(w)) inter++; });
  return inter / Math.min(sa.size, sb.size);
}
interface ClusterSaucissonnage {
  motCle: string; nature: string; total: number; nb: number; ids: string[];
}

const NATURES = ['Fournitures', 'Services', 'Travaux', 'Fournitures et services', 'Prestations intellectuelles'];
const PROCEDURES = ['Gré à gré (< 40 000 €)', 'MAPA simplifié', 'MAPA avec publicité', 'Appel d\'offres ouvert', 'Appel d\'offres restreint', 'Procédure négociée', 'Dialogue compétitif'];

export default function MarchesPage() {
  const [marches, setMarches] = useState<MarchePublic[]>(() => loadState('marches', []));
  const [regChecks, setRegChecks] = useState<Record<string, boolean>>(() => loadState('marches_checks', {}));
  const toggleRegCheck = (id: string) => { const u = { ...regChecks, [id]: !regChecks[id] }; setRegChecks(u); saveState('marches_checks', u); };
  const [form, setForm] = useState<any>(null);
  const save = (m: MarchePublic[]) => { setMarches(m); saveState('marches', m); };

  const submit = () => {
    if (!form || !form.objet) return;
    const item: MarchePublic = {
      id: form.id || crypto.randomUUID(), objet: form.objet,
      montant: parseFloat(form.montant) || 0, typeMarche: form.typeMarche,
      dateNotification: form.dateNotification, observations: form.observations || '',
    };
    if (form.id) save(marches.map(m => m.id === form.id ? item : m));
    else save([...marches, item]);
    setForm(null);
  };

  const remove = (id: string) => save(marches.filter(m => m.id !== id));
  const totMontant = marches.reduce((s, m) => s + m.montant, 0);

  /* ═══ Détection auto saucissonnage : regroupe les marchés similaires (objet + nature) ═══ */
  const clustersSaucissonnage = useMemo<ClusterSaucissonnage[]>(() => {
    const visited = new Set<string>();
    const clusters: ClusterSaucissonnage[] = [];
    for (const m of marches) {
      if (visited.has(m.id)) continue;
      const groupe = marches.filter(x =>
        x.typeMarche === m.typeMarche &&
        (x.id === m.id || similarite(x.objet, m.objet) >= 0.5)
      );
      if (groupe.length < 2) continue;
      const total = groupe.reduce((s, g) => s + (g.montant || 0), 0);
      groupe.forEach(g => visited.add(g.id));
      if (total >= SEUIL_CUMUL_SUSPECT) {
        clusters.push({
          motCle: m.objet.slice(0, 40), nature: m.typeMarche,
          total, nb: groupe.length, ids: groupe.map(g => g.id),
        });
      }
    }
    return clusters.sort((a, b) => b.total - a.total);
  }, [marches]);

  return (
    <ModulePageLayout
      title="Commande et marchés publics"
      section="FINANCES & BUDGET"
      description="Vérification de la conformité des procédures d'achat selon les seuils en vigueur, respect des obligations de publicité et de mise en concurrence."
      refs={[
        { refKey: 'ccp-r2122-8', label: 'Dispense < 40 K€' },
        { refKey: 'ccp-r2124', label: 'MAPA' },
        { refKey: 'ccp-seuils-2026', label: 'Seuils 2026' },
        { refKey: 'ce-l421-14', label: 'Contrôle légalité > 90 K€' },
        { refKey: 'ccp-saucissonnage', label: 'Anti-fractionnement' },
        { refKey: 'ccp-delai-paiement', label: 'Délai 30 j' },
      ]}
      completedChecks={(CONTROLES_MARCHES).filter(c => regChecks[c.id]).length}
      totalChecks={(CONTROLES_MARCHES).length}
    >

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold">{marches.length}</p><p className="text-xs text-muted-foreground mt-0.5">Marchés suivis</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold">{fmt(totMontant)}</p><p className="text-xs text-muted-foreground mt-0.5">Montant total</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold text-amber-600">{marches.filter(x => (x.montant||0) >= 40000).length}</p><p className="text-xs text-muted-foreground mt-0.5">MAPA (&gt; 40K)</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold text-destructive">{marches.filter(x => (x.montant||0) >= 143000).length}</p><p className="text-xs text-muted-foreground mt-0.5">Procédure formalisée</p></CardContent></Card>
      </div>

      {/* ═══ ALERTE SAUCISSONNAGE AUTO ═══ */}
      {clustersSaucissonnage.length > 0 && (
        <div className="space-y-2">
          {clustersSaucissonnage.map((c, idx) => (
            <ControlAlert key={idx}
              level={c.total >= SEUIL_FORMALISE ? 'critique' : 'alerte'}
              title={`Risque de fractionnement détecté — « ${c.motCle}… »`}
              description={`${c.nb} marchés similaires de nature « ${c.nature} » totalisent ${fmt(c.total)}. ${c.total >= SEUIL_FORMALISE ? 'Le cumul dépasse le seuil de procédure formalisée (143 000 € HT) : passation séparée potentiellement irrégulière.' : 'Le cumul dépasse le seuil de dispense (40 000 € HT) sans publicité : à justifier ou regrouper.'}`}
              refKey="ccp-saucissonnage"
              action={c.total >= SEUIL_FORMALISE
                ? 'Réinterroger la computation des seuils (besoin homogène) et engager une procédure formalisée pour le besoin global.'
                : 'Vérifier la computation des seuils par familles homogènes (CCP art. R.2121-1) ou regrouper en MAPA avec publicité.'} />
          ))}
        </div>
      )}

      {/* Contrôles réglementaires */}
      <ModuleSection title="Contrôles commande publique" description="CCP — Décrets 2025-1386/1383 — Seuils 2026" badge={`${(CONTROLES_MARCHES).filter(c => regChecks[c.id]).length}/${(CONTROLES_MARCHES).length}`}>
        <Card className="shadow-card">
          <CardContent className="p-3 space-y-2">
            {CONTROLES_MARCHES.map(item => (
              <ComplianceCheck
                key={item.id}
                label={item.label}
                checked={regChecks[item.id] || false}
                onChange={() => toggleRegCheck(item.id)}
                severity={item.severity}
                detail={item.ref}
              />
            ))}
          </CardContent>
        </Card>
      </ModuleSection>

      <div className="flex justify-end">
        <Button onClick={() => setForm({ objet: '', montant: '', typeMarche: 'Fournitures', dateNotification: '', observations: '' })}>
          <Plus className="h-4 w-4 mr-2" /> Ajouter un marché
        </Button>
      </div>

      {form && (
        <Card className="border-primary"><CardContent className="pt-6 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1"><Label className="text-xs">Objet du marché</Label><Input value={form.objet} onChange={e => setForm({ ...form, objet: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Montant (€ HT)</Label><Input type="number" value={form.montant} onChange={e => setForm({ ...form, montant: e.target.value })} /></div>
            <div className="space-y-1"><Label className="text-xs">Nature</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.typeMarche} onChange={e => setForm({ ...form, typeMarche: e.target.value })}>
                {NATURES.map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
            <div className="space-y-1"><Label className="text-xs">Date de notification</Label><Input type="date" value={form.dateNotification} onChange={e => setForm({ ...form, dateNotification: e.target.value })} /></div>
          </div>

          {/* Alerte seuils en temps réel */}
          {(() => {
            const montant = parseFloat(form.montant) || 0;
            const seuilAtteint = SEUILS_MARCHES.filter(s => montant >= s.seuil).pop();
            const seuilProchain = SEUILS_MARCHES.find(s => montant < s.seuil);
            return (
              <>
                {seuilAtteint && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <span className="text-sm font-bold text-destructive">Seuil franchi : {seuilAtteint.label}</span>
                    </div>
                    <p className="text-xs">{seuilAtteint.consigne}</p>
                  </div>
                )}
                {seuilProchain && montant > 0 && (
                  <p className="text-xs text-muted-foreground">Prochain seuil : {seuilProchain.label}</p>
                )}
              </>
            );
          })()}

          <div className="space-y-1"><Label className="text-xs">Observations</Label>
            <Textarea value={form.observations || ''} onChange={e => setForm({ ...form, observations: e.target.value })} rows={3} placeholder="Observations, procédure suivie, référence..." />
          </div>
          <div className="flex gap-2"><Button onClick={submit}>Valider</Button><Button variant="outline" onClick={() => setForm(null)}>Annuler</Button></div>
        </CardContent></Card>
      )}

      {marches.length === 0 && !form && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Aucun marché enregistré.</CardContent></Card>
      )}

      {marches.map(marche => {
        const seuilAtteint = SEUILS_MARCHES.filter(s => marche.montant >= s.seuil).pop();
        return (
          <Card key={marche.id} className={seuilAtteint ? 'border-l-4 border-l-destructive' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold">{marche.objet}</span>
                    {seuilAtteint && <Badge variant="destructive">{seuilAtteint.label}</Badge>}
                  </div>
                  {seuilAtteint && <p className="text-xs text-destructive mt-1">{seuilAtteint.consigne}</p>}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setForm({ ...marche, montant: String(marche.montant) })}><Pencil className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => remove(marche.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </ModulePageLayout>
  );
}
