"use client";

import { useState, useTransition } from "react";
import { deleteTemplate } from "@/app/actions/templates";
import type { PlainTemplate } from "@/lib/stages";

const ICON_BG: Record<string, string> = {
  code:            "bg-blue-50 text-blue-600",
  palette:         "bg-purple-50 text-purple-600",
  campaign:        "bg-orange-50 text-orange-600",
  bar_chart:       "bg-teal-50 text-teal-600",
  group:           "bg-emerald-50 text-emerald-600",
  storefront:      "bg-yellow-50 text-yellow-600",
  account_balance: "bg-indigo-50 text-indigo-600",
  work:            "bg-slate-50 text-slate-600",
};

export default function TemplateManager({
  initialTemplates,
}: {
  initialTemplates: PlainTemplate[];
}) {
  const [templates, setTemplates]    = useState(initialTemplates);
  const [confirming, setConfirming]  = useState<number | null>(null);
  const [pending, startTransition]   = useTransition();

  const handleDeleteClick = (id: number) => {
    if (confirming === id) {
      // Confirmed — proceed
      setConfirming(null);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      startTransition(() => deleteTemplate(id));
    } else {
      setConfirming(id);
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirming(null);
  };

  if (templates.length === 0) {
    return (
      <div className="border border-dashed border-slate-200 rounded-xl p-xl text-center text-slate-400">
        <span className="material-symbols-outlined text-3xl block mb-2">bookmark</span>
        <p className="text-body-sm">Aucun template enregistré.</p>
        <p className="text-body-sm mt-1">
          Ouvrez un poste et cliquez sur{" "}
          <span className="font-semibold text-slate-500">Sauvegarder comme template</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
      {templates.map((t) => {
        const { requirements: reqs, stages, icon, iconBg: templateIconBg } = t;
        const iconBg = ICON_BG[icon] ?? ICON_BG.work;

        return (
          <div
            key={t.id}
            className="tonal-card rounded-xl p-lg flex flex-col gap-md hover:shadow-md transition-all relative group"
          >
            {/* Delete / confirmation */}
            {confirming === t.id ? (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white border border-red-200 rounded-lg px-2 py-1 shadow-sm">
                <span className="text-xs text-red-600 font-semibold whitespace-nowrap">Supprimer ?</span>
                <button
                  onClick={() => handleDeleteClick(t.id)}
                  disabled={pending}
                  className="text-xs font-bold text-white bg-red-500 hover:bg-red-600 px-2 py-0.5 rounded transition-colors disabled:opacity-50"
                >
                  Oui
                </button>
                <button
                  onClick={handleCancel}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600 px-1"
                >
                  Non
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleDeleteClick(t.id)}
                disabled={pending}
                title="Supprimer ce template"
                className="absolute top-3 right-3 w-6 h-6 rounded-full bg-slate-100 text-slate-400 text-sm hidden group-hover:flex items-center justify-center hover:bg-red-100 hover:text-red-500 transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
                <span className="material-symbols-outlined">{t.icon}</span>
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-body-sm text-on-surface truncate">{t.name}</p>
                <p className="text-label-caps text-slate-400 truncate">{t.department}</p>
              </div>
            </div>

            {/* Meta */}
            <div className="flex gap-3 text-label-caps text-slate-400">
              {reqs.length > 0 && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  {reqs.length} compétence{reqs.length > 1 ? "s" : ""}
                </span>
              )}
              {stages.length > 0 && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">linear_scale</span>
                  {stages.length} étape{stages.length > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Pipeline preview */}
            {stages.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                {stages.slice(0, 4).map((s, i) => (
                  <span key={i} className="flex items-center gap-0.5 text-label-caps text-slate-500">
                    {i > 0 && <span className="text-slate-300">›</span>}
                    <span className="bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded text-[10px]">{s}</span>
                  </span>
                ))}
                {stages.length > 4 && (
                  <span className="text-slate-400 text-[10px]">+{stages.length - 4}</span>
                )}
              </div>
            )}

            {/* CTA */}
            <a
              href={`/jobs/new?from=${t.id}`}
              className="mt-auto flex items-center justify-center gap-2 py-2 border border-primary text-primary rounded-lg text-sm font-semibold hover:bg-primary hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Créer un poste
            </a>
          </div>
        );
      })}
    </div>
  );
}
