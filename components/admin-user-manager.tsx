"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type AdminUser = {
  id: string
  name: string
  email: string
  username: string | null
  phoneNumber: string | null
  background: string | null
  bio: string | null
  profilePicture: string | null
  suspended: boolean
  suspensionReason: string | null
  createdAt: string
}

type UsersResponse = {
  users: AdminUser[]
  total: number
  page: number
  pageSize: number
}

function UserEditor({
  user,
  onSaved,
}: {
  user: AdminUser
  onSaved: () => void
}) {
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [username, setUsername] = useState(user.username ?? "")
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber ?? "")
  const [background, setBackground] = useState(user.background ?? "")
  const [bio, setBio] = useState(user.bio ?? "")
  const [profilePicture, setProfilePicture] = useState(user.profilePicture ?? "")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const [controlError, setControlError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setMessage(null)
    setFailed(false)

    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          name,
          email,
          username,
          phoneNumber,
          background,
          bio,
          profilePicture,
        }),
      })
      const result = await response.json()
      if (!response.ok) {
        setFailed(true)
        setMessage(result.error ?? "Could not save changes")
        return
      }

      setMessage("Changes saved")
      onSaved()
    } catch {
      setFailed(true)
      setMessage("Could not save changes. Check your connection and try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 xl:grid-cols-4">
      <div className="space-y-1.5">
        <Label htmlFor={`name-${user.id}`}>Full name</Label>
        <Input id={`name-${user.id}`} value={name} onChange={(event) => setName(event.target.value)} required maxLength={120} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`username-${user.id}`}>Username</Label>
        <Input id={`username-${user.id}`} value={username} onChange={(event) => setUsername(event.target.value)} maxLength={50} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`email-${user.id}`}>Email</Label>
        <Input id={`email-${user.id}`} type="email" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={320} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`phone-${user.id}`}>Phone number</Label>
        <Input id={`phone-${user.id}`} type="tel" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} maxLength={32} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`background-${user.id}`}>Background</Label>
        <Input id={`background-${user.id}`} value={background} onChange={(event) => setBackground(event.target.value)} maxLength={100} />
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor={`profile-picture-${user.id}`}>Profile picture URL (HTTPS)</Label>
        <Input id={`profile-picture-${user.id}`} type="url" value={profilePicture} onChange={(event) => setProfilePicture(event.target.value)} maxLength={2048} />
      </div>
      <div className="space-y-1.5 sm:col-span-2 xl:col-span-4">
        <Label htmlFor={`bio-${user.id}`}>Bio</Label>
        <Textarea id={`bio-${user.id}`} value={bio} onChange={(event) => setBio(event.target.value)} maxLength={2000} />
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>
        {message && (
          <p className={`text-xs ${failed ? "text-destructive" : "text-emerald-700"}`} role="status">
            {message}
          </p>
        )}
      </div>
      <p className="text-xs text-slate-500 sm:col-span-2 xl:col-span-4">
        User ID: {user.id} · Joined {new Date(user.createdAt).toLocaleDateString()}
      </p>
      <div className="flex flex-wrap items-center gap-2 sm:col-span-2 xl:col-span-4">
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${user.suspended ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"}`}>
          {user.suspended ? "Suspended" : "Active"}
        </span>
        {user.suspensionReason && <span className="text-xs text-slate-500">{user.suspensionReason}</span>}
        <Button
          type="button"
          variant="outline"
          onClick={async () => {
            setControlError(null)
            const promptedReason = user.suspended
              ? ""
              : window.prompt("Reason for suspending this account (optional):")
            if (promptedReason === null) return
            const reason = promptedReason ?? ""
            try {
              const response = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id, suspended: !user.suspended, reason }),
              })
              const result = await response.json()
              if (!response.ok) {
                setControlError(result.error ?? "Could not change account status")
                return
              }
              onSaved()
            } catch {
              setControlError("Could not change account status")
            }
          }}
        >
          {user.suspended ? "Unsuspend" : "Suspend"}
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={async () => {
            if (!window.confirm(`Permanently delete ${user.email} and their profile, posts, tasks, and withdrawal history? This cannot be undone.`)) return
            setControlError(null)
            try {
              const response = await fetch("/api/admin/users", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id }),
              })
              const result = await response.json()
              if (!response.ok) {
                setControlError(result.error ?? "Could not delete user")
                return
              }
              onSaved()
            } catch {
              setControlError("Could not delete user")
            }
          }}
        >
          Delete user
        </Button>
        {controlError && <p className="text-xs text-destructive" role="alert">{controlError}</p>}
      </div>
    </form>
  )
}

export function AdminUserManager() {
  const [data, setData] = useState<UsersResponse | null>(null)
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page: String(page) })
      if (search) params.set("q", search)
      const response = await fetch(`/api/admin/users?${params}`)
      const result = await response.json()
      if (!response.ok) {
        setError(result.error ?? "Could not load users")
        return
      }
      setData(result as UsersResponse)
    } catch {
      setError("Could not load users. Check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    void loadUsers()
  }, [loadUsers])

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPage(1)
    setSearch(searchInput.trim())
  }

  const pageCount = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">User accounts</h2>
              <p className="text-sm text-slate-600">
                {data ? `${data.total} total users` : "Loading user count..."}
              </p>
            </div>
            <form onSubmit={handleSearch} className="flex w-full gap-2 sm:max-w-md">
              <Input
                aria-label="Search users"
                placeholder="Search name, email, username, or phone"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
              <Button type="submit">Search</Button>
            </form>
          </div>

          {error && <p className="mb-4 text-sm text-destructive" role="alert">{error}</p>}
          {loading && <p className="mb-4 text-sm text-slate-600">Loading users...</p>}
          {!loading && data?.users.length === 0 && (
            <p className="rounded-xl bg-white p-5 text-sm text-slate-600">No users found.</p>
          )}
          <div className="space-y-3">
            {data?.users.map((user) => (
              <UserEditor key={user.id} user={user} onSaved={() => void loadUsers()} />
            ))}
          </div>

          {data && data.total > 0 && (
            <div className="mt-5 flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                disabled={page <= 1 || loading}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </Button>
              <p className="text-sm text-slate-600">Page {page} of {pageCount}</p>
              <Button
                type="button"
                variant="outline"
                disabled={page >= pageCount || loading}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          )}
    </section>
  )
}
