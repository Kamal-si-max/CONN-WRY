ALTER TABLE "post_likes" ADD COLUMN "reaction" text DEFAULT 'like' NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "username" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "background" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "profilePicture" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_username_unique" UNIQUE("username");