import { Briefcase, ArrowRight } from "lucide-react";
import DashboardShell from "@/components/dashboard-shell";

export default function CareersPage() {
  return (
    <DashboardShell>
      {/* Page heading */}
      <div className="mb-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Join us
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Careers at CONN-WRY
        </h1>
      </div>

      {/* Empty state */}
      <div className="flex flex-col items-center gap-6 rounded-[2rem] border border-dashed border-slate-200 bg-white px-8 py-24 text-center shadow-sm">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-slate-100">
          <Briefcase className="size-8 text-slate-400" aria-hidden="true" />
        </div>
        <div className="max-w-sm">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            Great opportunities are coming soon.
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            We&apos;re building something exciting at CONN-WRY. You can check back here
            for future openings — roles across product, engineering, marketing, and beyond.
          </p>
        </div>

        <a
          href="mailto:careers@connwry.com"
          className="mt-2 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          Get notified when we&apos;re hiring
          <ArrowRight className="size-4" aria-hidden="true" />
        </a>
      </div>
    </DashboardShell>
  );
}
