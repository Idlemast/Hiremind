import { MikroORM } from "@mikro-orm/sqlite";
import config from "../mikro-orm.config";
import { Job, Candidate, Application } from "../entities/index";
import { scoreCandidate } from "../lib/triage";

const REQS: Record<string, { requirements: string[]; bonus: string[] }> = {
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
  data: {
    requirements: ["Python", "SQL", "Machine Learning", "Data Pipeline"],
    bonus: ["Spark", "Airflow", "dbt", "Statistics"],
  },
  devops: {
    requirements: ["Kubernetes", "Terraform", "CI/CD", "AWS"],
    bonus: ["Observability", "Security", "Helm", "GitOps"],
  },
};

function triage(skills: string[], jobKey: keyof typeof REQS) {
  const { requirements, bonus } = REQS[jobKey];
  return scoreCandidate({ candidateSkills: skills, jobRequirements: requirements, bonusKeywords: bonus });
}

async function seed() {
  const orm  = await MikroORM.init(config);
  const em   = orm.em.fork();
  const conn = em.getConnection();

  await conn.execute(`CREATE TABLE IF NOT EXISTS application (
    id           INTEGER  NOT NULL PRIMARY KEY AUTOINCREMENT,
    candidate_id INTEGER  NOT NULL REFERENCES candidate(id) ON DELETE CASCADE,
    job_id       INTEGER  NOT NULL REFERENCES job(id)       ON DELETE CASCADE,
    score        INTEGER  NOT NULL DEFAULT 0,
    fit          TEXT     NOT NULL DEFAULT 'weak',
    gaps         TEXT     NULL,
    why          TEXT     NULL,
    notes        TEXT     NULL,
    stage_index  INTEGER  NOT NULL DEFAULT 0,
    applied_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(candidate_id, job_id)
  )`);

  await conn.execute("PRAGMA foreign_keys = OFF");
  await em.nativeDelete(Application, {});
  await em.nativeDelete(Candidate, {});
  await em.nativeDelete(Job, {});

  // ── Jobs ──────────────────────────────────────────────────────────────────

  const P_DESIGN  = ["Sourcing", "CV Review", "Phone Screen", "Test Design",     "Entretien Final", "Offre"];
  const P_ENG     = ["Sourcing", "CV Review", "Phone Screen", "Test Technique",  "Entretien Final", "Offre"];
  const P_PM      = ["Sourcing", "CV Review", "Entretien RH", "Case Study",      "Entretien Final", "Offre"];
  const P_DATA    = ["Sourcing", "CV Review", "Phone Screen", "Challenge Algo",  "Entretien Final", "Offre"];
  const P_DEVOPS  = ["Sourcing", "CV Review", "Phone Screen", "Test Infra",      "Entretien Final", "Offre"];

  const designer = em.create(Job, {
    title: "Senior Product Designer", department: "Design", location: "Remote",
    stages: P_DESIGN, currentStageIndex: 3, stage: P_DESIGN[3],
    icon: "palette", iconBg: "bg-purple-50 text-purple-600", progress: 60,
    budget: "$150k – $180k", status: "open",
    requirements: REQS.designer.requirements,
  });
  const engineer = em.create(Job, {
    title: "Lead Frontend Engineer", department: "Engineering", location: "London, UK",
    stages: P_ENG, currentStageIndex: 4, stage: P_ENG[4],
    icon: "code", iconBg: "bg-blue-50 text-primary", progress: 80,
    budget: "$160k – $200k", status: "open",
    requirements: REQS.engineer.requirements,
  });
  const pm = em.create(Job, {
    title: "Product Manager", department: "Product", location: "New York, NY",
    stages: P_PM, currentStageIndex: 1, stage: P_PM[1],
    icon: "campaign", iconBg: "bg-orange-50 text-orange-600", progress: 20,
    budget: "$130k – $160k", status: "open",
    requirements: REQS.pm.requirements,
  });
  const dataEng = em.create(Job, {
    title: "Senior Data Engineer", department: "Data", location: "Paris, FR",
    stages: P_DATA, currentStageIndex: 2, stage: P_DATA[2],
    icon: "analytics", iconBg: "bg-teal-50 text-teal-600", progress: 40,
    budget: "$110k – $140k", status: "open",
    requirements: REQS.data.requirements,
  });
  const devops = em.create(Job, {
    title: "DevOps Engineer", department: "Infrastructure", location: "Berlin, DE",
    stages: P_DEVOPS, currentStageIndex: 1, stage: P_DEVOPS[1],
    icon: "settings_suggest", iconBg: "bg-slate-50 text-slate-600", progress: 20,
    budget: "$120k – $150k", status: "open",
    requirements: REQS.devops.requirements,
  });

  em.persist([designer, engineer, pm, dataEng, devops]);
  await em.flush();

  // ── Candidates ────────────────────────────────────────────────────────────
  // Format: { ...candidateFields, applications: [{ job, jobKey, why?, notes?, stageIndex? }] }

  const CANDIDATES = [
    // ── Multi-candidature stars ──────────────────────────────────────────────
    {
      name: "Marcus Holloway", role: "Senior Product Designer", company: "GlobalFin",
      location: "San Francisco, CA", email: "marcus@globalfin.com",
      skills: ["Design Systems (Expert)", "Figma Mastery", "React Components", "Data Visualization", "Prototyping", "UX Strategy"],
      tags: ["HIGH_POTENTIAL", "SYSTEMS_HEAVY", "RELO_READY"], source: "LinkedIn Recruiter", salary: "$180k – $210k",
      applications: [
        { job: designer, jobKey: "designer" as const,
          why: "Marcus stands out for his rare combination of systems thinking and execution. Led the design system overhaul at GlobalFin, directly applicable to our platform." },
        { job: pm, jobKey: "pm" as const,
          why: "Crossed into PM territory at GlobalFin — owned roadmap for 3 design tokens products. Unconventional but compelling." },
      ],
    },
    {
      name: "Priya Mehta", role: "Senior Frontend Engineer", company: "Stripe",
      location: "Remote", email: "priya@stripe.com",
      skills: ["React (Expert)", "TypeScript", "System Design", "Performance Optimization", "Team Lead", "Testing"],
      tags: ["HIGH_POTENTIAL", "REMOTE_READY"], source: "LinkedIn Recruiter", salary: "$190k – $220k",
      applications: [
        { job: engineer, jobKey: "engineer" as const,
          why: "Priya shipped high-scale frontend infra at Stripe. Deep React expertise, strong on perf.", stageIndex: 3 },
        { job: designer, jobKey: "designer" as const,
          why: "Unexpected crossover — Priya has shipped design systems and collaborates closely with design. Could bridge the gap." },
      ],
    },
    {
      name: "Lena Park", role: "Senior PM", company: "Notion",
      location: "San Francisco, CA", email: "lena@notion.so",
      skills: ["Product Strategy", "Roadmapping", "Stakeholder Management", "Data Analysis", "Agile", "A/B Testing", "User Research"],
      tags: ["HIGH_POTENTIAL", "TOP_PICK"], source: "LinkedIn", salary: "$170k – $200k",
      applications: [
        { job: pm, jobKey: "pm" as const,
          why: "Lena shipped 0-to-1 products at Notion with remarkable velocity and user focus.", stageIndex: 2 },
        { job: dataEng, jobKey: "data" as const,
          why: "Strong analytics background — built internal data dashboards at Notion. SQL-heavy role." },
      ],
    },
    {
      name: "Omar Shaikh", role: "Staff Engineer", company: "Cloudflare",
      location: "London, UK", email: "omar@cloudflare.com",
      skills: ["TypeScript", "React", "System Design", "Kubernetes", "Performance", "CI/CD", "Team Lead"],
      tags: ["HIGH_POTENTIAL", "FAST_TRACK"], source: "Referral", salary: "$200k – $240k",
      applications: [
        { job: engineer, jobKey: "engineer" as const,
          why: "Omar runs a 12-person frontend guild at Cloudflare. Architecture-first thinking, strong on scale." },
        { job: devops, jobKey: "devops" as const,
          why: "Heavy infra background underneath the frontend role — wrote Kubernetes deployments for Cloudflare edge workers." },
      ],
    },

    // ── Designer pool ────────────────────────────────────────────────────────
    {
      name: "Sarah Chen", role: "Senior Designer", company: "FintechCo",
      location: "New York, NY",
      skills: ["Design Systems", "UX Strategy", "Prototyping", "Figma", "User Research"],
      tags: ["TOP_PICK", "AVAILABLE_NOW"], source: "Referral", salary: "$160k – $190k",
      applications: [
        { job: designer, jobKey: "designer" as const,
          why: "Sarah brings exceptional craft and systems thinking from her fintech background.", stageIndex: 2 },
      ],
    },
    {
      name: "Aria Vance", role: "UI Designer", company: "CreativeHub",
      location: "Austin, TX",
      skills: ["Visual Design", "Brand Identity", "Storyboarding", "Figma"],
      tags: ["NEEDS_REVIEW"], source: "LinkedIn", salary: "$120k – $140k",
      applications: [{ job: designer, jobKey: "designer" as const }],
    },
    {
      name: "Jordan Smith", role: "Junior Web Developer", company: "WebAgency",
      location: "Chicago, IL",
      skills: ["HTML/CSS", "Figma (basic)", "JavaScript"],
      tags: [], source: "Indeed",
      applications: [{ job: designer, jobKey: "designer" as const }],
    },
    {
      name: "Chloe Dubois", role: "Product Designer", company: "Doctolib",
      location: "Paris, FR", email: "chloe@doctolib.fr",
      skills: ["Figma", "Design Systems", "Prototyping", "UX Strategy", "SaaS", "Stakeholder Management"],
      tags: ["TOP_PICK", "RELO_READY"], source: "LinkedIn", salary: "€70k – €85k",
      applications: [
        { job: designer, jobKey: "designer" as const,
          why: "Chloe owns the design system at Doctolib — one of France's most mature B2B design orgs." },
      ],
    },

    // ── Engineer pool ────────────────────────────────────────────────────────
    {
      name: "Dev Patel", role: "Frontend Engineer", company: "Shopify",
      location: "Toronto, Canada",
      skills: ["React", "JavaScript", "CSS", "Testing"],
      tags: ["RELOCATION_REQUIRED"], source: "GitHub",
      applications: [{ job: engineer, jobKey: "engineer" as const }],
    },
    {
      name: "Nina Russo", role: "Full-Stack Engineer", company: "Klarna",
      location: "Stockholm, SE", email: "nina@klarna.com",
      skills: ["React", "TypeScript", "Node.js", "Performance", "CI/CD"],
      tags: ["HIGH_POTENTIAL"], source: "LinkedIn Recruiter", salary: "€95k – €115k",
      applications: [
        { job: engineer, jobKey: "engineer" as const,
          why: "Nina has shipped real-time checkout flows at Klarna — obsessed with perf budgets.", stageIndex: 2 },
      ],
    },
    {
      name: "Tom Briggs", role: "Frontend Engineer", company: "Monzo",
      location: "London, UK",
      skills: ["React", "TypeScript", "Accessibility", "Testing"],
      tags: [], source: "GitHub",
      applications: [{ job: engineer, jobKey: "engineer" as const }],
    },

    // ── PM pool ──────────────────────────────────────────────────────────────
    {
      name: "Yuki Tanaka", role: "Group PM", company: "Mercari",
      location: "Tokyo, JP", email: "yuki@mercari.com",
      skills: ["Product Strategy", "Roadmapping", "Data Analysis", "Agile", "Stakeholder Management", "Fintech"],
      tags: ["HIGH_POTENTIAL", "RELO_READY"], source: "LinkedIn", salary: "$155k – $185k",
      applications: [
        { job: pm, jobKey: "pm" as const,
          why: "Yuki managed a $2B GMV marketplace product line. Deep on data-driven decision making." },
      ],
    },
    {
      name: "Amir Khoury", role: "Product Manager", company: "Leboncoin",
      location: "Paris, FR",
      skills: ["Roadmapping", "Stakeholder Management", "User Research"],
      tags: ["NEEDS_REVIEW"], source: "LinkedIn",
      applications: [{ job: pm, jobKey: "pm" as const }],
    },

    // ── Data pool ────────────────────────────────────────────────────────────
    {
      name: "Sofia Reyes", role: "Senior Data Engineer", company: "Spotify",
      location: "Stockholm, SE", email: "sofia@spotify.com",
      skills: ["Python", "SQL", "Machine Learning", "Data Pipeline", "Spark", "Airflow", "dbt"],
      tags: ["HIGH_POTENTIAL", "TOP_PICK"], source: "LinkedIn Recruiter", salary: "€100k – €125k",
      applications: [
        { job: dataEng, jobKey: "data" as const,
          why: "Sofia built Spotify's podcast recommendation pipeline — petabyte scale, low-latency.", stageIndex: 3 },
      ],
    },
    {
      name: "Hugo Petit", role: "Data Analyst", company: "BlaBlaCar",
      location: "Paris, FR",
      skills: ["Python", "SQL", "Statistics", "dbt"],
      tags: ["NEEDS_REVIEW"], source: "Referral",
      applications: [{ job: dataEng, jobKey: "data" as const }],
    },
    {
      name: "Fatima Al-Hassan", role: "ML Engineer", company: "Criteo",
      location: "Paris, FR", email: "fatima@criteo.com",
      skills: ["Python", "Machine Learning", "SQL", "Data Pipeline", "Statistics", "Spark"],
      tags: ["HIGH_POTENTIAL"], source: "LinkedIn", salary: "€95k – €115k",
      applications: [
        { job: dataEng, jobKey: "data" as const,
          why: "Fatima ships ML models to production at Criteo — rare blend of ML and infra." },
        { job: devops, jobKey: "devops" as const,
          why: "Her MLOps work covers Kubernetes-based model serving and observability pipelines." },
      ],
    },

    // ── DevOps pool ──────────────────────────────────────────────────────────
    {
      name: "Lars Engström", role: "Platform Engineer", company: "King",
      location: "Stockholm, SE", email: "lars@king.com",
      skills: ["Kubernetes", "Terraform", "AWS", "CI/CD", "Helm", "GitOps", "Observability"],
      tags: ["HIGH_POTENTIAL", "REMOTE_READY"], source: "GitHub", salary: "€110k – €130k",
      applications: [
        { job: devops, jobKey: "devops" as const,
          why: "Lars runs the platform team at King — 300+ microservices, multi-region K8s. Exactly the scale we need.", stageIndex: 2 },
      ],
    },
    {
      name: "Klara Novak", role: "SRE", company: "Zalando",
      location: "Berlin, DE",
      skills: ["Kubernetes", "AWS", "CI/CD", "Observability", "Security"],
      tags: ["AVAILABLE_NOW"], source: "LinkedIn",
      applications: [{ job: devops, jobKey: "devops" as const }],
    },
    {
      name: "Rafael Costa", role: "Junior DevOps", company: "Startup XYZ",
      location: "Lisbon, PT",
      skills: ["Docker", "CI/CD", "AWS (basic)"],
      tags: [], source: "Indeed",
      applications: [{ job: devops, jobKey: "devops" as const }],
    },
  ];

  // Step 1 — insert candidates
  const builtCandidates: Candidate[] = [];
  for (const d of CANDIDATES) {
    const c = em.create(Candidate, {
      name: d.name, role: d.role, company: d.company,
      location: d.location, email: d.email, salary: d.salary,
      source: d.source, skills: d.skills, tags: d.tags,
    });
    em.persist(c);
    builtCandidates.push(c);
  }
  await em.flush();

  // Step 2 — insert applications
  for (let i = 0; i < CANDIDATES.length; i++) {
    for (const appDef of CANDIDATES[i].applications) {
      const result = triage(CANDIDATES[i].skills, appDef.jobKey);
      em.persist(em.create(Application, {
        candidate:  builtCandidates[i],
        job:        appDef.job,
        score:      result.score,
        fit:        result.fit,
        gaps:       result.missingSkills,
        why:        (appDef as any).why ?? result.why,
        stageIndex: (appDef as any).stageIndex ?? 0,
      }));
    }
  }
  await em.flush();

  const appCount = CANDIDATES.reduce((s, c) => s + c.applications.length, 0);
  console.log(`✓ Seed — 5 jobs · ${CANDIDATES.length} candidats · ${appCount} candidatures`);
  await orm.close();
}

seed().catch((e) => { console.error(e); process.exit(1); });
