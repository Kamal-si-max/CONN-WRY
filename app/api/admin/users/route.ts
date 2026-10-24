import { randomBytes } from "node:crypto"
import { NextResponse } from "next/server"
import { count, desc, eq, ilike, inArray, or } from "drizzle-orm"
import { getAdminUser } from "@/lib/admin-auth"
import { isAdminEmail } from "@/lib/admin"
import { db } from "@/lib/db"
import {
  pollOptions,
  pollVotes,
  polls,
  postLikes,
  posts,
  profiles,
  session,
  taskCompletions,
  user,
  verification,
  withdrawals,
} from "@/lib/db/schema"

const PAGE_SIZE = 50

export async function GET(request: Request) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 })
  }

  const params = new URL(request.url).searchParams
  const requestedPage = Number.parseInt(params.get("page") ?? "1", 10)
  const page = Number.isFinite(requestedPage) ? Math.max(1, requestedPage) : 1
  const search = (params.get("q") ?? "").trim().slice(0, 100)
  const where = search
    ? or(
        ilike(user.name, `%${search}%`),
        ilike(user.email, `%${search}%`),
        ilike(profiles.username, `%${search}%`),
        ilike(profiles.phoneNumber, `%${search}%`),
      )
    : undefined

  const [users, [{ total }]] = await Promise.all([
    db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        username: profiles.username,
        phoneNumber: profiles.phoneNumber,
        background: profiles.background,
        bio: profiles.bio,
        profilePicture: profiles.profilePicture,
        suspended: user.suspended,
        suspensionReason: user.suspensionReason,
        createdAt: user.createdAt,
      })
      .from(user)
      .leftJoin(profiles, eq(profiles.userId, user.id))
      .where(where)
      .orderBy(desc(user.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db
      .select({ total: count() })
      .from(user)
      .leftJoin(profiles, eq(profiles.userId, user.id))
      .where(where),
  ])

  return NextResponse.json({ users, total, page, pageSize: PAGE_SIZE })
}

export async function POST(request: Request) {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid update data" }, { status: 400 })
    }

    const fields = body as Record<string, unknown>
    const userId = typeof fields.userId === "string" ? fields.userId.trim() : ""
    const suspended = fields.suspended
    const reason = typeof fields.reason === "string" ? fields.reason.trim() : ""
    if (!userId || typeof suspended !== "boolean" || reason.length > 500) {
      return NextResponse.json({ error: "Invalid suspension request" }, { status: 400 })
    }
    if (userId === admin.id) {
      return NextResponse.json({ error: "You cannot suspend your own admin account" }, { status: 400 })
    }

    const [target] = await db
      .select({ email: user.email })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1)
    if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 })
    if (isAdminEmail(target.email)) {
      return NextResponse.json({ error: "Admin accounts cannot be suspended here" }, { status: 400 })
    }

    await db.transaction(async (tx) => {
      await tx
        .update(user)
        .set({
          suspended,
          suspensionReason: suspended ? reason || null : null,
          updatedAt: new Date(),
        })
        .where(eq(user.id, userId))
      if (suspended) {
        await tx.delete(session).where(eq(session.userId, userId))
      }
    })

    return NextResponse.json({ ok: true })
  }

export async function DELETE(request: Request) {
    const admin = await getAdminUser()
    if (!admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }
    const userId =
      body && typeof body === "object" && "userId" in body &&
      typeof (body as { userId: unknown }).userId === "string"
        ? (body as { userId: string }).userId.trim()
        : ""
    if (!userId) return NextResponse.json({ error: "User id is required" }, { status: 400 })
    if (userId === admin.id) {
      return NextResponse.json({ error: "You cannot delete your own admin account" }, { status: 400 })
    }

    const [target] = await db
      .select({ email: user.email })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1)
    if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 })
    if (isAdminEmail(target.email)) {
      return NextResponse.json({ error: "Admin accounts cannot be deleted here" }, { status: 400 })
    }

    await db.transaction(async (tx) => {
      const ownedPosts = await tx
        .select({ id: posts.id })
        .from(posts)
        .where(eq(posts.userId, userId))
      const postIds = ownedPosts.map((post) => post.id)
      const ownedPolls = postIds.length
        ? await tx.select({ id: polls.id }).from(polls).where(inArray(polls.postId, postIds))
        : []
      const pollIds = ownedPolls.map((poll) => poll.id)

      if (pollIds.length) {
        await tx
          .delete(pollVotes)
          .where(or(eq(pollVotes.userId, userId), inArray(pollVotes.pollId, pollIds)))
        await tx.delete(pollOptions).where(inArray(pollOptions.pollId, pollIds))
        await tx.delete(polls).where(inArray(polls.id, pollIds))
      } else {
        await tx.delete(pollVotes).where(eq(pollVotes.userId, userId))
      }

      if (postIds.length) {
        await tx
          .delete(postLikes)
          .where(or(eq(postLikes.userId, userId), inArray(postLikes.postId, postIds)))
        await tx.delete(posts).where(inArray(posts.id, postIds))
      } else {
        await tx.delete(postLikes).where(eq(postLikes.userId, userId))
      }

      await tx.delete(taskCompletions).where(eq(taskCompletions.userId, userId))
      await tx.delete(withdrawals).where(eq(withdrawals.userId, userId))
      await tx.delete(profiles).where(eq(profiles.userId, userId))
      await tx.delete(verification).where(eq(verification.identifier, target.email))
      await tx.delete(user).where(eq(user.id, userId))
    })

    return NextResponse.json({ ok: true })
}

