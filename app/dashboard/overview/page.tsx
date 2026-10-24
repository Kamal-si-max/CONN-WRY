import Link from "next/link"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getDashboardData } from "@/app/actions/earnings"
import { TaskList } from "@/components/task-list"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, TrendingUp, CircleCheck, ArrowDownToLine, ArrowLeft } from "lucide-react"
import DashboardShell from "@/components/dashboard-shell"
import { getActiveUser } from "@/lib/active-session"

export default async function DashboardOverviewPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")
  if (!(await getActiveUser())) redirect("/account-suspended")

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
      <div className="space-y-8">
        {/* Navigation back to Feed / Home */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <ArrowLeft className="size-4" />
            Back to Feed
          </Link>

          <Link
            href="/profile/edit"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Profile Settings
          </Link>
        </div>

        {/* ── Dashboard Overview card ── */}
        <div className="rounded-[2rem] border border-white/10 bg-white/80 p-6 sm:p-8 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.65)] backdrop-blur-xl">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
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
              <Link href="/profile" className="font-medium text-slate-900 underline underline-offset-2 hover:text-accent">
                Profile
              </Link>{" "}
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

        {/* ── Available tasks ── */}
        <Card className="rounded-[1.75rem] border border-white/10 bg-white/95 shadow-sm shadow-slate-900/5">
          <CardHeader className="flex items-center justify-between gap-4 border-b border-slate-200/80 px-6 py-4">
            <CardTitle className="text-base font-semibold text-slate-900">Available tasks</CardTitle>
            <Badge variant="secondary">{data.availableTasks.length} open</Badge>
          </CardHeader>
          <CardContent className="p-6">
            <TaskList tasks={data.availableTasks} />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
