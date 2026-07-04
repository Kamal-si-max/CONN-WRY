import Link from "next/link"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getDashboardData } from "@/app/actions/earnings"
import { TaskList } from "@/components/task-list"
import { WithdrawDialog } from "@/components/withdraw-dialog"
import { PostForm } from "@/components/post-form"
import { Feed } from "@/components/feed"
import { ReferralCard } from "@/components/referral-card"
import { SignOutButton } from "@/components/sign-out-button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, TrendingUp, CircleCheck, ArrowDownToLine } from "lucide-react"

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
    <div className="min-h-svh bg-secondary/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold tracking-tight"
          >
            <span className="flex size-7 items-center justify-center rounded-md bg-accent text-accent-foreground">
              C
            </span>
            Conn-Wry
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="rounded-full border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
            >
              Profile
            </Link>
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {session.user.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 lg:py-12">
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
              Complete tasks below to grow your balance and cash out anytime once you reach the $10 threshold.
            </p>
          </div>

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

          {/* Right column: cashout, referral, activity */}
          <aside className="flex flex-col gap-6 lg:sticky lg:top-8">
            <Card className="rounded-[1.75rem] border border-white/10 bg-white/95 shadow-sm shadow-slate-900/5">
              <CardHeader className="flex items-center justify-between gap-2 space-y-0 px-6 py-4">
                <CardTitle className="text-base font-semibold text-slate-900">Cash out</CardTitle>
                <WithdrawDialog balance={data.balance} />
              </CardHeader>
              <CardContent className="px-6 py-5">
                {data.balance < 10 ? (
                  <p className="text-sm leading-6 text-slate-600">
                    You need ${(10 - data.balance).toFixed(2)} more to reach the $10.00 minimum payout.
                  </p>
                ) : (
                  <p className="text-sm leading-6 text-slate-600">
                    You can withdraw up to ${data.balance.toFixed(2)} now via PayPal, bank transfer, or crypto.
                  </p>
                )}
              </CardContent>
            </Card>

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
                        <span className="truncate text-slate-600">
                          {c.title ?? "Task"}
                        </span>
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
      </main>
    </div>
  )
}
