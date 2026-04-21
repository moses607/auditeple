/**
 * CalculateurShell — coque commune à tous les calculateurs.
 * Fournit : titre, référence M9-6, bouton « valeurs test », export PDF/print, footer pédagogique.
 */
import { ReactNode, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, FlaskConical, BookOpen } from 'lucide-react';
import type { CalculateurMeta } from '@/lib/calculateurs';
import { useGroupements, useEtablissements } from '@/hooks/useGroupements';

interface Props {
  meta: CalculateurMeta;
  children: ReactNode;
  onLoadSample?: () => void;
}

export function CalculateurShell({ meta, children, onLoadSample }: Props) {
  const printRef = useRef<HTMLDivElement>(null);
  const { groupements, activeId } = useGroupements();
  const { etablissements } = useEtablissements(activeId);
  const grp = groupements.find(g => g.id === activeId);
  const etabAC = etablissements.find(e => e.est_agence_comptable) ?? etablissements[0];

  const handlePrint = () => {
    const node = printRef.current;
    if (!node) return window.print();
    const w = window.open('', '_blank', 'width=900,height=1200');
    if (!w) return window.print();
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map(n => n.outerHTML).join('\n');
    w.document.write(`<!doctype html><html><head><title>${meta.label}</title>${styles}
      <style>@media print{body{background:#fff!important}}@page{size:A4;margin:14mm}</style>
      </head><body class="bg-background text-foreground p-6">
      <header style="border-bottom:1px solid #ddd;margin-bottom:1rem;padding-bottom:.5rem">
        <h1 style="font-size:18px;margin:0">${meta.label}</h1>
        <p style="font-size:11px;color:#666;margin:2px 0">${meta.reference}</p>
        ${grp ? `<p style="font-size:11px;color:#444;margin:0">${grp.libelle}${etabAC ? ' — ' + etabAC.nom : ''}</p>` : ''}
      </header>${node.innerHTML}
      <footer style="margin-top:2rem;font-size:10px;color:#888;border-top:1px solid #ddd;padding-top:.5rem">
        Édité le ${new Date().toLocaleString('fr-FR')} — CIC Expert Pro</footer>
      </body></html>`);
    w.document.close(); w.focus(); setTimeout(() => { w.print(); }, 300);
  };

  const Icon = meta.icon;
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <CardTitle className="text-lg leading-tight">{meta.label}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">{meta.description}</p>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <Badge variant="outline" className="text-[10px] gap-1">
                <BookOpen className="h-2.5 w-2.5" /> {meta.reference}
              </Badge>
              <Badge variant="secondary" className="text-[10px]">{meta.categorie}</Badge>
              {meta.agentComptableOnly && (
                <Badge className="text-[10px] bg-amber-500/15 text-amber-700 border-amber-500/30 border">
                  Agent comptable uniquement
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 shrink-0">
          {onLoadSample && (
            <Button size="sm" variant="ghost" onClick={onLoadSample} className="h-7 text-xs">
              <FlaskConical className="h-3 w-3" /> Valeurs test
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={handlePrint} className="h-7 text-xs">
            <Printer className="h-3 w-3" /> PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div ref={printRef}>{children}</div>
      </CardContent>
    </Card>
  );
}
