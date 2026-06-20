"use client";

import { useState } from "react";
import Link from "next/link";
import { jobUrl, candidateUrl } from "@/lib/slugify";
import { scheduleInterview, rescheduleInterview, setInterviewStatus } from "@/app/actions/interviews";

type ScheduledInterview = {
  id: number; candidateName: string; candidateSalt: string;
  jobTitle: string; jobSalt: string; score: number;
  interviewAt: string; interviewStatus: string; interviewLink: string | null;
};
type UnscheduledApp = { id: number; candidateName: string; jobTitle: string; score: number };

const STATUS_META: Record<string, { label: string; chip: string; dot: string }> = {
  pending:    { label: "En attente",     chip: "text-amber-700 bg-amber-100",     dot: "bg-amber-400" },
  confirmed:  { label: "Confirmé",       chip: "text-emerald-700 bg-emerald-100", dot: "bg-emerald-500" },
  reschedule: { label: "À replanifier",  chip: "text-error bg-red-100",           dot: "bg-error" },
};

const DAY_LABELS = ["LUN", "MAR", "MER", "JEU", "VEN"];

function mondayOf(offsetWeeks: number): Date {
  const now = new Date();
  const diffToMonday = now.getDay() === 0 ? -6 : 1 - now.getDay();
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday + offsetWeeks * 7);
  monday.setHours(0, 0, 0, 0);
  return monday;
}
function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function toDatetimeLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function InterviewCalendar({
  scheduled,
  unscheduled,
}: {
  scheduled: ScheduledInterview[];
  unscheduled: UnscheduledApp[];
}) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [schedulingId, setSchedulingId] = useState<number | null>(null);
  const [reschedulingId, setReschedulingId] = useState<number | null>(null);

  const monday = mondayOf(weekOffset);
  const days   = Array.from({ length: 5 }, (_, i) => addDays(monday, i));

  const now  = new Date();
  const next = scheduled.find((s) => new Date(s.interviewAt) > now);

  return (
    <div className="grid grid-cols-12 gap-lg">
      {/* ── Calendar ─────────────────────────────────────────── */}
      <div className="col-span-12 lg:col-span-8 tonal-card rounded-xl p-lg space-y-md">
        <div className="flex items-center justify-between">
          <h3 className="font-h3 text-h3 text-on-surface">
            Semaine du {monday.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
          </h3>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setWeekOffset((w) => w - 1)} className="p-1.5 rounded-lg hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined text-secondary">chevron_left</span>
            </button>
            <button type="button" onClick={() => setWeekOffset(0)} className="px-2 py-1 text-label-caps text-secondary hover:text-primary transition-colors">
              Aujourd&apos;hui
            </button>
            <button type="button" onClick={() => setWeekOffset((w) => w + 1)} className="p-1.5 rounded-lg hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined text-secondary">chevron_right</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-sm">
          {days.map((day, i) => {
            const dayInterviews = scheduled.filter((s) => sameDay(new Date(s.interviewAt), day));
            return (
              <div key={i} className="space-y-sm min-h-[12rem]">
                <p className="text-label-caps text-secondary uppercase text-center">
                  {DAY_LABELS[i]} {day.getDate()}
                </p>
                <div className="space-y-2">
                  {dayInterviews.map((iv) => {
                    const meta = STATUS_META[iv.interviewStatus] ?? STATUS_META.pending;
                    const time = new Date(iv.interviewAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
                    return (
                      <div key={iv.id} className="bg-white border border-outline-variant rounded-lg p-2 space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${meta.dot}`} />
                          <span className="text-label-caps font-semibold text-on-surface">{time}</span>
                        </div>
                        <Link
                          href={candidateUrl(iv.candidateSalt, iv.candidateName, iv.jobSalt, iv.jobTitle)}
                          className="block text-body-sm font-semibold text-on-surface hover:text-primary transition-colors truncate"
                        >
                          {iv.candidateName}
                        </Link>
                        <p className="text-label-caps text-secondary truncate">{iv.jobTitle}</p>
                        <span className={`inline-block text-label-caps font-semibold px-1.5 py-0.5 rounded uppercase ${meta.chip}`}>
                          {meta.label}
                        </span>

                        {reschedulingId === iv.id ? (
                          <form
                            action={async (fd) => { await rescheduleInterview(iv.id, fd); setReschedulingId(null); }}
                            className="space-y-1 pt-1"
                          >
                            <input
                              type="datetime-local"
                              name="at"
                              defaultValue={toDatetimeLocal(new Date(iv.interviewAt))}
                              required
                              className="w-full text-body-sm border border-outline-variant rounded px-1.5 py-1"
                            />
                            <button type="submit" className="w-full text-label-caps font-semibold bg-primary text-white rounded py-1 hover:bg-primary-container transition-colors">
                              Valider
                            </button>
                          </form>
                        ) : (
                          <div className="flex items-center gap-1 pt-1">
                            {iv.interviewStatus !== "confirmed" && (
                              <button
                                type="button"
                                onClick={() => setInterviewStatus(iv.id, "confirmed")}
                                className="text-label-caps text-emerald-600 hover:underline"
                              >
                                Confirmer
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setReschedulingId(iv.id)}
                              className="text-label-caps text-secondary hover:underline"
                            >
                              Replanifier
                            </button>
                            {iv.interviewLink && (
                              <a href={iv.interviewLink} target="_blank" rel="noopener noreferrer" className="text-label-caps text-primary hover:underline ml-auto">
                                Rejoindre
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <div className="col-span-12 lg:col-span-4 space-y-lg">
        {next && (
          <div className="bg-on-surface text-white rounded-xl p-lg space-y-2">
            <p className="text-label-caps text-periwinkle uppercase">Prochain entretien</p>
            <p className="font-h3 text-h3">{next.candidateName}</p>
            <p className="text-body-sm text-slate-300">
              {new Date(next.interviewAt).toLocaleString("fr-FR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
            </p>
            {next.interviewLink && (
              <a href={next.interviewLink} target="_blank" rel="noopener noreferrer" className="inline-block text-label-caps font-semibold bg-white/10 hover:bg-white/20 transition-colors rounded-lg px-3 py-1.5 mt-1">
                Rejoindre l&apos;appel
              </a>
            )}
          </div>
        )}

        <div className="tonal-card rounded-xl p-lg space-y-md">
          <h4 className="font-label-caps text-label-caps text-primary uppercase">
            À planifier — {unscheduled.length} candidat{unscheduled.length !== 1 ? "s" : ""}
          </h4>
          <div className="space-y-2">
            {unscheduled.map((app) => (
              <div key={app.id} className="bg-white border border-outline-variant rounded-lg p-2 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-body-sm font-semibold text-on-surface truncate">{app.candidateName}</p>
                  <span className="text-label-caps font-bold text-primary shrink-0">{app.score}%</span>
                </div>
                <p className="text-label-caps text-secondary truncate">{app.jobTitle}</p>

                {schedulingId === app.id ? (
                  <form
                    action={async (fd) => { await scheduleInterview(app.id, fd); setSchedulingId(null); }}
                    className="space-y-1 pt-1"
                  >
                    <input type="datetime-local" name="at" required className="w-full text-body-sm border border-outline-variant rounded px-1.5 py-1" />
                    <input type="url" name="link" placeholder="Lien visio (optionnel)" className="w-full text-body-sm border border-outline-variant rounded px-1.5 py-1" />
                    <button type="submit" className="w-full text-label-caps font-semibold bg-primary text-white rounded py-1 hover:bg-primary-container transition-colors">
                      Planifier
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSchedulingId(app.id)}
                    className="w-full text-label-caps font-semibold text-primary border border-primary/30 rounded py-1 hover:bg-primary/5 transition-colors"
                  >
                    Planifier l&apos;entretien
                  </button>
                )}
              </div>
            ))}
            {unscheduled.length === 0 && (
              <p className="text-body-sm text-secondary">Tous les candidats actifs ont un entretien planifié.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
