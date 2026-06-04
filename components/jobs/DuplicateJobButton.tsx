"use client";

import { useTransition } from "react";
import { duplicateJob } from "@/app/actions/jobs";

export default function DuplicateJobButton({ jobId }: { jobId: number }) {
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => duplicateJob(jobId))}
      className="p-2 sm:px-3 sm:py-2 bg-white border border-outline-variant text-on-surface-variant font-bold rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 text-sm disabled:opacity-50"
      title="Dupliquer ce poste"
    >
      <span className="material-symbols-outlined text-sm">content_copy</span>
      <span className="hidden sm:inline">{pending ? "…" : "Dupliquer"}</span>
    </button>
  );
}
