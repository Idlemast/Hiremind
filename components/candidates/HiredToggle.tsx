"use client";

import { useTransition } from "react";
import { setApplicationHired } from "@/app/actions/candidates";

export default function HiredToggle({
  applicationId,
  hired,
}: {
  applicationId: number;
  hired: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => setApplicationHired(applicationId, !hired))}
      disabled={pending}
      className={[
        "p-2 sm:px-4 sm:py-2 rounded-lg font-bold text-sm flex items-center gap-1.5 transition-colors disabled:opacity-50",
        hired
          ? "bg-emerald-600 text-white hover:bg-emerald-700"
          : "bg-white border border-outline-variant text-on-surface-variant hover:bg-slate-50",
      ].join(" ")}
      title={hired ? "Retirer le statut embauché" : "Marquer ce candidat comme embauché"}
    >
      <span className="material-symbols-outlined text-sm" style={hired ? { fontVariationSettings: "'FILL' 1" } : undefined}>
        military_tech
      </span>
      <span className="hidden sm:inline">{pending ? "…" : hired ? "Embauché" : "Marquer embauché"}</span>
    </button>
  );
}
