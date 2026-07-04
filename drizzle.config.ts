import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://neondb_owner:npg_cg52SUoOKLHP@ep-divine-meadow-atoxbxik.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require",
  },
});