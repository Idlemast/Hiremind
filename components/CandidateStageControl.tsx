"use client";

import { useTransition } from "react";
import { updateApplicationStage } from "@/app/actions/candidates";

export default function CandidateStageControl({
  applicationId,
  stageIndex,
  stages,
}: {
  applicationId: number;
  stageIndex: number;
  stages: string[];
}) {
  const [pending, startTransition] = useTransition();

  const move = (newIndex: number) => {
    startTransition(() => updateApplicationStage(applicationId, newIndex));
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => move(stageIndex - 1)}
        disabled={pending || stageIndex <= 0}
        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:border-primary hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        title="Étape précédente"
      >
        <span className="material-symbols-outlined text-sm">chevron_left</span>
      </button>
      <span className="text-label-caps text-slate-400 flex-1 text-center">
        {stageIndex + 1} / {stages.length}
      </span>
      <button
        type="button"
        onClick={() => move(stageIndex + 1)}
        disabled={pending || stageIndex >= stages.length - 1}
        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:border-primary hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        title="Étape suivante"
      >
        <span className="material-symbols-outlined text-sm">chevron_right</span>
      </button>
    </div>
  );
}
