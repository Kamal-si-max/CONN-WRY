ALTER TABLE "profiles"
  ADD COLUMN "username" text UNIQUE,
  ADD COLUMN "bio" text,
  ADD COLUMN "profilePicture" text;
