"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"

export function SuspendedAccountActions() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function signOut() {
    setLoading(true)
    setError(null)
    try {
      const result = await authClient.signOut()
      if (result.error) {
        setError(result.error.message ?? "Could not sign out")
        return
      }
      router.replace("/sign-in")
      router.refresh()
    } catch {
      setError("Could not sign out. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-6 space-y-3">
      <Button type="button" onClick={signOut} disabled={loading}>
        {loading ? "Signing out..." : "Sign out"}
      </Button>
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
    </div>
  )
}
