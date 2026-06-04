import { getTemplates } from "@/lib/db";
import NewJobForm from "@/components/jobs/NewJobForm";

export default async function NewJobPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  const templates = await getTemplates();
  return (
    <NewJobForm
      templates={templates}
      preselectedTemplateId={from ? Number(from) : undefined}
    />
  );
}
