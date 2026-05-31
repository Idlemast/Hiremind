"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/dashboard":  "Recruitment Overview",
  "/jobs":       "Job Requisitions",
  "/triage":     "Candidate Smart Triage",
  "/candidates": "Import Candidate",
  "/jobs/new":   "New Requisition",
};

export default function TopBar() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const section = "/" + segments[0];

  const isCandidateImport  = segments[0] === "candidates" && segments[1] === "new";
  const isCandidateProfile = segments[0] === "candidates" && segments.length >= 2 && segments[1] !== "new";
  const isJobNew           = segments[0] === "jobs" && segments[1] === "new";

  return (
    <header className="flex justify-between items-center w-full h-16 px-8 sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 text-sm shrink-0">

      <div className="flex items-center gap-4">
        {isJobNew ? (
          <>
            <Link href="/jobs" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <span className="material-symbols-outlined text-slate-500">arrow_back</span>
            </Link>
            <span className="text-slate-400">/</span>
            <Link href="/jobs" className="text-slate-500 hover:text-primary transition-colors">Jobs</Link>
            <span className="text-slate-400">/</span>
            <span className="font-bold text-primary">New Requisition</span>
          </>
        ) : isCandidateImport ? (
          <>
            <Link href="/triage" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <span className="material-symbols-outlined text-slate-500">arrow_back</span>
            </Link>
            <span className="text-slate-400">/</span>
            <Link href="/triage" className="text-slate-500 hover:text-primary transition-colors">Candidates</Link>
            <span className="text-slate-400">/</span>
            <span className="font-bold text-primary">Import</span>
          </>
        ) : isCandidateProfile ? (
          /* Breadcrumb for candidate profile */
          <>
            <Link href="/triage" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <span className="material-symbols-outlined text-slate-500">arrow_back</span>
            </Link>
            <span className="text-slate-400">/</span>
            <Link href="/triage" className="text-slate-500 hover:text-primary transition-colors">
              Candidates
            </Link>
            <span className="text-slate-400">/</span>
            <span className="font-bold text-primary">Marcus Holloway</span>
          </>
        ) : (
          <h2 className="font-h2 text-h2 text-primary">
            {pageTitles[section] ?? "HireMind"}
          </h2>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="relative w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
            search
          </span>
          <input
            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            placeholder="Search candidates or jobs..."
            type="text"
          />
        </div>
        <div className="flex items-center gap-4 text-slate-500">
          <button className="hover:text-primary transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="hover:text-primary transition-colors">
            <span className="material-symbols-outlined">help_outline</span>
          </button>
        </div>
      </div>
    </header>
  );
}
