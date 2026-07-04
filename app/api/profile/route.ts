import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { and, eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { profiles } from "@/lib/db/schema"

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, session.user.id),
  })

  return NextResponse.json(profile)
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const username = body.username ? String(body.username).trim() : null
  const bio = body.bio ? String(body.bio).trim() : null
  const profilePicture = body.profilePicture ? String(body.profilePicture).trim() : null
  const background = body.background ? String(body.background).trim() : null

  const values: Record<string, unknown> = {}
  if (username !== null) values.username = username
  if (background !== null) values.background = background
  if (bio !== null) values.bio = bio
  if (profilePicture !== null) values.profilePicture = profilePicture

  if (Object.keys(values).length === 0) {
    return NextResponse.json({ error: "No update data provided" }, { status: 400 })
  }

  try {
    await db
      .update(profiles)
      .set(values)
      .where(eq(profiles.userId, session.user.id))

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = (error as { message?: string } | null)?.message ?? ""

    // Postgres unique violation
    if (message.toLowerCase().includes("duplicate key") || message.toLowerCase().includes("unique")) {
      if (message.toLowerCase().includes("profiles_username")) {
        return NextResponse.json(
          { error: "Username already taken. Please choose another." },
          { status: 400 }
        )
      }

      if (message.toLowerCase().includes("profiles_bio")) {
        return NextResponse.json(
          { error: "Bio already used by another profile. Please write something unique." },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: "Duplicate value. Please check username/bio." },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: "Could not update profile" }, { status: 500 })
  }
}
