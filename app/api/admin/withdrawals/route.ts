import { NextResponse } from "next/server"
import { and, desc, eq } from "drizzle-orm"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"
import { user, withdrawals } from "@/lib/db/schema"

export async function GET() {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 })
  }

  const rows = await db
    .select({
      id: withdrawals.id,
      userId: withdrawals.userId,
      name: user.name,
      email: user.email,
      amount: withdrawals.amount,
      method: withdrawals.method,
      destination: withdrawals.destination,
      status: withdrawals.status,
      reviewNote: withdrawals.reviewNote,
      createdAt: withdrawals.createdAt,
      reviewedAt: withdrawals.reviewedAt,
    })
    .from(withdrawals)
    .leftJoin(user, eq(user.id, withdrawals.userId))
    .orderBy(desc(withdrawals.createdAt))
    .limit(200)

  return NextResponse.json({ withdrawals: rows })
}

export async function PATCH(request: Request) {
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
  const id = Number(fields.id)
  const status = fields.status
  const note = typeof fields.note === "string" ? fields.note.trim() : ""
  if (!Number.isInteger(id) || id < 1 || !["approved", "rejected", "paid"].includes(String(status))) {
    return NextResponse.json({ error: "Invalid withdrawal update" }, { status: 400 })
  }
  if (note.length > 500) {
    return NextResponse.json({ error: "Review note must be 500 characters or fewer" }, { status: 400 })
  }

  const [withdrawal] = await db
    .select({ status: withdrawals.status })
    .from(withdrawals)
    .where(eq(withdrawals.id, id))
    .limit(1)

  if (!withdrawal) {
    return NextResponse.json({ error: "Withdrawal not found" }, { status: 404 })
  }

  const allowed =
    (withdrawal.status === "pending" && (status === "approved" || status === "rejected")) ||
    (withdrawal.status === "approved" && status === "paid")
  if (!allowed) {
    return NextResponse.json(
      { error: "Invalid status change. Pending requests can be approved/rejected; approved requests can be marked paid." },
      { status: 409 },
    )
  }

  const [updated] = await db
    .update(withdrawals)
    .set({
      status: String(status),
      reviewedBy: admin.id,
      reviewedAt: new Date(),
      reviewNote: note || null,
    })
    .where(and(eq(withdrawals.id, id), eq(withdrawals.status, withdrawal.status)))
    .returning({ id: withdrawals.id })

  if (!updated) {
    return NextResponse.json({ error: "Withdrawal status changed; refresh and try again" }, { status: 409 })
  }

  return NextResponse.json({ ok: true })
}
