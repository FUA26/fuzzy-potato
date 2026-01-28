ALTER TABLE "projects" ALTER COLUMN "domain_whitelist" SET DATA TYPE text[] USING domain_whitelist::text[];--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "domain_whitelist" SET DEFAULT ARRAY[]::TEXT[];--> statement-breakpoint
ALTER TABLE "webhooks" ALTER COLUMN "events" SET DATA TYPE text[] USING events::text[];--> statement-breakpoint
ALTER TABLE "webhooks" ALTER COLUMN "events" SET DEFAULT ARRAY[]::TEXT[];