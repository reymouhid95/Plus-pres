import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function ConfidentialitePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-16">
        <h1 className="t-heading">Politique de confidentialité</h1>

        <div className="t-body mt-6 space-y-4 text-muted">
          <p>
            <strong className="text-fg">Données collectées.</strong> L&apos;application
            stocke votre adresse e-mail, votre pseudo, vos réponses, les moments
            sauvegardés et les défis de votre duo.
          </p>
          <p>
            <strong className="text-fg">Finalité.</strong> Ces données servent
            uniquement à faire fonctionner le jeu, votre historique et vos statistiques.
            Elles ne sont ni vendues, ni utilisées à des fins publicitaires.
          </p>
          <p>
            <strong className="text-fg">Conservation.</strong> Les données sont conservées
            tant que votre compte est actif. Vous pouvez demander leur suppression via
            l&apos;application.
          </p>
          <p>
            <strong className="text-fg">Cookies.</strong> Un cookie de session est utilisé
            pour vous maintenir connecté. Aucun cookie de suivi publicitaire.
          </p>
          <p>
            <strong className="text-fg">Vos droits.</strong> Conformément au RGPD, vous
            disposez d&apos;un droit d&apos;accès, de rectification et de suppression de
            vos données.
          </p>
          <p className="t-small italic">
            Document à valider juridiquement avant la mise en production publique.
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
