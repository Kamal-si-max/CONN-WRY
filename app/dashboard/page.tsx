import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { PostForm } from "@/components/post-form"
import { Feed } from "@/components/feed"
import { CardTitle } from "@/components/ui/card"
import DashboardShell from "@/components/dashboard-shell"

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")

  return (
    <DashboardShell>
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Create post */}
        <div className="rounded-[1.75rem] border border-white/10 bg-white/95 shadow-sm shadow-slate-900/5">
          <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4">
            <CardTitle className="text-base font-semibold text-slate-900">Create a post</CardTitle>
          </div>
          <div className="p-6">
            <PostForm />
          </div>
        </div>

        {/* Feed */}
        <div className="rounded-[1.75rem] border border-white/10 bg-white/95 shadow-sm shadow-slate-900/5">
          <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4">
            <CardTitle className="text-base font-semibold text-slate-900">Feed</CardTitle>
          </div>
          <div className="p-6">
            <Feed />
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
