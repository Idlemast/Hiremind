// Unicode range ̀-ͯ = combining diacritical marks (accents)
const COMBINING = /[̀-ͯ]/g;

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(COMBINING, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

export function jobUrl(id: number, title: string): string {
  return `/jobs/${id}-${slugify(title)}`;
}

export function candidateUrl(
  id: number,
  name: string,
  appId?: number,
  jobTitle?: string,
): string {
  const base = `/candidates/${id}-${slugify(name)}`;
  if (!appId) return base;
  const appSegment = jobTitle ? `${appId}-${slugify(jobTitle)}` : String(appId);
  return `${base}?appId=${appSegment}`;
}
