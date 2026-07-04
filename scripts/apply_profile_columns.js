const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env.local')
  const content = fs.readFileSync(envPath, 'utf8')
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const [key, ...rest] = trimmed.split('=')
    if (!key) continue
    const value = rest.join('=')
    process.env[key.trim()] = value.trim()
  }
}

loadEnv()

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const sql = `ALTER TABLE "profiles"
    ADD COLUMN IF NOT EXISTS "username" text UNIQUE,
    ADD COLUMN IF NOT EXISTS "bio" text,
    ADD COLUMN IF NOT EXISTS "profilePicture" text;`

  const client = await pool.connect()
  try {
    await client.query(sql)
    console.log('Applied profile columns successfully')
  } catch (error) {
    console.error(error)
    process.exitCode = 1
  } finally {
    client.release()
    await pool.end()
  }
}

main()
