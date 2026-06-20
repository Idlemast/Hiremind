"use client";

import { useTransition } from "react";
import { toggleIntegrationActive, syncIntegrationNow } from "@/app/actions/integrations";

export default function IntegrationCard({
  id,
  name,
  description,
  active,
  lastSyncLabel,
}: {
  id: number;
  name: string;
  description: string;
  active: boolean;
  lastSyncLabel: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="tonal-card rounded-xl p-lg space-y-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-h3 text-h3 text-on-surface">{name}</h3>
          <p className="text-body-sm text-secondary mt-0.5">{description}</p>
        </div>
        <span
          className={`text-label-caps font-semibold py-1 px-2 uppercase rounded-full shrink-0 ${
            active ? "text-emerald-600 bg-emerald-100" : "text-secondary bg-surface-container"
          }`}
        >
          {active ? "Actif" : "Inactif"}
        </span>
      </div>

      <p className="text-body-sm text-secondary">Dernière synchronisation : {lastSyncLabel}</p>

      <div className="flex items-center justify-end gap-2 pt-sm border-t border-outline-variant">
        <div className="flex items-center gap-2">
          {active && (
            <button
              type="button"
              disabled={pending}
              onClick={() => startTransition(() => syncIntegrationNow(id))}
              className="px-3 py-1.5 text-label-caps font-semibold rounded-lg bg-surface-container-low text-primary hover:bg-surface-container transition-colors disabled:opacity-50"
            >
              Synchroniser
            </button>
          )}
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => toggleIntegrationActive(id))}
            className="px-3 py-1.5 text-label-caps font-semibold rounded-lg bg-white border border-outline-variant text-on-surface-variant hover:bg-surface-container-low transition-colors disabled:opacity-50"
          >
            {active ? "Désactiver" : "Activer"}
          </button>
        </div>
      </div>
    </div>
  );
}
