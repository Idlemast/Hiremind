"use client";

import { useTransition } from "react";
import { updateApplicationStage } from "@/app/actions/candidates";

export default function CandidateStageControl({
  applicationId,
  stageIndex,
  stages,
  jobStageIndex,
}: {
  applicationId: number;
  stageIndex: number;
  stages: string[];
  jobStageIndex: number;
}) {
  const [pending, startTransition] = useTransition();

  const move = (newIndex: number) => {
    startTransition(() => updateApplicationStage(applicationId, newIndex));
  };

  const atJobLimit = stageIndex >= jobStageIndex;

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
      <span className="text-label-caps text-slate-500 flex-1 text-center">
        {stageIndex + 1} / {stages.length}
      </span>
      <button
        type="button"
        onClick={() => move(stageIndex + 1)}
        disabled={pending || stageIndex >= stages.length - 1 || atJobLimit}
        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:border-primary hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        title={atJobLimit ? `Poste bloqué à « ${stages[jobStageIndex]} » — avancez le poste d'abord` : "Étape suivante"}
      >
        <span className="material-symbols-outlined text-sm">chevron_right</span>
      </button>
      {atJobLimit && stageIndex < stages.length - 1 && (
        <span className="material-symbols-outlined text-sm text-amber-600" title="Limite du poste atteinte">lock</span>
      )}
    </div>
  );
}
