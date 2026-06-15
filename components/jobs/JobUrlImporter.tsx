"use client";

import { useState } from "react";
import type { JobPreview } from "@/app/api/jobs/preview/route";

interface Props {
  onImport: (data: Partial<JobPreview>) => void;
}

export default function JobUrlImporter({ onImport }: Props) {
  const [url,     setUrl]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  async function handleFetch() {
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/jobs/preview", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ url }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? "Erreur lors du fetch");
      onImport(json.data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="tonal-card rounded-xl p-lg space-y-md">
      <div className="flex items-center gap-sm">
        <span className="material-symbols-outlined text-primary">link</span>
        <h3 className="font-h3 text-h3 text-on-surface">Import from URL</h3>
        <span className="text-label-caps text-slate-400">optional</span>
      </div>
      <p className="text-body-sm text-slate-500">
        Paste a job posting URL — Greenhouse, Lever, LinkedIn, Indeed, etc. The form will be pre-filled automatically.
      </p>

      <div className="flex gap-3">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleFetch())}
          placeholder="https://boards.greenhouse.io/company/jobs/123456"
          className="flex-1 border border-outline-variant rounded-lg px-3 py-2.5 text-body-sm text-on-surface bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
        <button
          type="button"
          onClick={handleFetch}
          disabled={loading || !url.trim()}
          className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
          ) : (
            <span className="material-symbols-outlined text-sm">download</span>
          )}
          {loading ? "Fetching…" : "Fetch"}
        </button>
      </div>

      {error && (
        <p className="text-sm text-error flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">error</span>
          {error}
        </p>
      )}
    </div>
  );
}
