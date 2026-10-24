import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { hasConfiguredAdmins, isAdminEmail } from "@/lib/admin"
import { AdminLoginForm, AdminSignOutButton } from "@/components/admin-login-form"
import { AdminPortal } from "@/components/admin-portal"

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (session?.user && isAdminEmail(session.user.email)) {
    return <AdminPortal adminEmail={session.user.email} />
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-secondary/40 px-4 py-12">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Conn-Wry administration
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">Admin Login / Sign in</h1>
        <p className="mt-2 text-sm text-slate-600">
          Sign in with your authorized admin account to manage users and access your regular account features.
        </p>
        {!hasConfiguredAdmins() ? (
          <p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
            Admin access is not configured. Set the server-side ADMIN_EMAILS
            environment variable before signing in.
          </p>
        ) : session?.user ? (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-destructive">
              This account ({session.user.email}) is not authorized for admin access.
            </p>
            <AdminSignOutButton />
          </div>
        ) : (
          <AdminLoginForm />
        )}
      </section>
    </main>
  )
}
