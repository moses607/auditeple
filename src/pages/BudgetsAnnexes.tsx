import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Pencil, Building2, FileText, AlertTriangle, CheckCircle2, XCircle, MinusCircle, ArrowRight, Download, Info, Scale } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { loadState, saveState } from '@/lib/store';
import { useAuditParamsContext } from '@/contexts/AuditParamsContext';
import { fmt, getAgenceComptable } from '@/lib/types';
import { CONTROLES_BUDGETS_ANNEXES } from '@/lib/regulatory-data';
import { ModulePageLayout, ComplianceCheck, ModuleSection } from '@/components/ModulePageLayout';
import {
  BudgetAnnexeRecord, Mouvement185, AuditItemBA,
  AUDIT_ITEMS_BA, defaultAuditItems, computeAuditScore,
} from '@/lib/budgets-annexes-types';
import { DoctrineEPLE } from '@/components/DoctrineEPLE';

// ═══ HELPERS ═══
const STORE_KEY_BA = 'budgets_annexes_v2';
const STORE_KEY_AUDIT = 'ba_audit_items';

function loadBA(): BudgetAnnexeRecord[] { return loadState(STORE_KEY_BA, []); }
function saveBA(d: BudgetAnnexeRecord[]) { saveState(STORE_KEY_BA, d); }
function loadAuditItems(): AuditItemBA[] { return loadState(STORE_KEY_AUDIT, []); }
function saveAuditItems(d: AuditItemBA[]) { saveState(STORE_KEY_AUDIT, d); }

const SCORE_COLORS = { vert: 'bg-emerald-500', jaune: 'bg-amber-500', rouge: 'bg-red-500' };
const SCORE_TEXT = { vert: 'text-emerald-700', jaune: 'text-amber-700', rouge: 'text-red-700' };
const CONFORME_ICONS = {
  oui: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
  non: <XCircle className="h-4 w-4 text-red-600" />,
  partiel: <MinusCircle className="h-4 w-4 text-amber-600" />,
  '': <span className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 inline-block" />,
};

