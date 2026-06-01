import { getJobs } from "@/lib/db";
import { importCandidate } from "@/app/actions/candidates";

export default async function ImportCandidatePage() {
  const jobs = await getJobs();

  return (
    <div className="p-xl max-w-3xl mx-auto space-y-lg">
      <div>
        <h2 className="font-h2 text-h2 text-primary">Import Candidate</h2>
        <p className="text-body-sm text-slate-500 mt-1">
          Fill in the profile below. Paste the CV text to auto-extract skills, or enter them manually.
        </p>
      </div>

      <form action={importCandidate} className="space-y-lg">

        {/* Job selection */}
        <div className="tonal-card rounded-xl p-lg space-y-md">
          <h3 className="font-h3 text-h3 text-on-surface">Role</h3>

          <div className="space-y-xs">
            <label className="font-label-caps text-label-caps text-slate-500 uppercase block">
              Job Requisition *
            </label>
            <select
              name="jobId"
              required
              className="w-full border border-outline-variant rounded-lg px-3 py-2.5 text-body-sm text-on-surface bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">Select a job…</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} — {job.department}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Candidate info */}
        <div className="tonal-card rounded-xl p-lg space-y-md">
          <h3 className="font-h3 text-h3 text-on-surface">Profile</h3>

          <div className="grid grid-cols-2 gap-md">
            <Field label="Full Name *" name="name" placeholder="Marcus Holloway" required />
            <Field label="Email" name="email" placeholder="marcus@company.com" type="email" />
            <Field label="Current Role *" name="role" placeholder="Senior Product Designer" required />
            <Field label="Company *" name="company" placeholder="GlobalFin" required />
            <Field label="Location *" name="location" placeholder="San Francisco, CA" required />
            <Field label="Salary Range" name="salary" placeholder="$180k – $210k" />
            <div className="space-y-xs">
              <label className="font-label-caps text-label-caps text-slate-500 uppercase block">
                Source
              </label>
              <select
                name="source"
                className="w-full border border-outline-variant rounded-lg px-3 py-2.5 text-body-sm text-on-surface bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {["LinkedIn Recruiter", "Referral", "Indeed", "GitHub", "Glassdoor", "Manual"].map(
                  (s) => <option key={s} value={s}>{s}</option>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="tonal-card rounded-xl p-lg space-y-md">
          <h3 className="font-h3 text-h3 text-on-surface">Skills & CV</h3>
          <p className="text-body-sm text-slate-500">
            Enter skills manually <span className="font-semibold">and/or</span> paste the CV text — skills will be auto-extracted from the text and merged.
          </p>

          <div className="space-y-xs">
            <label className="font-label-caps text-label-caps text-slate-500 uppercase block">
              Skills (comma-separated)
            </label>
            <input
              type="text"
              name="skills"
              placeholder="React, TypeScript, System Design, Leadership…"
              className="w-full border border-outline-variant rounded-lg px-3 py-2.5 text-body-sm text-on-surface bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="space-y-xs">
            <label className="font-label-caps text-label-caps text-slate-500 uppercase block">
              CV Text (paste)
            </label>
            <textarea
              name="cvText"
              rows={10}
              placeholder="Paste the full CV or LinkedIn profile text here…&#10;&#10;Skills will be automatically extracted."
              className="w-full border border-outline-variant rounded-lg px-3 py-2.5 text-body-sm text-on-surface bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y font-mono text-xs"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between">
          <a
            href="/triage"
            className="text-sm font-semibold text-slate-500 hover:text-on-surface transition-colors"
          >
            ← Cancel
          </a>
          <button
            type="submit"
            className="bg-primary text-white px-8 py-3 rounded-lg font-semibold text-sm hover:bg-primary-container transition-colors shadow-md flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            Triage & Import
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label, name, placeholder, required, type = "text",
}: {
  label: string;
  name: string;
  placeholder: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <div className="space-y-xs">
      <label className="font-label-caps text-label-caps text-slate-500 uppercase block">
        {label}
      </label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        className="w-full border border-outline-variant rounded-lg px-3 py-2.5 text-body-sm text-on-surface bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
      />
    </div>
  );
}
