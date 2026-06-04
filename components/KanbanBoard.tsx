"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { updateApplicationStage } from "@/app/actions/candidates";
import { candidateUrl } from "@/lib/slugify";

type Fit = "strong" | "medium" | "weak";

export type KanbanCard = {
  appId: number;
  candidateId: number;
  name: string;
  score: number;
  fit: Fit;
  stageIndex: number;
  jobTitle?: string;
};

const FIT_DOT: Record<Fit, string> = {
  strong: "bg-emerald-500",
  medium: "bg-amber-400",
  weak:   "bg-slate-300",
};

export default function KanbanBoard({
  stages,
  initialCards,
  currentStageIndex,
}: {
  stages: string[];
  initialCards: KanbanCard[];
  currentStageIndex: number;
}) {
  const [cards, setCards]         = useState(initialCards);
  const [draggingId, setDragging] = useState<number | null>(null);
  const [overCol, setOverCol]     = useState<number | null>(null);
  const [, startTransition]       = useTransition();

  function onDragStart(appId: number) { setDragging(appId); }
  function onDragEnd()                { setDragging(null); setOverCol(null); }

  function onDrop(colIdx: number) {
    if (draggingId === null) return;
    if (colIdx > currentStageIndex) return; // blocked by job stage cap
    const card = cards.find((c) => c.appId === draggingId);
    setDragging(null);
    setOverCol(null);
    if (!card || card.stageIndex === colIdx) return;

    const prevCards = cards;
    setCards((prev) => prev.map((c) => c.appId === draggingId ? { ...c, stageIndex: colIdx } : c));

    startTransition(async () => {
      try {
        await updateApplicationStage(draggingId, colIdx);
      } catch {
        setCards(prevCards);
      }
    });
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 lg:-mx-xl lg:px-xl">
      {stages.map((stage, idx) => {
        const col      = cards.filter((c) => c.stageIndex === idx);
        const isOver   = overCol === idx;
        const isCurrent = idx === currentStageIndex;
        const isLocked  = idx > currentStageIndex;

        return (
          <div
            key={idx}
            className="flex-none w-44"
            onDragOver={(e) => { if (!isLocked) { e.preventDefault(); setOverCol(idx); } }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setOverCol(null);
            }}
            onDrop={() => onDrop(idx)}
          >
            {/* Column header */}
            <div className={`px-3 py-2 rounded-xl mb-2 border transition-colors ${
              isCurrent
                ? "border-primary bg-primary/5"
                : isOver
                ? "border-primary/40 bg-primary/5"
                : isLocked
                ? "border-slate-100 bg-slate-50/50"
                : "border-slate-200 bg-slate-50"
            }`}>
              <div className="flex items-center justify-between gap-2">
                <span className={`font-label-caps text-label-caps truncate ${isLocked ? "text-slate-300" : isCurrent ? "text-primary" : "text-slate-600"}`}>
                  {stage}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  {isCurrent && (
                    <span className="material-symbols-outlined text-[10px] text-primary" style={{ fontSize: "10px" }}>radio_button_checked</span>
                  )}
                  {isLocked && (
                    <span className="material-symbols-outlined text-[10px] text-slate-300" style={{ fontSize: "10px" }}>lock</span>
                  )}
                  <span className={`text-label-caps tabular-nums ${isLocked ? "text-slate-300" : "text-slate-400"}`}>{col.length}</span>
                </div>
              </div>
            </div>

            {/* Cards */}
            <div className={`min-h-20 space-y-2 rounded-xl p-1 transition-colors ${
              isOver && !isLocked ? "bg-primary/5" : ""
            } ${isLocked ? "opacity-60" : ""}`}>
              {col.map((card) => {
                const initials   = card.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
                const isDragging = draggingId === card.appId;
                return (
                  <div
                    key={card.appId}
                    draggable={!isLocked}
                    onDragStart={() => onDragStart(card.appId)}
                    onDragEnd={onDragEnd}
                    className={`group bg-white border border-slate-200 rounded-lg px-2.5 py-2 shadow-sm select-none transition-all ${
                      isDragging
                        ? "opacity-40 cursor-grabbing"
                        : isLocked
                        ? "cursor-default"
                        : "cursor-grab hover:shadow-md hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${FIT_DOT[card.fit]}`} />
                      <span className="text-body-sm font-medium text-on-surface truncate flex-1 leading-tight">
                        {card.name}
                      </span>
                      <Link
                        href={candidateUrl(card.candidateId, card.name, card.appId, card.jobTitle)}
                        className="text-slate-200 group-hover:text-slate-400 hover:!text-primary transition-colors shrink-0"
                        draggable={false}
                        onClick={(e) => e.stopPropagation()}
                        title="Voir la fiche"
                      >
                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                      </Link>
                    </div>
                  </div>
                );
              })}

              {col.length === 0 && !isLocked && (
                <div className={`h-14 rounded-lg border-2 border-dashed flex items-center justify-center transition-colors ${
                  isOver ? "border-primary/40" : "border-slate-200"
                }`}>
                  <span className="text-label-caps text-slate-300 text-xs">
                    {isOver ? "Déposer ici" : "Vide"}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
