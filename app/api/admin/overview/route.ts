import { NextResponse } from "next/server"
import { count, eq, sql } from "drizzle-orm"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"
import { tasks, user, withdrawals } from "@/lib/db/schema"

export async function GET() {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 })
  }

  const [users, pending, paid, activeTasks] = await Promise.all([
    db.select({ total: count() }).from(user),
    db
      .select({ total: count() })
      .from(withdrawals)
      .where(eq(withdrawals.status, "pending")),
    db
      .select({ total: sql<string>`coalesce(sum(${withdrawals.amount}), 0)` })
      .from(withdrawals)
      .where(eq(withdrawals.status, "paid")),
    db.select({ total: count() }).from(tasks).where(eq(tasks.active, true)),
  ])

  return NextResponse.json({
    totalUsers: users[0]?.total ?? 0,
    pendingWithdrawals: pending[0]?.total ?? 0,
    totalPaid: Number(paid[0]?.total ?? 0),
    activeTasks: activeTasks[0]?.total ?? 0,
  })
}
