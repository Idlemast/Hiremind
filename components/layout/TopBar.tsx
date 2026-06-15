"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/dashboard":  "Dashboard",
  "/jobs":       "Postes",
  "/candidates": "Candidats",
  "/stats":      "Statistiques",
  "/settings":   "Paramètres",
};

export default function TopBar({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const section  = "/" + segments[0];

  const isCandidateImport  = segments[0] === "candidates" && segments[1] === "new";
  const isCandidateProfile = segments[0] === "candidates" && segments.length >= 2 && segments[1] !== "new";
  const isJobNew           = segments[0] === "jobs" && segments[1] === "new";
  const isJobDetail        = segments[0] === "jobs" && segments[1] && segments[1] !== "new";

  return (
    <header className="flex items-center w-full h-14 px-4 lg:px-8 sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200 shrink-0 gap-3">

      {/* Hamburger (mobile only) */}
      <button
        type="button"
        onClick={onMenuToggle}
        className="lg:hidden p-2 -ml-1 rounded-full hover:bg-slate-100 transition-colors shrink-0"
        aria-label="Menu"
      >
        <span className="material-symbols-outlined text-slate-600">menu</span>
      </button>

      {/* Breadcrumb / Title */}
      <div className="flex items-center gap-2 flex-1 min-w-0 text-sm">
        {isJobNew ? (
          <>
            <Link href="/jobs" className="p-1 hover:bg-slate-100 rounded-full transition-colors shrink-0">
              <span className="material-symbols-outlined text-slate-500 text-xl">arrow_back</span>
            </Link>
            <span className="text-slate-400 hidden sm:inline">/</span>
            <Link href="/jobs" className="text-slate-500 hover:text-primary transition-colors hidden sm:inline">Postes</Link>
            <span className="text-slate-400 hidden sm:inline">/</span>
            <span className="font-bold text-primary truncate">New Requisition</span>
          </>
        ) : isCandidateImport ? (
          <>
            <Link href="/candidates" className="p-1 hover:bg-slate-100 rounded-full transition-colors shrink-0">
              <span className="material-symbols-outlined text-slate-500 text-xl">arrow_back</span>
            </Link>
            <span className="text-slate-400 hidden sm:inline">/</span>
            <Link href="/candidates" className="text-slate-500 hover:text-primary transition-colors hidden sm:inline">Candidats</Link>
            <span className="text-slate-400 hidden sm:inline">/</span>
            <span className="font-bold text-primary truncate">Import</span>
          </>
        ) : isCandidateProfile ? (
          <>
            <Link href="/candidates" className="p-1 hover:bg-slate-100 rounded-full transition-colors shrink-0">
              <span className="material-symbols-outlined text-slate-500 text-xl">arrow_back</span>
            </Link>
            <span className="text-slate-400 hidden sm:inline">/</span>
            <Link href="/candidates" className="text-slate-500 hover:text-primary transition-colors hidden sm:inline">Candidats</Link>
            <span className="text-slate-400 hidden sm:inline">/</span>
            <span className="font-bold text-primary truncate">Profil</span>
          </>
        ) : isJobDetail ? (
          <>
            <Link href="/jobs" className="p-1 hover:bg-slate-100 rounded-full transition-colors shrink-0">
              <span className="material-symbols-outlined text-slate-500 text-xl">arrow_back</span>
            </Link>
            <span className="text-slate-400 hidden sm:inline">/</span>
            <Link href="/jobs" className="text-slate-500 hover:text-primary transition-colors hidden sm:inline">Postes</Link>
            <span className="text-slate-400 hidden sm:inline">/</span>
            <span className="font-bold text-primary truncate">Poste</span>
          </>
        ) : (
          <h2 className="font-semibold text-base text-primary truncate">
            {pageTitles[section] ?? "HireMind"}
          </h2>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button type="button" aria-label="Notifications" className="hidden sm:block hover:text-primary transition-colors text-slate-500">
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </div>
    </header>
  );
}
