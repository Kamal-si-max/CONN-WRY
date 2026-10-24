ALTER TABLE "user"
  ADD COLUMN "suspended" boolean NOT NULL DEFAULT false,
  ADD COLUMN "suspensionReason" text;

ALTER TABLE "withdrawals"
  ADD COLUMN "reviewedBy" text,
  ADD COLUMN "reviewedAt" timestamp,
  ADD COLUMN "reviewNote" text;
