import { useMemo, useState, useEffect } from 'react';
import { ModulePageLayout, ModuleSection } from '@/components/ModulePageLayout';
import { useAuditParamsContext } from '@/contexts/AuditParamsContext';
import { getAgenceComptable } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';
import {
  ACTIVITES_MODELES, CATEGORIES_COULEURS, MOIS_NOMS, MOIS_NOMS_COURT,
  type ActiviteModele,
} from '@/lib/calendrier-activites';
import type { ActiviteCalendrier } from '@/lib/calendrier-types';
import { exportCalendrierPDF, exportCalendrierDOCX } from '@/lib/calendrier-export';
import { downloadEmlFile, getActivitesGroupees } from '@/lib/calendrier-mail';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  FileDown, FileText, Plus, Trash2, AlertTriangle, Filter,
  Building2, Pencil, Mail, CheckCircle2, Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'calendrier_annuel_v1';

function buildFromModele(m: ActiviteModele, allEtabIds: string[]): ActiviteCalendrier {
  return {
    id: `${m.id}-${Date.now()}`,
    modeleId: m.id,
    titre: m.titre,
    categorie: m.categorie,
    periodicite: m.periodicite,
    moisDebut: m.moisDebut,
    moisFin: m.moisFin,
    description: m.description,
    reference: m.reference,
    responsable: m.responsable,
    criticite: m.criticite,
    etablissementsIds: allEtabIds,
    tousEtablissements: true,
  };
}

