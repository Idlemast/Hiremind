import { getCandidateById } from "@/lib/db";
import { updateCandidate } from "@/app/actions/candidates";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function EditCandidatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id }    = await params;
  const candidate = await getCandidateById(Number(id));
  if (!candidate) notFound();

  const skills = (candidate.skills as string[] | null) ?? [];

  async function action(formData: FormData) {
    "use server";
    await updateCandidate(Number(id), formData);
  }

  return (
    <div className="p-4 lg:p-xl max-w-3xl mx-auto space-y-lg">
      <div className="flex items-center gap-3">
        <Link href={`/candidates/${id}`} className="text-slate-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <h2 className="font-h2 text-h2 text-primary">Modifier le candidat</h2>
          <p className="text-body-sm text-slate-500 mt-0.5">{candidate.name}</p>
        </div>
      </div>

      <form action={action} className="space-y-lg">

        <div className="tonal-card rounded-xl p-lg space-y-md">
          <h3 className="font-h3 text-h3">Profil</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            <Field label="Nom complet *"       name="name"     defaultValue={candidate.name}             required />
            <Field label="Email"               name="email"    defaultValue={candidate.email ?? ""}      type="email" />
            <Field label="Poste actuel *"      name="role"     defaultValue={candidate.role}             required />
            <Field label="Entreprise *"        name="company"  defaultValue={candidate.company}          required />
            <Field label="Localisation *"      name="location" defaultValue={candidate.location}         required />
            <Field label="Prétentions salariales" name="salary" defaultValue={candidate.salary ?? ""} placeholder="ex. 55k€ – 65k€" />
          </div>
        </div>

        <div className="tonal-card rounded-xl p-lg space-y-md">
          <h3 className="font-h3 text-h3">Compétences</h3>
          <p className="text-body-sm text-slate-500">
            Modifiez la liste de compétences (virgule-séparées). Le score sera recalculé automatiquement.
          </p>
          <div className="space-y-xs">
            <label className="font-label-caps text-label-caps text-slate-500 uppercase block">
              Compétences
            </label>
            <input
              type="text"
              name="skills"
              defaultValue={skills.join(", ")}
              placeholder="React, TypeScript, Leadership…"
              className="w-full border border-outline-variant rounded-lg px-3 py-2.5 text-body-sm text-on-surface bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div className="space-y-xs">
            <label className="font-label-caps text-label-caps text-slate-500 uppercase block">
              CV Text (optionnel — fusion avec les compétences ci-dessus)
            </label>
            <textarea
              name="cvText"
              rows={6}
              placeholder="Collez du texte CV pour extraire des compétences supplémentaires…"
              className="w-full border border-outline-variant rounded-lg px-3 py-2.5 text-body-sm text-on-surface bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y font-mono text-xs"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Link
            href={`/candidates/${id}`}
            className="text-sm font-semibold text-slate-500 hover:text-on-surface transition-colors"
          >
            ← Annuler
          </Link>
          <button
            type="submit"
            className="bg-primary text-white px-8 py-3 rounded-lg font-semibold text-sm hover:bg-primary-container transition-colors shadow-md flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">save</span>
            Enregistrer et recalculer
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label, name, defaultValue, required, type = "text", placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-xs">
      <label className="font-label-caps text-label-caps text-slate-500 uppercase block">{label}</label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="w-full border border-outline-variant rounded-lg px-3 py-2.5 text-body-sm text-on-surface bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
      />
    </div>
  );
}
