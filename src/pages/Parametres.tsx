import { useState } from 'react';
import { useAuditParams } from '@/hooks/useAuditStore';
import { TeamMember } from '@/lib/types';
import { lookupUAI, UAIResult } from '@/lib/uai-lookup';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Search, CheckCircle2, Loader2, AlertCircle, Building2 } from 'lucide-react';
import { toast } from 'sonner';

const TYPES_ETABLISSEMENT = [
  'Collège', 'Lycée général', 'Lycée professionnel', 'Lycée polyvalent',
  'EREA', 'ERPD', 'Campus des métiers',
];

export default function ParametresPage() {
  const { params, update } = useAuditParams();
  const [newMember, setNewMember] = useState<Partial<TeamMember>>({});
  const [uaiInput, setUaiInput] = useState(params.uai || '');
  const [searching, setSearching] = useState(false);
  const [lookupError, setLookupError] = useState('');

  const handleUAILookup = async () => {
    const code = uaiInput.trim().toUpperCase();
    if (!/^\d{7}[A-Z]$/.test(code)) {
      setLookupError('Format UAI invalide. Attendu : 7 chiffres + 1 lettre (ex: 0131234A)');
      return;
    }
    setSearching(true);
    setLookupError('');
    try {
      const result = await lookupUAI(code);
      if (result) {
        update({
          uai: result.uai,
          etablissement: result.nom,
          typeEtablissement: result.type,
          adresse: result.adresse,
          codePostal: result.codePostal,
          ville: result.ville,
          academie: result.academie,
        });
        toast.success(`Établissement trouvé : ${result.nom}`);
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
    };
    update({ equipe: [...params.equipe, member] });
    setNewMember({});
    toast.success('Membre ajouté');
  };

  const removeMember = (id: string) => {
    update({ equipe: params.equipe.filter(m => m.id !== id) });
    toast.success('Membre supprimé');
  };

  const clearEtablissement = () => {
    update({
      uai: '', etablissement: '', typeEtablissement: '',
      adresse: '', codePostal: '', ville: '', academie: '',
    });
    setUaiInput('');
    toast.success('Établissement réinitialisé');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Paramètres & Équipe</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Les données sont sauvegardées automatiquement dans votre navigateur.
        </p>
      </div>

      {/* Identification par UAI */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Identification de l'établissement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Code UAI (identifiant national unique)</Label>
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
                Rechercher
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Saisissez le numéro UAI puis cliquez sur Rechercher. L'établissement sera identifié automatiquement via l'annuaire national de l'éducation.
            </p>
            {lookupError && (
              <div className="flex items-center gap-2 text-sm text-destructive mt-1">
                <AlertCircle className="h-4 w-4" />
                {lookupError}
              </div>
            )}
          </div>

          {/* Establishment display card */}
          {params.etablissement && params.uai ? (
            <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-foreground">Établissement enregistré</span>
                </div>
                <Button variant="ghost" size="sm" onClick={clearEtablissement} className="text-xs text-muted-foreground">
                  Changer
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Nom :</span>
                  <span className="ml-2 font-medium">{params.etablissement}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">UAI :</span>
                  <span className="ml-2 font-mono font-medium">{params.uai}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Type :</span>
                  <span className="ml-2">{params.typeEtablissement || '—'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Académie :</span>
                  <span className="ml-2">{params.academie || '—'}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-muted-foreground">Adresse :</span>
                  <span className="ml-2">{params.adresse} {params.codePostal} {params.ville}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-4 text-center text-sm text-muted-foreground">
              Aucun établissement enregistré. Saisissez un code UAI ci-dessus pour commencer.
            </div>
          )}
        </CardContent>
      </Card>

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
            <Label>Ordonnateur</Label>
            <Input value={params.ordonnateur} onChange={e => update({ ordonnateur: e.target.value })} />
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

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Équipe d'audit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {params.equipe.length > 0 && (
            <div className="space-y-2">
              {params.equipe.map(m => (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-md bg-muted">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{m.prenom} {m.nom}</p>
                    <p className="text-xs text-muted-foreground">{m.fonction} {m.email && `· ${m.email}`}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeMember(m.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Separator />

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
    </div>
  );
}
