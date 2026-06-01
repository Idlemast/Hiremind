import type { Candidate, Job } from "@/entities/index";

export interface GapFrequency {
  skill: string;
  count: number;
  pct: number;
}

export interface FitDistribution {
  jobId: number;
  jobTitle: string;
  strong: number;
  medium: number;
  weak: number;
  total: number;
}

export function computeGapFrequency(candidates: Candidate[]): GapFrequency[] {
  const freq: Record<string, number> = {};
  for (const c of candidates) {
    const gaps = (c.gaps as string[] | null) ?? [];
    for (const g of gaps) {
      freq[g] = (freq[g] ?? 0) + 1;
    }
  }
  const total = candidates.length || 1;
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([skill, count]) => ({ skill, count, pct: Math.round((count / total) * 100) }));
}

export function computeFitDistribution(
  candidates: Candidate[],
  jobs: Job[],
  scoreToFitFn: (score: number) => string
): FitDistribution[] {
  return jobs.map((job) => {
    const jobCandidates = candidates.filter((c) => (c.job as any)?.id === job.id || (c as any).job_id === job.id);
    const strong = jobCandidates.filter((c) => scoreToFitFn(c.score) === "strong").length;
    const medium = jobCandidates.filter((c) => scoreToFitFn(c.score) === "medium").length;
    const weak   = jobCandidates.filter((c) => scoreToFitFn(c.score) === "weak").length;
    return { jobId: job.id, jobTitle: job.title, strong, medium, weak, total: jobCandidates.length };
  }).filter((d) => d.total > 0);
}
