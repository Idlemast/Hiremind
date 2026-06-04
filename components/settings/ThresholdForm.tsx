"use client";

import { useState, useTransition } from "react";
import { updateThresholds } from "@/app/actions/settings";

export default function ThresholdForm({
  defaultStrong,
  defaultMedium,
}: {
  defaultStrong: number;
  defaultMedium: number;
}) {
  const [strong, setStrong] = useState(defaultStrong);
  const [medium, setMedium] = useState(defaultMedium);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleStrong = (v: number) => {
    const clamped = Math.min(100, Math.max(medium + 1, v));
    setStrong(clamped);
    setSaved(false);
  };

  const handleMedium = (v: number) => {
    const clamped = Math.min(strong - 1, Math.max(1, v));
    setMedium(clamped);
    setSaved(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData();
    fd.set("strong", String(strong));
    fd.set("medium", String(medium));
    startTransition(async () => {
      await updateThresholds(fd);
      setSaved(true);
    });
  };

  const weakPct   = medium;
  const mediumPct = strong - medium;
  const strongPct = 100 - strong;

  return (
    <form onSubmit={handleSubmit} className="space-y-xl">

      {/* ── Visual bar ──────────────────────────────────────── */}
      <div>
        <p className="font-label-caps text-label-caps text-slate-400 uppercase tracking-widest mb-md">
          Aperçu des zones de qualification
        </p>
        <div className="w-full h-10 rounded-xl overflow-hidden flex text-xs font-bold select-none shadow-inner">
          <div
            className="bg-slate-200 text-slate-500 flex items-center justify-center transition-all duration-200"
            style={{ width: `${weakPct}%` }}
          >
            {weakPct >= 14 && `Faible · 0–${medium}`}
          </div>
          <div
            className="bg-amber-300 text-amber-800 flex items-center justify-center transition-all duration-200"
            style={{ width: `${mediumPct}%` }}
          >
            {mediumPct >= 14 && `Moyen · ${medium}–${strong}`}
          </div>
          <div
            className="bg-emerald-400 text-emerald-900 flex items-center justify-center transition-all duration-200"
            style={{ width: `${strongPct}%` }}
          >
            {strongPct >= 14 && `Fort · ${strong}–100`}
          </div>
        </div>
        {/* Tick marks */}
        <div className="relative h-5 mt-1 text-label-caps text-slate-400 text-[10px]">
          <span className="absolute left-0">0</span>
          <span className="absolute" style={{ left: `${medium}%`, transform: "translateX(-50%)" }}>{medium}</span>
          <span className="absolute" style={{ left: `${strong}%`, transform: "translateX(-50%)" }}>{strong}</span>
          <span className="absolute right-0">100</span>
        </div>
      </div>

      {/* ── Sliders ─────────────────────────────────────────── */}
      <div className="space-y-lg">

        {/* Strong threshold */}
        <div className="bg-white border border-outline-variant rounded-xl p-lg shadow-sm">
          <div className="flex items-center justify-between mb-md">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                <span className="font-h3 text-body-md font-bold">Seuil « Fort »</span>
              </div>
              <p className="text-body-sm text-slate-500 mt-0.5">
                Score ≥ <strong>{strong}</strong> → candidat recommandé pour l'étape suivante
              </p>
            </div>
            <input
              type="number"
              min={medium + 1}
              max={100}
              value={strong}
              onChange={(e) => handleStrong(Number(e.target.value))}
              className="w-16 text-center border border-slate-200 rounded-lg py-1 font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <input
            type="range"
            min={medium + 1}
            max={100}
            value={strong}
            onChange={(e) => handleStrong(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
        </div>

        {/* Medium threshold */}
        <div className="bg-white border border-outline-variant rounded-xl p-lg shadow-sm">
          <div className="flex items-center justify-between mb-md">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                <span className="font-h3 text-body-md font-bold">Seuil « Moyen »</span>
              </div>
              <p className="text-body-sm text-slate-500 mt-0.5">
                Score ≥ <strong>{medium}</strong> → à évaluer manuellement
              </p>
            </div>
            <input
              type="number"
              min={1}
              max={strong - 1}
              value={medium}
              onChange={(e) => handleMedium(Number(e.target.value))}
              className="w-16 text-center border border-slate-200 rounded-lg py-1 font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <input
            type="range"
            min={1}
            max={strong - 1}
            value={medium}
            onChange={(e) => handleMedium(Number(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer"
          />
        </div>
      </div>

      {/* ── Decision table ──────────────────────────────────── */}
      <div className="border border-outline-variant rounded-xl overflow-x-auto">
        <table className="w-full text-body-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-lg py-sm text-left font-label-caps text-label-caps text-slate-400 uppercase">Zone</th>
              <th className="px-lg py-sm text-left font-label-caps text-label-caps text-slate-400 uppercase">Score</th>
              <th className="px-lg py-sm text-left font-label-caps text-label-caps text-slate-400 uppercase">Décision</th>
              <th className="px-lg py-sm text-left font-label-caps text-label-caps text-slate-400 uppercase">Communication</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="px-lg py-sm font-semibold text-emerald-700">Fort</td>
              <td className="px-lg py-sm text-slate-600">{strong} – 100</td>
              <td className="px-lg py-sm"><span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-label-caps">Avancer</span></td>
              <td className="px-lg py-sm text-slate-500">Invitation à l'entretien</td>
            </tr>
            <tr>
              <td className="px-lg py-sm font-semibold text-amber-700">Moyen</td>
              <td className="px-lg py-sm text-slate-600">{medium} – {strong - 1}</td>
              <td className="px-lg py-sm"><span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-label-caps">À évaluer</span></td>
              <td className="px-lg py-sm text-slate-500">Les deux options disponibles</td>
            </tr>
            <tr>
              <td className="px-lg py-sm font-semibold text-slate-500">Faible</td>
              <td className="px-lg py-sm text-slate-600">0 – {medium - 1}</td>
              <td className="px-lg py-sm"><span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-label-caps">Décliner</span></td>
              <td className="px-lg py-sm text-slate-500">Message de refus</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Save ────────────────────────────────────────────── */}
      <div className="flex items-center gap-md">
        <button
          type="submit"
          disabled={pending}
          className="px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary-container transition-colors shadow-sm disabled:opacity-60 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">save</span>
          {pending ? "Enregistrement…" : "Enregistrer les seuils"}
        </button>
        {saved && !pending && (
          <span className="flex items-center gap-1.5 text-body-sm text-emerald-600 font-semibold">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            Seuils mis à jour
          </span>
        )}
      </div>
    </form>
  );
}
