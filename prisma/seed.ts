// Seeds: built-in templates (FR-TMPL-01/02), a demo workspace + admin user,
// a sample channel with voice/audience/ideas so the app shows real data on first run.

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const LONG_TEMPLATES = [
  { name: "Flexible", structure: { sections: ["Hook", "Body", "Conclusion"], notes: "Free-form. AI decides pacing." } },
  { name: "Educational (WHY-WHAT-HOW)", structure: { sections: ["Why it matters", "What it is", "How to do it"] } },
  { name: "Documentary (3-act)", structure: { sections: ["Setup", "Confrontation", "Resolution"] } },
  { name: "Explainer", structure: { sections: ["Question", "Mechanism", "Implication"] } },
  { name: "Commentary (O-I-E)", structure: { sections: ["Observation", "Insight", "Evidence"] } },
  { name: "Review (C-F-V)", structure: { sections: ["Context", "Finding", "Verdict"] } },
  { name: "Compilation", structure: { sections: ["Intro", "Curated items", "Wrap"] } },
  { name: "Fictional Story (3-act)", structure: { sections: ["Setup", "Conflict", "Resolution"] } },
  { name: "VSL (P-A-S)", structure: { sections: ["Problem", "Agitation", "Solution"] } },
  { name: "Listicle", structure: { sections: ["Intro", "Items", "Best pick"] } },
  { name: "Essay (thesis)", structure: { sections: ["Thesis", "Arguments", "Conclusion"] } },
  { name: "News (inverted pyramid)", structure: { sections: ["Lede", "Details", "Background"] } },
  { name: "Experiment", structure: { sections: ["Question", "Test", "Result"] } },
  { name: "Challenge", structure: { sections: ["Premise", "Attempts", "Outcome"] } },
];

const SHORT_TEMPLATES = [
  { name: "Shorts Educational" },
  { name: "Shorts Review" },
  { name: "Shorts Story" },
  { name: "Shorts Viral" },
  { name: "Shorts Ad" },
];

async function seedTemplates() {
  for (const t of LONG_TEMPLATES) {
    await db.template.upsert({
      where: { id: "global-" + t.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") },
      update: {},
      create: {
        id: "global-" + t.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        name: t.name,
        kind: "long",
        source: "built-in",
        structure: JSON.stringify(t.structure),
      },
    });
  }
  for (const t of SHORT_TEMPLATES) {
    await db.template.upsert({
      where: { id: "global-" + t.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") },
      update: {},
      create: {
        id: "global-" + t.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        name: t.name,
        kind: "short",
        source: "built-in",
        structure: JSON.stringify({ sections: ["Hook", "Beat", "Payoff"] }),
      },
    });
  }
}

async function seedDemoData() {
  const adminEmail = (process.env.BOOTSTRAP_ADMIN_EMAIL ?? "you@example.com").toLowerCase();
  const passwordHash = await bcrypt.hash("createup-dev", 10);

  const user = await db.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, name: "CreateUp Admin", passwordHash },
  });

  const workspace = await db.workspace.upsert({
    where: { id: "demo-workspace" },
    update: {},
    create: { id: "demo-workspace", name: "Demo Workspace", defaultModel: "claude-sonnet" },
  });

  await db.membership.upsert({
    where: { userId_workspaceId: { userId: user.id, workspaceId: workspace.id } },
    update: { role: "ADMIN" },
    create: { userId: user.id, workspaceId: workspace.id, role: "ADMIN" },
  });

  const channel = await db.channel.upsert({
    where: { id: "demo-channel" },
    update: {},
    create: {
      id: "demo-channel",
      workspaceId: workspace.id,
      name: "Demo Creator",
      nicheDescription: "Practical, evidence-based productivity for knowledge workers.",
      presentationStyle: "personality",
      differentiation: "Less hustle, more systems. Cite the research; show the math.",
      defaultModel: "claude-sonnet",
      accentColor: "#E5482F",
    },
  });

  await db.voiceProfile.upsert({
    where: { id: "demo-voice" },
    update: {},
    create: {
      id: "demo-voice",
      channelId: channel.id,
      label: "Default voice",
      isDefault: true,
      data: JSON.stringify({
        archetype: { ageVibe: "30s", profession: "engineer-writer", temperament: "calm-curious", authority: "peer-expert" },
        delivery: { cadence: "measured", energy: "warm-medium", pacing: "varied" },
        rhetoric: { hooks: ["counter-intuitive", "data-led"], transitions: ["bridge", "callback"], cta: "soft" },
        diction: { vocabulary: "everyday-precise", sentenceShape: "mixed", avoid: ["literally","very","quite"] },
        extras: { phraseKit: ["Here's the thing —", "But here's where it gets interesting:"], formatting: "spoken-style" },
      }),
    },
  });

  await db.audienceAvatar.upsert({
    where: { channelId: channel.id },
    update: {},
    create: {
      channelId: channel.id,
      demographics: JSON.stringify({ ageRange: "26–40", role: "knowledge worker", location: "global English-speaking" }),
      psychographics: JSON.stringify({ values: ["competence","autonomy"], pains: ["info-overload","time-poverty"] }),
      onlineBehavior: JSON.stringify({ platforms: ["YouTube","Twitter","Substack"], habits: ["multi-tab","deep-dive"] }),
      offlineBehavior: JSON.stringify({ environment: ["WFH","gym","commute"] }),
      keyQuestions: JSON.stringify(["What's actually worth doing today?","Which advice is BS?","How do experts decide?"]),
    },
  });

  const ideas = [
    { title: "I tried four productivity systems for 30 days. Only one worked.", strategy: "Comparison + receipts", outlierScore: 4.2 },
    { title: "Stop reading productivity books. Do this instead.", strategy: "Counter-intuitive hook", outlierScore: 6.1 },
    { title: "The 2-hour workday: how researchers actually plan their time", strategy: "Curiosity gap + authority", outlierScore: 3.4 },
  ];
  for (const i of ideas) {
    await db.idea.create({
      data: {
        channelId: channel.id,
        title: i.title,
        strategy: i.strategy,
        outlierScore: i.outlierScore,
        topic: "Productivity",
        suggestedLength: "8–12 min",
      },
    });
  }
}

async function main() {
  await seedTemplates();
  await seedDemoData();
  console.log("✓ Seed complete. Admin email:", (process.env.BOOTSTRAP_ADMIN_EMAIL ?? "you@example.com").toLowerCase(), "  password: createup-dev");
}

main().then(() => db.$disconnect()).catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
