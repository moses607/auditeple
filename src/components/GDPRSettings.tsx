import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Download, Trash2, Loader2, Shield } from 'lucide-react';

export function GDPRSettings() {
  const { user, signOut } = useAuth();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleExportData = async () => {
    if (!user) return;
    setExporting(true);
    try {
      // Fetch profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const exportData = {
        exported_at: new Date().toISOString(),
        account: {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          last_sign_in: user.last_sign_in_at,
        },
        profile: profile || null,
        preferences: (() => {
          const prefs: Record<string, unknown> = {};
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('cic_expert_')) {
              try { prefs[key] = JSON.parse(localStorage.getItem(key)!); } catch { prefs[key] = localStorage.getItem(key); }
            }
          }
          return prefs;
        })(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cic-expert-pro-donnees-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Export terminé', description: 'Vos données ont été téléchargées.' });
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      // Delete profile (cascade will clean up)
      await supabase.from('profiles').delete().eq('user_id', user.id);

      // Clear all local data
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('cic_expert_')) keysToRemove.push(key);
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));

      // Sign out
      await signOut();
      toast({ title: 'Compte supprimé', description: 'Vos données ont été effacées.' });
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <CardTitle className="text-base">Données personnelles (RGPD)</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Gérez vos données conformément au Règlement Général sur la Protection des Données.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" size="sm" onClick={handleExportData} disabled={exporting} className="gap-2 text-xs">
            {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            Exporter mes données
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="gap-2 text-xs">
                <Trash2 className="h-3.5 w-3.5" />
                Supprimer mon compte
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer votre compte ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. Toutes vos données personnelles, votre profil
                  et vos préférences seront définitivement supprimés. Les données d'audit
                  liées à des obligations légales de conservation pourront être anonymisées
                  plutôt que supprimées.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {deleting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Confirmer la suppression
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <p className="text-xs text-muted-foreground">
          Nous recommandons d'exporter vos données avant toute suppression de compte.
        </p>
      </CardContent>
    </Card>
  );
}
