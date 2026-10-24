import { NextResponse } from "next/server"
import { desc, eq } from "drizzle-orm"
import { getAdminUser } from "@/lib/admin-auth"
import { db } from "@/lib/db"
import { tasks } from "@/lib/db/schema"

export async function GET() {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 })
  }
  const rows = await db.select().from(tasks).orderBy(desc(tasks.createdAt))
  return NextResponse.json({ tasks: rows })
}

function parseTask(body: unknown) {
  if (!body || typeof body !== "object") return null
  const fields = body as Record<string, unknown>
  const title = typeof fields.title === "string" ? fields.title.trim() : ""
  const description =
    typeof fields.description === "string" ? fields.description.trim() : ""
  const category = typeof fields.category === "string" ? fields.category.trim() : ""
  const reward = Number(fields.reward)
  const estMinutes = Number(fields.estMinutes)
  const actionUrl =
    typeof fields.actionUrl === "string" && fields.actionUrl.trim()
      ? fields.actionUrl.trim()
      : null
  const active = fields.active !== false

  if (
    !title ||
    title.length > 120 ||
    !description ||
    description.length > 2000 ||
    !category ||
    category.length > 80 ||
    !Number.isFinite(reward) ||
    reward < 0 ||
    reward > 100000 ||
    !Number.isInteger(estMinutes) ||
    estMinutes < 1 ||
    estMinutes > 1440
  ) {
    return null
  }
  if (actionUrl) {
    try {
      const url = new URL(actionUrl)
      if (url.protocol !== "https:" && url.protocol !== "http:") return null
    } catch {
      return null
    }
  }

  return {
    title,
    description,
    category,
    reward: reward.toFixed(2),
    estMinutes,
    actionUrl,
    active,
  }
}

export async function POST(request: Request) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }
  const values = parseTask(body)
  if (!values) {
    return NextResponse.json({ error: "Check task fields and reward values" }, { status: 400 })
  }

  const [created] = await db.insert(tasks).values(values).returning()
  return NextResponse.json({ task: created }, { status: 201 })
}

export async function PATCH(request: Request) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }
  if (!body || typeof body !== "object" || !("id" in body)) {
    return NextResponse.json({ error: "Task id is required" }, { status: 400 })
  }
  const id = Number((body as { id: unknown }).id)
  const values = parseTask(body)
  if (!Number.isInteger(id) || id < 1 || !values) {
    return NextResponse.json({ error: "Check task fields and reward values" }, { status: 400 })
  }

  const [updated] = await db
    .update(tasks)
    .set(values)
    .where(eq(tasks.id, id))
    .returning()
  if (!updated) return NextResponse.json({ error: "Task not found" }, { status: 404 })
  return NextResponse.json({ task: updated })
}
