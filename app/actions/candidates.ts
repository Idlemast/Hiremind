"use server";

import { redirect } from "next/navigation";
import { getEm, getJobById, getCandidateById } from "@/lib/db";
import { scoreCandidate } from "@/lib/triage";
import { extractSkillsFromText, parseManualSkills, mergeSkills } from "@/lib/extract-skills";
import { Candidate } from "@/entities/index";

export async function importCandidate(formData: FormData) {
  const jobId    = Number(formData.get("jobId"));
  const name     = String(formData.get("name") ?? "").trim();
  const role     = String(formData.get("role") ?? "").trim();
  const company  = String(formData.get("company") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const email    = String(formData.get("email") ?? "").trim() || undefined;
  const salary   = String(formData.get("salary") ?? "").trim() || undefined;
  const source   = String(formData.get("source") ?? "Manual").trim();
  const cvText   = String(formData.get("cvText") ?? "");
  const rawSkills = String(formData.get("skills") ?? "");

  if (!name || !role || !company || !location || !jobId) {
    throw new Error("Champs obligatoires manquants");
  }

  const job = await getJobById(jobId);
  if (!job) throw new Error("Job introuvable");

  const manualSkills  = parseManualSkills(rawSkills);
  const extractedSkills = extractSkillsFromText(cvText);
  const skills = mergeSkills(manualSkills, extractedSkills);

  const requirements = (job.requirements as string[] | null) ?? [];
  const result = scoreCandidate({ candidateSkills: skills, jobRequirements: requirements });

  const em = await getEm();
  const candidate = em.create(Candidate, {
    name, role, company, location, email, salary, source,
    skills,
    fit:  result.fit,
    score: result.score,
    gaps:  result.missingSkills,
    why:   result.why,
    tags:  [],
    job,
  });

  em.persist(candidate);
  await em.flush();

  redirect(`/candidates/${candidate.id}`);
}

export async function updateCandidateTags(id: number, tags: string[]) {
  const em        = await getEm();
  const candidate = await getCandidateById(id);
  if (!candidate) throw new Error("Candidat introuvable");

  const ref = em.getReference(Candidate, id);
  em.assign(ref, { tags });
  await em.flush();
}
