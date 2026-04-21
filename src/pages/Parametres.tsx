/**
 * Page « Paramètres » — refonte multi-groupements (Chantier 2).
 *
 * 4 onglets :
 *  1. Mon groupement       → groupements_comptables (Supabase)
 *  2. Établissements       → etablissements (Supabase, source unique de vérité)
 *  3. Agents               → agents (Supabase, source unique de vérité)
 *  4. Préférences (legacy) → ancienne page localStorage (équipe, modules, RGPD)
 */
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ParametresGroupements } from '@/components/parametres/ParametresGroupements';
import { ParametresEtablissements } from '@/components/parametres/ParametresEtablissements';
import { ParametresAgents } from '@/components/parametres/ParametresAgents';
import { Building, Users, Settings as SettingsIcon, Building2 } from 'lucide-react';
import { ModulePageLayout } from '@/components/ModulePageLayout';
import { GDPRSettings } from '@/components/GDPRSettings';

export default function ParametresPage() {
  return (
    <ModulePageLayout
      title="Paramètres"
      icon={SettingsIcon}
      description="Gérez votre groupement comptable, vos établissements et vos agents. Ces données alimentent automatiquement tous les modules de l'application (zéro double saisie)."
    >
      <Tabs defaultValue="groupement" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-3xl">
          <TabsTrigger value="groupement"><Building className="h-4 w-4 mr-2" />Mon groupement</TabsTrigger>
          <TabsTrigger value="etablissements"><Building2 className="h-4 w-4 mr-2" />Établissements</TabsTrigger>
          <TabsTrigger value="agents"><Users className="h-4 w-4 mr-2" />Agents</TabsTrigger>
          <TabsTrigger value="preferences"><SettingsIcon className="h-4 w-4 mr-2" />Préférences</TabsTrigger>
        </TabsList>

        <TabsContent value="groupement"><ParametresGroupements /></TabsContent>
        <TabsContent value="etablissements"><ParametresEtablissements /></TabsContent>
        <TabsContent value="agents"><ParametresAgents /></TabsContent>
        <TabsContent value="preferences">
          <GDPRSettings />
        </TabsContent>
      </Tabs>
    </ModulePageLayout>
  );
}
