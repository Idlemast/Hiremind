"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/triage",    label: "Candidates",   icon: "group" },
  { href: "/jobs",      label: "Jobs",          icon: "work" },
];

const navDisabled = [
  { label: "Messages",  icon: "mail" },
  { label: "Analytics", icon: "analytics" },
  { label: "Settings",  icon: "settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-64 border-r border-slate-200 bg-slate-50 flex flex-col py-6 px-4 antialiased sticky top-0 shrink-0">

      {/* Logo */}
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white">
          <span className="material-symbols-outlined text-sm">water_drop</span>
        </div>
        <div>
          <h1 className="font-h1 text-lg font-bold tracking-tight text-primary">HireMind</h1>
          <p className="text-label-caps text-slate-500 font-medium tracking-widest uppercase">Decision Support</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {nav.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex items-center gap-3 px-3 py-2.5 text-sm duration-200 ease-in-out",
                active
                  ? "text-primary font-semibold border-r-2 border-primary bg-blue-50/50"
                  : "text-slate-500 hover:text-primary hover:bg-slate-100 transition-colors",
              ].join(" ")}
            >
              <span className="material-symbols-outlined">{icon}</span>
              <span>{label}</span>
            </Link>
          );
        })}

        {navDisabled.map(({ label, icon }) => (
          <span
            key={label}
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-400 cursor-not-allowed select-none"
          >
            <span className="material-symbols-outlined">{icon}</span>
            <span>{label}</span>
          </span>
        ))}
      </nav>

      {/* CTA */}
      <div className="mt-auto px-2">
        <Link
          href="/jobs/new"
          className="w-full bg-primary text-white py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary-container transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          New Requisition
        </Link>

        {/* Profile */}
        <div className="mt-8 pt-6 border-t border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold shrink-0">
            AR
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-slate-900 truncate">Alex Rivera</p>
            <p className="text-xs text-slate-500 truncate">Senior Recruiter</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
