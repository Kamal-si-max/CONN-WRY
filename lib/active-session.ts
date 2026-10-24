import { headers } from "next/headers"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { user } from "@/lib/db/schema"

export async function getActiveUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return null

  const [account] = await db
    .select({ suspended: user.suspended })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1)

  if (!account || account.suspended) return null
  return session.user
}
