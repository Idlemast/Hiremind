"use client";

import { useState } from "react";
import { createJob } from "@/app/actions/jobs";
import JobUrlImporter from "@/components/JobUrlImporter";
import type { JobPreview } from "@/app/api/jobs/preview/route";

const ICON_OPTIONS = [
  { value: "code",            label: "Code",     bg: "bg-blue-50 text-blue-600" },
  { value: "palette",         label: "Design",   bg: "bg-purple-50 text-purple-600" },
  { value: "campaign",        label: "Marketing",bg: "bg-orange-50 text-orange-600" },
  { value: "bar_chart",       label: "Data",     bg: "bg-teal-50 text-teal-600" },
  { value: "group",           label: "People",   bg: "bg-emerald-50 text-emerald-600" },
  { value: "storefront",      label: "Sales",    bg: "bg-yellow-50 text-yellow-600" },
  { value: "account_balance", label: "Finance",  bg: "bg-indigo-50 text-indigo-600" },
  { value: "work",            label: "Other",    bg: "bg-slate-50 text-slate-600" },
];

const STAGE_OPTIONS = [
  { value: "SOURCING",  label: "Sourcing" },
  { value: "SCREENING", label: "Screening" },
  { value: "TECHNICAL", label: "Technical" },
];

export default function NewJobPage() {
  const [fields, setFields] = useState<Partial<JobPreview>>({});

  function handleImport(data: Partial<JobPreview>) {
    setFields(data);
  }

  return (
    <div className="p-xl max-w-2xl mx-auto space-y-lg">
      <div>
        <h2 className="font-h2 text-h2 text-blue-900">New Requisition</h2>
        <p className="text-body-sm text-slate-500 mt-1">
          Define the role and its requirements — the triage engine will use them to score incoming candidates.
        </p>
      </div>

      {/* URL importer — pre-fills the form below */}
      <JobUrlImporter onImport={handleImport} />

      {/* Main form */}
      <form action={createJob} className="space-y-lg">

        <div className="tonal-card rounded-xl p-lg space-y-md">
          <h3 className="font-h3 text-h3 text-on-surface">Role Details</h3>

          <div className="space-y-xs">
            <label className="font-label-caps text-label-caps text-slate-500 uppercase block">
              Job Title *
            </label>
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

          <div className="grid grid-cols-2 gap-md">
            <div className="space-y-xs">
              <label className="font-label-caps text-label-caps text-slate-500 uppercase block">
                Department *
              </label>
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
              <label className="font-label-caps text-label-caps text-slate-500 uppercase block">
                Location *
              </label>
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
          </div>

          <div className="space-y-xs">
            <label className="font-label-caps text-label-caps text-slate-500 uppercase block">
              Hiring Stage
            </label>
            <select
              name="stage"
              className="w-full border border-outline-variant rounded-lg px-3 py-2.5 text-body-sm text-on-surface bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              {STAGE_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Icon */}
        <div className="tonal-card rounded-xl p-lg space-y-md">
          <h3 className="font-h3 text-h3 text-on-surface">Icon</h3>
          <div className="grid grid-cols-4 gap-3">
            {ICON_OPTIONS.map((opt, i) => (
              <label
                key={opt.value}
                className="flex flex-col items-center gap-2 p-3 rounded-lg border border-outline-variant cursor-pointer hover:border-primary transition-colors has-[:checked]:border-primary has-[:checked]:bg-blue-50/30"
              >
                <input
                  type="radio"
                  name="icon"
                  value={opt.value}
                  className="sr-only"
                  defaultChecked={i === 0}
                />
                <input type="hidden" name="iconBg" value={opt.bg} />
                <div className={`w-9 h-9 rounded flex items-center justify-center ${opt.bg}`}>
                  <span className="material-symbols-outlined text-lg">{opt.value}</span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Requirements */}
        <div className="tonal-card rounded-xl p-lg space-y-md">
          <h3 className="font-h3 text-h3 text-on-surface">Requirements</h3>
          <p className="text-body-sm text-slate-500">
            List the mandatory competencies for this role, comma-separated. The triage engine uses these to score every candidate automatically.
          </p>
          {fields.requirements && (
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              <span className="text-body-sm font-semibold">
                {fields.requirements.split(",").filter(Boolean).length} requirements extracted from the job posting
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
