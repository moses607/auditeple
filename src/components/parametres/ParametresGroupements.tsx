/**
 * ParametresGroupements — Onglet 1 : « Mon groupement »
 * Gestion du/des groupement(s) comptable(s) de l'utilisateur.
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, CheckCircle2, Building, Trash2 } from 'lucide-react';
import { useGroupements, type Groupement } from '@/hooks/useGroupements';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';

export function ParametresGroupements() {
  const { groupements, activeId, loading, createGroupement, updateGroupement, deleteGroupement, setActive } = useGroupements();
  const [openCreate, setOpenCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Groupement>>({ academie: 'Guadeloupe' });

  const handleSubmit = async () => {
    if (!form.libelle?.trim()) return;
    if (editingId) {
      await updateGroupement(editingId, form);
      setEditingId(null);
    } else {
      await createGroupement({
        libelle: form.libelle,
        academie: form.academie ?? 'Guadeloupe',
        siege: form.siege ?? null,
        email_agent_comptable: form.email_agent_comptable ?? null,
        telephone: form.telephone ?? null,
        logo_url: form.logo_url ?? null,
        couleur_principale: form.couleur_principale ?? '#1e40af',
      });
    }
    setForm({ academie: 'Guadeloupe' });
    setOpenCreate(false);
  };

  const editGroupement = (g: Groupement) => {
    setForm(g);
    setEditingId(g.id);
    setOpenCreate(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Mes groupements comptables</CardTitle>
            <CardDescription>
              Un groupement = une agence comptable couvrant plusieurs EPLE / CFA / GRETA.
              L'application est conçue multi-groupements dès l'origine (M9-6 § 1.2).
            </CardDescription>
          </div>
          <Dialog open={openCreate} onOpenChange={(o) => { setOpenCreate(o); if (!o) { setEditingId(null); setForm({ academie: 'Guadeloupe' }); } }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Nouveau groupement</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? 'Modifier' : 'Créer'} un groupement comptable</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Libellé *</Label>
                  <Input value={form.libelle ?? ''} onChange={e => setForm({ ...form, libelle: e.target.value })}
                    placeholder="ex. Groupement Pointe-à-Pitre" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Académie</Label>
                    <Input value={form.academie ?? ''} onChange={e => setForm({ ...form, academie: e.target.value })} />
                  </div>
                  <div>
                    <Label>Couleur</Label>
                    <Input type="color" value={form.couleur_principale ?? '#1e40af'} onChange={e => setForm({ ...form, couleur_principale: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label>Siège</Label>
                  <Input value={form.siege ?? ''} onChange={e => setForm({ ...form, siege: e.target.value })} placeholder="Adresse de l'agence comptable" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Email AC</Label>
                    <Input type="email" value={form.email_agent_comptable ?? ''} onChange={e => setForm({ ...form, email_agent_comptable: e.target.value })} />
                  </div>
                  <div>
                    <Label>Téléphone</Label>
                    <Input value={form.telephone ?? ''} onChange={e => setForm({ ...form, telephone: e.target.value })} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpenCreate(false)}>Annuler</Button>
                <Button onClick={handleSubmit}>{editingId ? 'Enregistrer' : 'Créer'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : groupements.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <Building className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-3">Aucun groupement configuré.</p>
              <p className="text-xs text-muted-foreground">Créez votre premier groupement pour démarrer.</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {groupements.map(g => (
                <div key={g.id}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${activeId === g.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                  onClick={() => setActive(g.id)}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ background: g.couleur_principale ?? '#1e40af' }} />
                      <h4 className="font-semibold">{g.libelle}</h4>
                    </div>
                    {activeId === g.id && <Badge variant="default" className="text-[10px]"><CheckCircle2 className="h-3 w-3 mr-1" />Actif</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">Académie : {g.academie}</p>
                  {g.email_agent_comptable && <p className="text-xs text-muted-foreground">{g.email_agent_comptable}</p>}
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); editGroupement(g); }}>
                      Modifier
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive hover:text-destructive" onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Supprimer définitivement le groupement « ${g.libelle} » ?\n\nCette action est irréversible et supprimera tous les établissements et agents rattachés.`)) {
                        deleteGroupement(g.id);
                      }
                    }}>
                      <Trash2 className="h-3 w-3 mr-1" />Supprimer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
