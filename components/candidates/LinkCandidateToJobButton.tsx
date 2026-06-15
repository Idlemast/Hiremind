"use client";

import { useState, useTransition } from "react";
import { addApplicationToJob } from "@/app/actions/candidates";

export type JobOption = { id: number; title: string; department: string };

export default function LinkCandidateToJobButton({
  candidateId,
  availableJobs,
}: {
  candidateId: number;
  availableJobs: JobOption[];
}) {
  const [open, setOpen]           = useState(false);
  const [selectedId, setSelected] = useState(availableJobs[0]?.id ?? 0);
  const [pending, start]          = useTransition();

  if (availableJobs.length === 0) return null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:border-primary hover:text-primary transition-colors"
      >
        <span className="material-symbols-outlined text-sm">add_link</span>
        Postuler à un autre poste
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
      <div className="relative">
        <select
          value={selectedId}
          onChange={(e) => setSelected(Number(e.target.value))}
          className="appearance-none pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          {availableJobs.map((j) => (
            <option key={j.id} value={j.id}>{j.title} — {j.department}</option>
          ))}
        </select>
        <span className="material-symbols-outlined text-slate-400 text-sm absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
          expand_more
        </span>
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={() => start(() => addApplicationToJob(candidateId, selectedId))}
        className="px-3 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-container transition-colors disabled:opacity-50"
      >
        {pending ? "…" : "Confirmer"}
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        Annuler
      </button>
    </div>
  );
}
