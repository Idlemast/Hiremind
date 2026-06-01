"use client";

import { useState, useTransition } from "react";
import { setJobStage, updateJobStages } from "@/app/actions/jobs";
import { DEFAULT_STAGES } from "@/lib/stages";
import PipelineEditor from "@/components/PipelineEditor";

export default function StagePipeline({
  jobId,
  initialStages,
  initialCurrentIndex,
}: {
  jobId: number;
  initialStages: string[];
  initialCurrentIndex: number;
}) {
  const base                            = initialStages.length > 0 ? initialStages : DEFAULT_STAGES;
  const [list, setList]                 = useState(base);
  const [current, setCurrent]           = useState(initialCurrentIndex);
  const [editing, setEditing]           = useState(false);
  const [pending, startTransition]      = useTransition();

  const handleSetStage = (idx: number) => {
    setCurrent(idx);
    startTransition(() => setJobStage(jobId, idx));
  };

  const handlePipelineChange = (stages: string[]) => {
    const clamped = Math.min(current, stages.length - 1);
    setList(stages);
    setCurrent(clamped);
    startTransition(() => updateJobStages(jobId, stages, clamped));
  };

  return (
    <div className="space-y-lg">

      {/* ── Progress view ──────────────────────────────────── */}
      <div className="flex items-center gap-3">

        {/* Scrollable stage strip */}
        <div className="flex-1 overflow-x-auto pb-0.5 hide-scrollbar">
          <div className="flex items-center min-w-max">
            {list.map((stage, i) => {
              const done   = i < current;
              const active = i === current;

              return (
                <div key={`${i}-${stage}`} className="flex items-center">
                  {i > 0 && (
                    <div className={`w-8 h-px shrink-0 ${i <= current ? "bg-emerald-400" : "bg-slate-200"}`} />
                  )}
                  <button
                    onClick={() => handleSetStage(i)}
                    disabled={pending}
                    title={`Passer à "${stage}"`}
                    className={[
                      "flex items-center gap-1 px-3 py-1.5 rounded-full border text-label-caps font-label-caps transition-all duration-150 disabled:cursor-not-allowed whitespace-nowrap",
                      done    ? "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200" : "",
                      active  ? "bg-primary text-white border-primary shadow-md"                          : "",
                      !done && !active ? "bg-white text-slate-400 border-slate-200 hover:bg-slate-50 hover:text-slate-600" : "",
                    ].join(" ")}
                  >
                    {done && (
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                        check
                      </span>
                    )}
                    {active && (
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                        radio_button_checked
                      </span>
                    )}
                    {stage}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Edit toggle — always anchored right */}
        <button
          onClick={() => setEditing((v) => !v)}
          className={[
            "shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-semibold transition-colors",
            editing
              ? "border-primary bg-primary/5 text-primary"
              : "border-slate-200 text-slate-500 hover:border-primary/40 hover:text-primary",
          ].join(" ")}
        >
          <span className="material-symbols-outlined text-sm">
            {editing ? "check" : "edit"}
          </span>
          {editing ? "Terminer" : "Éditer le pipeline"}
        </button>
      </div>

      {pending && (
        <p className="text-label-caps text-slate-400 text-xs flex items-center gap-1">
          <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
          Enregistrement…
        </p>
      )}

      {/* ── Edit mode ──────────────────────────────────────── */}
      {editing && (
        <div className="border-t border-slate-100 pt-lg">
          <PipelineEditor value={list} onChange={handlePipelineChange} />
        </div>
      )}
    </div>
  );
}
