"use client";

import { useState, useTransition, useMemo } from "react";
import { updateApplicationNotes } from "@/app/actions/candidates";
import { analyzeInterviewNotes } from "@/lib/interview-signals";

export default function CandidateNotes({
  applicationId,
  initialNotes,
}: {
  applicationId: number;
  initialNotes: string;
}) {
  const [notes, setNotes]          = useState(initialNotes);
  const [dirty, setDirty]          = useState(false);
  const [saved, setSaved]          = useState(false);
  const [pending, startTransition] = useTransition();

  const signalAnalysis = useMemo(() => analyzeInterviewNotes(notes), [notes]);

  const handleChange = (v: string) => {
    setNotes(v);
    setDirty(true);
    setSaved(false);
  };

  const handleSave = () => {
    startTransition(async () => {
      await updateApplicationNotes(applicationId, notes);
      setDirty(false);
      setSaved(true);
    });
  };

  return (
    <div className="space-y-md">
      <div>
        <p className="font-label-caps text-label-caps text-slate-400 uppercase tracking-widest mb-sm">
          Notes recruteur
        </p>
        <textarea
          value={notes}
          onChange={(e) => handleChange(e.target.value)}
          rows={5}
          placeholder="Ajoutez vos observations, impressions ou points de vigilance sur ce candidat…"
          className="w-full border border-outline-variant rounded-lg px-3 py-2.5 text-body-sm text-on-surface bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none leading-relaxed"
        />
        {signalAnalysis && (
          <div className={[
            "mt-2 px-3 py-2 rounded-md text-label-caps flex flex-col gap-1",
            signalAnalysis.tendency === "negative" && "bg-red-50 text-red-700",
            signalAnalysis.tendency === "positive" && "bg-emerald-50 text-emerald-700",
            signalAnalysis.tendency === "neutral"  && "bg-slate-50 text-slate-500",
          ].filter(Boolean).join(" ")}>
            <span className="font-label-caps uppercase tracking-widest">
              {signalAnalysis.tendency === "negative" && "Tendance négative détectée"}
              {signalAnalysis.tendency === "positive" && "Tendance positive détectée"}
              {signalAnalysis.tendency === "neutral"  && "Signaux mixtes"}
            </span>
            <span className="text-xs opacity-75">
              {signalAnalysis.negativeMatches.length > 0 && <>Négatif : {signalAnalysis.negativeMatches.join(", ")}</>}
              {signalAnalysis.negativeMatches.length > 0 && signalAnalysis.positiveMatches.length > 0 && " — "}
              {signalAnalysis.positiveMatches.length > 0 && <>Positif : {signalAnalysis.positiveMatches.join(", ")}</>}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={pending || !dirty}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-sm">save</span>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
        {saved && !dirty && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-semibold">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
            Sauvegardé — le score se met à jour.
          </span>
        )}
      </div>
    </div>
  );
}
