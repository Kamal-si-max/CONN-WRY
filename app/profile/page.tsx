import Link from "next/link"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { eq } from "drizzle-orm"
import { profiles, user } from "@/lib/db/schema"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit3 } from "lucide-react"
import Image from "next/image"

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

  return (
    <div className="min-h-svh bg-secondary/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link
  href="/dashboard"
  className="flex items-center gap-3"
>
  <Image
    src="/logo.png"
    alt="Conn-Wry"
    width={42}
    height={42}
    priority
  />

  <span className="text-2xl font-bold">
    CONN-WRY
  </span>
</Link>
    {/* Right */}
  <Link href="/dashboard">
  <Button variant="outline">
    Back to dashboard
  </Button>
</Link>

        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-[2rem] border border-white/10 bg-white/95 p-8 shadow-sm shadow-slate-900/5">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-center gap-4">
              <Avatar size="lg">
                {profile?.profilePicture ? (
                  <AvatarImage src={profile.profilePicture} alt={profile.username ?? profile.name ?? "Profile picture"} />
                ) : (
                  <AvatarFallback>{(profile?.username ?? profile?.name ?? "U").charAt(0).toUpperCase()}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
                  Your profile
                </p>
                <h1 className="mt-2 text-3xl font-semibold text-slate-950">
                  {profile?.username ?? profile?.name ?? "Unnamed user"}
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                  {(() => {
                    const raw = String(profile?.background ?? "").toLowerCase()
                    if (raw.includes("developer")) return "I am Developer"
                    if (raw.includes("student")) return "I am Student"
                    if (raw.trim().length === 0) return "No background set"
                    return `I am ${profile?.background}`
                  })()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button render={<Link href="/profile/edit">Edit profile</Link>}>
                <Edit3 className="size-4" />
                Edit profile
              </Button>
            </div>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200/80 bg-slate-50/70 p-6">
              <p className="text-sm text-slate-500">Full name</p>
              <p className="mt-3 text-base font-medium text-slate-900">{profile?.name ?? "Unknown"}</p>
            </div>
            <div className="rounded-3xl border border-slate-200/80 bg-slate-50/70 p-6">
              <p className="text-sm text-slate-500">Username</p>
              <p className="mt-3 text-base font-medium text-slate-900">{profile?.username ?? "Not set"}</p>
            </div>
            <div className="rounded-3xl border border-slate-200/80 bg-slate-50/70 p-6 sm:col-span-2">
              <p className="text-sm text-slate-500">Bio</p>
              <p className="mt-3 text-base font-medium text-slate-900">{profile?.bio ?? "No bio yet"}</p>
            </div>
            <div className="rounded-3xl border border-slate-200/80 bg-slate-50/70 p-6 sm:col-span-2">
              <p className="text-sm text-slate-500">Email</p>
              <p className="mt-3 text-base font-medium text-slate-900">{profile?.email}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
