/**
 * ParametresAgents — Onglet 3 : annuaire des agents du groupement.
 * Source unique alimentant : organigramme, plan d'action, PV signataires,
 * fiches de contrôle (régisseur, magasinier, chef de cuisine…).
 */
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Users, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  useAgents, useEtablissements, useGroupements, AGENT_ROLES,
  type AgentRow, type AgentRole, getRoleLabel,
} from '@/hooks/useGroupements';

const empty = (gid: string): Omit<AgentRow, 'id'> => ({
  groupement_id: gid, etablissement_id: null, role: 'agent_comptable',
  civilite: 'M.', nom: '', prenom: '', email: null, telephone: null,
  date_prise_fonction: null, delegation_signature: false, signature_url: null,
  actif: true, notes: null,
});

export function ParametresAgents() {
  const { activeId } = useGroupements();
  const { agents, loading, create, update, remove } = useAgents(activeId);
  const { etablissements } = useEtablissements(activeId);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<AgentRow, 'id'>>(empty(activeId ?? ''));
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterEtab, setFilterEtab] = useState<string>('all');

  const filtered = useMemo(() => agents.filter(a => {
    if (search && !`${a.prenom} ${a.nom} ${a.email ?? ''}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterRole !== 'all' && a.role !== filterRole) return false;
    if (filterEtab !== 'all' && a.etablissement_id !== filterEtab) return false;
    return true;
  }), [agents, search, filterRole, filterEtab]);

  const submit = async () => {
    if (!activeId || !form.nom.trim() || !form.prenom.trim()) return;
    const ok = editingId ? await update(editingId, form) : await create({ ...form, groupement_id: activeId });
    if (ok) { setOpen(false); setEditingId(null); setForm(empty(activeId)); }
  };

  const startEdit = (a: AgentRow) => { setForm(a); setEditingId(a.id); setOpen(true); };
  const startCreate = () => { setForm(empty(activeId ?? '')); setEditingId(null); setOpen(true); };

  if (!activeId) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          Sélectionnez d'abord un groupement.
        </CardContent>
      </Card>
    );
  }

  const etablissementName = (id: string | null) => id ? etablissements.find(e => e.id === id)?.nom ?? '—' : 'Tous les établissements';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <CardTitle>Annuaire des agents</CardTitle>
            <CardDescription>
              Source unique : ces noms apparaissent automatiquement dans l'organigramme,
              les PV, le plan d'action et les fiches de contrôle. Zéro double saisie.
            </CardDescription>
          </div>
          <Button onClick={startCreate}><Plus className="h-4 w-4 mr-2" />Nouvel agent</Button>
        </div>
        <div className="grid md:grid-cols-3 gap-2 mt-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input className="pl-8" placeholder="Recherche nom / email…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger><SelectValue placeholder="Filtrer par rôle" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les rôles</SelectItem>
              {AGENT_ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterEtab} onValueChange={setFilterEtab}>
            <SelectTrigger><SelectValue placeholder="Filtrer par établissement" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les établissements</SelectItem>
              {etablissements.map(e => <SelectItem key={e.id} value={e.id}>{e.nom}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? <p className="text-sm text-muted-foreground">Chargement…</p>
          : filtered.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
              <Users className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Aucun agent.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(a => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{a.civilite} {a.prenom} {a.nom}</span>
                      <Badge variant="outline" className="text-[10px]">{getRoleLabel(a.role)}</Badge>
                      {a.delegation_signature && <Badge className="text-[10px]">Délég. signature</Badge>}
                      {!a.actif && <Badge variant="secondary" className="text-[10px]">Inactif</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {etablissementName(a.etablissement_id)}{a.email ? ` · ${a.email}` : ''}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => startEdit(a)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => { if (confirm(`Supprimer ${a.prenom} ${a.nom} ?`)) remove(a.id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editingId ? 'Modifier' : 'Ajouter'} un agent</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Civilité</Label>
              <Select value={form.civilite ?? 'M.'} onValueChange={v => setForm({ ...form, civilite: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="M.">M.</SelectItem>
                  <SelectItem value="Mme">Mme</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Rôle *</Label>
              <Select value={form.role} onValueChange={v => setForm({ ...form, role: v as AgentRole })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AGENT_ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Prénom *</Label>
              <Input value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} />
            </div>
            <div>
              <Label>Nom *</Label>
              <Input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={form.email ?? ''} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <Label>Téléphone</Label>
              <Input value={form.telephone ?? ''} onChange={e => setForm({ ...form, telephone: e.target.value })} />
            </div>
            <div className="col-span-2">
              <Label>Établissement de rattachement</Label>
              <Select value={form.etablissement_id ?? '__all__'} onValueChange={v => setForm({ ...form, etablissement_id: v === '__all__' ? null : v })}>
                <SelectTrigger><SelectValue placeholder="Choisir un établissement" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Tous les établissements (ex. AC du groupement)</SelectItem>
                  {etablissements.map(e => <SelectItem key={e.id} value={e.id}>{e.nom}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date prise de fonction</Label>
              <Input type="date" value={form.date_prise_fonction ?? ''} onChange={e => setForm({ ...form, date_prise_fonction: e.target.value || null })} />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch checked={form.delegation_signature} onCheckedChange={v => setForm({ ...form, delegation_signature: v })} />
              <Label>Délégation de signature</Label>
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
