import Link from "next/link"
import Image from "next/image"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { AuthForm } from "@/components/auth-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function SignUpPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect("/dashboard")

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-secondary px-4 py-12">
      <Link
      href="/"
      className="flex items-center gap-3"
      >
        <Image
        src="/logo.png"
        alt="Conn-Wry"
        width={42}
        height={42}
        priority
        />
        
        <span className="text-xl font-bold tracking-tight hidden sm:block">
          CONN-WRY
        </span>
      </Link>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <p className="text-sm text-muted-foreground text-balance">
            Join free and start earning on your first task today.
          </p>
        </CardHeader>
        <CardContent>
          <AuthForm mode="sign-up" />
        </CardContent>
      </Card>
    </main>
  )
}
