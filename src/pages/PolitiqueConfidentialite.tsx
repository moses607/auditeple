import { NavLink } from '@/components/NavLink';
import { Shield, ArrowLeft } from 'lucide-react';

export default function PolitiqueConfidentialite() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <NavLink to="/" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </NavLink>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Politique de confidentialité
          </h1>
        </div>
      </div>

      <div className="prose prose-sm max-w-none text-foreground space-y-6">
        <p className="text-muted-foreground text-sm">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">1. Responsable du traitement</h2>
          <p className="text-sm text-muted-foreground">
            L'application CIC Expert Pro est un outil d'aide à l'audit comptable des établissements publics locaux d'enseignement (EPLE).
            Le responsable du traitement est l'agent comptable ou le service académique utilisateur de l'application.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">2. Données collectées</h2>
          <p className="text-sm text-muted-foreground">Nous collectons les données suivantes :</p>
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
            <li><strong>Données d'identification</strong> : nom, prénom, adresse email (lors de l'inscription)</li>
            <li><strong>Données de connexion</strong> : adresse IP, date et heure de connexion</li>
            <li><strong>Données d'audit</strong> : informations relatives aux établissements audités (UAI, données comptables, observations)</li>
            <li><strong>Données nominatives d'élèves</strong> : dans le cadre des vérifications des droits constatés, les noms des élèves peuvent être saisis temporairement</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">3. Finalités du traitement</h2>
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
            <li>Permettre l'authentification et la gestion des comptes utilisateurs</li>
            <li>Fournir les fonctionnalités d'audit comptable et de contrôle interne</li>
            <li>Sauvegarder les paramètres et préférences de l'utilisateur</li>
            <li>Assurer la sécurité et le bon fonctionnement de l'application</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">4. Base légale</h2>
          <p className="text-sm text-muted-foreground">
            Le traitement des données est fondé sur l'exécution d'une mission d'intérêt public (article 6.1.e du RGPD)
            et le consentement de l'utilisateur pour les cookies non essentiels (article 6.1.a du RGPD).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">5. Durée de conservation</h2>
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
            <li><strong>Données de compte</strong> : conservées tant que le compte est actif, supprimées dans les 30 jours après demande de suppression</li>
            <li><strong>Données d'audit</strong> : conservées pendant la durée de l'exercice comptable + 10 ans (obligations légales)</li>
            <li><strong>Données nominatives d'élèves</strong> : conservées uniquement le temps de l'audit, supprimées à la clôture</li>
            <li><strong>Cookies de session</strong> : durée de la session ou 30 jours maximum</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">6. Destinataires des données</h2>
          <p className="text-sm text-muted-foreground">
            Les données sont accessibles uniquement à l'utilisateur connecté. Aucune donnée n'est partagée avec des tiers
            à des fins commerciales ou publicitaires. L'hébergement est assuré par des serveurs sécurisés en Europe (RGPD compliant).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">7. Vos droits (RGPD)</h2>
          <p className="text-sm text-muted-foreground">Conformément au Règlement Général sur la Protection des Données, vous disposez des droits suivants :</p>
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
            <li><strong>Droit d'accès</strong> : obtenir une copie de vos données personnelles</li>
            <li><strong>Droit de rectification</strong> : corriger vos données inexactes</li>
            <li><strong>Droit à l'effacement</strong> : demander la suppression de votre compte et de vos données</li>
            <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré et lisible</li>
            <li><strong>Droit d'opposition</strong> : vous opposer au traitement de vos données</li>
            <li><strong>Droit à la limitation</strong> : demander la restriction du traitement</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Vous pouvez exercer ces droits depuis la page{' '}
            <NavLink to="/parametres" className="text-primary hover:underline">Paramètres</NavLink>{' '}
            de votre compte (export et suppression de données) ou en contactant le responsable du traitement.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">8. Cookies</h2>
          <p className="text-sm text-muted-foreground">
            L'application utilise exclusivement des cookies techniques nécessaires au fonctionnement :
          </p>
          <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
            <li><strong>Cookie de session</strong> : maintien de votre connexion sécurisée</li>
            <li><strong>Cookie de préférences</strong> : sauvegarde de vos choix d'affichage</li>
            <li><strong>Cookie de consentement</strong> : mémorisation de votre choix RGPD</li>
          </ul>
          <p className="text-sm text-muted-foreground">Aucun cookie de traçage ou publicitaire n'est utilisé.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">9. Sécurité</h2>
          <p className="text-sm text-muted-foreground">
            Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :
            chiffrement des communications (HTTPS), authentification sécurisée, politiques de sécurité au niveau des données (RLS),
            hébergement européen conforme au RGPD.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">10. Réclamation</h2>
          <p className="text-sm text-muted-foreground">
            Si vous estimez que le traitement de vos données n'est pas conforme, vous pouvez adresser une réclamation
            à la CNIL (Commission Nationale de l'Informatique et des Libertés) : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.cnil.fr</a>
          </p>
        </section>
      </div>
    </div>
  );
}
