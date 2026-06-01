import { MikroORM } from "@mikro-orm/sqlite";
import config from "../mikro-orm.config";
import { Job, Candidate } from "../entities/index";
import { scoreCandidate } from "../lib/triage";

// Job requirements used by the triage engine
const JOB_REQUIREMENTS: Record<string, { requirements: string[]; bonus: string[] }> = {
  designer: {
    requirements: ["Design Systems", "Figma", "UX Strategy", "Prototyping", "SaaS"],
    bonus: ["React", "Data Visualization", "User Research", "Stakeholder Management"],
  },
  engineer: {
    requirements: ["React", "TypeScript", "System Design", "Performance"],
    bonus: ["Node.js", "Testing", "CI/CD", "Team Lead"],
  },
  pm: {
    requirements: ["Product Strategy", "Roadmapping", "Stakeholder Management", "Data Analysis"],
    bonus: ["Fintech", "Agile", "A/B Testing", "User Research"],
  },
};

function triage(skills: string[], jobKey: keyof typeof JOB_REQUIREMENTS) {
  const { requirements, bonus } = JOB_REQUIREMENTS[jobKey];
  return scoreCandidate({ candidateSkills: skills, jobRequirements: requirements, bonusKeywords: bonus });
}

async function seed() {
  const orm = await MikroORM.init(config);
  const em = orm.em.fork();

  await em.nativeDelete(Candidate, {});
  await em.nativeDelete(Job, {});

  // ── Jobs ──────────────────────────────────────────────────────────────────

  const PIPELINE_DESIGN = ["Sourcing", "CV Review", "Phone Screen", "Test Design", "Entretien Final", "Offre"];
  const PIPELINE_ENG    = ["Sourcing", "CV Review", "Phone Screen", "Test Technique", "Entretien Final", "Offre"];
  const PIPELINE_PM     = ["Sourcing", "CV Review", "Entretien RH", "Case Study", "Entretien Final", "Offre"];

  // progress = index / (stages - 1) * 100 → 5 steps, so index 3 = 60%, index 4 = 80%, index 1 = 20%
  const designer = em.create(Job, {
    title: "Senior Product Designer",
    department: "Design",
    location: "Remote",
    stages: PIPELINE_DESIGN,
    currentStageIndex: 3,           // "Test Design"
    stage: PIPELINE_DESIGN[3],
    icon: "palette",
    iconBg: "bg-purple-50 text-purple-600",
    progress: 60,
    requirements: JOB_REQUIREMENTS.designer.requirements,
  });

  const engineer = em.create(Job, {
    title: "Lead Frontend Engineer",
    department: "Engineering",
    location: "London, UK",
    stages: PIPELINE_ENG,
    currentStageIndex: 4,           // "Entretien Final"
    stage: PIPELINE_ENG[4],
    icon: "code",
    iconBg: "bg-blue-50 text-primary",
    progress: 80,
    requirements: JOB_REQUIREMENTS.engineer.requirements,
  });

  const pm = em.create(Job, {
    title: "Product Manager",
    department: "Product",
    location: "New York, NY",
    stages: PIPELINE_PM,
    currentStageIndex: 1,           // "CV Review"
    stage: PIPELINE_PM[1],
    icon: "campaign",
    iconBg: "bg-orange-50 text-orange-600",
    progress: 20,
    requirements: JOB_REQUIREMENTS.pm.requirements,
  });

  em.persist([designer, engineer, pm]);
  await em.flush();

  // ── Candidates — scores calculated by triage engine ───────────────────────

  const candidatesData = [
    // Senior Product Designer
    {
      name: "Marcus Holloway", role: "Senior Product Designer", company: "GlobalFin",
      location: "San Francisco, CA",
      skills: ["Design Systems (Expert)", "Figma Mastery", "React Components", "Data Visualization", "Prototyping", "UX Strategy"],
      tags: ["HIGH_POTENTIAL", "SYSTEMS_HEAVY", "RELO_READY"],
      source: "LinkedIn Recruiter", salary: "$180k – $210k", job: designer, jobKey: "designer" as const,
      why: `Marcus stands out due to his rare combination of deep systems thinking and high-fidelity visual execution. Having led the design system overhaul at a Tier-1 fintech firm, he demonstrates the precise expertise needed for our upcoming platform migration.`,
    },
    {
      name: "Sarah Chen", role: "Senior Designer @ FintechCo", company: "FintechCo",
      location: "New York, NY",
      skills: ["Design Systems", "UX Strategy", "Prototyping", "Figma"],
      tags: ["TOP_PICK", "AVAILABLE_NOW"],
      source: "Referral", salary: "$160k – $190k", job: designer, jobKey: "designer" as const,
      why: "Sarah brings exceptional craft and systems thinking from her fintech background.",
    },
    {
      name: "Aria Vance", role: "UI Designer @ CreativeHub", company: "CreativeHub",
      location: "Austin, TX",
      skills: ["Visual Design", "Brand Identity", "Storyboarding"],
      tags: ["NEEDS_REVIEW"],
      source: "LinkedIn", salary: "$120k – $140k", job: designer, jobKey: "designer" as const,
    },
    {
      name: "Jordan Smith", role: "Junior Web Dev @ Agency", company: "WebAgency",
      location: "Chicago, IL",
      skills: ["HTML/CSS", "Figma (basic)"],
      tags: [],
      source: "Indeed", job: designer, jobKey: "designer" as const,
    },
    // Lead Frontend Engineer
    {
      name: "Priya Mehta", role: "Senior Frontend Engineer @ Stripe", company: "Stripe",
      location: "Remote",
      skills: ["React (Expert)", "TypeScript", "System Design", "Performance Optimization", "Team Lead"],
      tags: ["HIGH_POTENTIAL", "REMOTE_READY"],
      source: "LinkedIn Recruiter", salary: "$190k – $220k", job: engineer, jobKey: "engineer" as const,
      why: "Priya has an exceptional track record shipping high-scale frontend systems at Stripe.",
    },
    {
      name: "Dev Patel", role: "Frontend Engineer @ Shopify", company: "Shopify",
      location: "Toronto, Canada",
      skills: ["React", "JavaScript", "CSS"],
      tags: ["RELOCATION_REQUIRED"],
      source: "GitHub", job: engineer, jobKey: "engineer" as const,
    },
    // Product Manager
    {
      name: "Lena Park", role: "Senior PM @ Notion", company: "Notion",
      location: "San Francisco, CA",
      skills: ["Product Strategy", "Roadmapping", "Stakeholder Management", "Data Analysis", "Agile"],
      tags: ["HIGH_POTENTIAL"],
      source: "LinkedIn", salary: "$170k – $200k", job: pm, jobKey: "pm" as const,
      why: "Lena has shipped 0-to-1 products at Notion with remarkable velocity and user focus.",
    },
  ];

  for (const data of candidatesData) {
    const { jobKey, ...rest } = data;
    const result = triage(rest.skills, jobKey);
    em.create(Candidate, {
      ...rest,
      score: result.score,
      fit: result.fit,
      gaps: result.missingSkills,
      why: rest.why ?? result.why,
    });
  }

  await em.flush();
  console.log("✓ Seed complete — 3 jobs, 7 candidates (scores computed by triage engine)");
  await orm.close();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
