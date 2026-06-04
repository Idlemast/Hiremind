import crypto from "crypto";

// Unicode range ̀-ͯ = combining diacritical marks (accents)
const COMBINING = /[̀-ͯ]/g;

export function generateSalt(length = 10): string {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = crypto.randomBytes(length);
  let result = "";
  for (const byte of bytes) result += charset[byte % charset.length];
  return result;
}

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

export function jobUrl(salt: string, title: string): string {
  return `/jobs/${salt}-${slugify(title)}`;
}

export function candidateUrl(
  salt: string,
  name: string,
  jobSalt?: string,
  jobTitle?: string,
): string {
  const candSegment = `${salt}-${slugify(name)}`;
  if (!jobSalt) return `/candidates/${candSegment}`;
  const jobSegment = jobTitle ? `${jobSalt}-${slugify(jobTitle)}` : jobSalt;
  return `/jobs/${jobSegment}/candidates/${candSegment}`;
}
