"use client";

import { useTransition } from "react";
import { archiveJob, unarchiveJob } from "@/app/actions/jobs";

export default function ArchiveJobButton({
  jobId,
  status,
}: {
  jobId: number;
  status: string;
}) {
  const [pending, startTransition] = useTransition();
  const isOpen = status === "open";

  return (
    <button
      type="button"
      onClick={() => startTransition(() => isOpen ? archiveJob(jobId) : unarchiveJob(jobId))}
      disabled={pending}
      className="p-2 sm:px-4 sm:py-2 bg-white border border-outline-variant text-on-surface-variant font-bold rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 text-sm disabled:opacity-50"
      title={isOpen ? "Archiver" : "Réactiver"}
    >
      <span className="material-symbols-outlined text-sm">{isOpen ? "archive" : "unarchive"}</span>
      <span className="hidden sm:inline">{pending ? "…" : isOpen ? "Archiver" : "Réactiver"}</span>
    </button>
  );
}
