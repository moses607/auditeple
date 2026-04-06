import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LogEntry, fmtDate } from '@/lib/types';
import { loadState } from '@/lib/store';
import { ModulePageLayout } from '@/components/ModulePageLayout';

export default function PisteAudit() {
  const logs: LogEntry[] = loadState('piste_audit', []);
  const [search, setSearch] = useState('');

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
        { code: "Décret 2012-1246 art. 170", label: "CICF" },
        { code: "M9-6", label: "Traçabilité des contrôles" },
      ]}
    >

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold">{items.length}</p><p className="text-xs text-muted-foreground mt-0.5">Événements tracés</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold text-destructive">{items.filter(x => x.type === 'anomalie').length}</p><p className="text-xs text-muted-foreground mt-0.5">Anomalies</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-2xl font-bold text-green-600">{items.filter(x => x.type === 'controle').length}</p><p className="text-xs text-muted-foreground mt-0.5">Contrôles</p></CardContent></Card>
      </div>


      <div className="grid grid-cols-2 gap-3">

      <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." />

      {logs.length === 0 && <Card><CardContent className="py-12 text-center text-muted-foreground">Aucune action enregistrée. La piste d'audit se construit au fur et à mesure de l'utilisation de l'application.</CardContent></Card>}

      {filtered.length > 0 && (
        <Card><CardContent className="pt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>{filtered.slice(0, 200).map(l => (
              <tr key={l.id} className="border-b">
                <td className="p-2 font-mono text-xs">{l.timestamp}</td>
                <td className="p-2 font-bold">{l.utilisateur}</td>
                <td className="p-2"><Badge>{l.action}</Badge></td>
              </tr>
            ))}</tbody>
          </table>
        </CardContent></Card>
      )}
    </ModulePageLayout>
  );
}
