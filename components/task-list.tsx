"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { completeTask } from "@/app/actions/earnings"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, ExternalLink, Check } from "lucide-react"

type Task = {
  id: number
  title: string
  description: string
  category: string
  reward: string
  estMinutes: number
  actionUrl: string | null
}

export function TaskList({ tasks }: { tasks: Task[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [activeId, setActiveId] = useState<number | null>(null)
  const [opened, setOpened] = useState<Set<number>>(new Set())

  function handleComplete(task: Task) {
    setActiveId(task.id)
    startTransition(async () => {
      const res = await completeTask(task.id)
      if (res.ok) {
        toast.success(`Earned $${res.reward?.toFixed(2)}`, {
          description: `"${task.title}" added to your balance.`,
        })
        router.refresh()
      } else {
        toast.error(res.error ?? "Could not complete task")
      }
      setActiveId(null)
    })
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
          <Check className="size-8 text-accent" />
          <p className="font-medium">You&apos;ve cleared every task</p>
          <p className="text-sm text-muted-foreground text-balance">
            Nice work. Check back soon — new earning tasks are added regularly.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {tasks.map((task) => {
        const needsAction = Boolean(task.actionUrl)
        const hasOpened = opened.has(task.id)
        const isPending = pending && activeId === task.id

        return (
          <Card key={task.id} className="flex flex-col">
            <CardContent className="flex flex-1 flex-col gap-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <Badge variant="secondary" className="font-normal">
                  {task.category}
                </Badge>
                <span className="text-lg font-semibold text-accent">
                  ${Number(task.reward).toFixed(2)}
                </span>
              </div>

              <div className="flex-1 space-y-1">
                <h3 className="font-medium leading-snug text-pretty">
                  {task.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {task.description}
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="size-3.5" />
                ~{task.estMinutes} min
              </div>

              <div className="flex flex-col gap-2">
                {needsAction && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() =>
                      setOpened((prev) => new Set(prev).add(task.id))
                    }
                    render={
                      <a
                        href={task.actionUrl as string}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open task
                        <ExternalLink className="size-3.5" />
                      </a>
                    }
                  />
                )}
                <Button
                  size="sm"
                  disabled={isPending || (needsAction && !hasOpened)}
                  onClick={() => handleComplete(task)}
                >
                  {isPending
                    ? "Confirming..."
                    : needsAction && !hasOpened
                      ? "Open task first"
                      : "Mark complete & earn"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
