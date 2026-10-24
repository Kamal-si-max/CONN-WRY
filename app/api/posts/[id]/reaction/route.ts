import { NextResponse } from "next/server"
import { and, eq, sql } from "drizzle-orm"

import { getActiveUser } from "@/lib/active-session"
import { db } from "@/lib/db"
import { posts, postLikes } from "@/lib/db/schema"

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const activeUser = await getActiveUser()

  if (!activeUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const postId = Number(id)
  if (Number.isNaN(postId)) {
    return NextResponse.json({ error: "Invalid post id" }, { status: 400 })
  }
  const body = await req.json()
  const reaction = body.reaction === "dislike" ? "dislike" : "like"
  console.time("reaction")
  const existing = await db
    .select()
    .from(postLikes)
    .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, activeUser.id)))
    .then((rows) => rows[0])

  if (existing) {
    if (existing.reaction === reaction) {
      await db.delete(postLikes).where(eq(postLikes.id, existing.id))
    } else {
      await db.update(postLikes)
        .set({ reaction })
        .where(eq(postLikes.id, existing.id))
    }
  } else {
    await db.insert(postLikes).values({
      postId,
      userId: activeUser.id,
      reaction,
    })
  }

  const [likesRow, dislikesRow, userReactionRow] = await Promise.all([
  db
    .select({ total: sql<number>`count(*)` })
    .from(postLikes)
    .where(
      and(
        eq(postLikes.postId, postId),
        eq(postLikes.reaction, "like")
      )
    )
    .then((r) => r[0]),

  db
    .select({ total: sql<number>`count(*)` })
    .from(postLikes)
    .where(
      and(
        eq(postLikes.postId, postId),
        eq(postLikes.reaction, "dislike")
      )
    )
    .then((r) => r[0]),

  db
    .select({ reaction: postLikes.reaction })
    .from(postLikes)
    .where(
      and(
        eq(postLikes.postId, postId),
        eq(postLikes.userId, activeUser.id)
      )
    )
    .then((r) => r[0]),
])
console.time("reaction")
  return NextResponse.json({
    likes: Number(likesRow?.total ?? 0),
    dislikes: Number(dislikesRow?.total ?? 0),
    userReaction: userReactionRow?.reaction ?? null,
  })
}
