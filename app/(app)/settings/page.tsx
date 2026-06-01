import { getThresholds } from "@/lib/db";
import ThresholdForm from "@/components/ThresholdForm";

export default async function SettingsPage() {
  const thresholds = await getThresholds();

  return (
    <div className="p-xl max-w-3xl space-y-xl">
      <div>
        <h2 className="font-h1 text-h1 text-on-surface">Paramètres</h2>
        <p className="text-body-sm text-slate-500 mt-1">
          Configurez les seuils de qualification utilisés pour classer les candidats et générer les communications.
        </p>
      </div>

      <section className="space-y-md">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">tune</span>
          <h3 className="font-h3 text-h3">Seuils de qualification</h3>
        </div>
        <ThresholdForm
          defaultStrong={thresholds.strong}
          defaultMedium={thresholds.medium}
        />
      </section>
    </div>
  );
}
