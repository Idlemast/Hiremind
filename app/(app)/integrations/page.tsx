import Link from "next/link";
import { getIntegrations } from "@/lib/db";
import IntegrationCard from "@/components/integrations/IntegrationCard";

function relativeSync(date?: Date): string {
  if (!date) return "jamais";
  const minutes = Math.round((Date.now() - date.getTime()) / 60_000);
  if (minutes < 1)  return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  return `il y a ${Math.round(hours / 24)}j`;
}

export default async function IntegrationsPage() {
  const integrations = await getIntegrations();

  return (
    <div className="p-4 lg:p-xl space-y-xl">
      <div>
        <h2 className="font-h1 text-h1 text-on-surface">Intégrations</h2>
        <p className="text-body-sm text-slate-500 mt-1 max-w-2xl">
          Gérez la provenance de vos candidatures. HireMind fonctionne en mode standalone — aucune
          connexion API externe n'est réellement établie ; ces cartes reflètent un état local que vous contrôlez.
        </p>
      </div>

      <section className="space-y-md">
        <h3 className="font-label-caps text-label-caps text-secondary uppercase">Logiciels connectés (lecture seule)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          {integrations.map((i) => (
            <IntegrationCard
              key={i.id}
              id={i.id}
              name={i.name}
              description={i.description}
              active={i.active}
              lastSyncLabel={relativeSync(i.lastSyncAt)}
            />
          ))}
        </div>
      </section>

      <section className="space-y-md">
        <h3 className="font-label-caps text-label-caps text-secondary uppercase">Saisie directe</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          <Link
            href="/candidates/new"
            className="tonal-card rounded-xl p-lg flex items-center gap-3 hover:border-primary transition-colors"
          >
            <span className="material-symbols-outlined text-primary text-2xl">person_add</span>
            <div>
              <p className="font-h3 text-h3 text-on-surface">Ajouter un candidat</p>
              <p className="text-body-sm text-secondary">Formulaire manuel + CV texte, sans passer par un ATS.</p>
            </div>
          </Link>

          <div className="tonal-card rounded-xl p-lg flex items-center gap-3 opacity-60">
            <span className="material-symbols-outlined text-secondary text-2xl">extension</span>
            <div>
              <p className="font-h3 text-h3 text-on-surface">Extension navigateur</p>
              <p className="text-body-sm text-secondary">Capture de profil depuis LinkedIn/GitHub. Bientôt disponible.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
