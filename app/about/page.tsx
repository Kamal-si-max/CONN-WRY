import Link from "next/link";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import DashboardShell from "@/components/dashboard-shell";

// ─── Data ─────────────────────────────────────────────────────────────────────

const promises = [
  {
    title: "Opportunities for everyone",
    body: "No follower minimum, no influencer status required. Every campaign and task on CONN-WRY is open to any user who wants to join the opportunity.",
  },
  {
    title: "Transparency with trust",
    body: "Every campaign is reviewed before it goes live, every submission is checked before payout — so brands, AI companies, and users can all trust what happens on the platform.",
  },
  {
    title: "Feed-first, not app-hopping",
    body: "While task and reward apps live outside your social life, CONN-WRY brings opportunity directly into your feed — no separate app, no extra friction.",
  },
  {
    title: "Purposeful participation",
    body: "We don't just connect you to a prize pool. Every task comes with the guidance to do it well — so your effort turns into a real, approved opportunity.",
  },
  {
    title: "Learn as you go",
    body: "Every task comes paired with study material — a guide, an example, a walkthrough — so you're not just taking the opportunity, you're picking up real skills along the way.",
  },
];

const reasons = [
  {
    title: "Real brands, real campaigns",
    body: "Work directly with brands running contests and challenges, not a black-box algorithm.",
  },
  {
    title: "AI training, made accessible",
    body: "Get paid for tasks that power the next generation of AI — labeling, feedback, annotation — no technical background needed.",
  },
  {
    title: "Built-in guidance",
    body: "Study material and instructions come with every task, so you know exactly what's expected before you start.",
  },
  {
    title: "Fair, reviewed payouts",
    body: "Every submission goes through review before you get paid, keeping the platform fair for everyone involved.",
  },
  {
    title: "Skills, not just cash",
    body: "Study material attached to every task means you walk away having learned something, not just gained an opportunity.",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <DashboardShell>
      {/* Back to Dashboard */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to Dashboard
        </Link>
      </div>

      {/* Hero */}
      <section className="mb-14 rounded-[2rem] border border-white/10 bg-white/80 px-8 py-14 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:px-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Who we are
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
          About CONN-WRY
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
          Welcome to CONN-WRY — where every scroll is an opportunity, and ambition doesn&apos;t
          need a follower count.
        </p>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
          At CONN-WRY, we believe opportunities should belong to everyone, not just influencers.
          Built as a social feed where brand contests, challenges, and AI training tasks live
          natively alongside your posts, we bring real paid opportunities into the space you
          already spend time in — your feed.
        </p>
      </section>

      {/* Our Promise */}
      <section className="mb-14">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-slate-900">
          Our Promise
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {promises.map((item, i) => (
            <div
              key={item.title}
              className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-bold text-accent">
                  {i + 1}
                </span>
                <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
              </div>
              <p className="text-sm leading-6 text-slate-500">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section>
        <h2 className="mb-6 text-2xl font-semibold tracking-tight text-slate-900">
          Why Choose Us?
        </h2>
        <div className="flex flex-col gap-4">
          {reasons.map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white px-6 py-5 shadow-sm"
            >
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}
