const SKILL_DICTIONARY: string[] = [
  // Languages
  "JavaScript", "TypeScript", "Python", "Java", "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin", "C#", "C++", "Scala",
  // Frontend
  "React", "Vue", "Angular", "Next.js", "Svelte", "HTML", "CSS", "Tailwind", "Sass", "Redux", "GraphQL",
  // Backend
  "Node.js", "Express", "NestJS", "Django", "FastAPI", "Spring Boot", "Rails", "Laravel",
  // Database
  "PostgreSQL", "MySQL", "MongoDB", "SQLite", "Redis", "Prisma", "Supabase",
  // Cloud & DevOps
  "AWS", "GCP", "Azure", "Docker", "Kubernetes", "CI/CD", "GitHub Actions", "Terraform",
  // Design
  "Figma", "Sketch", "Adobe XD", "Design Systems", "UX Strategy", "User Research",
  "Prototyping", "Wireframing", "Information Architecture", "Accessibility", "Motion Design",
  // Product
  "Product Strategy", "Roadmapping", "Agile", "Scrum", "Stakeholder Management",
  "OKRs", "A/B Testing", "Data Analysis", "User Interviews",
  // Data & ML
  "SQL", "Tableau", "Power BI", "Machine Learning", "TensorFlow", "PyTorch", "Pandas",
  // Soft skills
  "Leadership", "Team Management", "Communication", "Mentoring", "Cross-functional",
];

export function extractSkillsFromText(text: string): string[] {
  if (!text.trim()) return [];
  const normalized = text.toLowerCase();
  return SKILL_DICTIONARY.filter((skill) =>
    normalized.includes(skill.toLowerCase())
  );
}

export function parseManualSkills(raw: string): string[] {
  return raw
    .split(/[,\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function mergeSkills(manual: string[], extracted: string[]): string[] {
  const seen = new Set<string>();
  return [...manual, ...extracted].filter((s) => {
    const key = s.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
