"use client";

import { useState, useRef } from "react";
import { GROUPED_STAGE_OPTIONS } from "@/lib/stages";

type Item = { id: string; label: string };

function makeItems(labels: string[]): Item[] {
  return labels.map((label, i) => ({ id: `${i}-${label}`, label }));
}

export default function PipelineEditor({
  value,
  onChange,
}: {
  value: string[];
  onChange: (stages: string[]) => void;
}) {
  const [items, setItems] = useState<Item[]>(() => makeItems(value));
  const dragSrc              = useRef<number | null>(null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  function commit(next: Item[]) {
    setItems(next);
    onChange(next.map((it) => it.label));
  }

  function add(label: string) {
    commit([...items, { id: `${Date.now()}-${Math.random()}`, label }]);
  }

  function remove(id: string) {
    if (items.length <= 1) return;
    commit(items.filter((it) => it.id !== id));
  }

  // ── Drag handlers ────────────────────────────────────────────────────────────

  function onDragStart(idx: number) {
    dragSrc.current = idx;
    setDraggingIdx(idx);
  }

  function onDragOver(idx: number, e: React.DragEvent) {
    e.preventDefault();
    if (dragSrc.current !== idx) setDragOver(idx);
  }

  function onDrop(idx: number) {
    const src = dragSrc.current;
    dragSrc.current = null;
    setDraggingIdx(null);
    setDragOver(null);
    if (src === null || src === idx) return;
    const next = [...items];
    const [moved] = next.splice(src, 1);
    // Drop above the target when dragging down, below when dragging up
    next.splice(idx, 0, moved);
    commit(next);
  }

  function onDragEnd() {
    dragSrc.current = null;
    setDraggingIdx(null);
    setDragOver(null);
  }

  return (
    <div className="space-y-lg">

      {/* ── Pipeline list ──────────────────────────────────── */}
      <div className="space-y-1.5">
        {items.map((item, i) => {
          const isDragging = draggingIdx === i;
          const isOver     = dragOver === i;

          return (
            <div
              key={item.id}
              draggable
              onDragStart={() => onDragStart(i)}
              onDragOver={(e) => onDragOver(i, e)}
              onDrop={() => onDrop(i)}
              onDragEnd={onDragEnd}
              className={[
                "flex items-center gap-3 px-3 py-2.5 bg-white border rounded-xl transition-all duration-100 select-none",
                isOver   ? "border-primary bg-blue-50/50 shadow-sm"    : "border-slate-200",
                isDragging ? "opacity-30 scale-[0.98]"                 : "opacity-100",
              ].join(" ")}
            >
              {/* Drag handle */}
              <span
                className="material-symbols-outlined text-slate-300 text-base cursor-grab active:cursor-grabbing shrink-0"
                title="Glisser pour réordonner"
              >
                drag_indicator
              </span>

              {/* Step badge */}
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>

              {/* Label */}
              <span className="flex-1 text-body-sm text-on-surface font-medium">{item.label}</span>

              {/* Remove */}
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  className="text-slate-300 hover:text-red-500 transition-colors shrink-0"
                  title="Supprimer cette étape"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Catalogue ──────────────────────────────────────── */}
      <div className="border-t border-slate-100 pt-md space-y-md">
        <p className="font-label-caps text-label-caps text-slate-400 uppercase tracking-widest">
          Ajouter une étape au pipeline
        </p>
        {Object.entries(GROUPED_STAGE_OPTIONS).map(([group, opts]) => (
          <div key={group}>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1.5">{group}</p>
            <div className="flex flex-wrap gap-1.5">
              {opts.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => add(opt.label)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-slate-200 bg-white text-slate-600 text-label-caps font-label-caps hover:border-primary/50 hover:text-primary hover:bg-blue-50/30 transition-all"
                >
                  <span className="material-symbols-outlined text-sm leading-none">add</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
