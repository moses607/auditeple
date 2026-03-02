import { useState } from 'react';
import { useAuditParams } from '@/hooks/useAuditStore';
import { TeamMember } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';

const TYPES_ETABLISSEMENT = [
  'Collège', 'Lycée général', 'Lycée professionnel', 'Lycée polyvalent',
  'EREA', 'ERPD', 'Campus des métiers',
];

export default function ParametresPage() {
  const { params, update } = useAuditParams();
  const [newMember, setNewMember] = useState<Partial<TeamMember>>({});

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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Paramètres & Équipe</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Les données sont sauvegardées automatiquement dans votre navigateur.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Établissement</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nom de l'établissement</Label>
            <Input value={params.etablissement} onChange={e => update({ etablissement: e.target.value })} placeholder="Lycée Victor Hugo" />
          </div>
          <div className="space-y-2">
            <Label>Code UAI</Label>
            <Input value={params.uai} onChange={e => update({ uai: e.target.value })} placeholder="0123456A" />
          </div>
          <div className="space-y-2">
            <Label>Type d'établissement</Label>
            <Select value={params.typeEtablissement} onValueChange={v => update({ typeEtablissement: v })}>
              <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
              <SelectContent>
                {TYPES_ETABLISSEMENT.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Académie</Label>
            <Input value={params.academie} onChange={e => update({ academie: e.target.value })} placeholder="Académie de..." />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label>Adresse</Label>
            <Input value={params.adresse} onChange={e => update({ adresse: e.target.value })} placeholder="Adresse complète" />
          </div>
          <div className="space-y-2">
            <Label>Ville</Label>
            <Input value={params.ville} onChange={e => update({ ville: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Code postal</Label>
            <Input value={params.codePostal} onChange={e => update({ codePostal: e.target.value })} />
          </div>
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
