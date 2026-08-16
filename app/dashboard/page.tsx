import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getDashboardData } from "@/app/actions/earnings"
import { TaskList } from "@/components/task-list"
import { PostForm } from "@/components/post-form"
import { Feed } from "@/components/feed"
import { ReferralCard } from "@/components/referral-card"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, TrendingUp, CircleCheck, ArrowDownToLine } from "lucide-react"
import DashboardShell from "@/components/dashboard-shell"

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")

  const data = await getDashboardData()
  const firstName = session.user.name?.split(" ")[0] ?? "there"

  const stats = [
    {
      label: "Available balance",
      value: `$${data.balance.toFixed(2)}`,
      icon: Wallet,
      highlight: true,
    },
    {
      label: "Total earned",
      value: `$${data.totalEarned.toFixed(2)}`,
      icon: TrendingUp,
    },
    {
      label: "Tasks completed",
      value: String(data.completedCount),
      icon: CircleCheck,
    },
    {
      label: "Total withdrawn",
      value: `$${data.totalWithdrawn.toFixed(2)}`,
      icon: ArrowDownToLine,
    },
  ]

  return (
    <DashboardShell>
      {/* ── Dashboard Overview card ── */}
      <div className="mb-10 rounded-[2rem] border border-white/10 bg-white/80 p-8 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.65)] backdrop-blur-xl">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
              Dashboard overview
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Welcome back, {firstName}
            </h1>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600 sm:text-right">
            Complete tasks below to grow your balance. Visit your{" "}
            <a href="/profile" className="font-medium text-slate-900 underline underline-offset-2">
              Profile
            </a>{" "}
            page to cash out.
          </p>
        </div>

        {/* Balance cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card
              key={stat.label}
              className={`rounded-[1.5rem] border border-white/10 bg-white/95 shadow-sm shadow-slate-900/5 ${stat.highlight ? "bg-gradient-to-br from-accent/10 to-white" : ""}`}
            >
              <CardContent className="flex flex-col gap-3 p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium uppercase tracking-[0.08em] text-slate-500">
                    {stat.label}
                  </span>
                  <stat.icon
                    className={`size-5 ${stat.highlight ? "text-accent" : "text-slate-400"}`}
                  />
                </div>
                <span className="text-3xl font-semibold tracking-tight text-slate-950">
                  {stat.value}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ── Main grid (2-col on large screens) ── */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left column: post form, feed, tasks */}
        <section className="lg:col-span-2 flex flex-col gap-8">
          <div className="space-y-8">
            <div className="rounded-[1.75rem] border border-white/10 bg-white/95 shadow-sm shadow-slate-900/5">
              <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4">
                <CardTitle className="text-base font-semibold text-slate-900">Create a post</CardTitle>
              </div>
              <div className="p-6">
                <PostForm />
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-white/95 shadow-sm shadow-slate-900/5">
              <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4">
                <CardTitle className="text-base font-semibold text-slate-900">Feed</CardTitle>
              </div>
              <div className="p-6">
                <Feed />
              </div>
            </div>
          </div>

          <Card className="rounded-[1.75rem] border border-white/10 bg-white/95 shadow-sm shadow-slate-900/5">
            <CardHeader className="flex items-center justify-between gap-4 border-b border-slate-200/80 px-6 py-4">
              <CardTitle className="text-base font-semibold text-slate-900">Available tasks</CardTitle>
              <Badge variant="secondary">{data.availableTasks.length} open</Badge>
            </CardHeader>
            <CardContent className="p-6">
              <TaskList tasks={data.availableTasks} />
            </CardContent>
          </Card>
        </section>

        {/* Right column: referral, activity */}
        <aside className="flex flex-col gap-6 lg:sticky lg:top-8">
          <Card className="rounded-[1.75rem] border border-white/10 bg-white/95 shadow-sm shadow-slate-900/5">
            <CardHeader className="px-6 py-4">
              <CardTitle className="text-base font-semibold text-slate-900">Refer &amp; earn</CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-5">
              <ReferralCard code={data.profile.referralCode} />
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem] border border-white/10 bg-white/95 shadow-sm shadow-slate-900/5">
            <CardHeader className="px-6 py-4">
              <CardTitle className="text-base font-semibold text-slate-900">Recent activity</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 px-6 py-5">
              {data.recentCompletions.length === 0 &&
              data.recentWithdrawals.length === 0 ? (
                <p className="text-sm text-slate-600">
                  No activity yet. Complete your first task to get started.
                </p>
              ) : (
                <>
                  {data.recentCompletions.map((c) => (
                    <div
                      key={`c-${c.id}`}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <span className="truncate text-slate-600">{c.title ?? "Task"}</span>
                      <span className="shrink-0 font-medium text-accent">
                        +${Number(c.reward).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  {data.recentWithdrawals.map((w) => (
                    <div
                      key={`w-${w.id}`}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <span className="truncate text-slate-600">
                        Withdrawal · {w.status}
                      </span>
                      <span className="shrink-0 font-medium text-slate-900">
                        -${Number(w.amount).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </DashboardShell>
  )
}
