"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setJobStage } from "@/app/actions/jobs";
import CopyButton from "@/components/ui/CopyButton";
import type { Fit, Decision } from "@/lib/thresholds";

export interface CandidateEmailData {
  id: number;
  name: string;
  email: string | null;
  fit: Fit;
  decision: Decision;
  score: number;
  advanceEmail: string | null;
  rejectEmail:  string | null;
}

const FIT_LABEL: Record<Fit, string> = {
  strong: "Fort",
  medium: "À évaluer",
  weak:   "Faible",
};

const FIT_CHIP: Record<Fit, string> = {
  strong: "bg-emerald-100 text-emerald-700 border-emerald-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  weak:   "bg-slate-100 text-slate-500 border-slate-200",
};


export default function AdvanceStagePanel({
  jobId,
  nextStageIndex,
  candidates,
}: {
  jobId: number;
  nextStageIndex: number;
  candidates: CandidateEmailData[];
}) {
  // Local email state — editable per candidate
  const [emails, setEmails] = useState<Record<number, string>>(() => {
    const init: Record<number, string> = {};
    for (const c of candidates) {
      // Primary email: advance for strong/review, reject for weak
      init[c.id] = c.decision === "reject"
        ? (c.rejectEmail  ?? "")
        : (c.advanceEmail ?? "");
    }
    return init;
  });

  // Track which emails the recruiter has sent
  const [sent, setSent] = useState<Set<number>>(new Set());
  const toggleSent = (id: number) =>
    setSent((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleConfirm = () => {
    startTransition(async () => {
      await setJobStage(jobId, nextStageIndex);
      router.push(`/jobs/${jobId}`);
    });
  };

  const sentCount = sent.size;
  const total     = candidates.length;

  // Group by fit order
  const groups: Fit[] = ["strong", "medium", "weak"];

  return (
    <div className="space-y-xl">

      {/* ── Summary bar ───────────────────────────────────── */}
      <div className="flex items-center gap-4 p-md bg-white border border-outline-variant rounded-xl shadow-sm">
        <div className="flex-1 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">mail</span>
          <span className="text-body-sm text-slate-600">
            <strong>{sentCount}</strong> / {total} email{total > 1 ? "s" : ""} marqué{sentCount > 1 ? "s" : ""} comme envoyé{sentCount > 1 ? "s" : ""}
          </span>
        </div>
        {/* Progress bar */}
        <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: total > 0 ? `${(sentCount / total) * 100}%` : "0%" }}
          />
        </div>
      </div>

      {/* ── Candidate cards by fit group ──────────────────── */}
      {groups.map((fit) => {
        const group = candidates.filter((c) => c.fit === fit);
        if (!group.length) return null;
        return (
          <section key={fit} className="space-y-md">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-label-caps font-label-caps border ${FIT_CHIP[fit]}`}>
                {FIT_LABEL[fit]}
              </span>
              <span className="text-slate-400 text-label-caps">— {group.length} candidat{group.length > 1 ? "s" : ""}</span>
            </div>

            <div className="space-y-md">
              {group.map((c) => {
                const isSent = sent.has(c.id);
                return (
                  <div
                    key={c.id}
                    className={[
                      "bg-white border rounded-xl p-lg space-y-md transition-all",
                      isSent ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200",
                    ].join(" ")}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm shrink-0">
                          {c.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-body-sm text-on-surface">{c.name}</p>
                          {c.email && (
                            <p className="text-label-caps text-slate-500">{c.email}</p>
                          )}
                        </div>
                        <span className="text-label-caps text-slate-500">{c.score}% match</span>
                      </div>

                      {/* Sent toggle */}
                      <button
                        type="button"
                        onClick={() => toggleSent(c.id)}
                        className={[
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-semibold transition-all",
                          isSent
                            ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                            : "border-slate-200 text-slate-400 hover:border-emerald-300 hover:text-emerald-600",
                        ].join(" ")}
                      >
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: isSent ? "'FILL' 1" : "'FILL' 0" }}>
                          check_circle
                        </span>
                        {isSent ? "Envoyé" : "Marquer envoyé"}
                      </button>
                    </div>

                    {/* Email draft — editable */}
                    <textarea
                      value={emails[c.id] ?? ""}
                      onChange={(e) => setEmails((prev) => ({ ...prev, [c.id]: e.target.value }))}
                      rows={8}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-body-sm text-on-surface-variant bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y font-sans leading-relaxed"
                    />

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <CopyButton text={emails[c.id] ?? ""} />
                      {c.email && (
                        <a
                          href={`mailto:${c.email}?subject=Suite%20de%20votre%20candidature&body=${encodeURIComponent(emails[c.id] ?? "")}`}
                          className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                        >
                          <span className="material-symbols-outlined text-sm">open_in_new</span>
                          Ouvrir dans la messagerie
                        </a>
                      )}
                      {/* Toggle between advance / reject template for "review" */}
                      {c.decision === "review" && (
                        <div className="ml-auto flex items-center gap-2 text-xs text-slate-400">
                          <button
                            type="button"
                            onClick={() => setEmails((p) => ({ ...p, [c.id]: c.advanceEmail ?? "" }))}
                            className="hover:text-emerald-600 font-semibold transition-colors"
                          >
                            Template avancer
                          </button>
                          <span>·</span>
                          <button
                            type="button"
                            onClick={() => setEmails((p) => ({ ...p, [c.id]: c.rejectEmail ?? "" }))}
                            className="hover:text-red-500 font-semibold transition-colors"
                          >
                            Template refus
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* ── Confirm button ────────────────────────────────── */}
      <div className="flex items-center justify-between pt-md border-t border-slate-100">
        <p className="text-body-sm text-slate-400">
          {sentCount < total
            ? `${total - sentCount} email${total - sentCount > 1 ? "s" : ""} non marqué${total - sentCount > 1 ? "s" : ""} comme envoyé.`
            : "Tous les emails sont marqués comme envoyés."}
        </p>
        <button
          onClick={handleConfirm}
          disabled={pending}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-container transition-colors shadow-md disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
          {pending ? "Avancement…" : "Confirmer et avancer le pipeline"}
        </button>
      </div>
    </div>
  );
}
