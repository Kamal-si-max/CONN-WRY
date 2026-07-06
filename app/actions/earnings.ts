"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import {
  profiles,
  tasks,
  taskCompletions,
  withdrawals,
} from "@/lib/db/schema"
import { and, desc, eq, sql } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user.id
}

function generateReferralCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

// Ensure a profile (with referral code) exists for the current user.
export async function ensureProfile() {
  const userId = await getUserId()

  // Pehle check karo profile already hai ya nahi
  const [existing] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1)

  if (existing) {
    return existing
  }

  // Agar nahi hai to create karo
  try {
    const [created] = await db
      .insert(profiles)
      .values({
        userId,
        referralCode: generateReferralCode(),
      })
      .onConflictDoNothing({
        target: profiles.userId,
      })
      .returning()

    // Insert successful
    if (created) {
      return created
    }

    // Agar kisi aur request ne same time insert kar diya ho
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1)

    if (profile) {
      return profile
    }

    throw new Error("Could not create profile")
  } catch (err) {
    console.error("ensureProfile:", err)
    throw err
  }
}

export async function getDashboardData() {
  const userId = await getUserId()
  const profile = await ensureProfile()

  const [earnedRow] = await db
    .select({ total: sql<string>`coalesce(sum(${taskCompletions.reward}), 0)` })
    .from(taskCompletions)
    .where(eq(taskCompletions.userId, userId))

  const [withdrawnRow] = await db
    .select({
      total: sql<string>`coalesce(sum(${withdrawals.amount}), 0)`,
    })
    .from(withdrawals)
    .where(
      and(
        eq(withdrawals.userId, userId),
        sql`${withdrawals.status} <> 'rejected'`,
      ),
    )

  const completions = await db
    .select()
    .from(taskCompletions)
    .where(eq(taskCompletions.userId, userId))

  const completedIds = new Set(completions.map((c) => c.taskId))

  const allTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.active, true))
    .orderBy(desc(tasks.reward))

  const availableTasks = allTasks.filter((t) => !completedIds.has(t.id))

  const recentWithdrawals = await db
    .select()
    .from(withdrawals)
    .where(eq(withdrawals.userId, userId))
    .orderBy(desc(withdrawals.createdAt))
    .limit(10)

  const recentCompletions = await db
    .select({
      id: taskCompletions.id,
      reward: taskCompletions.reward,
      createdAt: taskCompletions.createdAt,
      title: tasks.title,
      category: tasks.category,
    })
    .from(taskCompletions)
    .leftJoin(tasks, eq(taskCompletions.taskId, tasks.id))
    .where(eq(taskCompletions.userId, userId))
    .orderBy(desc(taskCompletions.createdAt))
    .limit(10)

  const totalEarned = Number(earnedRow?.total ?? 0)
  const totalWithdrawn = Number(withdrawnRow?.total ?? 0)
  const balance = totalEarned - totalWithdrawn

  return {
    profile,
    balance,
    totalEarned,
    totalWithdrawn,
    completedCount: completions.length,
    availableTasks,
    recentWithdrawals,
    recentCompletions,
  }
}

export async function completeTask(taskId: number) {
  const userId = await getUserId()

  const already = await db
    .select()
    .from(taskCompletions)
    .where(
      and(
        eq(taskCompletions.userId, userId),
        eq(taskCompletions.taskId, taskId),
      ),
    )
    .limit(1)

  if (already.length > 0) {
    return { ok: false, error: "Task already completed" }
  }

  const [task] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.active, true)))
    .limit(1)

  if (!task) return { ok: false, error: "Task not found" }

  await db.insert(taskCompletions).values({
    userId,
    taskId,
    reward: task.reward,
  })

  revalidatePath("/dashboard")
  return { ok: true, reward: Number(task.reward) }
}

export async function requestWithdrawal(formData: {
  amount: number
  method: string
  destination: string
}) {
  const userId = await getUserId()
  const { balance } = await getDashboardData()

  const amount = Number(formData.amount)
  if (!amount || amount <= 0) {
    return { ok: false, error: "Enter a valid amount" }
  }
  if (amount < 10) {
    return { ok: false, error: "Minimum withdrawal is $10.00" }
  }
  if (amount > balance) {
    return { ok: false, error: "Amount exceeds your available balance" }
  }
  if (!formData.destination?.trim()) {
    return { ok: false, error: "Enter a payout destination" }
  }

  await db.insert(withdrawals).values({
    userId,
    amount: amount.toFixed(2),
    method: formData.method,
    destination: formData.destination.trim(),
    status: "pending",
  })

  revalidatePath("/dashboard")
  return { ok: true }
}