export async function PATCH(request: Request) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid update data" }, { status: 400 })
  }

  const fields = body as Record<string, unknown>
  if (
    typeof fields.userId !== "string" ||
    typeof fields.name !== "string" ||
    typeof fields.email !== "string" ||
    typeof fields.username !== "string" ||
    typeof fields.phoneNumber !== "string" ||
    typeof fields.background !== "string" ||
    typeof fields.bio !== "string" ||
    typeof fields.profilePicture !== "string"
  ) {
    return NextResponse.json({ error: "Invalid update data" }, { status: 400 })
  }

  const userId = fields.userId.trim()
  const name = fields.name.trim()
  const email = fields.email.trim().toLowerCase()
  const username = fields.username.trim() || null
  const phoneNumber = fields.phoneNumber.trim() || null
  const background = fields.background.trim() || null
  const bio = fields.bio.trim() || null
  const profilePicture = fields.profilePicture.trim() || null

  if (!userId || !name || !email || name.length > 120 || email.length > 320) {
    return NextResponse.json(
      { error: "Enter a valid name and email address" },
      { status: 400 },
    )
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 })
  }

  const [targetUser] = await db
    .select({ email: user.email })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)
  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }
  if (isAdminEmail(targetUser.email) && email !== targetUser.email.toLowerCase()) {
    return NextResponse.json(
      { error: "Admin account email cannot be changed in user management" },
      { status: 400 },
    )
  }

  if (username && username.length > 50) {
    return NextResponse.json(
      { error: "Username must be 50 characters or fewer" },
      { status: 400 },
    )
  }

  if ((background?.length ?? 0) > 100 || (bio?.length ?? 0) > 2000) {
    return NextResponse.json(
      { error: "Background must be 100 characters or less and bio 2,000 or less" },
      { status: 400 },
    )
  }

  if (profilePicture) {
    try {
      const imageUrl = new URL(profilePicture)
      if (profilePicture.length > 2048 || imageUrl.protocol !== "https:") {
        return NextResponse.json(
          { error: "Profile picture must be an HTTPS URL of 2,048 characters or fewer" },
          { status: 400 },
        )
      }
    } catch {
      return NextResponse.json({ error: "Enter a valid profile picture URL" }, { status: 400 })
    }
  }

  if (
    phoneNumber &&
    (phoneNumber.length > 32 ||
      !/^\+?[\d\s().-]+$/.test(phoneNumber) ||
      (phoneNumber.match(/\d/g)?.length ?? 0) < 5 ||
      (phoneNumber.match(/\d/g)?.length ?? 0) > 20)
  ) {
    return NextResponse.json({ error: "Enter a valid phone number" }, { status: 400 })
  }

  try {
    const updated = await db.transaction(async (tx) => {
      const [updatedUser] = await tx
        .update(user)
        .set({ name, email, updatedAt: new Date() })
        .where(eq(user.id, userId))
        .returning({ id: user.id })

      if (!updatedUser) return false

      await tx
        .insert(profiles)
        .values({
          userId,
          referralCode: randomBytes(12).toString("hex"),
          username,
          phoneNumber,
          background,
          bio,
          profilePicture,
        })
        .onConflictDoUpdate({
          target: profiles.userId,
          set: { username, phoneNumber, background, bio, profilePicture },
        })

      return true
    })

    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    const code =
      error && typeof error === "object" && "code" in error
        ? String(error.code)
        : ""
    if (code === "23505") {
      return NextResponse.json(
        { error: "That email or username is already in use" },
        { status: 409 },
      )
    }

    console.error("Admin user update failed:", error)
    return NextResponse.json({ error: "Could not update user" }, { status: 500 })
  }
}
