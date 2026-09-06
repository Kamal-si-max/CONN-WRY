"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { CldUploadWidget } from "next-cloudinary"

export default function EditProfilePage() {
  const router = useRouter()
  const session = useSession()
  const [username, setUsername] = useState("")

  const [background, setBackground] = useState("")
  const [bio, setBio] = useState("")
  const [profilePicture, setProfilePicture] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
  async function loadProfile() {
    try {
      const res = await fetch("/api/profile")

      if (!res.ok) return

      const profile = await res.json()

      setUsername(profile?.username ?? "")
      setBackground(profile?.background ?? "")
      setBio(profile?.bio ?? "")
      setProfilePicture(profile?.profilePicture ?? "")
    } catch (err) {
      console.error("Failed to load profile:", err)
    }
  }

  loadProfile()
}, [])

  if (!session?.data?.user) {
    return (
      <div className="min-h-svh flex items-center justify-center p-4">
        <p className="text-sm text-slate-600">Loading profile…</p>
      </div>
    )
  }
  
  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, background, bio, profilePicture }),
      })

      if (!res.ok) {
        const body = await res.json()
        setError(body?.error ?? "Could not update profile")
        setLoading(false)
        return
      }

      router.push("/profile")
      router.refresh()
    } catch (err) {
      setError("Could not update profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-svh bg-secondary/40">
      <main className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-[2rem] border border-white/10 bg-white/95 p-8 shadow-sm shadow-slate-900/5">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Edit profile</p>
              <h1 className="mt-2 text-2xl font-semibold text-slate-950 whitespace-nowrap">Update your profile details</h1>
            </div>
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 shrink-0"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to Profile
            </Link>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="conn_wry"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
            </div>

              <div className="space-y-2">
                <Label htmlFor="background">Background</Label>
                <Input
                  id="background"
                  type="text"
                  placeholder="Developer, Student, Designer"
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <Label>Profile Picture</Label>
                <Avatar className="h-24 w-24">
                    {profilePicture ? (
                        <AvatarImage src={profilePicture} />
                    ) : (
                    <AvatarFallback>
                        {session.data.user?.name?.[0]?.toUpperCase() ?? "U"}
                        </AvatarFallback>
                    )}
                    </Avatar>
                    <CldUploadWidget
                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!}
                    options={{
                        sources: ["local", "camera"], // Sirf My Files aur Camera
                        multiple: false,
                        maxFiles: 1,
                        resourceType: "image",
                        clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
                        maxFileSize: 5000000, // 5MB
                        cropping: true,
                        croppingAspectRatio: 1,
                        croppingShowBackButton: true,
                        showAdvancedOptions: false,
                        showSkipCropButton: false,
                        folder: "profiles",
                        styles: {
                            palette: {
                                window: "#FFFFFF",
                                windowBorder: "#E5E7EB",
                                tabIcon: "#22c55e",
                                menuIcons: "#22c55e",
                                link: "#22c55e",
                                action: "#22c55e",
                            },
                        },
                    }}
                    onSuccess={(result: any) => {
                        setProfilePicture(result.info.secure_url)
                        }}
                        >
                            {({ open }) => (
                                <Button
                                type="button"
                                onClick={() => open()}
                                >
                                    Upload Profile Picture
                                    </Button>
                                )}
                                </CldUploadWidget>
                </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell people something about you"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="min-h-[140px]"
                />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving…" : "Save profile"}
              </Button>
              <Avatar className="h-10 w-10">
                {profilePicture ? (
                  <AvatarImage src={profilePicture} alt="Profile preview" />
                ) : (
                  <AvatarFallback>{session.data.user?.name?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
                )}
              </Avatar>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
