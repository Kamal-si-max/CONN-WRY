import { betterAuth } from "better-auth"
import { Pool } from "pg"

const baseURL =
  process.env.BETTER_AUTH_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.V0_RUNTIME_URL || "http://localhost:3000")

function toOrigin(value: string | undefined) {
  if (!value) return undefined

  try {
    const url = new URL(
      value.includes("://") ? value : `https://${value}`,
    )
    if (url.protocol !== "https:" && url.protocol !== "http:") return undefined
    return url.origin
  } catch {
    console.warn("Ignoring invalid Better Auth trusted origin:", value)
    return undefined
  }
}

const configuredTrustedOrigins =
  process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",")
    .map((origin) => toOrigin(origin.trim()))
    .filter((origin): origin is string => Boolean(origin)) ?? []

const trustedOrigins = Array.from(
  new Set(
    [
      toOrigin(baseURL),
      toOrigin(process.env.V0_RUNTIME_URL),
      toOrigin(process.env.VERCEL_URL),
      toOrigin(process.env.VERCEL_BRANCH_URL),
      toOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL),
      ...configuredTrustedOrigins,
      "http://localhost:3000",
    ].filter((origin): origin is string => Boolean(origin)),
  ),
)

export const auth = betterAuth({
  database: new Pool({ connectionString: process.env.DATABASE_URL }),
  baseURL,
  trustedOrigins,
  emailAndPassword: {
    enabled: true,
  },
  ...(process.env.NODE_ENV === "development"
    ? {
        advanced: {
          defaultCookieAttributes: {
            sameSite: "none" as const,
            secure: true,
          },
        },
      }
    : {}),
})
