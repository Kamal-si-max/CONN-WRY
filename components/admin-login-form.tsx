"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function AdminLoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await authClient.signIn.email({ email, password })
      if (result.error) {
        setError(result.error.message ?? "Invalid email or password")
        return
      }

      const response = await fetch("/api/admin/users?page=1")
      if (response.status === 403) {
        await authClient.signOut()
        setError("This account is not authorized for admin access.")
        return
      }
      if (!response.ok) {
        setError("Could not verify admin access. Please try again.")
        return
      }

      router.refresh()
    } catch {
      setError("Could not sign in. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="admin-email">Email</Label>
        <Input
          id="admin-email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="admin-password">Password</Label>
        <Input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
      <Button type="submit" disabled={loading} className="mt-2">
        {loading ? "Checking access..." : "Admin Sign in"}
      </Button>
    </form>
  )
}

export function AdminSignOutButton() {
  const router = useRouter()

  async function signOut() {
    await authClient.signOut()
    router.refresh()
  }

  return (
    <Button type="button" variant="outline" onClick={signOut}>
      Sign out
    </Button>
  )
}
