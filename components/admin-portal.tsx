"use client"

import { useCallback, useEffect, useState } from "react"
import { AdminUserManager } from "@/components/admin-user-manager"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type Overview = {
  totalUsers: number
  pendingWithdrawals: number
  totalPaid: number
  activeTasks: number
}

type Withdrawal = {
  id: number
  userId: string
  name: string | null
  email: string | null
  amount: string
  method: string
  destination: string
  status: string
  reviewNote: string | null
  createdAt: string
  reviewedAt: string | null
}

type Task = {
  id: number
  title: string
  description: string
  category: string
  reward: string
  estMinutes: number
  actionUrl: string | null
  active: boolean
  createdAt: string
}

type TaskFields = {
  title: string
  description: string
  category: string
  reward: string
  estMinutes: string
  actionUrl: string
  active: boolean
}

const emptyTask: TaskFields = {
  title: "",
  description: "",
  category: "",
  reward: "",
  estMinutes: "5",
  actionUrl: "",
  active: true,
}

function TaskEditor({
  task,
  onSaved,
}: {
  task?: Task
  onSaved: () => void
}) {
  const [fields, setFields] = useState<TaskFields>(
    task
      ? {
          title: task.title,
          description: task.description,
          category: task.category,
          reward: task.reward,
          estMinutes: String(task.estMinutes),
          actionUrl: task.actionUrl ?? "",
          active: task.active,
        }
      : emptyTask,
  )
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setMessage(null)
    setFailed(false)
    try {
      const response = await fetch("/api/admin/tasks", {
        method: task ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(task ? { id: task.id } : {}),
          ...fields,
          reward: Number(fields.reward),
          estMinutes: Number(fields.estMinutes),
        }),
      })
      const result = await response.json()
      if (!response.ok) {
        setFailed(true)
        setMessage(result.error ?? "Could not save task")
        return
      }
      setMessage(task ? "Task updated" : "Task created")
      onSaved()
      if (!task) setFields(emptyTask)
    } catch {
      setFailed(true)
      setMessage("Could not save task")
    } finally {
      setSaving(false)
    }
  }

  function update<K extends keyof TaskFields>(key: K, value: TaskFields[K]) {
    setFields((current) => ({ ...current, [key]: value }))
  }

  return (
    <form onSubmit={save} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 xl:grid-cols-4">
      <div className="space-y-1.5">
        <Label htmlFor={`task-title-${task?.id ?? "new"}`}>Title</Label>
        <Input id={`task-title-${task?.id ?? "new"}`} value={fields.title} onChange={(event) => update("title", event.target.value)} required maxLength={120} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`task-category-${task?.id ?? "new"}`}>Category</Label>
        <Input id={`task-category-${task?.id ?? "new"}`} value={fields.category} onChange={(event) => update("category", event.target.value)} required maxLength={80} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`task-reward-${task?.id ?? "new"}`}>Reward (USD)</Label>
        <Input id={`task-reward-${task?.id ?? "new"}`} type="number" min="0" max="100000" step="0.01" value={fields.reward} onChange={(event) => update("reward", event.target.value)} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`task-minutes-${task?.id ?? "new"}`}>Estimated minutes</Label>
        <Input id={`task-minutes-${task?.id ?? "new"}`} type="number" min="1" max="1440" step="1" value={fields.estMinutes} onChange={(event) => update("estMinutes", event.target.value)} required />
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor={`task-description-${task?.id ?? "new"}`}>Description</Label>
        <Textarea id={`task-description-${task?.id ?? "new"}`} value={fields.description} onChange={(event) => update("description", event.target.value)} required maxLength={2000} />
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor={`task-url-${task?.id ?? "new"}`}>Action URL (optional)</Label>
        <Input id={`task-url-${task?.id ?? "new"}`} type="url" placeholder="https://" value={fields.actionUrl} onChange={(event) => update("actionUrl", event.target.value)} />
      </div>
      <div className="flex items-center gap-2">
        <input id={`task-active-${task?.id ?? "new"}`} type="checkbox" checked={fields.active} onChange={(event) => update("active", event.target.checked)} />
        <Label htmlFor={`task-active-${task?.id ?? "new"}`}>Available to users</Label>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : task ? "Save task" : "Create task"}</Button>
        {message && <p className={`text-xs ${failed ? "text-destructive" : "text-emerald-700"}`} role="status">{message}</p>}
      </div>
    </form>
  )
}

