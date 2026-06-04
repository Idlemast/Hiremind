"use client";

import { useState, useTransition } from "react";
import { saveAsTemplate } from "@/app/actions/templates";

export default function SaveAsTemplateButton({ jobId }: { jobId: number }) {
  const [open, setOpen]       = useState(false);
  const [name, setName]       = useState("");
  const [done, setDone]       = useState(false);
  const [pending, startTransition] = useTransition();

  const handleSave = () => {
    if (!name.trim()) return;
    startTransition(async () => {
      await saveAsTemplate(jobId, name.trim());
      setDone(true);
      setOpen(false);
      setName("");
      setTimeout(() => setDone(false), 3000);
    });
  };

  if (done) {
    return (
      <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-semibold">
        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        Template sauvegardé
      </span>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary border border-slate-200 hover:border-primary px-3 py-1.5 rounded-lg transition-colors"
      >
        <span className="material-symbols-outlined text-sm">bookmark_add</span>
        Sauvegarder comme template
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        autoFocus
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") { setOpen(false); setName(""); }
        }}
        placeholder="Nom du template…"
        className="border border-primary/40 rounded-lg px-3 py-1.5 text-sm w-44 focus:outline-none focus:ring-2 focus:ring-primary/25"
      />
      <button
        onClick={handleSave}
        disabled={pending || !name.trim()}
        className="px-3 py-1.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-container transition-colors disabled:opacity-50"
      >
        {pending ? "…" : "Sauvegarder"}
      </button>
      <button onClick={() => { setOpen(false); setName(""); }} className="text-slate-400 hover:text-slate-600 text-sm">
        Annuler
      </button>
    </div>
  );
}