export default function CalendrierAnnuel() {
  const { params } = useAuditParamsContext();
  const ac = getAgenceComptable(params);
  const etablissementsRattaches = params.etablissements.filter(e => !e.isAgenceComptable);

  const [activites, setActivites] = useState<ActiviteCalendrier[]>(() =>
    loadState<ActiviteCalendrier[]>(STORAGE_KEY, [])
  );
  const [filterCategorie, setFilterCategorie] = useState<string>('all');
  const [filterMois, setFilterMois] = useState<string>('all');
  const [filterEtab, setFilterEtab] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);

  useEffect(() => {
    saveState(STORAGE_KEY, activites);
  }, [activites]);

  // Initialiser avec la bibliothèque si vide
  const initFromLibrary = () => {
    const allIds = etablissementsRattaches.map(e => e.id);
    setActivites(ACTIVITES_MODELES.map(m => buildFromModele(m, allIds)));
    toast.success(`${ACTIVITES_MODELES.length} activités importées de la bibliothèque`);
  };

  const addFromModele = (m: ActiviteModele) => {
    const allIds = etablissementsRattaches.map(e => e.id);
    setActivites(prev => [...prev, buildFromModele(m, allIds)]);
    toast.success('Activité ajoutée');
  };

  const remove = (id: string) => {
    setActivites(prev => prev.filter(a => a.id !== id));
    toast.success('Activité supprimée');
  };

  const update = (id: string, patch: Partial<ActiviteCalendrier>) => {
    setActivites(prev => prev.map(a => a.id === id ? { ...a, ...patch } : a));
  };

  const addBlank = () => {
    const id = `custom-${Date.now()}`;
    setActivites(prev => [...prev, {
      id, titre: 'Nouvelle activité', categorie: 'Pilotage / Conseil AC',
      periodicite: 'annuelle', moisDebut: 1, description: '',
      responsable: 'AC', criticite: 'moyenne',
      etablissementsIds: etablissementsRattaches.map(e => e.id),
      tousEtablissements: true,
    }]);
    setEditingId(id);
  };

  // Filtrage
  const filtered = useMemo(() => activites.filter(a => {
    if (filterCategorie !== 'all' && a.categorie !== filterCategorie) return false;
    if (filterMois !== 'all') {
      const m = parseInt(filterMois, 10);
      if (!isInMonth(a, m)) return false;
    }
    if (filterEtab !== 'all') {
      if (filterEtab === 'tous' && !a.tousEtablissements) return false;
      if (filterEtab !== 'tous' && !a.etablissementsIds.includes(filterEtab)) return false;
    }
    return true;
  }), [activites, filterCategorie, filterMois, filterEtab]);

  // Vue par mois
  const byMonth = useMemo(() => {
    const map: Record<number, ActiviteCalendrier[]> = {};
    for (let m = 1; m <= 12; m++) map[m] = [];
    filtered.forEach(a => {
      for (let m = 1; m <= 12; m++) {
        if (isInMonth(a, m)) map[m].push(a);
      }
    });
    return map;
  }, [filtered]);

  const exportPDF = () => {
    if (activites.length === 0) {
      toast.error('Aucune activité à exporter');
      return;
    }
    exportCalendrierPDF({
      activites, etablissements: etablissementsRattaches, agenceComptable: ac,
      exercice: params.exercice, agentComptable: params.agentComptable,
    });
    toast.success('PDF généré');
  };

  const exportDOCX = async () => {
    if (activites.length === 0) {
      toast.error('Aucune activité à exporter');
      return;
    }
    await exportCalendrierDOCX({
      activites, etablissements: etablissementsRattaches, agenceComptable: ac,
      exercice: params.exercice, agentComptable: params.agentComptable,
    });
    toast.success('Document Word généré');
  };

  const exportMailMensuel = () => {
    if (activites.length === 0) {
      toast.error('Initialisez d\'abord la bibliothèque');
      return;
    }
    const moisCible = new Date().getMonth() + 1;
    const { duMois, enRetard } = getActivitesGroupees(activites, moisCible);
    if (duMois.length === 0 && enRetard.length === 0) {
      toast.info('Aucune opération à signaler ce mois-ci');
      return;
    }
    downloadEmlFile({
      activites, etablissements: etablissementsRattaches, agenceComptable: ac,
      exercice: params.exercice, agentComptable: params.agentComptable, moisCible,
    });
    toast.success(`Mail .eml généré (${duMois.length} du mois, ${enRetard.length} en retard)`);
  };

  const headerActions = (
    <div className="flex flex-wrap gap-2">
      <Button onClick={exportMailMensuel} size="sm" className="gap-1.5">
        <Mail className="h-4 w-4" /> Mail mensuel ER (.eml)
      </Button>
      <Button onClick={exportPDF} size="sm" variant="secondary" className="gap-1.5">
        <FileDown className="h-4 w-4" /> PDF paysage
      </Button>
      <Button onClick={exportDOCX} size="sm" variant="secondary" className="gap-1.5">
        <FileText className="h-4 w-4" /> Word paysage
      </Button>
    </div>
  );

  return (
    <ModulePageLayout
      title="Calendrier annuel de l'agent comptable"
      section="AUDIT & RESTITUTION"
      description="Calendrier des opérations comptables à destination des établissements rattachés. Exports PDF et Word au format paysage."
      refs={[
        { code: 'GBCP 2012-1246', label: 'décret du 7 nov. 2012' },
        { code: 'M9.6', label: 'instruction codificatrice' },
        { code: 'R. 421-64+', label: 'Code de l\'éducation' },
        { code: 'Circ. 2011-117', label: 'voyages scolaires' },
      ]}
      headerActions={headerActions}
    >
      {/* ─── Avertissement ─── */}
      <div className="rounded-lg border-l-4 border-l-destructive bg-destructive/5 p-4">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-destructive text-sm">Note aux secrétaires généraux des établissements rattachés</p>
            <p className="text-sm text-foreground/80 mt-1">
              Le non-respect de ce calendrier met l'agent comptable en difficulté et l'empêche de servir
              correctement le groupement dans les délais réglementaires. Une coordination rigoureuse est indispensable
              pour garantir la régularité comptable, la sécurité des fonds et la bonne information de tous.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Contexte ─── */}
      <Card className="p-4 bg-muted/30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Agence comptable</p>
            <p className="font-semibold">{ac?.nom || 'Non définie'} {ac?.uai && <span className="text-xs text-muted-foreground">({ac.uai})</span>}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Exercice</p>
            <p className="font-semibold">{params.exercice}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Établissements rattachés</p>
            <p className="font-semibold">{etablissementsRattaches.length}</p>
          </div>
        </div>
      </Card>

      {/* ─── Actions ─── */}
      <div className="flex flex-wrap gap-2 items-center">
        {activites.length === 0 ? (
          <Button onClick={initFromLibrary} className="gap-1.5">
            <Plus className="h-4 w-4" /> Initialiser avec la bibliothèque ({ACTIVITES_MODELES.length} activités)
          </Button>
        ) : (
          <>
            <Dialog open={showLibrary} onOpenChange={setShowLibrary}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Plus className="h-4 w-4" /> Ajouter depuis la bibliothèque
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Bibliothèque d'activités réglementaires</DialogTitle></DialogHeader>
                <div className="space-y-2">
                  {ACTIVITES_MODELES.map(m => {
                    const alreadyAdded = activites.some(a => a.modeleId === m.id);
                    return (
                      <div key={m.id} className="flex gap-3 p-3 rounded-lg border hover:bg-muted/30">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm">{m.titre}</span>
                            <Badge variant="outline" className={cn('text-[10px]', CATEGORIES_COULEURS[m.categorie])}>
                              {m.categorie}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{m.description}</p>
                          {m.reference && <p className="text-[11px] text-primary mt-0.5">📖 {m.reference}</p>}
                        </div>
                        <Button size="sm" variant={alreadyAdded ? 'ghost' : 'outline'}
                          disabled={alreadyAdded}
                          onClick={() => addFromModele(m)}>
                          {alreadyAdded ? 'Ajoutée' : 'Ajouter'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </DialogContent>
            </Dialog>
            <Button onClick={addBlank} variant="outline" size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" /> Activité personnalisée
            </Button>
          </>
        )}
      </div>

      {activites.length > 0 && (
        <>
          {/* ─── Filtres ─── */}
          <Card className="p-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterMois} onValueChange={setFilterMois}>
                <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Mois" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les mois</SelectItem>
                  {MOIS_NOMS.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterCategorie} onValueChange={setFilterCategorie}>
                <SelectTrigger className="w-[200px] h-8 text-xs"><SelectValue placeholder="Catégorie" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes catégories</SelectItem>
                  {Object.keys(CATEGORIES_COULEURS).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterEtab} onValueChange={setFilterEtab}>
                <SelectTrigger className="w-[200px] h-8 text-xs"><SelectValue placeholder="Établissement" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="tous">Globales (tous ER)</SelectItem>
                  {etablissementsRattaches.map(e => <SelectItem key={e.id} value={e.id}>{e.nom}</SelectItem>)}
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground ml-auto">
                {filtered.length} / {activites.length} activité(s)
              </span>
            </div>
          </Card>

          {/* ─── Vue par mois ─── */}
          <div className="space-y-4">
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => {
              const items = filterMois === 'all'
                ? byMonth[m]
                : (parseInt(filterMois, 10) === m ? byMonth[m] : []);
              if (items.length === 0 && filterMois !== 'all' && parseInt(filterMois, 10) !== m) return null;
              if (items.length === 0) return null;
              return (
                <ModuleSection key={m} title={MOIS_NOMS[m - 1]} badge={`${items.length} activité${items.length > 1 ? 's' : ''}`}>
                  <div className="space-y-2">
                    {items.map(a => (
                      <ActiviteRow key={a.id + '-' + m}
                        activite={a}
                        etablissements={etablissementsRattaches}
                        onUpdate={(patch) => update(a.id, patch)}
                        onRemove={() => remove(a.id)}
                        editing={editingId === a.id}
                        onEdit={() => setEditingId(editingId === a.id ? null : a.id)}
                      />
                    ))}
                  </div>
                </ModuleSection>
              );
            })}
          </div>
        </>
      )}
    </ModulePageLayout>
  );
}

// ─── Ligne d'activité ──────────────────────────────────────────────
function ActiviteRow({
  activite, etablissements, onUpdate, onRemove, editing, onEdit,
}: {
  activite: ActiviteCalendrier;
  etablissements: { id: string; nom: string; uai: string }[];
  onUpdate: (patch: Partial<ActiviteCalendrier>) => void;
  onRemove: () => void;
  editing: boolean;
  onEdit: () => void;
}) {
  const { params } = useAuditParamsContext();
  const realisee = !!activite.realisee;
  const critColor = realisee
    ? 'border-l-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 opacity-70'
    : activite.criticite === 'haute' ? 'border-l-destructive bg-destructive/5'
    : activite.criticite === 'moyenne' ? 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20'
    : 'border-l-sky-500 bg-sky-50/50 dark:bg-sky-950/20';

  const erResume = activite.tousEtablissements
    ? `Tous les ER (${etablissements.length})`
    : `${activite.etablissementsIds.length} ER sélectionné(s)`;

  const toggleRealisee = (c: boolean) => {
    if (c) {
      onUpdate({
        realisee: true,
        realiseeAt: new Date().toISOString(),
        realiseePar: params.agentComptable || 'Agent comptable',
      });
      toast.success('Activité marquée comme réalisée');
    } else {
      onUpdate({ realisee: false, realiseeAt: undefined, realiseePar: undefined });
    }
  };

  return (
    <div className={cn('rounded-lg border border-border border-l-4 p-3 transition-all', critColor)}>
      <div className="flex items-start gap-3">
        <div className="pt-0.5">
          <Checkbox
            checked={realisee}
            onCheckedChange={(c) => toggleRealisee(!!c)}
            aria-label="Marquer comme réalisée"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn('font-semibold text-sm', realisee && 'line-through text-muted-foreground')}>
              {activite.titre}
            </span>
            {realisee && (
              <Badge variant="outline" className="text-[10px] bg-emerald-100 text-emerald-900 border-emerald-300 gap-1">
                <CheckCircle2 className="h-3 w-3" /> Réalisée
              </Badge>
            )}
            <Badge variant="outline" className={cn('text-[10px]', CATEGORIES_COULEURS[activite.categorie])}>
              {activite.categorie}
            </Badge>
            <Badge variant="outline" className="text-[10px]">{activite.responsable}</Badge>
            {activite.reference && (
              <Badge variant="secondary" className="text-[10px]">📖 {activite.reference}</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{activite.description}</p>
          <div className="flex items-center gap-3 mt-2 text-xs flex-wrap">
            {activite.dateEcheance && (
              <span className="text-foreground/80">
                <strong>Échéance :</strong> {new Date(activite.dateEcheance).toLocaleDateString('fr-FR')}
              </span>
            )}
            <span className="text-muted-foreground flex items-center gap-1">
              <Building2 className="h-3 w-3" /> {erResume}
            </span>
            {realisee && activite.realiseeAt && (
              <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(activite.realiseeAt).toLocaleDateString('fr-FR')} — {activite.realiseePar}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <Button size="sm" variant="ghost" onClick={onEdit} className="h-7 w-7 p-0">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onRemove} className="h-7 w-7 p-0 text-destructive hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {editing && (
        <div className="mt-3 pt-3 border-t space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Titre</Label>
              <Input value={activite.titre} onChange={e => onUpdate({ titre: e.target.value })} className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Date d'échéance</Label>
              <Input type="date" value={activite.dateEcheance || ''} onChange={e => onUpdate({ dateEcheance: e.target.value })} className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Mois début (1-12)</Label>
              <Input type="number" min={1} max={12} value={activite.moisDebut || ''}
                onChange={e => onUpdate({ moisDebut: parseInt(e.target.value, 10) || 1 })} className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Mois fin (optionnel)</Label>
              <Input type="number" min={1} max={12} value={activite.moisFin || ''}
                onChange={e => onUpdate({ moisFin: parseInt(e.target.value, 10) || undefined })} className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Responsable</Label>
              <Select value={activite.responsable} onValueChange={(v) => onUpdate({ responsable: v as 'AC' | 'ER' | 'AC+ER' })}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="AC">Agent comptable (AC)</SelectItem>
                  <SelectItem value="ER">Établissement rattaché (ER)</SelectItem>
                  <SelectItem value="AC+ER">AC + ER (conjoint)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Criticité</Label>
              <Select value={activite.criticite} onValueChange={(v) => onUpdate({ criticite: v as 'haute' | 'moyenne' | 'info' })}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="haute">Haute</SelectItem>
                  <SelectItem value="moyenne">Moyenne</SelectItem>
                  <SelectItem value="info">Information</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs">Description</Label>
            <Textarea value={activite.description} onChange={e => onUpdate({ description: e.target.value })}
              className="text-sm" rows={2} />
          </div>

          {/* Affectation établissements rattachés */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs font-semibold">Établissements rattachés concernés</Label>
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`tous-${activite.id}`}
                  checked={activite.tousEtablissements}
                  onCheckedChange={(c) => onUpdate({
                    tousEtablissements: !!c,
                    etablissementsIds: c ? etablissements.map(e => e.id) : activite.etablissementsIds,
                  })}
                />
                <Label htmlFor={`tous-${activite.id}`} className="text-xs cursor-pointer">Tous</Label>
              </div>
            </div>
            {!activite.tousEtablissements && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-40 overflow-y-auto p-2 border rounded">
                {etablissements.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic col-span-2">
                    Aucun établissement rattaché. Ajoutez-en dans Paramètres.
                  </p>
                ) : etablissements.map(e => (
                  <div key={e.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`${activite.id}-${e.id}`}
                      checked={activite.etablissementsIds.includes(e.id)}
                      onCheckedChange={(c) => {
                        const newIds = c
                          ? [...activite.etablissementsIds, e.id]
                          : activite.etablissementsIds.filter(id => id !== e.id);
                        onUpdate({ etablissementsIds: newIds });
                      }}
                    />
                    <Label htmlFor={`${activite.id}-${e.id}`} className="text-xs cursor-pointer truncate">
                      {e.nom} <span className="text-muted-foreground">({e.uai})</span>
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helper ────────────────────────────────────────────────────────
function isInMonth(a: ActiviteCalendrier, m: number): boolean {
  if (a.periodicite === 'mensuelle' && a.moisDebut === 0) return true;
  const debut = a.moisDebut;
  const fin = a.moisFin || a.moisDebut;
  if (debut <= fin) return m >= debut && m <= fin;
  return m >= debut || m <= fin;
}
