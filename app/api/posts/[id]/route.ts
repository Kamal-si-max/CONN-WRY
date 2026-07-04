import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { eq } from "drizzle-orm"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { posts, polls, pollOptions, pollVotes, postLikes } from "@/lib/db/schema"

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const postId = Number(id)
  if (Number.isNaN(postId)) {
    return NextResponse.json({ error: "Invalid post id" }, { status: 400 })
  }

  const post = await db
    .select()
    .from(posts)
    .where(eq(posts.id, postId))
    .then((rows) => rows[0])

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 })
  }

  if (post.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const poll = await db
    .select()
    .from(polls)
    .where(eq(polls.postId, postId))
    .then((rows) => rows[0])

  if (poll) {
    await db.delete(pollVotes).where(eq(pollVotes.pollId, poll.id))
    await db.delete(pollOptions).where(eq(pollOptions.pollId, poll.id))
    await db.delete(polls).where(eq(polls.id, poll.id))
  }

  await db.delete(postLikes).where(eq(postLikes.postId, postId))
  await db.delete(posts).where(eq(posts.id, postId))

  return NextResponse.json({ success: true })
}
