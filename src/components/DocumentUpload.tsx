import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Trash2, FileText, Eye } from 'lucide-react';
import { StoredDocument, saveDocument, loadDocuments, deleteDocument, fileToBase64 } from '@/lib/document-store';
import { toast } from 'sonner';

interface Props {
  categorie: string;
  label: string;
  acceptedTypes?: string;
  maxSizeMB?: number;
}

export function DocumentUpload({ categorie, label, acceptedTypes = '.pdf,.csv,.xlsx,.xls', maxSizeMB = 5 }: Props) {
  const [docs, setDocs] = useState<StoredDocument[]>(() => loadDocuments(categorie));
  const [uploading, setUploading] = useState(false);

  const refresh = () => setDocs(loadDocuments(categorie));

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Fichier trop lourd (max ${maxSizeMB} Mo)`);
      return;
    }
    setUploading(true);
    try {
      const base64 = await fileToBase64(file);
      const doc: StoredDocument = {
        id: crypto.randomUUID(),
        nom: file.name,
        type: file.type,
        taille: file.size,
        date: new Date().toISOString(),
        base64,
        categorie,
      };
      saveDocument(doc);
      refresh();
      toast.success(`"${file.name}" enregistré`);
    } catch { toast.error('Erreur lors du chargement'); }
    finally { setUploading(false); e.target.value = ''; }
  };

  const handleDelete = (id: string, nom: string) => {
    deleteDocument(id);
    refresh();
    toast.success(`"${nom}" supprimé`);
  };

  const handleView = (doc: StoredDocument) => {
    const a = document.createElement('a');
    a.href = doc.base64;
    a.download = doc.nom;
    a.click();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="cursor-pointer">
          <input type="file" accept={acceptedTypes} onChange={handleUpload} className="hidden" />
          <Button type="button" variant="outline" size="sm" className="gap-2 text-xs pointer-events-none" tabIndex={-1}>
            <Upload className="h-3.5 w-3.5" />
            {uploading ? 'Chargement...' : label}
          </Button>
        </label>
        <span className="text-[10px] text-muted-foreground">PDF, CSV, Excel — max {maxSizeMB} Mo</span>
      </div>

      {docs.length > 0 && (
        <div className="space-y-1">
          {docs.map(doc => (
            <div key={doc.id} className="flex items-center gap-2 p-2 rounded-md bg-muted/50 text-xs">
              <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="font-medium truncate flex-1">{doc.nom}</span>
              <Badge variant="secondary" className="text-[10px]">{(doc.taille / 1024).toFixed(0)} Ko</Badge>
              <span className="text-muted-foreground">{new Date(doc.date).toLocaleDateString('fr-FR')}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleView(doc)} title="Télécharger"><Eye className="h-3 w-3" /></Button>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDelete(doc.id, doc.nom)}><Trash2 className="h-3 w-3" /></Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
