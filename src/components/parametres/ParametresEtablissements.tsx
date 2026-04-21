/**
 * ParametresEtablissements — Onglet 2 : liste + CRUD des établissements
 * du groupement actif. Source unique de vérité pour TOUS les sélecteurs
 * d'établissement de l'application.
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Building2, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  useEtablissements, useGroupements, ETABLISSEMENT_TYPES,
  type EtablissementRow, type EtablissementType,
} from '@/hooks/useGroupements';
import { lookupUAI } from '@/lib/uai-lookup';

const empty = (gid: string): Omit<EtablissementRow, 'id'> => ({
  groupement_id: gid, type: 'EPLE', nom: '', uai: '', siret: null, code_budgetaire: null,
  adresse: null, code_postal: null, ville: null, telephone: null, email: null,
  est_agence_comptable: false, actif: true,
});

export function ParametresEtablissements() {
  const { activeId, groupements } = useGroupements();
  const { etablissements, loading, create, update, remove } = useEtablissements(activeId);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<EtablissementRow, 'id'>>(empty(activeId ?? ''));
  const [search, setSearch] = useState('');
  const [lookingUp, setLookingUp] = useState(false);

  const filtered = etablissements.filter(e =>
    !search || e.nom.toLowerCase().includes(search.toLowerCase()) || e.uai.toLowerCase().includes(search.toLowerCase()),
  );

  const submit = async () => {
    if (!activeId || !form.nom.trim() || !form.uai.trim()) return;
    const ok = editingId ? await update(editingId, form) : await create({ ...form, groupement_id: activeId });
    if (ok) { setOpen(false); setEditingId(null); setForm(empty(activeId)); }
  };

  const handleUaiLookup = async () => {
    const code = form.uai.trim().toUpperCase();
    if (!/^\d{7}[A-Z]$/.test(code)) return;
    setLookingUp(true);
    const result = await lookupUAI(code);
    if (result) {
      setForm(f => ({
        ...f,
        nom: result.nom || f.nom,
        ville: result.ville || f.ville,
        code_postal: result.codePostal || f.code_postal,
        adresse: result.adresse || f.adresse,
      }));
    }
    setLookingUp(false);
  };

  const startEdit = (e: EtablissementRow) => { setForm(e); setEditingId(e.id); setOpen(true); };
  const startCreate = () => { setForm(empty(activeId ?? '')); setEditingId(null); setOpen(true); };

  if (!activeId) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          Sélectionnez d'abord un groupement dans l'onglet « Mon groupement ».
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <CardTitle>Établissements du groupement</CardTitle>
            <CardDescription>
              EPLE, CFA, GRETA et budgets annexes rattachés.
              Ces données alimentent automatiquement tous les modules d'audit.
            </CardDescription>
          </div>
          <Button onClick={startCreate} disabled={!activeId}><Plus className="h-4 w-4 mr-2" />Ajouter</Button>
        </div>
        <div className="relative max-w-sm mt-3">
          <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
          <Input className="pl-8" placeholder="Rechercher par nom ou UAI…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? <p className="text-sm text-muted-foreground">Chargement…</p>
          : filtered.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
              <Building2 className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Aucun établissement.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(e => (
                <div key={e.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{e.nom}</span>
                      <Badge variant="outline" className="text-[10px]">{e.type}</Badge>
                      {e.est_agence_comptable && <Badge className="text-[10px] bg-primary">Agence comptable</Badge>}
                      {!e.actif && <Badge variant="secondary" className="text-[10px]">Inactif</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      UAI {e.uai}{e.ville ? ` · ${e.ville}` : ''}{e.code_postal ? ` ${e.code_postal}` : ''}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => startEdit(e)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => { if (confirm(`Supprimer ${e.nom} ?`)) remove(e.id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editingId ? 'Modifier' : 'Ajouter'} un établissement</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 grid grid-cols-[1fr_auto] gap-2 items-end">
              <div>
                <Label>UAI *</Label>
                <Input value={form.uai} onChange={e => setForm({ ...form, uai: e.target.value.toUpperCase() })} placeholder="ex. 9710038C" />
              </div>
              <Button variant="outline" onClick={handleUaiLookup} disabled={lookingUp}>
                {lookingUp ? '…' : 'Annuaire'}
              </Button>
            </div>
            <div className="col-span-2">
              <Label>Nom *</Label>
              <Input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as EtablissementType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ETABLISSEMENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Code budgétaire</Label>
              <Input value={form.code_budgetaire ?? ''} onChange={e => setForm({ ...form, code_budgetaire: e.target.value })} />
            </div>
            <div className="col-span-2">
              <Label>Adresse</Label>
              <Input value={form.adresse ?? ''} onChange={e => setForm({ ...form, adresse: e.target.value })} />
            </div>
            <div>
              <Label>Code postal</Label>
              <Input value={form.code_postal ?? ''} onChange={e => setForm({ ...form, code_postal: e.target.value })} />
            </div>
            <div>
              <Label>Ville</Label>
              <Input value={form.ville ?? ''} onChange={e => setForm({ ...form, ville: e.target.value })} />
            </div>
            <div>
              <Label>Téléphone</Label>
              <Input value={form.telephone ?? ''} onChange={e => setForm({ ...form, telephone: e.target.value })} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={form.email ?? ''} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <Label>SIRET</Label>
              <Input value={form.siret ?? ''} onChange={e => setForm({ ...form, siret: e.target.value })} />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch checked={form.est_agence_comptable} onCheckedChange={(v) => setForm({ ...form, est_agence_comptable: v })} />
              <Label>Agence comptable du groupement</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={submit}>{editingId ? 'Enregistrer' : 'Ajouter'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
