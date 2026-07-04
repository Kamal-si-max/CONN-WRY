"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function PostForm() {
  const [content, setContent] = useState("")
  const [hasPoll, setHasPoll] = useState(false)
  const [pollQuestion, setPollQuestion] = useState("")
  const [pollOptions, setPollOptions] = useState(["", ""])

  function updateOption(index: number, value: string) {
    setPollOptions((current) => current.map((option, i) => (i === index ? value : option)))
  }

  function addPollOption() {
    setPollOptions((current) => [...current, ""])
  }

  function removePollOption(index: number) {
    setPollOptions((current) => current.filter((_, i) => i !== index))
  }

  async function handleSubmit() {
    const trimmedContent = content.trim()
    const options = pollOptions.map((option) => option.trim()).filter(Boolean)

    if (!trimmedContent && !(hasPoll && pollQuestion.trim() && options.length >= 2)) {
      alert("Please add post content or a poll with at least two options.")
      return
    }

    const payload: Record<string, unknown> = {
      content: trimmedContent,
    }

    if (hasPoll) {
      payload.poll = {
        question: pollQuestion.trim(),
        options,
      }
    }

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      setContent("")
      setHasPoll(false)
      setPollQuestion("")
      setPollOptions(["", ""])
      window.location.reload()
    } else {
      alert("Failed to create post")
    }
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <textarea
          className="w-full min-h-[120px] rounded-md border border-slate-300 p-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="rounded-3xl border border-slate-200/80 bg-slate-50/70 p-4">
          <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={hasPoll}
              onChange={(e) => setHasPoll(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent"
            />
            Add a poll to this post
          </label>

          {hasPoll && (
            <div className="mt-4 space-y-4">
              <input
                type="text"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder="Poll question"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />

              <div className="space-y-2">
                {pollOptions.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                    />
                    {pollOptions.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => removePollOption(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Button type="button" variant="secondary" size="sm" onClick={addPollOption}>
                Add option
              </Button>
            </div>
          )}
        </div>

        <Button onClick={handleSubmit}>Post</Button>
      </CardContent>
    </Card>
  )
}
