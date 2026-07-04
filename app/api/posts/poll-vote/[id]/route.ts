import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { and, eq, sql } from "drizzle-orm"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { pollOptions, pollVotes, polls, posts } from "@/lib/db/schema"

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const pollId = Number(id)
  if (Number.isNaN(pollId)) {
    return NextResponse.json({ error: "Invalid poll id" }, { status: 400 })
  }

  const poll = await db
    .select()
    .from(polls)
    .where(eq(polls.id, pollId))
    .then((rows) => rows[0])

  if (!poll) {
    return NextResponse.json({ error: "Poll not found" }, { status: 404 })
  }

  const body = await req.json()
  const optionId = Number(body.optionId)
  if (Number.isNaN(optionId)) {
    return NextResponse.json({ error: "Invalid option id" }, { status: 400 })
  }

  const option = await db
    .select()
    .from(pollOptions)
    .where(and(eq(pollOptions.id, optionId), eq(pollOptions.pollId, pollId)))
    .then((rows) => rows[0])

  if (!option) {
    return NextResponse.json({ error: "Poll option not found" }, { status: 404 })
  }

  const existingVote = await db
    .select()
    .from(pollVotes)
    .where(and(eq(pollVotes.pollId, pollId), eq(pollVotes.userId, session.user.id)))
    .then((rows) => rows[0])

  if (existingVote) {
    if (existingVote.optionId === optionId) {
      await db.delete(pollVotes).where(eq(pollVotes.id, existingVote.id))
    } else {
      await db.update(pollVotes)
        .set({ optionId })
        .where(eq(pollVotes.id, existingVote.id))
    }
  } else {
    await db.insert(pollVotes).values({
      pollId,
      optionId,
      userId: session.user.id,
    })
  }

  const voteCounts = await db
    .select({ optionId: pollVotes.optionId, total: sql<number>`count(*)` })
    .from(pollVotes)
    .where(eq(pollVotes.pollId, pollId))
    .groupBy(pollVotes.optionId)

  return NextResponse.json({
    selectedOptionId: existingVote?.optionId === optionId ? null : optionId,
    voteCounts: voteCounts.map((row) => ({ optionId: row.optionId, total: Number(row.total) })),
  })
}
