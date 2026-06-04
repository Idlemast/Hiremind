"use client";

import { useState, useTransition } from "react";
import { createJob } from "@/app/actions/jobs";
import { deleteTemplate } from "@/app/actions/templates";
import JobUrlImporter from "@/components/jobs/JobUrlImporter";
import type { JobPreview } from "@/app/api/jobs/preview/route";
import { DEFAULT_STAGES, type PlainTemplate } from "@/lib/stages";
import PipelineEditor from "@/components/jobs/PipelineEditor";

const ICON_OPTIONS = [
  { value: "code",            label: "Code",      bg: "bg-blue-50 text-blue-600" },
  { value: "palette",         label: "Design",    bg: "bg-purple-50 text-purple-600" },
  { value: "campaign",        label: "Marketing", bg: "bg-orange-50 text-orange-600" },
  { value: "bar_chart",       label: "Data",      bg: "bg-teal-50 text-teal-600" },
  { value: "group",           label: "People",    bg: "bg-emerald-50 text-emerald-600" },
  { value: "storefront",      label: "Sales",     bg: "bg-yellow-50 text-yellow-600" },
  { value: "account_balance", label: "Finance",   bg: "bg-indigo-50 text-indigo-600" },
  { value: "work",            label: "Other",     bg: "bg-slate-50 text-slate-600" },
];

type Fields = Partial<JobPreview> & { icon?: string; iconBg?: string };

