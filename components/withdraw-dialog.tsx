"use client"

import type React from "react"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { requestWithdrawal } from "@/app/actions/earnings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const METHODS = [
  { value: "paypal", label: "PayPal", placeholder: "PayPal email" },
  { value: "bank", label: "Bank transfer", placeholder: "Account / IBAN" },
  { value: "crypto", label: "Crypto (USDC)", placeholder: "Wallet address" },
]

export function WithdrawDialog({ balance }: { balance: number }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState(METHODS[0].value)
  const [destination, setDestination] = useState("")

  const canWithdraw = balance >= 10
  const activeMethod = METHODS.find((m) => m.value === method) ?? METHODS[0]

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const res = await requestWithdrawal({
        amount: Number(amount),
        method,
        destination,
      })
      if (res.ok) {
        toast.success("Withdrawal requested", {
          description:
            "We'll process your payout within 1-3 business days.",
        })
        setOpen(false)
        setAmount("")
        setDestination("")
        router.refresh()
      } else {
        toast.error(res.error ?? "Could not request withdrawal")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button disabled={!canWithdraw}>Withdraw funds</Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Withdraw your earnings</DialogTitle>
          <DialogDescription>
            Available balance: ${balance.toFixed(2)}. Minimum withdrawal is
            $10.00.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="amount">Amount (USD)</Label>
            <Input
              id="amount"
              type="number"
              min={10}
              max={balance}
              step="0.01"
              placeholder="10.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="method">Payout method</Label>
            <div className="grid grid-cols-3 gap-2">
              {METHODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMethod(m.value)}
                  className={`rounded-md border px-2 py-2 text-xs font-medium transition-colors ${
                    method === m.value
                      ? "border-accent bg-accent/10 text-foreground"
                      : "border-border text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="destination">{activeMethod.label} details</Label>
            <Input
              id="destination"
              type="text"
              placeholder={activeMethod.placeholder}
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "Submitting..." : "Request withdrawal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
