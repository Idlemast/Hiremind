"use client";

import { useState, useRef, useTransition } from "react";
import { updateCandidateTags } from "@/app/actions/candidates";

const SUGGESTED_TAGS = [
  "HIGH_POTENTIAL", "TOP_PICK", "AVAILABLE_NOW",
  "SYSTEMS_HEAVY", "RELO_READY", "RELOCATION_REQUIRED",
  "NEEDS_REVIEW", "ON_HOLD", "FAST_TRACK",
  "CULTURE_FIT", "OVERQUALIFIED", "REFERRAL",
];

interface Props {
  candidateId: number;
  initialTags: string[];
}

export default function TagEditor({ candidateId, initialTags }: Props) {
  const [tags,    setTags]    = useState<string[]>(initialTags);
  const [input,   setInput]   = useState("");
  const [open,    setOpen]    = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = SUGGESTED_TAGS.filter(
    (t) => !tags.includes(t) && t.toLowerCase().includes(input.toLowerCase())
  );

  function addTag(tag: string) {
    const normalized = tag.trim().toUpperCase().replace(/\s+/g, "_");
    if (!normalized || tags.includes(normalized)) return;
    const next = [...tags, normalized];
    setTags(next);
    setInput("");
    persist(next);
  }

  function removeTag(tag: string) {
    const next = tags.filter((t) => t !== tag);
    setTags(next);
    persist(next);
  }

  function persist(next: string[]) {
    startTransition(async () => {
      await updateCandidateTags(candidateId, next);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === "Escape") {
      setOpen(false);
      setInput("");
    }
  }

  return (
    <div className="space-y-sm">
      {/* Existing tags */}
      <div className="flex flex-wrap gap-xs min-h-[28px]">
        {tags.length === 0 && (
          <span className="text-body-sm text-slate-400">No tags yet</span>
        )}
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-label-caps font-bold group"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-error"
              aria-label={`Remove ${tag}`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>close</span>
            </button>
          </span>
        ))}
        {saved && (
          <span className="inline-flex items-center gap-1 text-label-caps text-emerald-600">
            <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>check</span>
            Saved
          </span>
        )}
      </div>

      {/* Add tag input */}
      <div className="relative">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => { setInput(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            onKeyDown={handleKeyDown}
            placeholder="Add tag…"
            className="w-40 border border-outline-variant rounded px-2.5 py-1 text-label-caps font-bold text-on-surface bg-white focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary placeholder:font-normal placeholder:text-slate-400"
          />
          {input.trim() && (
            <button
              type="button"
              onClick={() => addTag(input)}
              className="text-label-caps font-bold text-primary hover:underline"
            >
              Add
            </button>
          )}
        </div>

        {/* Suggestions dropdown */}
        {open && suggestions.length > 0 && (
          <div className="absolute top-full left-0 mt-1 z-10 bg-white border border-outline-variant rounded-lg shadow-lg py-1 min-w-[180px]">
            {suggestions.slice(0, 8).map((s) => (
              <button
                key={s}
                type="button"
                onMouseDown={() => addTag(s)}
                className="w-full text-left px-3 py-1.5 text-label-caps font-bold text-slate-700 hover:bg-surface-container-low transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
