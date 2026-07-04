import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { and, desc, eq, sql } from "drizzle-orm"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { posts, polls, pollOptions, pollVotes, postLikes, user } from "@/lib/db/schema"

// GET all posts
export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  const url = new URL(req.url)
  const limit = Number(url.searchParams.get("limit") ?? "20")

  const rows = await db
    .select({
      postId: posts.id,
      userId: posts.userId,
      userName: user.name,
      content: posts.content,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      pollId: polls.id,
      pollQuestion: polls.question,
      optionId: pollOptions.id,
      optionText: pollOptions.optionText,
    })
    .from(posts)
    .leftJoin(user, eq(user.id, posts.userId))
    .leftJoin(polls, eq(polls.postId, posts.id))
    .leftJoin(pollOptions, eq(pollOptions.pollId, polls.id))
    .orderBy(desc(posts.createdAt))
    .limit(limit)

  const allPosts = Array.from(
    rows.reduce((acc, row) => {
      let post = acc.get(row.postId)
      if (!post) {
        post = {
          id: row.postId,
          userId: row.userId,
          userName: row.userName ?? "Unknown user",
          content: row.content,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          poll: row.pollId
            ? { id: row.pollId, question: row.pollQuestion, options: [] }
            : null,
          likes: 0,
          dislikes: 0,
          userReaction: null,
        }
        acc.set(row.postId, post)
      }

      if (row.pollId && row.optionId) {
        post.poll?.options.push({
          id: row.optionId,
          optionText: row.optionText,
          votes: 0,
        })
      }

      return acc
    }, new Map()).values()
  )

  const counts = await db
    .select({
      postId: postLikes.postId,
      reaction: postLikes.reaction,
      total: sql<number>`count(*)`,
    })
    .from(postLikes)
    .groupBy(postLikes.postId, postLikes.reaction)

  const reactionMap = counts.reduce((acc, row) => {
    const current = acc.get(row.postId) ?? { likes: 0, dislikes: 0 }
    if (row.reaction === "like") {
      current.likes = Number(row.total)
    } else {
      current.dislikes = Number(row.total)
    }
    acc.set(row.postId, current)
    return acc
  }, new Map<number, { likes: number; dislikes: number }>())

  const userReactionRows = session?.user?.id
    ? await db
        .select({ postId: postLikes.postId, reaction: postLikes.reaction })
        .from(postLikes)
        .where(eq(postLikes.userId, session.user.id))
    : []

  const userReactionMap = userReactionRows.reduce((acc, row) => {
    acc.set(row.postId, row.reaction as "like" | "dislike")
    return acc
  }, new Map<number, "like" | "dislike">())

  const userPollVoteRows = session?.user?.id
    ? await db
        .select({ pollId: pollVotes.pollId, optionId: pollVotes.optionId })
        .from(pollVotes)
        .where(eq(pollVotes.userId, session.user.id))
    : []

  const userPollVoteMap = userPollVoteRows.reduce((acc, row) => {
    acc.set(row.pollId, row.optionId)
    return acc
  }, new Map<number, number>())

  const optionVoteCounts = await db
    .select({ optionId: pollVotes.optionId, total: sql<number>`count(*)` })
    .from(pollVotes)
    .groupBy(pollVotes.optionId)

  const optionVoteMap = optionVoteCounts.reduce((acc, row) => {
    acc.set(row.optionId, Number(row.total))
    return acc
  }, new Map<number, number>())

  for (const post of allPosts) {
    if (!post.poll) continue
    for (const option of post.poll.options) {
      option.votes = optionVoteMap.get(option.id) ?? 0
    }
  }

  const postsWithTotals = allPosts.map((post) => {
    const counts = reactionMap.get(post.id) ?? { likes: 0, dislikes: 0 }
    return {
      ...post,
      poll: post.poll
        ? {
            ...post.poll,
            selectedOptionId: userPollVoteMap.get(post.poll.id) ?? null,
          }
        : null,
      likes: counts.likes,
      dislikes: counts.dislikes,
      userReaction: userReactionMap.get(post.id) ?? null,
    }
  })

  return NextResponse.json({
    posts: postsWithTotals,
    currentUserId: session?.user?.id ?? null,
  })
}

// CREATE post
export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  const body = await req.json()
  const content = String(body.content ?? "").trim()
  const poll = body.poll

  if (!content && !poll) {
    return NextResponse.json(
      { error: "Content required" },
      { status: 400 }
    )
  }

  const [post] = await db
    .insert(posts)
    .values({
      userId: session.user.id,
      content,
    })
    .returning()

  if (poll) {
    const question = String(poll.question ?? "").trim()
    const options = Array.isArray(poll.options)
      ? poll.options.map((option: unknown) => String(option ?? "").trim()).filter(Boolean)
      : []

    if (question && options.length >= 2) {
      const [createdPoll] = await db
        .insert(polls)
        .values({
          postId: post.id,
          question,
        })
        .returning()

      await db.insert(pollOptions).values(
        options.map((option: string) => ({
          pollId: createdPoll.id,
          optionText: option,
          votes: 0,
        }))
      )
    }
  }

  return NextResponse.json(post)
}
