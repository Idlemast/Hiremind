"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type AppOption = {
  id: number;
  jobTitle: string;
  score: number;
  fit: string;
};

const FIT_CHIP: Record<string, string> = {
  strong: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  weak:   "bg-slate-100 text-slate-500",
};

export default function CandidateApplicationSelector({
  candidateId,
  applications,
}: {
  candidateId: number;
  applications: AppOption[];
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(applications[0]?.id);

  const selected = applications.find((a) => a.id === selectedId) ?? applications[0];

  const open = () => {
    if (selected) router.push(`/candidates/${candidateId}?appId=${selected.id}`);
  };

  if (applications.length === 1) {
    return (
      <button
        type="button"
        onClick={open}
        className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-on-surface rounded-lg text-sm font-semibold hover:border-primary hover:text-primary transition-colors"
      >
        <span className="material-symbols-outlined text-sm">open_in_new</span>
        Voir
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="relative">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(Number(e.target.value))}
          className="appearance-none pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
        >
          {applications.map((a) => (
            <option key={a.id} value={a.id}>
              {a.jobTitle} — {a.score}%
            </option>
          ))}
        </select>
        <span className="material-symbols-outlined text-slate-400 text-sm absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
          expand_more
        </span>
      </div>
      {selected && (
        <span className={`px-2 py-0.5 rounded-full text-label-caps font-label-caps ${FIT_CHIP[selected.fit] ?? FIT_CHIP.weak}`}>
          {selected.fit}
        </span>
      )}
      <button
        type="button"
        onClick={open}
        className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-container transition-colors"
      >
        <span className="material-symbols-outlined text-sm">open_in_new</span>
        Ouvrir
      </button>
    </div>
  );
}
