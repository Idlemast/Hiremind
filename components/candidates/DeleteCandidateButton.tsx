"use client";

import { useState, useTransition } from "react";
import { deleteCandidate } from "@/app/actions/candidates";

export default function DeleteCandidateButton({
  candidateId,
  candidateName,
}: {
  candidateId: number;
  candidateName: string;
}) {
  const [confirm, setConfirm]      = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirm) {
    return (
      <button
        type="button"
        onClick={() => setConfirm(true)}
        className="px-4 py-2 bg-white border border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1.5 text-sm"
      >
        <span className="material-symbols-outlined text-sm">delete</span>
        Supprimer
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
      <span className="text-sm text-red-700 font-semibold truncate max-w-45 sm:max-w-none">Supprimer {candidateName} ?</span>
      <button
        type="button"
        onClick={() => startTransition(() => deleteCandidate(candidateId))}
        disabled={pending}
        className="px-3 py-1 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
      >
        {pending ? "…" : "Confirmer"}
      </button>
      <button
        type="button"
        onClick={() => setConfirm(false)}
        className="px-3 py-1 text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        Annuler
      </button>
    </div>
  );
}
