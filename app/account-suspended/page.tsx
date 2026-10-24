import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { SuspendedAccountActions } from "@/components/suspended-account-actions"

export default async function SuspendedAccountPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")

  return (
    <main className="flex min-h-svh items-center justify-center bg-secondary/40 px-4 py-12">
      <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Account status</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">Account suspended</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          This account is temporarily unable to use Conn-Wry. Please contact support if you believe this is a mistake.
        </p>
        <SuspendedAccountActions />
      </section>
    </main>
  )
}