export default function NewJobForm({
  templates,
  preselectedTemplateId,
}: {
  templates: PlainTemplate[];
  preselectedTemplateId?: number;
}) {
  const preselected = preselectedTemplateId
    ? templates.find((t) => t.id === preselectedTemplateId) ?? null
    : null;

  const [fields, setFields] = useState<Fields>(
    preselected
      ? {
          title:        preselected.title,
          department:   preselected.department,
          location:     preselected.location,
          requirements: preselected.requirements.join(", "),
        }
      : {}
  );
  const [selectedIcon, setSelectedIcon] = useState(
    preselected
      ? (ICON_OPTIONS.find((o) => o.value === preselected.icon)?.value ?? ICON_OPTIONS[0].value)
      : ICON_OPTIONS[0].value
  );
  const [activeTemplate, setActiveTemplate] = useState<number | null>(preselected?.id ?? null);
  const [templateList, setTemplateList]     = useState(templates);
  const [stages, setStages] = useState<string[]>(
    preselected
      ? (preselected.stages.length ? preselected.stages : DEFAULT_STAGES)
      : DEFAULT_STAGES
  );
  const [deletePending, startDelete] = useTransition();

  function applyTemplate(t: typeof templateList[number]) {
    setActiveTemplate(t.id);
    setFields({
      title:        t.title,
      department:   t.department,
      location:     t.location,
      requirements: t.requirements.join(", "),
    });
    const matched = ICON_OPTIONS.find((o) => o.value === t.icon);
    setSelectedIcon(matched?.value ?? ICON_OPTIONS[0].value);
    setStages(t.stages.length ? t.stages : DEFAULT_STAGES);
  }

  function clearTemplate() {
    setActiveTemplate(null);
    setFields({});
    setSelectedIcon(ICON_OPTIONS[0].value);
    setStages(DEFAULT_STAGES);
  }

  function handleImport(data: Partial<JobPreview>) {
    setActiveTemplate(null);
    setFields((prev) => ({ ...prev, ...data }));
  }

  function handleDeleteTemplate(id: number) {
    setTemplateList((prev) => prev.filter((t) => t.id !== id));
    if (activeTemplate === id) clearTemplate();
    startDelete(() => deleteTemplate(id));
  }

  const currentIconBg = ICON_OPTIONS.find((o) => o.value === selectedIcon)?.bg ?? ICON_OPTIONS[0].bg;

  return (
    <div className="p-xl max-w-2xl mx-auto space-y-lg">
      <div>
        <h2 className="font-h2 text-h2 text-primary">New Requisition</h2>
        <p className="text-body-sm text-slate-500 mt-1">
          Define the role and its requirements — the triage engine will use them to score incoming candidates.
        </p>
      </div>

      {/* ── Template picker ────────────────────────────────── */}
      {templateList.length > 0 && (
        <section className="space-y-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-label-caps text-label-caps text-slate-400 uppercase tracking-widest">
              Partir d'un template
            </h3>
            {activeTemplate !== null && (
              <button onClick={clearTemplate} className="text-xs text-slate-400 hover:text-slate-600 hover:underline">
                Effacer la sélection
              </button>
            )}
          </div>
          <div className="flex gap-3 flex-wrap">
            {templateList.map((t) => {
              const reqs   = (t.requirements as string[]) ?? [];
              const stages = (t.stages as string[]) ?? [];
              const iconOpt = ICON_OPTIONS.find((o) => o.value === t.icon) ?? ICON_OPTIONS[0];
              const active  = activeTemplate === t.id;

              return (
                <div key={t.id} className="relative group">
                  <button
                    type="button"
                    onClick={() => active ? clearTemplate() : applyTemplate(t)}
                    className={[
                      "flex items-center gap-3 p-3 pr-4 rounded-xl border text-left transition-all",
                      active
                        ? "border-primary bg-blue-50/50 shadow-sm"
                        : "border-slate-200 bg-white hover:border-primary/40 hover:shadow-sm",
                    ].join(" ")}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconOpt.bg}`}>
                      <span className="material-symbols-outlined text-lg">{t.icon}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-body-sm text-on-surface leading-tight">{t.name}</p>
                      <p className="text-label-caps text-slate-400 mt-0.5">
                        {t.department}
                        {reqs.length > 0 && ` · ${reqs.length} compétences`}
                        {stages.length > 0 && ` · ${stages.length} étapes`}
                      </p>
                    </div>
                    {active && (
                      <span className="material-symbols-outlined text-primary text-sm ml-1" style={{ fontVariationSettings: "'FILL' 1" }}>
                        check_circle
                      </span>
                    )}
                  </button>

                  {/* Delete button — hover */}
                  <button
                    type="button"
                    onClick={() => handleDeleteTemplate(t.id)}
                    disabled={deletePending}
                    title="Supprimer ce template"
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-300 text-white text-xs hidden group-hover:flex items-center justify-center hover:bg-red-500 transition-colors disabled:opacity-50"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── URL importer ───────────────────────────────────── */}
      <JobUrlImporter onImport={handleImport} />

      {/* ── Main form ──────────────────────────────────────── */}
      <form action={createJob} className="space-y-lg">
        <input type="hidden" name="iconBg" value={currentIconBg} />
        <input type="hidden" name="stages" value={JSON.stringify(stages)} />

        <div className="tonal-card rounded-xl p-lg space-y-md">
          <h3 className="font-h3 text-h3 text-on-surface">Role Details</h3>

          <div className="space-y-xs">
            <label className="font-label-caps text-label-caps text-slate-500 uppercase block">Job Title *</label>
            <input
              key={fields.title}
              type="text"
              name="title"
              required
              defaultValue={fields.title ?? ""}
              placeholder="Senior Product Designer"
              className="w-full border border-outline-variant rounded-lg px-3 py-2.5 text-body-sm text-on-surface bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            <div className="space-y-xs">
              <label className="font-label-caps text-label-caps text-slate-500 uppercase block">Department *</label>
              <input
                key={fields.department}
                type="text"
                name="department"
                required
                defaultValue={fields.department ?? ""}
                placeholder="Design, Engineering…"
                className="w-full border border-outline-variant rounded-lg px-3 py-2.5 text-body-sm text-on-surface bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div className="space-y-xs">
              <label className="font-label-caps text-label-caps text-slate-500 uppercase block">Location *</label>
              <input
                key={fields.location}
                type="text"
                name="location"
                required
                defaultValue={fields.location ?? ""}
                placeholder="Remote, London UK…"
                className="w-full border border-outline-variant rounded-lg px-3 py-2.5 text-body-sm text-on-surface bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div className="space-y-xs sm:col-span-2">
              <label className="font-label-caps text-label-caps text-slate-500 uppercase block">Budget salarial</label>
              <input
                type="text"
                name="budget"
                placeholder="ex. 55k€ – 70k€"
                className="w-full border border-outline-variant rounded-lg px-3 py-2.5 text-body-sm text-on-surface bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* ── Icon ───────────────────────────────────────────── */}
        <div className="tonal-card rounded-xl p-lg space-y-md">
          <h3 className="font-h3 text-h3 text-on-surface">Icon</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ICON_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex flex-col items-center gap-2 p-3 rounded-lg border border-outline-variant cursor-pointer hover:border-primary transition-colors has-[:checked]:border-primary has-[:checked]:bg-blue-50/30"
              >
                <input
                  type="radio"
                  name="icon"
                  value={opt.value}
                  className="sr-only"
                  checked={selectedIcon === opt.value}
                  onChange={() => setSelectedIcon(opt.value)}
                />
                <div className={`w-9 h-9 rounded flex items-center justify-center ${opt.bg}`}>
                  <span className="material-symbols-outlined text-lg">{opt.value}</span>
                </div>
                <span className="text-label-caps text-slate-500 font-medium">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* ── Requirements ───────────────────────────────────── */}
        <div className="tonal-card rounded-xl p-lg space-y-md">
          <h3 className="font-h3 text-h3 text-on-surface">Requirements</h3>
          <p className="text-body-sm text-slate-500">
            List the mandatory competencies for this role, comma-separated. The triage engine uses these to score every candidate automatically.
          </p>
          {fields.requirements && (
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              <span className="text-body-sm font-semibold">
                {fields.requirements.split(",").filter(Boolean).length} requirements extracted
              </span>
            </div>
          )}
          <div className="space-y-xs">
            <label className="font-label-caps text-label-caps text-slate-500 uppercase block">
              Mandatory Skills / Competencies
            </label>
            <textarea
              key={fields.requirements}
              name="requirements"
              rows={4}
              defaultValue={fields.requirements ?? ""}
              placeholder="Design Systems, Figma, UX Strategy, Prototyping, SaaS experience…"
              className="w-full border border-outline-variant rounded-lg px-3 py-2.5 text-body-sm text-on-surface bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>
        </div>

        {/* ── Pipeline ───────────────────────────────────────── */}
        <div className="tonal-card rounded-xl p-lg space-y-md">
          <div className="flex items-center justify-between">
            <h3 className="font-h3 text-h3 text-on-surface">Pipeline de recrutement</h3>
            <button
              type="button"
              onClick={() => setStages(DEFAULT_STAGES)}
              className="text-xs text-slate-400 hover:text-primary hover:underline"
            >
              Réinitialiser
            </button>
          </div>
          <p className="text-body-sm text-slate-500">
            Glissez les étapes pour les réordonner. Vous pouvez ajouter plusieurs fois le même type d'étape.
          </p>
          <PipelineEditor value={stages} onChange={setStages} />
        </div>

        <div className="flex items-center justify-between">
          <a href="/jobs" className="text-sm font-semibold text-slate-500 hover:text-on-surface transition-colors">
            ← Cancel
          </a>
          <button
            type="submit"
            className="bg-primary text-white px-8 py-3 rounded-lg font-semibold text-sm hover:bg-primary-container transition-colors shadow-md flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Create Requisition
          </button>
        </div>
      </form>
    </div>
  );
}
