ALTER TABLE "post_likes"
  ADD COLUMN IF NOT EXISTS "reaction" text NOT NULL DEFAULT 'like';

--> statement-breakpoint
