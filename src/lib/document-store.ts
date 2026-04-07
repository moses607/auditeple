// Stockage de documents (PDF, CSV) en base64 dans localStorage
const DOC_PREFIX = 'cic_expert_doc_';

export interface StoredDocument {
  id: string;
  nom: string;
  type: string;
  taille: number;
  date: string;
  base64: string;
  categorie: string;
}

export function saveDocument(doc: StoredDocument): void {
  try {
    localStorage.setItem(DOC_PREFIX + doc.id, JSON.stringify(doc));
  } catch { console.warn('Stockage document échoué (quota?)'); }
}

export function loadDocuments(categorie?: string): StoredDocument[] {
  const docs: StoredDocument[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(DOC_PREFIX)) continue;
    try {
      const doc = JSON.parse(localStorage.getItem(key)!) as StoredDocument;
      if (!categorie || doc.categorie === categorie) docs.push(doc);
    } catch {}
  }
  return docs.sort((a, b) => b.date.localeCompare(a.date));
}

export function deleteDocument(id: string): void {
  localStorage.removeItem(DOC_PREFIX + id);
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
