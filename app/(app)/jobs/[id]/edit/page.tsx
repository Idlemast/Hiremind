import { getJobById } from "@/lib/db";
import { updateJob } from "@/app/actions/jobs";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const jobId  = Number(id);
  const job    = await getJobById(jobId);
  if (!job) notFound();

  const requirements = (job.requirements as string[] | null) ?? [];

  async function action(formData: FormData) {
    "use server";
    await updateJob(jobId, formData);
  }

  return (
    <div className="p-4 lg:p-xl max-w-2xl mx-auto space-y-lg">
      <div className="flex items-center gap-3">
        <Link href={`/jobs/${id}`} className="text-slate-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <h2 className="font-h2 text-h2 text-primary">Modifier le poste</h2>
          <p className="text-body-sm text-slate-500 mt-0.5">{job.title}</p>
        </div>
      </div>

      <form action={action} className="space-y-lg">

        <div className="tonal-card rounded-xl p-lg space-y-md">
          <h3 className="font-h3 text-h3">Détails du poste</h3>

          <div className="space-y-xs">
            <label className="font-label-caps text-label-caps text-slate-500 uppercase block">Intitulé du poste *</label>
            <input
              type="text"
              name="title"
              required
              defaultValue={job.title}
              className="w-full border border-outline-variant rounded-lg px-3 py-2.5 text-body-sm text-on-surface bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            <div className="space-y-xs">
              <label className="font-label-caps text-label-caps text-slate-500 uppercase block">Département *</label>
              <input
                type="text"
                name="department"
                required
                defaultValue={job.department}
                className="w-full border border-outline-variant rounded-lg px-3 py-2.5 text-body-sm text-on-surface bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div className="space-y-xs">
              <label className="font-label-caps text-label-caps text-slate-500 uppercase block">Localisation *</label>
              <input
                type="text"
                name="location"
                required
                defaultValue={job.location}
                className="w-full border border-outline-variant rounded-lg px-3 py-2.5 text-body-sm text-on-surface bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-xs">
            <label className="font-label-caps text-label-caps text-slate-500 uppercase block">Budget salarial</label>
            <input
              type="text"
              name="budget"
              defaultValue={job.budget ?? ""}
              placeholder="ex. 55k€ – 70k€"
              className="w-full border border-outline-variant rounded-lg px-3 py-2.5 text-body-sm text-on-surface bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        <div className="tonal-card rounded-xl p-lg space-y-md">
          <h3 className="font-h3 text-h3">Exigences</h3>
          <p className="text-body-sm text-slate-500">
            Modifiez la liste de compétences requises. Si vous activez le re-scoring, tous les candidats existants seront recalculés.
          </p>
          <div className="space-y-xs">
            <label className="font-label-caps text-label-caps text-slate-500 uppercase block">
              Compétences requises (virgule-séparées)
            </label>
            <textarea
              name="requirements"
              rows={4}
              defaultValue={requirements.join(", ")}
              placeholder="React, TypeScript, System Design…"
              className="w-full border border-outline-variant rounded-lg px-3 py-2.5 text-body-sm text-on-surface bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="rescore"
              value="true"
              className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
            />
            <span className="text-body-sm text-on-surface">
              Recalculer le score de tous les candidats existants avec ces nouvelles exigences
            </span>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <Link
            href={`/jobs/${id}`}
            className="text-sm font-semibold text-slate-500 hover:text-on-surface transition-colors"
          >
            ← Annuler
          </Link>
          <button
            type="submit"
            className="bg-primary text-white px-8 py-3 rounded-lg font-semibold text-sm hover:bg-primary-container transition-colors shadow-md flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">save</span>
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
}
