import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function MentionsLegalesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-16">
        <h1 className="t-heading">Mentions légales</h1>

        <div className="t-body mt-6 space-y-4 text-muted">
          <p>
            <strong className="text-fg">Éditeur du site.</strong> Plus Près —
            application web éditée à titre indépendant. Contact : via le formulaire de
            l&apos;application.
          </p>
          <p>
            <strong className="text-fg">Hébergement.</strong> Le service est hébergé par
            Vercel Inc. (440 N Barranca Ave #4133, Covina, CA 91723, États-Unis).
          </p>
          <p>
            <strong className="text-fg">Propriété intellectuelle.</strong> Les contenus
            proposés (textes, questions, interface) sont protégés. Toute reproduction
            sans autorisation est interdite.
          </p>
          <p>
            <strong className="text-fg">Responsabilité.</strong> Les réponses déposées
            dans l&apos;application restent la responsabilité de leurs auteurs.
          </p>
          <p className="t-small italic">
            Document à compléter (identité de l&apos;éditeur, SIRET, adresse) avant la
            mise en production publique.
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
