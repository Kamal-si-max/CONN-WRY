"use client";

import { useState } from "react";
import { Calendar, Tag, Clock, ChevronRight } from "lucide-react";
import DashboardShell from "@/components/dashboard-shell";

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = "All" | "Sports" | "Learning" | "AI Training" | "Challenges" | "Other";

interface Event {
  id: number;
  title: string;
  category: Exclude<Category, "All">;
  description: string;
  date: string;
  status: "Open" | "Upcoming" | "Closed";
}

// ─── Static data (replace with API/DB later) ──────────────────────────────────

const EVENTS: Event[] = [
  {
    id: 1,
    title: "CONN-WRY AI Caption Challenge",
    category: "AI Training",
    description:
      "Write creative captions for AI-generated images to help train the next generation of vision models.",
    date: "Aug 20, 2026",
    status: "Open",
  },
  {
    id: 2,
    title: "Social Media Marketing Sprint",
    category: "Challenges",
    description:
      "Create and share a brand post for our partner campaign. Top submissions earn a bonus reward.",
    date: "Aug 22, 2026",
    status: "Open",
  },
  {
    id: 3,
    title: "Digital Marketing Fundamentals Workshop",
    category: "Learning",
    description:
      "A structured learning event covering SEO, social ads, and content strategy. Earn a certificate.",
    date: "Sep 1, 2026",
    status: "Upcoming",
  },
  {
    id: 4,
    title: "Cricket Fan Engagement Challenge",
    category: "Sports",
    description:
      "Share match predictions, clips, and reactions. Top creators earn platform credits and prizes.",
    date: "Sep 5, 2026",
    status: "Upcoming",
  },
  {
    id: 5,
    title: "Feedback & Rating Marathon",
    category: "Other",
    description:
      "Review a set of app experiences and provide detailed feedback to help product teams improve.",
    date: "Jul 30, 2026",
    status: "Closed",
  },
  {
    id: 6,
    title: "AI Image Annotation Hackathon",
    category: "AI Training",
    description:
      "Label and annotate real-world images for a leading AI research project. Top contributors get bonuses.",
    date: "Sep 10, 2026",
    status: "Upcoming",
  },
];

const CATEGORIES: Category[] = ["All", "Sports", "Learning", "AI Training", "Challenges", "Other"];

const STATUS_STYLES: Record<Event["status"], string> = {
  Open:     "bg-emerald-50 text-emerald-700 border-emerald-200",
  Upcoming: "bg-blue-50    text-blue-700    border-blue-200",
  Closed:   "bg-slate-100  text-slate-500   border-slate-200",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function EventsPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  const filtered =
    activeCategory === "All"
      ? EVENTS
      : EVENTS.filter((e) => e.category === activeCategory);

  return (
    <DashboardShell>
      {/* Page heading */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          CONN-WRY
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Events
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Discover live challenges, learning sessions, and earning opportunities.
        </p>
      </div>

      {/* Category filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={[
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-150",
              activeCategory === cat
                ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900",
            ].join(" ")}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Event cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
          <Calendar className="size-10 text-slate-300" />
          <p className="text-base font-medium text-slate-500">No events in this category yet.</p>
          <p className="text-sm text-slate-400">Check back soon or explore another category.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((event) => (
            <div
              key={event.id}
              className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[event.status]}`}
                >
                  {event.status}
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Tag className="size-3" aria-hidden="true" />
                  {event.category}
                </span>
              </div>

              {/* Title + description */}
              <div>
                <h2 className="text-base font-semibold text-slate-900 leading-snug">
                  {event.title}
                </h2>
                <p className="mt-1.5 text-sm leading-6 text-slate-500">{event.description}</p>
              </div>

              {/* Footer row */}
              <div className="mt-auto flex items-center justify-between pt-2">
                <span className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock className="size-3.5" aria-hidden="true" />
                  {event.date}
                </span>
                <button
                  type="button"
                  disabled={event.status === "Closed"}
                  className={[
                    "flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors",
                    event.status === "Closed"
                      ? "cursor-not-allowed text-slate-400"
                      : "bg-slate-900 text-white hover:bg-slate-700",
                  ].join(" ")}
                >
                  {event.status === "Closed" ? "Ended" : "View / Join"}
                  {event.status !== "Closed" && <ChevronRight className="size-3.5" aria-hidden="true" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
