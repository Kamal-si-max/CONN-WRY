import Link from "next/link"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { eq } from "drizzle-orm"
import { profiles, user } from "@/lib/db/schema"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CardTitle } from "@/components/ui/card"
import { Edit3 } from "lucide-react"
import { getDashboardData } from "@/app/actions/earnings"
import { WithdrawDialog } from "@/components/withdraw-dialog"
import DashboardShell from "@/components/dashboard-shell"

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")

  const [profile] = await db
    .select({
      username: profiles.username,
      background: profiles.background,
      bio: profiles.bio,
      profilePicture: profiles.profilePicture,
      referralCode: profiles.referralCode,
      name: user.name,
      email: user.email,
      image: user.image,
    })
    .from(profiles)
    .leftJoin(user, eq(user.id, profiles.userId))
    .where(eq(user.id, session.user.id))
    .limit(1)

  // Fetch balance for the Cash Out section
  const data = await getDashboardData()

  const backgroundLabel = (() => {
    const raw = String(profile?.background ?? "").toLowerCase()
    if (raw.includes("developer")) return "I am Developer"
    if (raw.includes("student")) return "I am Student"
    if (raw.trim().length === 0) return "No background set"
    return `I am ${profile?.background}`
  })()

  return (
    <DashboardShell>
      {/* ── Profile card ── */}
      <div className="mb-8 rounded-[2rem] border border-white/10 bg-white/95 p-8 shadow-sm shadow-slate-900/5">
        {/* Header row: avatar + name + edit button */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar size="lg">
              {profile?.profilePicture ? (
                <AvatarImage
                  src={profile.profilePicture}
                  alt={profile.username ?? profile.name ?? "Profile picture"}
                />
              ) : (
                <AvatarFallback>
                  {(profile?.username ?? profile?.name ?? "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Your profile
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-slate-950 sm:text-3xl">
                {profile?.username ?? profile?.name ?? "Unnamed user"}
              </h1>
              <p className="mt-1 text-sm text-slate-500">{backgroundLabel}</p>
            </div>
          </div>

          <Link
            href="/profile/edit"
            className={cn(buttonVariants({ variant: "default", size: "default" }), "gap-2")}
          >
            <Edit3 className="size-4" />
            Edit profile
          </Link>
        </div>

        {/* Info grid */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5">
            <p className="text-xs font-medium uppercase tracking-widest text-slate-400">Full name</p>
            <p className="mt-2 text-base font-medium text-slate-900">{profile?.name ?? "Unknown"}</p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5">
            <p className="text-xs font-medium uppercase tracking-widest text-slate-400">Username</p>
            <p className="mt-2 text-base font-medium text-slate-900">{profile?.username ?? "Not set"}</p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 sm:col-span-2">
            <p className="text-xs font-medium uppercase tracking-widest text-slate-400">Bio</p>
            <p className="mt-2 text-base font-medium text-slate-900">{profile?.bio ?? "No bio yet"}</p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 sm:col-span-2">
            <p className="text-xs font-medium uppercase tracking-widest text-slate-400">Email</p>
            <p className="mt-2 text-base font-medium text-slate-900">{profile?.email}</p>
          </div>
        </div>
      </div>

      {/* ── Cash Out section ── */}
      <div className="rounded-[2rem] border border-white/10 bg-white/95 p-8 shadow-sm shadow-slate-900/5">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
              Your earnings
            </p>
            <CardTitle className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              Cash Out
            </CardTitle>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {data.balance >= 10
                ? `You have $${data.balance.toFixed(2)} available. You can withdraw via PayPal, bank transfer, or crypto.`
                : `You need $${(10 - data.balance).toFixed(2)} more to reach the $10.00 minimum payout. Keep completing tasks!`}
            </p>
          </div>

          <div className="shrink-0">
            <WithdrawDialog balance={data.balance} />
          </div>
        </div>

        {/* Balance summary */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-accent/10 p-4 text-center">
            <p className="text-xs font-medium uppercase tracking-widest text-slate-500">Available</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">${data.balance.toFixed(2)}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 text-center">
            <p className="text-xs font-medium uppercase tracking-widest text-slate-500">Total earned</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">${data.totalEarned.toFixed(2)}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 text-center">
            <p className="text-xs font-medium uppercase tracking-widest text-slate-500">Total withdrawn</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">${data.totalWithdrawn.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
