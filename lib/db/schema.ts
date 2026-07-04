import {
  pgTable,
  text,
  timestamp,
  boolean,
  serial,
  integer,
  numeric,
} from "drizzle-orm/pg-core"

// ---------- Better Auth tables (do not rename columns) ----------
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

// ---------- App tables ----------
export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull().unique(),
  referralCode: text("referralCode").notNull().unique(),
  username: text("username").unique(),
  background: text("background"),
  bio: text("bio").unique(),
  profilePicture: text("profilePicture"),
  referredBy: text("referredBy"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  reward: numeric("reward", { precision: 10, scale: 2 }).notNull(),
  estMinutes: integer("estMinutes").notNull().default(5),
  actionUrl: text("actionUrl"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const taskCompletions = pgTable("task_completions", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  taskId: integer("taskId").notNull(),
  reward: numeric("reward", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const withdrawals = pgTable("withdrawals", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  method: text("method").notNull(),
  destination: text("destination").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})
// ---------------- POSTS ----------------

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: text("userId").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

// ---------------- POST LIKES ----------------

export const postLikes = pgTable("post_likes", {
  id: serial("id").primaryKey(),
  postId: integer("postId").notNull(),
  userId: text("userId").notNull(),
  reaction: text("reaction").notNull().default("like"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

// ---------------- POLLS ----------------

export const polls = pgTable("polls", {
  id: serial("id").primaryKey(),
  postId: integer("postId").notNull(),
  question: text("question").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

// ---------------- POLL OPTIONS ----------------

export const pollOptions = pgTable("poll_options", {
  id: serial("id").primaryKey(),
  pollId: integer("pollId").notNull(),
  optionText: text("optionText").notNull(),
  votes: integer("votes").notNull().default(0),
})

// ---------------- POLL VOTES ----------------

export const pollVotes = pgTable("poll_votes", {
  id: serial("id").primaryKey(),
  pollId: integer("pollId").notNull(),
  optionId: integer("optionId").notNull(),
  userId: text("userId").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})