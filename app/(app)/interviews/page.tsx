import { getScheduledInterviews, getUnscheduledApplications } from "@/lib/db";
import InterviewCalendar from "@/components/interviews/InterviewCalendar";

export default async function InterviewsPage() {
  const [scheduled, unscheduled] = await Promise.all([
    getScheduledInterviews(),
    getUnscheduledApplications(8),
  ]);

  return (
    <div className="p-4 lg:p-xl space-y-lg">
      <div>
        <h2 className="font-h1 text-h1 text-on-surface">Entretiens</h2>
        <p className="text-body-sm text-slate-500 mt-1">
          Planification et suivi des entretiens candidats, tous postes confondus.
        </p>
      </div>
      <InterviewCalendar scheduled={scheduled} unscheduled={unscheduled} />
    </div>
  );
}