function WithdrawalCard({
  withdrawal,
  onUpdated,
}: {
  withdrawal: Withdrawal
  onUpdated: () => void
}) {
  const [note, setNote] = useState(withdrawal.reviewNote ?? "")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function changeStatus(status: "approved" | "rejected" | "paid") {
    if (status === "paid" && !window.confirm("Confirm that the payout has already been sent outside this app?")) return
    setBusy(true)
    setError(null)
    try {
      const response = await fetch("/api/admin/withdrawals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: withdrawal.id, status, note }),
      })
      const result = await response.json()
      if (!response.ok) {
        setError(result.error ?? "Could not update request")
        return
      }
      onUpdated()
    } catch {
      setError("Could not update request")
    } finally {
      setBusy(false)
    }
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <p className="text-lg font-semibold text-slate-950">${Number(withdrawal.amount).toFixed(2)} <span className="text-sm font-normal text-slate-500">· {withdrawal.status}</span></p>
          <p className="text-sm text-slate-700">{withdrawal.name ?? "Unknown user"} · {withdrawal.email ?? withdrawal.userId}</p>
          <p className="text-sm text-slate-600">{withdrawal.method}: <span className="break-all">{withdrawal.destination}</span></p>
          <p className="text-xs text-slate-500">Requested {new Date(withdrawal.createdAt).toLocaleString()}</p>
          {withdrawal.reviewedAt && <p className="text-xs text-slate-500">Last reviewed {new Date(withdrawal.reviewedAt).toLocaleString()}</p>}
        </div>
        <div className="flex flex-col gap-2 lg:min-w-80">
          <Label htmlFor={`review-note-${withdrawal.id}`}>Admin note (optional)</Label>
          <Input id={`review-note-${withdrawal.id}`} value={note} maxLength={500} onChange={(event) => setNote(event.target.value)} placeholder="Reason or payout reference" />
          <div className="flex flex-wrap gap-2">
            {withdrawal.status === "pending" && (
              <>
                <Button type="button" disabled={busy} onClick={() => void changeStatus("approved")}>Approve</Button>
                <Button type="button" variant="destructive" disabled={busy} onClick={() => void changeStatus("rejected")}>Reject</Button>
              </>
            )}
            {withdrawal.status === "approved" && (
              <Button type="button" disabled={busy} onClick={() => void changeStatus("paid")}>Mark paid</Button>
            )}
          </div>
          {error && <p className="text-xs text-destructive" role="alert">{error}</p>}
        </div>
      </div>
    </article>
  )
}

