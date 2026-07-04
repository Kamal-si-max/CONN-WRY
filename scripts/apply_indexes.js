const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

function getConnectionString() {
  // 1) try env
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL
  // 2) try .env.local
  const envPath = path.join(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const data = fs.readFileSync(envPath, 'utf8')
    for (const line of data.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const [key, ...rest] = trimmed.split('=')
      if (key === 'DATABASE_URL') return rest.join('=').trim()
    }
  }
  // 3) try drizzle.config.ts
  const cfg = path.join(process.cwd(), 'drizzle.config.ts')
  if (fs.existsSync(cfg)) {
    const txt = fs.readFileSync(cfg, 'utf8')
    const m = txt.match(/url:\s*"([^"]+)"/)
    if (m) return m[1]
  }
  return null
}

;(async () => {
  const conn = getConnectionString()
  if (!conn) {
    console.error('No DATABASE_URL found in env, .env.local, or drizzle.config.ts')
    process.exit(1)
  }

  const pool = new Pool({ connectionString: conn })

  const stmts = [
    `CREATE INDEX IF NOT EXISTS post_likes_post_id_user_id_idx ON public.post_likes ("postId", "userId");`,
    `CREATE INDEX IF NOT EXISTS post_likes_post_id_reaction_idx ON public.post_likes ("postId", "reaction");`,
    `CREATE INDEX IF NOT EXISTS post_likes_user_id_idx ON public.post_likes ("userId");`,
    `CREATE INDEX IF NOT EXISTS poll_votes_poll_id_user_id_idx ON public.poll_votes ("pollId", "userId");`,
    `CREATE INDEX IF NOT EXISTS poll_votes_poll_id_option_id_idx ON public.poll_votes ("pollId", "optionId");`,
    `CREATE INDEX IF NOT EXISTS poll_votes_option_id_idx ON public.poll_votes ("optionId");`,
    `CREATE INDEX IF NOT EXISTS poll_options_poll_id_idx ON public.poll_options ("pollId");`,
    `CREATE INDEX IF NOT EXISTS polls_post_id_idx ON public.polls ("postId");`,
    `CREATE INDEX IF NOT EXISTS posts_created_at_idx ON public.posts ("createdAt" DESC);`,
  ]

  try {
    for (const s of stmts) {
      console.log('Executing:', s.replace(/\s+/g, ' ').slice(0, 120))
      await pool.query(s)
    }
    console.log('Indexes applied')
  } catch (err) {
    console.error('Error applying indexes', err)
    process.exitCode = 1
  } finally {
    await pool.end()
  }
})()
