import { NextRequest, NextResponse } from "next/server";
import { extractSkillsFromText } from "@/lib/extract-skills";

export interface JobPreview {
  title:        string;
  company:      string;
  location:     string;
  department:   string;
  requirements: string;
}

// Strip HTML tags and collapse whitespace
function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Extract first <title> tag
function extractTitle(html: string): string {
  return html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ?? "";
}

// Extract first <h1> tag
function extractH1(html: string): string {
  return stripHtml(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "");
}

// Try to extract a JSON-LD JobPosting block
function extractJsonLd(html: string): Partial<JobPreview> | null {
  const scripts = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const match of scripts) {
    try {
      const data = JSON.parse(match[1]);
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        if (item["@type"] !== "JobPosting") continue;
        const location =
          item.jobLocation?.address?.addressLocality ??
          item.jobLocation?.address?.addressRegion ??
          item.applicantLocationRequirements?.name ??
          "";
        const description = stripHtml(item.description ?? "");
        const skills = extractSkillsFromText(description);
        return {
          title:        item.title ?? "",
          company:      item.hiringOrganization?.name ?? "",
          location:     location,
          department:   item.occupationalCategory ?? "",
          requirements: skills.join(", "),
        };
      }
    } catch {
      // ignore malformed JSON
    }
  }
  return null;
}

// Heuristic fallback — extract from plain text
function extractHeuristic(html: string): Partial<JobPreview> {
  const title   = extractH1(html) || extractTitle(html).split(" - ")[0].split(" | ")[0].trim();
  const company = extractTitle(html).split(" - ").at(-1)?.split(" | ").at(-1)?.trim() ?? "";
  const text    = stripHtml(html).slice(0, 8000);
  const skills  = extractSkillsFromText(text);

  // Simple location pattern: "Location: X" or "City, Country"
  const locMatch = text.match(/location[:\s]+([A-Z][a-zA-Z\s,]+?)(?:\s{2,}|\n|·|—)/i);
  const location = locMatch?.[1]?.trim() ?? "";

  return { title, company, location, department: "", requirements: skills.join(", ") };
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json() as { url: string };

    if (!url?.startsWith("http")) {
      return NextResponse.json({ ok: false, error: "URL invalide" }, { status: 400 });
    }

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; HireMind/1.0; +https://hiremind.app)",
        "Accept":     "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      return NextResponse.json({ ok: false, error: `HTTP ${res.status}` }, { status: 400 });
    }

    const html = await res.text();
    const data = extractJsonLd(html) ?? extractHeuristic(html);

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
