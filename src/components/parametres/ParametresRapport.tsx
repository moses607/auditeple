/**
 * Onglet « Rapport & diffusion » dans Paramètres → Mon groupement.
 * Permet de définir : lycée siège, logo, signature AC, emails rectorat/CRC, seuil d'alerte.
 */
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Image as ImageIcon, Trash2, Save } from 'lucide-react';
import { useGroupements, useEtablissements } from '@/hooks/useGroupements';
import { uploadGroupementAsset, deleteGroupementAsset } from '@/hooks/useGroupementAssets';
import { toast } from 'sonner';

export function ParametresRapport() {
  const { groupements, activeId, updateGroupement } = useGroupements();
  const groupement = groupements.find(g => g.id === activeId);
  const { etablissements } = useEtablissements(activeId);
  const [form, setForm] = useState<any>({});
  const [uploading, setUploading] = useState<'logo' | 'signature' | null>(null);

  useEffect(() => { if (groupement) setForm(groupement); }, [groupement?.id]);

  if (!groupement) {
    return <p className="text-sm text-muted-foreground">Sélectionnez un groupement actif.</p>;
  }

  const handleUpload = async (file: File, kind: 'logo' | 'signature') => {
    if (!file || !activeId) return;
    setUploading(kind);
    try {
      const url = await uploadGroupementAsset(file, activeId, kind);
      const patch = kind === 'logo' ? { logo_url: url } : { signature_ac_url: url };
      await updateGroupement(activeId, patch);
      setForm({ ...form, ...patch });
      toast.success(kind === 'logo' ? 'Logo téléversé' : 'Signature téléversée');
    } catch (e: any) {
      toast.error('Upload impossible : ' + e.message);
    } finally {
      setUploading(null);
    }
  };

  const handleRemoveAsset = async (kind: 'logo' | 'signature') => {
    const url = kind === 'logo' ? form.logo_url : form.signature_ac_url;
    if (url) await deleteGroupementAsset(url);
    const patch = kind === 'logo' ? { logo_url: null } : { signature_ac_url: null };
    await updateGroupement(activeId!, patch);
    setForm({ ...form, ...patch });
  };

  const save = async () => {
    await updateGroupement(activeId!, {
      lycee_siege_id: form.lycee_siege_id ?? null,
      devise: form.devise ?? 'Liberté · Égalité · Fraternité',
      email_rectorat_daf: form.email_rectorat_daf ?? null,
      email_rectorat_inspection: form.email_rectorat_inspection ?? null,
      email_crc: form.email_crc ?? null,
      seuil_alerte_score: form.seuil_alerte_score ?? 60,
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Rapport de maturité — Identité officielle</CardTitle>
          <CardDescription>
            Ces éléments alimentent automatiquement la page de garde du PDF officiel.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <Label>République Française</Label>
              <Input value="République Française" disabled />
            </div>
            <div>
              <Label>Académie</Label>
              <Input value={groupement.academie} disabled />
            </div>
          </div>
          <div>
            <Label>Devise (pied de page)</Label>
            <Input value={form.devise ?? 'Liberté · Égalité · Fraternité'} onChange={e => setForm({ ...form, devise: e.target.value })} />
          </div>
          <div>
            <Label>Lycée siège du groupement</Label>
            <select className="w-full border rounded-md p-2 text-sm" value={form.lycee_siege_id ?? ''} onChange={e => setForm({ ...form, lycee_siege_id: e.target.value || null })}>
              <option value="">— Sélectionnez —</option>
              {etablissements.map(e => <option key={e.id} value={e.id}>{e.uai} — {e.nom}</option>)}
            </select>
          </div>

          {/* Upload logo */}
          <div className="border-2 border-dashed rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <Label className="text-base">Logo du lycée siège</Label>
                <p className="text-xs text-muted-foreground mt-1">PNG / JPG / SVG · 300 dpi recommandé · fond transparent de préférence</p>
              </div>
              {form.logo_url && <Button size="sm" variant="ghost" onClick={() => handleRemoveAsset('logo')}><Trash2 className="h-3 w-3" /></Button>}
            </div>
            {form.logo_url ? (
              <div className="mt-3 flex items-center gap-3">
                <img src={form.logo_url} alt="Logo" className="h-20 w-20 object-contain border rounded bg-white p-1" />
                <Badge variant="secondary">Téléversé ✓</Badge>
              </div>
            ) : (
              <label className="mt-3 flex items-center justify-center gap-2 border rounded-md p-6 cursor-pointer hover:bg-muted/50">
                <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], 'logo')} />
                <Upload className="h-4 w-4" />
                <span className="text-sm">{uploading === 'logo' ? 'Téléversement…' : 'Glisser ou cliquer pour téléverser'}</span>
              </label>
            )}
          </div>

          {/* Upload signature */}
          <div className="border-2 border-dashed rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <Label className="text-base">Signature scannée de l'agent comptable</Label>
                <p className="text-xs text-muted-foreground mt-1">PNG transparent recommandé · apposée sur la page synthèse</p>
              </div>
              {form.signature_ac_url && <Button size="sm" variant="ghost" onClick={() => handleRemoveAsset('signature')}><Trash2 className="h-3 w-3" /></Button>}
            </div>
            {form.signature_ac_url ? (
              <img src={form.signature_ac_url} alt="Signature" className="h-16 mt-3 object-contain border rounded bg-white p-1" />
            ) : (
              <label className="mt-3 flex items-center justify-center gap-2 border rounded-md p-6 cursor-pointer hover:bg-muted/50">
                <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], 'signature')} />
                <ImageIcon className="h-4 w-4" />
                <span className="text-sm">{uploading === 'signature' ? 'Téléversement…' : 'Téléverser une signature'}</span>
              </label>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Destinataires institutionnels</CardTitle>
          <CardDescription>Pré-remplis dans l'écran de diffusion du rapport.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Email Rectorat — DAF</Label>
            <Input type="email" value={form.email_rectorat_daf ?? ''} onChange={e => setForm({ ...form, email_rectorat_daf: e.target.value })} />
          </div>
          <div>
            <Label>Email Rectorat — Corps d'inspection</Label>
            <Input type="email" value={form.email_rectorat_inspection ?? ''} onChange={e => setForm({ ...form, email_rectorat_inspection: e.target.value })} />
          </div>
          <div>
            <Label>Email Chambre régionale des comptes</Label>
            <Input type="email" value={form.email_crc ?? ''} onChange={e => setForm({ ...form, email_crc: e.target.value })} />
          </div>
          <div>
            <Label>Seuil d'alerte sur score CICF</Label>
            <Input type="number" min={0} max={100} value={form.seuil_alerte_score ?? 60} onChange={e => setForm({ ...form, seuil_alerte_score: parseInt(e.target.value) || 60 })} />
            <p className="text-xs text-muted-foreground mt-1">Une alerte se déclenche dès que le score consolidé passe sous ce seuil.</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save}><Save className="h-4 w-4 mr-2" /> Enregistrer</Button>
      </div>
    </div>
  );
}
