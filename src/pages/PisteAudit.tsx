import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Download } from 'lucide-react';
import { LogEntry } from '@/lib/types';
import { loadState, saveState } from '@/lib/store';
import { ModulePageLayout } from '@/components/ModulePageLayout';
import { useAuditParams } from '@/hooks/useAuditStore';
import { getSelectedEtablissement } from '@/lib/types';

const ACTION_TYPES = ['Contrôle effectué', 'Anomalie relevée', 'Action corrective', 'Document vérifié', 'Observation', 'Suspension de paiement', 'Irrégularité constatée'];
const SEVERITY_COLORS: Record<string, 'destructive' | 'default' | 'secondary'> = {
  'Anomalie relevée': 'destructive',
  'Irrégularité constatée': 'destructive',
  'Suspension de paiement': 'destructive',
  'Action corrective': 'default',
  'Contrôle effectué': 'secondary',
  'Document vérifié': 'secondary',
  'Observation': 'secondary',
};

export default function PisteAudit() {
  const { params } = useAuditParams();
  const etab = getSelectedEtablissement(params);
  const [logs, setLogs] = useState<LogEntry[]>(() => loadState('piste_audit', []));
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ action: ACTION_TYPES[0], details: '', utilisateur: etab?.nom || '', module: '' });

  const saveLogs = (d: LogEntry[]) => { setLogs(d); saveState('piste_audit', d); };

  const submit = () => {
    if (!form.details.trim()) return;
    const entry: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      action: form.action,
      details: form.details,
      utilisateur: form.utilisateur || 'Agent comptable',
      module: form.module,
    };
    saveLogs([entry, ...logs]);
    setForm({ ...form, details: '', module: '' });
    setShowForm(false);
  };

  const exportCSV = () => {
    const rows = [['Date', 'Utilisateur', 'Action', 'Module', 'Détails'], ...logs.map(l => [l.timestamp, l.utilisateur, l.action, l.module || '', l.details])];
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `piste-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const anomalies = logs.filter(l => ['Anomalie relevée', 'Irrégularité constatée', 'Suspension de paiement'].includes(l.action));
  const filtered = logs.filter(l => {
    if (!search) return true;
    const s = search.toLowerCase();
    return l.action.toLowerCase().includes(s) || l.details.toLowerCase().includes(s) || l.utilisateur.toLowerCase().includes(s);
  });

  return (
    <ModulePageLayout
      title="Piste d'audit"
      section="AUDIT & RESTITUTION"
      description="Journal chronologique des opérations d'audit : contrôles effectués, anomalies relevées et actions correctives. Traçabilité complète pour le PV contradictoire."
      refs={[
        { code: 'Décret 2012-1246 art. 170', label: 'CICF' },
        { code: 'M9-6', label: 'Traçabilité des contrôles' },
      ]}
      headerActions={
        <div className="flex gap-2">
          <Button
            className="bg-white/20 hover:bg-white/30 text-white border-white/25"
            variant="outline"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus className="h-4 w-4 mr-2" /> Nouvelle entrée
          </Button>
          {logs.length > 0 && (
            <Button
              className="bg-white/20 hover:bg-white/30 text-white border-white/25"
              variant="outline"
              onClick={exportCSV}
            >
              <Download className="h-4 w-4 mr-2" /> Export CSV
            </Button>
          )}
        </div>
      }
    >
      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{logs.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Événements tracés</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <p className={`text-2xl font-bold ${anomalies.length > 0 ? 'text-destructive' : 'text-green-600'}`}>{anomalies.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Anomalies / irrégularités</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{logs.filter(l => l.action === 'Action corrective').length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Actions correctives</p>
          </CardContent>
        </Card>
      </div>

      {/* Formulaire de saisie */}
      {showForm && (
        <Card className="border-primary shadow-card-hover">
          <CardContent className="pt-6 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Type d'action</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.action} onChange={e => setForm({ ...form, action: e.target.value })}>
                  {ACTION_TYPES.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Module concerné</Label>
                <Input value={form.module} onChange={e => setForm({ ...form, module: e.target.value })} placeholder="Ex: Régies, Marchés..." />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Auditeur</Label>
                <Input value={form.utilisateur} onChange={e => setForm({ ...form, utilisateur: e.target.value })} placeholder="Nom de l'agent comptable" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Détails *</Label>
              <Input value={form.details} onChange={e => setForm({ ...form, details: e.target.value })} placeholder="Décrire le contrôle effectué, l'anomalie relevée ou l'action corrective..." />
            </div>
            <div className="flex gap-2">
              <Button onClick={submit}>Enregistrer</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher dans la piste d'audit..." />

      {logs.length === 0 && !showForm && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Aucune action enregistrée. Utilisez « Nouvelle entrée » pour alimenter la piste d'audit.
          </CardContent>
        </Card>
      )}

      {filtered.length > 0 && (
        <Card>
          <CardContent className="pt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Auditeur</th>
                  <th className="p-2">Action</th>
                  <th className="text-left p-2">Module</th>
                  <th className="text-left p-2">Détails</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 200).map(l => (
                  <tr key={l.id} className="border-b">
                    <td className="p-2 font-mono text-xs">{new Date(l.timestamp).toLocaleString('fr-FR')}</td>
                    <td className="p-2 font-bold">{l.utilisateur}</td>
                    <td className="p-2"><Badge variant={SEVERITY_COLORS[l.action] || 'secondary'}>{l.action}</Badge></td>
                    <td className="p-2 text-xs">{l.module || '—'}</td>
                    <td className="p-2 text-xs">{l.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </ModulePageLayout>
  );
}
