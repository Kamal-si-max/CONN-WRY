"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Check } from "lucide-react"

export function ReferralCard({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const link =
    typeof window !== "undefined"
      ? `${window.location.origin}/sign-up?ref=${code}`
      : `/sign-up?ref=${code}`

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      toast.success("Referral link copied")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Could not copy link")
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Share your link. You earn $7.00 for every friend who joins and completes
        their first task.
      </p>
      <div className="flex gap-2">
        <Input readOnly value={link} className="font-mono text-xs" />
        <Button
          variant="outline"
          size="icon"
          onClick={handleCopy}
          aria-label="Copy referral link"
        >
          {copied ? (
            <Check className="size-4 text-accent" />
          ) : (
            <Copy className="size-4" />
          )}
        </Button>
      </div>
    </div>
  )
}