export function AdminPortal({ adminEmail }: { adminEmail: string }) {
  const [tab, setTab] = useState<"overview" | "users" | "withdrawals" | "tasks">("overview")
  const [overview, setOverview] = useState<Overview | null>(null)
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const loadOverview = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/overview")
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? "Could not load dashboard")
      setOverview(result as Overview)
      setError(null)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load dashboard")
    }
  }, [])

  const loadWithdrawals = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/withdrawals")
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? "Could not load withdrawals")
      setWithdrawals(result.withdrawals as Withdrawal[])
      setError(null)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load withdrawals")
    } finally {
      setLoading(false)
    }
  }, [])

  const loadTasks = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/tasks")
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? "Could not load tasks")
      setTasks(result.tasks as Task[])
      setError(null)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load tasks")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadOverview()
  }, [loadOverview])

  useEffect(() => {
    if (tab === "withdrawals") void loadWithdrawals()
    if (tab === "tasks") void loadTasks()
  }, [tab, loadTasks, loadWithdrawals])

  const tabs = [
    ["overview", "Overview"],
    ["users", "Users"],
    ["withdrawals", `Withdrawals${overview?.pendingWithdrawals ? ` (${overview.pendingWithdrawals})` : ""}`],
    ["tasks", "Tasks"],
  ] as const

  return (
    <main className="min-h-svh bg-slate-100 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 rounded-3xl bg-slate-950 p-6 text-white shadow-lg sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-300">Conn-Wry Control Center</p>
            <h1 className="mt-2 text-3xl font-semibold">Admin portal</h1>
            <p className="mt-1 text-sm text-slate-300">Signed in as {adminEmail}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a href="/dashboard" className="inline-flex h-9 items-center rounded-lg border border-white/30 px-4 text-sm font-medium hover:bg-white/10">User dashboard</a>
            <button
              type="button"
              className="inline-flex h-9 items-center rounded-lg bg-white px-4 text-sm font-medium text-slate-950 hover:bg-slate-200"
              onClick={async () => {
                const { authClient } = await import("@/lib/auth-client")
                await authClient.signOut()
                window.location.assign("/admin")
              }}
            >
              Sign out
            </button>
          </div>
        </header>

        <nav className="mb-6 flex flex-wrap gap-2" aria-label="Admin sections">
          {tabs.map(([id, label]) => (
            <Button
              key={id}
              type="button"
              variant={tab === id ? "default" : "outline"}
              onClick={() => setTab(id)}
            >
              {label}
            </Button>
          ))}
        </nav>

        {error && <p className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-800" role="alert">{error}</p>}

        {tab === "overview" && (
          <section>
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-slate-950">Platform overview</h2>
              <p className="text-sm text-slate-600">A quick view of users, payouts and earning tasks.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["Total users", overview?.totalUsers],
                ["Pending withdrawals", overview?.pendingWithdrawals],
                ["Total paid", overview ? `$${overview.totalPaid.toFixed(2)}` : undefined],
                ["Active tasks", overview?.activeTasks],
              ].map(([label, value]) => (
                <article key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-medium text-slate-500">{label}</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-950">{value ?? "—"}</p>
                </article>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
              Withdrawal approval does not send money automatically. Approve/reject a request here, send approved payouts using your payment provider, then mark them paid.
            </div>
          </section>
        )}

        {tab === "users" && <AdminUserManager />}

        {tab === "withdrawals" && (
          <section>
            <div className="mb-5 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Withdrawal review</h2>
                <p className="text-sm text-slate-600">Review requests, record a note, and track manual payouts.</p>
              </div>
              <Button type="button" variant="outline" disabled={loading} onClick={() => void loadWithdrawals()}>
                {loading ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
            {loading && <p className="mb-3 text-sm text-slate-600">Loading withdrawal requests...</p>}
            {!loading && withdrawals.length === 0 && <p className="rounded-2xl bg-white p-6 text-sm text-slate-600">No withdrawal requests yet.</p>}
            <div className="space-y-3">
              {withdrawals.map((withdrawal) => (
                <WithdrawalCard
                  key={withdrawal.id}
                  withdrawal={withdrawal}
                  onUpdated={() => {
                    void loadWithdrawals()
                    void loadOverview()
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {tab === "tasks" && (
          <section>
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-slate-950">Earning tasks</h2>
              <p className="text-sm text-slate-600">Create tasks, change rewards, or deactivate them without removing completion history.</p>
            </div>
            <div className="mb-5">
              <TaskEditor onSaved={() => { void loadTasks(); void loadOverview() }} />
            </div>
            {loading && <p className="mb-3 text-sm text-slate-600">Loading tasks...</p>}
            <div className="space-y-3">
              {tasks.map((task) => (
                <TaskEditor
                  key={task.id}
                  task={task}
                  onSaved={() => { void loadTasks(); void loadOverview() }}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
