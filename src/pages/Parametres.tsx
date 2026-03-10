import { useState } from 'react';
import { GDPRSettings } from '@/components/GDPRSettings';
import { useAuditParams } from '@/hooks/useAuditStore';
import { TeamMember, Etablissement, getSelectedEtablissement, getAgenceComptable } from '@/lib/types';
import { lookupUAI } from '@/lib/uai-lookup';
import { ModuleConfig, SECTIONS } from '@/lib/audit-modules';
import { useModules } from '@/hooks/useModules';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Trash2, Search, CheckCircle2, Loader2, AlertCircle, Building2, MapPin, ClipboardList, Users, ShieldAlert, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function ParametresPage() {
  const { params, update } = useAuditParams();
  const [newMember, setNewMember] = useState<Partial<TeamMember>>({});
  const [uaiInput, setUaiInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [modules, setModules] = useState<ModuleConfig[]>(() => getModules());
  const [accreditationAlert, setAccreditationAlert] = useState<{ etabId: string; ancienOrdo: string; nouveauOrdo: string } | null>(null);

  const current = getSelectedEtablissement(params);

  const handleUAILookup = async () => {
    const code = uaiInput.trim().toUpperCase();
    if (!/^\d{7}[A-Z]$/.test(code)) {
      setLookupError('Format UAI invalide. Attendu : 7 chiffres + 1 lettre (ex: 0131234A)');
      return;
    }
    if (params.etablissements.some(e => e.uai === code)) {
      setLookupError('Cet établissement est déjà enregistré dans le groupement.');
      return;
    }
    setSearching(true);
    setLookupError('');
    try {
      const result = await lookupUAI(code);
      if (result) {
        const newEtab: Etablissement = {
          id: crypto.randomUUID(),
          uai: result.uai,
          nom: result.nom,
          type: result.type,
          adresse: result.adresse,
          codePostal: result.codePostal,
          ville: result.ville,
          academie: result.academie,
        };
        const updated = [...params.etablissements, newEtab];
        update({
          etablissements: updated,
          selectedEtablissementId: params.selectedEtablissementId || newEtab.id,
        });
        toast.success(`Établissement ajouté : ${result.nom}`);
        setUaiInput('');
        setLookupError('');
      } else {
        setLookupError('Aucun établissement trouvé pour ce code UAI.');
      }
    } catch {
      setLookupError('Erreur de recherche. Vérifiez votre connexion.');
    } finally {
      setSearching(false);
    }
  };

  const removeEtab = (id: string) => {
    const updated = params.etablissements.filter(e => e.id !== id);
    const newSelected = params.selectedEtablissementId === id
      ? (updated[0]?.id || '')
      : params.selectedEtablissementId;
    update({ etablissements: updated, selectedEtablissementId: newSelected });
    toast.success('Établissement retiré du groupement');
  };

  const selectEtab = (id: string) => {
    update({ selectedEtablissementId: id });
  };

  const updateEtabField = (id: string, field: keyof Etablissement, value: any) => {
    const updated = params.etablissements.map(e =>
      e.id === id ? { ...e, [field]: value } : e
    );
    update({ etablissements: updated });
  };

  const handleOrdonnateurChange = (etabId: string, newOrdo: string) => {
    const etab = params.etablissements.find(e => e.id === etabId);
    if (!etab) return;
    const ancienOrdo = etab.ordonnateur || '';

    if (ancienOrdo && ancienOrdo !== newOrdo && newOrdo.trim()) {
      // Save old ordonnateur to history
      const historique = [...(etab.historiqueOrdonnateurs || []), {
        nom: ancienOrdo,
        dateFin: new Date().toISOString().split('T')[0],
        accreditationVerifiee: false,
      }];
      const updated = params.etablissements.map(e =>
        e.id === etabId ? { ...e, ordonnateur: newOrdo, historiqueOrdonnateurs: historique } : e
      );
      update({ etablissements: updated });
      // Show accreditation alert
      setAccreditationAlert({ etabId, ancienOrdo, nouveauOrdo: newOrdo });
    } else {
      updateEtabField(etabId, 'ordonnateur', newOrdo);
    }
  };

  const addMember = () => {
    if (!newMember.nom || !newMember.prenom) {
      toast.error('Nom et prénom requis');
      return;
    }
    const member: TeamMember = {
      id: crypto.randomUUID(),
      nom: newMember.nom || '',
      prenom: newMember.prenom || '',
      fonction: newMember.fonction || '',
      email: newMember.email || '',
      telephone: newMember.telephone || '',
      isAuditeur: false,
    };
    update({ equipe: [...params.equipe, member] });
    setNewMember({});
    toast.success('Membre ajouté');
  };

  const removeMember = (id: string) => {
    update({ equipe: params.equipe.filter(m => m.id !== id) });
    toast.success('Membre supprimé');
  };

  const toggleAuditeur = (id: string) => {
    const updated = params.equipe.map(m =>
      m.id === id ? { ...m, isAuditeur: !m.isAuditeur } : m
    );
    update({ equipe: updated });
  };

  const auditeurs = params.equipe.filter(m => m.isAuditeur);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Paramètres & Groupement comptable</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enregistrez les établissements du groupement comptable puis sélectionnez celui sur lequel travailler.
        </p>
      </div>

      {/* Alerte acccréditation */}
      <AlertDialog open={!!accreditationAlert} onOpenChange={() => setAccreditationAlert(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-500" />
              Changement d'ordonnateur détecté
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 text-left">
              <p>
                L'ordonnateur <strong>{accreditationAlert?.ancienOrdo}</strong> a été remplacé par <strong>{accreditationAlert?.nouveauOrdo}</strong>.
              </p>
              <p className="text-amber-600 font-semibold">
                ⚠ Vérifiez que le nouvel ordonnateur a bien remis son accréditation auprès de l'agent comptable.
              </p>
              <p className="text-xs text-muted-foreground">
                En cas de changement de chef d'établissement (notamment en septembre), l'ordonnateur doit transmettre
                une nouvelle accréditation pour habiliter les signatures et mandatements.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Rappeler plus tard</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              // Mark accreditation as verified
              const etabId = accreditationAlert?.etabId;
              if (etabId) {
                const etab = params.etablissements.find(e => e.id === etabId);
                if (etab?.historiqueOrdonnateurs) {
                  const hist = [...etab.historiqueOrdonnateurs];
                  if (hist.length > 0) hist[hist.length - 1].accreditationVerifiee = true;
                  updateEtabField(etabId, 'historiqueOrdonnateurs', hist);
                }
              }
              toast.success('Accréditation vérifiée');
              setAccreditationAlert(null);
            }}>
              <UserCheck className="h-4 w-4 mr-2" />
              Accréditation vérifiée
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Ajout UAI */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Ajouter un établissement au groupement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Code UAI</Label>
            <div className="flex gap-2">
              <Input
                value={uaiInput}
                onChange={e => setUaiInput(e.target.value.toUpperCase())}
                placeholder="0131234A"
                className="font-mono text-lg tracking-wider max-w-[200px]"
                maxLength={8}
                onKeyDown={e => e.key === 'Enter' && handleUAILookup()}
              />
              <Button onClick={handleUAILookup} disabled={searching} className="gap-2">
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Rechercher &amp; Ajouter
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Saisissez le code UAI puis validez. L'établissement sera recherché automatiquement et ajouté au groupement.
            </p>
            {lookupError && (
              <div className="flex items-center gap-2 text-sm text-destructive mt-1">
                <AlertCircle className="h-4 w-4" />
                {lookupError}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Liste des établissements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Groupement comptable
            <Badge variant="secondary" className="ml-auto text-xs">
              {params.etablissements.length} établissement{params.etablissements.length > 1 ? 's' : ''}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {params.etablissements.length === 0 ? (
            <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-6 text-center text-sm text-muted-foreground">
              Aucun établissement enregistré. Ajoutez-en un ci-dessus avec son code UAI.
            </div>
          ) : (
            <div className="space-y-3">
              {params.etablissements.map(e => {
                const isSelected = e.id === params.selectedEtablissementId;
                const isAC = !!e.isAgenceComptable;
                return (
                  <div key={e.id} className={`rounded-lg border-2 p-3 transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/40 hover:bg-muted/50'
                  }`}>
                    {/* Ligne principale */}
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => selectEtab(e.id)}>
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-foreground truncate">{e.nom}</span>
                          {isSelected && (
                            <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0">Actif</Badge>
                          )}
                          {isAC && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-500 text-amber-700">Agence comptable</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span className="font-mono">{e.uai}</span>
                          <span>{e.type}</span>
                          {e.ville && <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{e.ville}</span>}
                          {e.academie && <span>Ac. {e.academie}</span>}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          variant={isAC ? 'default' : 'outline'}
                          size="sm"
                          className={`text-[10px] h-7 ${isAC ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`}
                          onClick={(ev) => {
                            ev.stopPropagation();
                            const updated = params.etablissements.map(et => ({
                              ...et,
                              isAgenceComptable: et.id === e.id ? !et.isAgenceComptable : false,
                            }));
                            update({ etablissements: updated });
                            toast.success(isAC ? 'Statut agence comptable retiré' : `${e.nom} défini comme agence comptable`);
                          }}
                          title={isAC ? 'Retirer le statut agence comptable' : 'Définir comme agence comptable'}
                        >
                          {isAC ? '★ AC' : '☆ AC'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 text-destructive hover:text-destructive"
                          onClick={(ev) => { ev.stopPropagation(); removeEtab(e.id); }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Ordonnateur / Secrétaire Général par établissement */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-border/50">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Ordonnateur (chef d'établissement)</Label>
                        <Input
                          value={e.ordonnateur || ''}
                          onChange={ev => updateEtabField(e.id, 'ordonnateur', ev.target.value)}
                          onBlur={ev => {
                            const newVal = ev.target.value.trim();
                            const oldVal = params.etablissements.find(et => et.id === e.id)?.ordonnateur || '';
                            // Check if value actually changed from a non-empty previous value
                            if (oldVal && oldVal !== newVal && newVal) {
                              handleOrdonnateurChange(e.id, newVal);
                            }
                          }}
                          placeholder="Nom de l'ordonnateur"
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Secrétaire général</Label>
                        <Input
                          value={e.secretaireGeneral || ''}
                          onChange={ev => updateEtabField(e.id, 'secretaireGeneral', ev.target.value)}
                          placeholder="Nom du secrétaire général"
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audit params */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Audit</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Agent comptable</Label>
            <Input value={params.agentComptable} onChange={e => update({ agentComptable: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Exercice</Label>
            <Input value={params.exercice} onChange={e => update({ exercice: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Date de début</Label>
            <Input type="date" value={params.dateDebut} onChange={e => update({ dateDebut: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Date de fin</Label>
            <Input type="date" value={params.dateFin} onChange={e => update({ dateFin: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      {/* Équipe de l'agence comptable */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Équipe de l'agence comptable
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Enregistrez les membres permanents de l'équipe, puis cochez ceux qui participent à l'audit en cours.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {params.equipe.length > 0 && (
            <div className="space-y-2">
              {params.equipe.map(m => (
                <div key={m.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  m.isAuditeur ? 'border-primary bg-primary/5' : 'border-border bg-muted/30'
                }`}>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch
                      checked={!!m.isAuditeur}
                      onCheckedChange={() => toggleAuditeur(m.id)}
                      aria-label="Participe à l'audit"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{m.prenom} {m.nom}</p>
                      {m.isAuditeur && (
                        <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0">
                          Auditeur
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{m.fonction} {m.email && `· ${m.email}`} {m.telephone && `· ${m.telephone}`}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeMember(m.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {auditeurs.length > 0 && (
            <div className="flex items-center gap-2 p-2 rounded-md bg-primary/10 text-sm">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span className="font-medium">{auditeurs.length} auditeur{auditeurs.length > 1 ? 's' : ''} désigné{auditeurs.length > 1 ? 's' : ''} :</span>
              <span className="text-muted-foreground">{auditeurs.map(m => `${m.prenom} ${m.nom}`).join(', ')}</span>
            </div>
          )}

          <Separator />
          <p className="text-xs font-semibold text-muted-foreground">Ajouter un membre à l'équipe</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input placeholder="Nom" value={newMember.nom || ''} onChange={e => setNewMember(p => ({ ...p, nom: e.target.value }))} />
            <Input placeholder="Prénom" value={newMember.prenom || ''} onChange={e => setNewMember(p => ({ ...p, prenom: e.target.value }))} />
            <Input placeholder="Fonction" value={newMember.fonction || ''} onChange={e => setNewMember(p => ({ ...p, fonction: e.target.value }))} />
            <Input placeholder="Email" value={newMember.email || ''} onChange={e => setNewMember(p => ({ ...p, email: e.target.value }))} />
            <Input placeholder="Téléphone" value={newMember.telephone || ''} onChange={e => setNewMember(p => ({ ...p, telephone: e.target.value }))} />
            <Button onClick={addMember} className="bg-primary text-primary-foreground">
              <Plus className="h-4 w-4 mr-2" /> Ajouter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sélection des modules à auditer */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Modules à auditer
            <Badge variant="secondary" className="ml-auto text-xs">
              {modules.filter(m => m.enabled).length} / {modules.length} actifs
            </Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Cochez les modules qui feront l'objet de l'audit pour l'établissement sélectionné.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 mb-2">
            <Button size="sm" variant="outline" onClick={() => {
              const updated = modules.map(m => ({ ...m, enabled: true }));
              setModules(updated); saveModules(updated);
              toast.success('Tous les modules activés');
            }}>Tout cocher</Button>
            <Button size="sm" variant="outline" onClick={() => {
              const updated = modules.map(m => ({ ...m, enabled: false }));
              setModules(updated); saveModules(updated);
              toast.success('Tous les modules désactivés');
            }}>Tout décocher</Button>
          </div>
          {SECTIONS.filter(s => s !== 'AUDIT & RESTITUTION').map(section => {
            const sectionModules = modules.filter(m => m.section === section);
            if (sectionModules.length === 0) return null;
            return (
              <div key={section}>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{section}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {sectionModules.map(mod => (
                    <div
                      key={mod.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        mod.enabled ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                      }`}
                      onClick={() => {
                        const updated = modules.map(m => m.id === mod.id ? { ...m, enabled: !m.enabled } : m);
                        setModules(updated); saveModules(updated);
                      }}
                    >
                      <Checkbox checked={mod.enabled} />
                      <div>
                        <p className="text-sm font-medium">{mod.label}</p>
                        <p className="text-xs text-muted-foreground">{mod.section}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Separator className="mt-3" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <GDPRSettings />
    </div>
  );
}