export default function BudgetsAnnexes() {
  const { params } = useAuditParamsContext();
  const agence = getAgenceComptable(params);
  const [records, setRecords] = useState<BudgetAnnexeRecord[]>(() => loadBA());
  const [auditItems, setAuditItems] = useState<AuditItemBA[]>(() => loadAuditItems());
  const [form, setForm] = useState<Partial<BudgetAnnexeRecord> | null>(null);
  const [selectedBAId, setSelectedBAId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterEquilibre, setFilterEquilibre] = useState<string>('all');
  const [regChecks, setRegChecks] = useState<Record<string, boolean>>(() => loadState('budgets_annexes_checks', {}));
  const toggleRegCheck = (id: string) => { const u = { ...regChecks, [id]: !regChecks[id] }; setRegChecks(u); saveState('budgets_annexes_checks', u); };

  const persist = (d: BudgetAnnexeRecord[]) => { setRecords(d); saveBA(d); };
  const persistAudit = (d: AuditItemBA[]) => { setAuditItems(d); saveAuditItems(d); };

  // Filtered list
  const filtered = useMemo(() => {
    let list = records;
    if (filterType !== 'all') list = list.filter(r => r.type === filterType);
    if (filterEquilibre === 'equilibre') list = list.filter(r => Math.abs(r.resultatNet) < 1);
    if (filterEquilibre === 'desequilibre') list = list.filter(r => Math.abs(r.resultatNet) >= 1);
    return list;
  }, [records, filterType, filterEquilibre]);

  const selectedBA = records.find(r => r.id === selectedBAId);
  const baAuditItems = useMemo(() => {
    if (!selectedBAId) return [];
    const existing = auditItems.filter(a => a.budgetAnnexeId === selectedBAId);
    if (existing.length === 8) return existing;
    // Create default items for this BA
    const defaults = defaultAuditItems(selectedBAId);
    const merged = [...auditItems.filter(a => a.budgetAnnexeId !== selectedBAId), ...defaults];
    persistAudit(merged);
    return defaults;
  }, [selectedBAId, auditItems]);

  const scoring = computeAuditScore(baAuditItems);

  // ═══ Form submit ═══
  const submitForm = () => {
    if (!form || !form.nom) return;
    const record: BudgetAnnexeRecord = {
      id: form.id || crypto.randomUUID(),
      epleSupportId: form.epleSupportId || agence?.id || '',
      type: (form.type as BudgetAnnexeRecord['type']) || 'CFA',
      nom: form.nom || '',
      dateCreation: form.dateCreation || new Date().toISOString().slice(0, 10),
      exercice: form.exercice || params.exercice,
      deliberationCA: form.deliberationCA || '',
      budget: Number(form.budget) || 0,
      resultatExploitation: Number(form.resultatExploitation) || 0,
      resultatFinancier: Number(form.resultatFinancier) || 0,
      resultatExceptionnel: Number(form.resultatExceptionnel) || 0,
      resultatNet: Number(form.resultatNet) || 0,
      tauxExecution: Number(form.tauxExecution) || 0,
      mouvements185: form.mouvements185 || [],
    };
    if (form.id) persist(records.map(r => r.id === form.id ? record : r));
    else persist([...records, record]);
    setForm(null);
  };

  // ═══ Mouvement 185 helpers ═══
  const addMouvement185 = (baId: string) => {
    const ba = records.find(r => r.id === baId);
    if (!ba) return;
    const m: Mouvement185 = { id: crypto.randomUUID(), date: new Date().toISOString().slice(0, 10), libelle: '', debit: 0, credit: 0 };
    persist(records.map(r => r.id === baId ? { ...r, mouvements185: [...r.mouvements185, m] } : r));
  };

  const updateMouvement185 = (baId: string, mId: string, field: string, value: string | number) => {
    persist(records.map(r => r.id === baId
      ? { ...r, mouvements185: r.mouvements185.map(m => m.id === mId ? { ...m, [field]: value } : m) }
      : r
    ));
  };

  const removeMouvement185 = (baId: string, mId: string) => {
    persist(records.map(r => r.id === baId
      ? { ...r, mouvements185: r.mouvements185.filter(m => m.id !== mId) }
      : r
    ));
  };

  // ═══ Audit item update ═══
  const updateAuditItem = (itemId: string, field: string, value: string | number) => {
    const updated = auditItems.map(a => a.id === itemId ? { ...a, [field]: value } : a);
    persistAudit(updated);
  };

  // ═══ PDF Export ═══
  const exportPDF = () => {
    if (!selectedBA) return;
    const w = window.open('', '_blank');
    if (!w) return;
    const items = baAuditItems;
    const sc = computeAuditScore(items);
    const epleSupport = params.etablissements.find(e => e.id === selectedBA.epleSupportId);

    // HTML escape helper to prevent XSS injection from user-controlled fields
    const esc = (s: unknown): string =>
      String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');

    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Rapport Audit BA – ${esc(selectedBA.nom)}</title>
    <style>
      @page { size: A4; margin: 20mm; }
      body { font-family: Georgia, 'Times New Roman', serif; font-size: 11pt; color: #1a1a2e; line-height: 1.5; }
      h1 { text-align: center; font-size: 16pt; border-bottom: 3px double #1a1a2e; padding-bottom: 8px; letter-spacing: 2px; text-transform: uppercase; }
      h2 { font-size: 13pt; color: #1a1a2e; border-left: 4px solid #1e3a5f; padding-left: 10px; margin-top: 20px; }
      .header-block { background: #f0f4f8; border: 1px solid #ccc; padding: 12px; margin: 15px 0; font-size: 10pt; }
      .header-block td { padding: 3px 10px; }
      table.audit { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 10pt; }
      table.audit th, table.audit td { border: 1px solid #999; padding: 6px 8px; text-align: left; vertical-align: top; }
      table.audit th { background: #1e3a5f; color: white; font-weight: bold; }
      .conforme-oui { color: #059669; font-weight: bold; }
      .conforme-non { color: #dc2626; font-weight: bold; }
      .conforme-partiel { color: #d97706; font-weight: bold; }
      .score-block { text-align: center; padding: 15px; margin: 20px 0; border: 2px solid; border-radius: 8px; }
      .score-vert { border-color: #059669; background: #ecfdf5; color: #059669; }
      .score-jaune { border-color: #d97706; background: #fffbeb; color: #d97706; }
      .score-rouge { border-color: #dc2626; background: #fef2f2; color: #dc2626; }
      .footer { text-align: center; font-size: 9pt; color: #666; margin-top: 30px; border-top: 1px solid #ccc; padding-top: 10px; }
      .ref { font-size: 9pt; color: #666; font-style: italic; }
    </style></head><body>
    <h1>RAPPORT D'AUDIT – BUDGET ANNEXE</h1>
    <div class="header-block"><table>
      <tr><td><strong>Budget annexe :</strong></td><td>${esc(selectedBA.nom)} (${esc(selectedBA.type)})</td></tr>
      <tr><td><strong>EPLE support :</strong></td><td>${esc(epleSupport?.nom || '—')} (UAI ${esc(epleSupport?.uai || '—')})</td></tr>
      ${agence ? `<tr><td><strong>Agence comptable :</strong></td><td>${esc(agence.nom)}</td></tr>` : ''}
      <tr><td><strong>Exercice :</strong></td><td>${esc(selectedBA.exercice)}</td></tr>
      <tr><td><strong>Date création BA :</strong></td><td>${esc(selectedBA.dateCreation)}</td></tr>
      <tr><td><strong>Budget :</strong></td><td>${esc(fmt(selectedBA.budget))}</td></tr>
      <tr><td><strong>Résultat net :</strong></td><td>${esc(fmt(selectedBA.resultatNet))}</td></tr>
    </table></div>
    <div class="score-block score-${esc(sc.label)}">
      <strong>SCORING GLOBAL : ${esc(sc.score)}% — ${esc(sc.label.toUpperCase())}</strong><br/>
      <span style="font-size:10pt">${esc(sc.detail)}</span>
    </div>
    <h2>I. DÉTAIL DES CONTRÔLES</h2>
    <table class="audit">
      <thead><tr><th style="width:5%">N°</th><th style="width:25%">Item</th><th style="width:20%">Existant</th><th style="width:20%">Attendu (réf.)</th><th style="width:15%">Écart</th><th style="width:15%">Conformité</th></tr></thead>
      <tbody>
      ${items.map((it, i) => {
        const def = AUDIT_ITEMS_BA[i];
        return `<tr>
          <td><strong>${esc(def.index)}</strong></td>
          <td><strong>${esc(def.label)}</strong><br/><span class="ref">${esc(def.reference)}</span></td>
          <td>${it.existant ? esc(it.existant) : '<em>Non renseigné</em>'}<br/>${it.montantExistant ? `Montant: ${esc(fmt(it.montantExistant))}` : ''}</td>
          <td>${esc(it.attendu)}<br/>${it.montantAttendu ? `Attendu: ${esc(fmt(it.montantAttendu))}` : ''}</td>
          <td>${it.ecart ? esc(it.ecart) : '—'}</td>
          <td class="conforme-${esc(it.conforme || 'non')}">${it.conforme === 'oui' ? '✓ CONFORME' : it.conforme === 'non' ? '✗ NON CONFORME' : it.conforme === 'partiel' ? '⚠ PARTIEL' : 'Non vérifié'}<br/><span style="font-size:9pt;color:#333;font-weight:normal">${esc(it.commentaire || '')}</span></td>
        </tr>`;
      }).join('')}
      </tbody>
    </table>
    <h2>II. LIAISON COMPTE 185000 (Planche 16)</h2>
    ${selectedBA.mouvements185.length > 0 ? `
    <table class="audit">
      <thead><tr><th>Date</th><th>Libellé</th><th>Débit</th><th>Crédit</th></tr></thead>
      <tbody>
      ${selectedBA.mouvements185.map(m => `<tr><td>${esc(m.date)}</td><td>${esc(m.libelle)}</td><td>${esc(fmt(m.debit))}</td><td>${esc(fmt(m.credit))}</td></tr>`).join('')}
      <tr style="font-weight:bold;background:#f0f4f8">
        <td colspan="2">TOTAL</td>
        <td>${esc(fmt(selectedBA.mouvements185.reduce((s, m) => s + m.debit, 0)))}</td>
        <td>${esc(fmt(selectedBA.mouvements185.reduce((s, m) => s + m.credit, 0)))}</td>
      </tr>
      </tbody>
    </table>
    ` : '<p><em>Aucun mouvement 185000 enregistré.</em></p>'}
    <div class="footer">
      <p>Rapport généré le ${new Date().toLocaleDateString('fr-FR')} — CIC Expert Pro — Réf. M9.6 Tome 2 § 2.1.2.3.2 + Planche 16</p>
      <p>Décret 2012-1246 — Code de l'éducation art. R421-58 et suivants</p>
    </div>
    </body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 500);
  };

  return (
    <ModulePageLayout
      title="Budgets annexes"
      section="FINANCES & BUDGET"
      description="Contrôle des services spéciaux et budgets annexes : SRH (service de restauration et d'hébergement), CFA, GRETA. Suivi du compte de dépôt C/185000 et vérification de l'absence de compte au Trésor propre."
      refs={[
        { code: "M9-6 § 4.3", label: "Budgets annexes" },
        { code: "C/185000", label: "Compte de dépôt" },
        { code: "Art. R.421-58 C.Édu", label: "Budget de l'EPLE" },
      ]}
      completedChecks={(CONTROLES_BUDGETS_ANNEXES).filter(c => regChecks[c.id]).length}
      totalChecks={(CONTROLES_BUDGETS_ANNEXES).length}
    >
      <DoctrineEPLE theme="budgets-annexes" titre="Budgets annexes (CFA / GRETA / SRH)" resume="Compte 185000 = 0, vote CA, séparation des résultats" />
      {/* ═══ HEADER ═══ */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Réf. : Instruction M9.6 Tome 2 § 2.1.2.3.2 + Planche 16 — Décret 2012-1246 — Code éducation R421-58
              </p>
            </div>
          </div>
          {agence && (
            <p className="text-sm text-muted-foreground mt-2 ml-13">
              Agence comptable : <span className="font-semibold text-foreground">{agence.nom}</span>
            </p>
          )}
        </div>
      </div>

      <Tabs defaultValue="gestion" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 h-11">
          <TabsTrigger value="gestion" className="gap-2 text-sm">
            <Building2 className="h-4 w-4" />
            PAN 1 — Rattachement & Gestion
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2 text-sm">
            <FileText className="h-4 w-4" />
            PAN 2 — Audit Opérations
          </TabsTrigger>
        </TabsList>

        {/* ═══════════════════════════════════════════════ */}
        {/* PAN 1 – RATTACHEMENT & GESTION                  */}
        {/* ═══════════════════════════════════════════════ */}
        <TabsContent value="gestion" className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => setForm({
              type: 'CFA', nom: '', dateCreation: new Date().toISOString().slice(0, 10),
              exercice: params.exercice, epleSupportId: agence?.id || params.etablissements[0]?.id || '',
              mouvements185: [],
            })}>
              <Plus className="h-4 w-4 mr-2" /> Nouveau BA
            </Button>
            <div className="flex items-center gap-2 ml-auto">
              <Label className="text-xs text-muted-foreground">Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="CFA">CFA</SelectItem>
                  <SelectItem value="GRETA">GRETA</SelectItem>
                  <SelectItem value="SRH">SRH</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
              <Label className="text-xs text-muted-foreground">Équilibre</Label>
              <Select value={filterEquilibre} onValueChange={setFilterEquilibre}>
                <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="equilibre">Équilibré</SelectItem>
                  <SelectItem value="desequilibre">Déséquilibré</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Creation form */}
          {form && (
            <Card className="border-primary shadow-card animate-fade-in">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{form.id ? 'Modifier le BA' : 'Création / Rattachement Budget Annexe'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">EPLE support</Label>
                    <Select value={form.epleSupportId || ''} onValueChange={v => setForm({ ...form, epleSupportId: v })}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                      <SelectContent>
                        {params.etablissements.map(e => (
                          <SelectItem key={e.id} value={e.id}>
                            {e.nom} {e.isAgenceComptable ? '★ AC' : ''} ({e.uai})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Type</Label>
                    <Select value={form.type || 'CFA'} onValueChange={v => setForm({ ...form, type: v as any })}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CFA">CFA</SelectItem>
                        <SelectItem value="GRETA">GRETA</SelectItem>
                        <SelectItem value="SRH">SRH</SelectItem>
                        <SelectItem value="Autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Nom du BA</Label>
                    <Input className="h-9" value={form.nom || ''} onChange={e => setForm({ ...form, nom: e.target.value })} placeholder="Ex: CFA Académique" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Date de création</Label>
                    <Input className="h-9" type="date" value={form.dateCreation || ''} onChange={e => setForm({ ...form, dateCreation: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Exercice</Label>
                    <Input className="h-9" value={form.exercice || ''} onChange={e => setForm({ ...form, exercice: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Délibération CA</Label>
                    <Input className="h-9" type="file" accept=".pdf,.jpg,.png" onChange={e => setForm({ ...form, deliberationCA: e.target.files?.[0]?.name || '' })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Budget (€)</Label>
                    <Input className="h-9" type="number" value={form.budget ?? ''} onChange={e => setForm({ ...form, budget: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Rés. exploitation</Label>
                    <Input className="h-9" type="number" value={form.resultatExploitation ?? ''} onChange={e => setForm({ ...form, resultatExploitation: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Rés. financier</Label>
                    <Input className="h-9" type="number" value={form.resultatFinancier ?? ''} onChange={e => setForm({ ...form, resultatFinancier: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Rés. exceptionnel</Label>
                    <Input className="h-9" type="number" value={form.resultatExceptionnel ?? ''} onChange={e => setForm({ ...form, resultatExceptionnel: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Résultat net</Label>
                    <Input className="h-9" type="number" value={form.resultatNet ?? ''} onChange={e => setForm({ ...form, resultatNet: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Taux exéc. %</Label>
                    <Input className="h-9" type="number" value={form.tauxExecution ?? ''} onChange={e => setForm({ ...form, tauxExecution: parseFloat(e.target.value) || 0 })} />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={submitForm}>Valider</Button>
                  <Button variant="outline" onClick={() => setForm(null)}>Annuler</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* List */}
          {filtered.length === 0 && !form && (
            <Card><CardContent className="py-16 text-center text-muted-foreground">
              <Building2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Aucun budget annexe enregistré</p>
              <p className="text-xs mt-1">Créez un nouveau BA pour commencer le rattachement.</p>
            </CardContent></Card>
          )}

          {filtered.map(x => {
            const eple = params.etablissements.find(e => e.id === x.epleSupportId);
            const totalDebit185 = x.mouvements185.reduce((s, m) => s + m.debit, 0);
            const totalCredit185 = x.mouvements185.reduce((s, m) => s + m.credit, 0);
            const ecart185 = Math.abs(totalDebit185 - totalCredit185);
            const baScore = computeAuditScore(auditItems.filter(a => a.budgetAnnexeId === x.id));

            return (
              <Card key={x.id} className="transition-shadow hover:shadow-card">
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Badge variant={x.type === 'CFA' ? 'default' : x.type === 'GRETA' ? 'secondary' : 'outline'} className="text-xs">
                        {x.type}
                      </Badge>
                      <span className="font-bold text-foreground">{x.nom}</span>
                      {eple && <span className="text-xs text-muted-foreground">— {eple.nom}</span>}
                      <Badge variant="outline" className="text-[10px]">{x.exercice}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Score badge */}
                      <Badge className={`${SCORE_COLORS[baScore.label]} text-white text-[10px]`}>
                        {baScore.score}%
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                        setForm({
                          ...x,
                          budget: x.budget,
                          resultatExploitation: x.resultatExploitation,
                          resultatFinancier: x.resultatFinancier,
                          resultatExceptionnel: x.resultatExceptionnel,
                          resultatNet: x.resultatNet,
                          tauxExecution: x.tauxExecution,
                        });
                      }}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => persist(records.filter(r => r.id !== x.id))}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => { setSelectedBAId(x.id); /* Switch to audit tab */ }}>
                        <ArrowRight className="h-3 w-3" /> Auditer
                      </Button>
                    </div>
                  </div>

                  {/* KPI row */}
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-sm">
                    <div className="space-y-0.5">
                      <span className="text-muted-foreground text-xs">Budget</span>
                      <p className="font-mono font-bold">{fmt(x.budget)}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-muted-foreground text-xs">Rés. exploit.</span>
                      <p className="font-mono font-bold">{fmt(x.resultatExploitation)}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-muted-foreground text-xs">Résultat net</span>
                      <p className={`font-mono font-bold ${x.resultatNet >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                        {fmt(x.resultatNet)}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-muted-foreground text-xs">Taux exéc.</span>
                      <p className={`font-bold ${x.tauxExecution >= 80 ? 'text-emerald-600' : 'text-destructive'}`}>
                        {x.tauxExecution}%
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-muted-foreground text-xs">C185 solde</span>
                      <p className={`font-mono font-bold ${ecart185 < 1 ? 'text-emerald-600' : 'text-destructive'}`}>
                        {fmt(ecart185)}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-muted-foreground text-xs">Délibération</span>
                      <p className="text-xs truncate">{x.deliberationCA || '—'}</p>
                    </div>
                  </div>

                  {/* Mouvements 185 */}
                  <details className="mt-4">
                    <summary className="text-xs font-medium text-primary cursor-pointer flex items-center gap-1.5">
                      <Scale className="h-3.5 w-3.5" />
                      Compte 185000 — Liaison Planche 16 ({x.mouvements185.length} mouvement{x.mouvements185.length > 1 ? 's' : ''})
                    </summary>
                    <div className="mt-3 space-y-2">
                      {x.mouvements185.map(m => (
                        <div key={m.id} className="grid grid-cols-5 gap-2 items-end">
                          <Input className="h-8 text-xs" type="date" value={m.date} onChange={e => updateMouvement185(x.id, m.id, 'date', e.target.value)} />
                          <Input className="h-8 text-xs" placeholder="Libellé" value={m.libelle} onChange={e => updateMouvement185(x.id, m.id, 'libelle', e.target.value)} />
                          <Input className="h-8 text-xs" type="number" placeholder="Débit" value={m.debit || ''} onChange={e => updateMouvement185(x.id, m.id, 'debit', parseFloat(e.target.value) || 0)} />
                          <Input className="h-8 text-xs" type="number" placeholder="Crédit" value={m.credit || ''} onChange={e => updateMouvement185(x.id, m.id, 'credit', parseFloat(e.target.value) || 0)} />
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeMouvement185(x.id, m.id)}>
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      ))}
                      <div className="flex items-center justify-between pt-1">
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => addMouvement185(x.id)}>
                          <Plus className="h-3 w-3 mr-1" /> Ajouter mouvement
                        </Button>
                        {x.mouvements185.length > 0 && (
                          <div className="text-xs">
                            <span className="text-muted-foreground mr-2">Total D: <strong className="text-foreground">{fmt(totalDebit185)}</strong></span>
                            <span className="text-muted-foreground mr-2">Total C: <strong className="text-foreground">{fmt(totalCredit185)}</strong></span>
                            <Badge variant={ecart185 < 1 ? 'default' : 'destructive'} className="text-[10px]">
                              {ecart185 < 1 ? '✓ Compensation parfaite' : `Écart: ${fmt(ecart185)}`}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </details>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* ═══════════════════════════════════════════════ */}
        {/* PAN 2 – AUDIT DÉTAILLÉ DES OPÉRATIONS           */}
        {/* ═══════════════════════════════════════════════ */}
        <TabsContent value="audit" className="space-y-4">
          {/* BA Selector */}
          <div className="flex flex-wrap items-center gap-3">
            <Label className="text-sm font-medium">Budget annexe :</Label>
            <Select value={selectedBAId || ''} onValueChange={setSelectedBAId}>
              <SelectTrigger className="w-72 h-9"><SelectValue placeholder="Sélectionner un BA" /></SelectTrigger>
              <SelectContent>
                {records.map(r => (
                  <SelectItem key={r.id} value={r.id}>{r.nom} ({r.type}) — {r.exercice}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedBA && (
              <Button variant="outline" size="sm" className="gap-1 ml-auto" onClick={exportPDF}>
                <Download className="h-3.5 w-3.5" /> Export PDF rapport
              </Button>
            )}
          </div>

          {!selectedBA ? (
            <Card><CardContent className="py-16 text-center text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Sélectionnez un budget annexe pour lancer l'audit</p>
              <p className="text-xs mt-1">Les 8 items de contrôle réglementaire apparaîtront automatiquement.</p>
            </CardContent></Card>
          ) : (
            <>
              {/* Score card */}
              <Card className={`border-2 ${scoring.label === 'vert' ? 'border-emerald-300 bg-emerald-50/50' : scoring.label === 'jaune' ? 'border-amber-300 bg-amber-50/50' : 'border-red-300 bg-red-50/50'}`}>
                <CardContent className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`h-14 w-14 rounded-xl flex items-center justify-center text-white font-bold text-lg ${SCORE_COLORS[scoring.label]}`}>
                      {scoring.score}%
                    </div>
                    <div>
                      <p className={`font-bold text-sm ${SCORE_TEXT[scoring.label]}`}>
                        SCORING GLOBAL — {scoring.label.toUpperCase()}
                      </p>
                      <p className="text-xs text-muted-foreground">{scoring.detail}</p>
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p className="font-semibold text-foreground">{selectedBA.nom}</p>
                    <p>{selectedBA.type} — Exercice {selectedBA.exercice}</p>
                  </div>
                </CardContent>
              </Card>

              {/* 8 Audit items */}
              {baAuditItems.map((item, idx) => {
                const def = AUDIT_ITEMS_BA[idx];
                if (!def) return null;
                return (
                  <Card key={item.id} className={`transition-shadow hover:shadow-card ${item.conforme === 'non' ? 'border-l-4 border-l-red-400' : item.conforme === 'oui' ? 'border-l-4 border-l-emerald-400' : item.conforme === 'partiel' ? 'border-l-4 border-l-amber-400' : 'border-l-4 border-l-muted'}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">{def.index}</span>
                          <div>
                            <CardTitle className="text-sm">{def.label}</CardTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">{def.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {CONFORME_ICONS[item.conforme || '']}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <Info className="h-3.5 w-3.5 text-muted-foreground" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="max-w-sm text-xs">
                              <p className="font-semibold mb-1">Référence réglementaire</p>
                              <p>{def.reference}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-primary">Existant (constaté)</Label>
                          <Textarea className="text-sm min-h-[80px]" placeholder="Saisie manuelle ou import OP@LE…" value={item.existant} onChange={e => updateAuditItem(item.id, 'existant', e.target.value)} />
                          <div className="flex gap-2">
                            <div className="flex-1 space-y-1">
                              <Label className="text-[10px] text-muted-foreground">Montant existant (€)</Label>
                              <Input className="h-8 text-xs" type="number" value={item.montantExistant || ''} onChange={e => updateAuditItem(item.id, 'montantExistant', parseFloat(e.target.value) || 0)} />
                            </div>
                            <div className="flex-1 space-y-1">
                              <Label className="text-[10px] text-muted-foreground">Pièces justificatives</Label>
                              <Input className="h-8 text-xs" type="file" multiple accept=".pdf,.jpg,.png,.xlsx" onChange={e => {
                                const files = Array.from(e.target.files || []).map(f => f.name);
                                updateAuditItem(item.id, 'pieces', files.join(', '));
                              }} />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-amber-700">Attendu (réf. réglementaire)</Label>
                          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md p-3 text-xs leading-relaxed text-amber-900 dark:text-amber-200 min-h-[80px]">
                            {def.regle}
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground">Montant attendu (€)</Label>
                            <Input className="h-8 text-xs" type="number" value={item.montantAttendu || ''} onChange={e => updateAuditItem(item.id, 'montantAttendu', parseFloat(e.target.value) || 0)} />
                          </div>
                        </div>
                      </div>

                      {/* Ecart + Conformité */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium">Écart constaté</Label>
                          <Textarea className="text-xs min-h-[60px]" placeholder="Description de l'écart…" value={item.ecart} onChange={e => updateAuditItem(item.id, 'ecart', e.target.value)} />
                          {item.montantExistant > 0 && item.montantAttendu > 0 && (
                            <div className={`text-xs font-mono font-bold ${Math.abs(item.montantExistant - item.montantAttendu) < 1 ? 'text-emerald-600' : 'text-destructive'}`}>
                              Δ = {fmt(item.montantExistant - item.montantAttendu)}
                            </div>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium">Conformité</Label>
                          <Select value={item.conforme || ''} onValueChange={v => updateAuditItem(item.id, 'conforme', v)}>
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Évaluer…" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="oui">✓ Conforme</SelectItem>
                              <SelectItem value="partiel">⚠ Partiellement conforme</SelectItem>
                              <SelectItem value="non">✗ Non conforme</SelectItem>
                            </SelectContent>
                          </Select>
                          {item.conforme === 'non' && (
                            <div className="flex items-center gap-1.5 text-xs text-red-600 animate-pulse">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              <span className="font-medium">Anomalie détectée — action corrective requise</span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium">Commentaire auditeur</Label>
                          <Textarea className="text-xs min-h-[60px]" placeholder="Observations…" value={item.commentaire} onChange={e => updateAuditItem(item.id, 'commentaire', e.target.value)} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Contrôles réglementaires */}
      <ModuleSection title="Contrôles réglementaires — Budgets annexes" description="M9-6 § 4.3 — C/185000" badge={`${(CONTROLES_BUDGETS_ANNEXES).filter(c => regChecks[c.id]).length}/${(CONTROLES_BUDGETS_ANNEXES).length}`}>
        <Card className="shadow-card">
          <CardContent className="p-3 space-y-2">
            {CONTROLES_BUDGETS_ANNEXES.map(item => (
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
    </ModulePageLayout>
  );
}
