import Link from "next/link"
import Image from "next/image"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { AuthForm } from "@/components/auth-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function SignInPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect("/dashboard")

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-secondary px-4 py-12">
      <Link
      href="/"
      className="mb-8 flex items-center gap-3"
      >
        <Image
        src="/logo.png"
        alt="Conn-Wry"
        width={48}
        height={48}
        priority
        />
        <span className="text-2xl font-bold tracking-tight">
          CONN-WRY
          </span>
      </Link>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <p className="text-sm text-muted-foreground text-balance">
            Sign in to track your balance and keep earning.
          </p>
        </CardHeader>
        <CardContent>
          <AuthForm mode="sign-in" />
        </CardContent>
      </Card>
    </main>
  )
}
