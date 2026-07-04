"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown } from "lucide-react"

type PollOption = {
  id: number
  optionText: string
  votes: number
}

type Poll = {
  id: number
  question: string
  options: PollOption[]
  selectedOptionId: number | null
}

type Post = {
  id: number
  userId: string
  userName: string
  createdAt: string
  content: string
  poll: Poll | null
  likes: number
  dislikes: number
  userReaction: "like" | "dislike" | null
}

type PostsResponse = {
  posts: Post[]
  currentUserId: string | null
}

export function Feed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [saving, setSaving] = useState<Record<number, boolean>>({})
  const CACHE_KEY = "feed.posts.v1"

  const saveCache = (p: Post[]) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(p))
    } catch (e) {
      // ignore
    }
  }

  useEffect(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) setPosts(JSON.parse(cached))
    } catch (e) {
      // ignore
    }

    fetch("/api/posts?limit=10", { cache: "no-store" })
      .then((r) => r.json())
      .then((response: PostsResponse) => {
        console.log("/api/posts response", response)
        setPosts(response.posts)
        setCurrentUserId(response.currentUserId)
        saveCache(response.posts)
      })
  }, [])

  async function handleReaction(postId: number, type: "like" | "dislike") {
    const previousPosts = posts
    const optimistic = posts.map((post) => {
      if (post.id !== postId) return post

      const currentReaction = post.userReaction
      let likes = post.likes
      let dislikes = post.dislikes
      let userReaction: Post["userReaction"] = type

      if (currentReaction === type) {
        if (type === "like") likes = Math.max(0, likes - 1)
        else dislikes = Math.max(0, dislikes - 1)
        userReaction = null
      } else {
        if (currentReaction === "like") likes = Math.max(0, likes - 1)
        if (currentReaction === "dislike") dislikes = Math.max(0, dislikes - 1)
        if (type === "like") likes += 1
        else dislikes += 1
      }

      return {
        ...post,
        likes,
        dislikes,
        userReaction,
      }
    })

    setPosts(optimistic)
    saveCache(optimistic)

    setSaving((prev) => ({ ...prev, [postId]: true }))
    try {
      const res = await fetch(`/api/posts/${postId}/reaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reaction: type }),
      })

      if (!res.ok) {
        setPosts(previousPosts)
        alert("Could not save your reaction")
        return
      }

      const updated = await res.json()
      const settled = posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes: updated.likes,
              dislikes: updated.dislikes,
              userReaction: updated.userReaction,
            }
          : post,
      )
      setPosts(settled)
      saveCache(settled)
    } catch {
      setPosts(previousPosts)
      saveCache(previousPosts)
      alert("Could not save your reaction")
    } finally {
      setSaving((prev) => ({ ...prev, [postId]: false }))
    }
  }

  async function handlePollVote(postId: number, pollId: number, optionId: number) {
    if (!currentUserId) {
      alert("Please sign in to vote on polls.")
      return
    }

    const previousPosts = posts
    const optimistic = posts.map((post) => {
      if (post.id !== postId) return post
      if (!post.poll) return post

      const currentSelected = post.poll.selectedOptionId
      const newSelected = currentSelected === optionId ? null : optionId

      return {
        ...post,
        poll: {
          ...post.poll,
          selectedOptionId: newSelected,
          options: post.poll.options.map((option) => {
            let votes = option.votes
            if (option.id === optionId) {
              votes = option.id === currentSelected ? Math.max(0, votes - 1) : votes + 1
            }
            if (currentSelected && option.id === currentSelected && currentSelected !== optionId) {
              votes = Math.max(0, votes - 1)
            }
            return {
              ...option,
              votes,
            }
          }),
        },
      }
    })

    setPosts(optimistic)
    saveCache(optimistic)

    setSaving((prev) => ({ ...prev, [postId]: true }))
    try {
      const res = await fetch(`/api/posts/poll-vote/${pollId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ optionId }),
      })

      if (!res.ok) {
        setPosts(previousPosts)
        alert("Could not save your poll vote")
        return
      }

      const updated = await res.json()
      const settled = posts.map((post) => {
        if (post.id !== postId) return post
        if (!post.poll) return post

        const voteMap = new Map<number, number>(
          updated.voteCounts.map((item: { optionId: number; total: number }) => [item.optionId, item.total]),
        )

        return {
          ...post,
          poll: {
            ...post.poll,
            selectedOptionId: updated.selectedOptionId,
            options: post.poll.options.map((option) => ({
              ...option,
              votes: voteMap.get(option.id) ?? option.votes,
            })),
          },
        }
      })
      setPosts(settled)
      saveCache(settled)
    } catch {
      setPosts(previousPosts)
      saveCache(previousPosts)
      alert("Could not save your poll vote")
    } finally {
      setSaving((prev) => ({ ...prev, [postId]: false }))
    }
  }

  const postCountLabel = useMemo(() => {
    const count = posts.length
    return count === 0 ? "No posts yet" : `${count} ${count === 1 ? "post" : "posts"}`
  }, [posts.length])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-3xl border border-slate-200/80 bg-slate-50/70 px-4 py-3 text-sm text-slate-600 shadow-sm shadow-slate-900/5">
        <span className="font-medium text-slate-900">Feed</span>
        <span>{postCountLabel}</span>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300/80 bg-white/80 p-8 text-center text-sm text-slate-500">
          No posts available yet. Create the first update and share it with your network.
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <article
              key={post.id}
              className="rounded-[1.5rem] border border-slate-200/80 bg-white/90 p-5 shadow-sm shadow-slate-900/5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-sm font-semibold text-white shadow-sm shadow-emerald-500/20">
                    {post.userName?.[0] ?? "U"}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{post.userName}</p>
                    <p className="text-xs text-slate-500">
                      {post.createdAt ? new Date(post.createdAt).toLocaleString() : ""}
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-sm leading-7 text-slate-700">{post.content}</p>

              {post.poll && (
                <div className="mt-5 rounded-3xl border border-slate-200/80 bg-slate-50/70 p-4">
                  <p className="font-semibold text-slate-900">{post.poll.question}</p>
                  <div className="mt-3 space-y-2">
                    {post.poll.options.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      disabled={saving[post.id]}
                      onClick={() => handlePollVote(post.id, post.poll!.id, option.id)}
                      className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition ${
                        post.poll?.selectedOptionId === option.id
                          ? "border-emerald-500 bg-emerald-50 text-slate-900 shadow-sm"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <span>{option.optionText}</span>
                      <span className="text-slate-500">
                        {option.votes} vote{option.votes === 1 ? "" : "s"}
                      </span>
                    </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <span>{post.likes} likes</span>
                  <span>{post.dislikes} dislikes</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={saving[post.id]}
                    className={`gap-2 ${post.userReaction === "like" ? "border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600" : "border-slate-200 text-slate-700 hover:bg-slate-100"}`}
                    onClick={() => handleReaction(post.id, "like")}
                  >
                    <ThumbsUp className="size-4" />
                    Like
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={saving[post.id]}
                    className={`gap-2 ${post.userReaction === "dislike" ? "border-red-500 bg-red-500 text-white hover:bg-red-600" : "border-slate-200 text-slate-700 hover:bg-slate-100"}`}
                    onClick={() => handleReaction(post.id, "dislike")}
                  >
                    <ThumbsDown className="size-4" />
                    Dislike
                  </Button>
                  {currentUserId === post.userId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={async () => {
                        const res = await fetch(`/api/posts/${post.id}`, {
                          method: "DELETE",
                        })
                        if (res.ok) {
                          setPosts((current) => {
                            const next = current.filter((item) => item.id !== post.id)
                            saveCache(next)
                            return next
                          })
                        } else {
                          alert("Unable to delete post")
                        }
                      }}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
