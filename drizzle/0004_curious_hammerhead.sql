CREATE TABLE "feedbacks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"rating" smallint NOT NULL,
	"status" varchar(20) DEFAULT 'new' NOT NULL,
	"answers" jsonb,
	"meta" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(50) NOT NULL,
	"domain_whitelist" text DEFAULT ARRAY[]::TEXT[] NOT NULL,
	"api_key" varchar(64),
	"widget_config" jsonb DEFAULT '{}'::jsonb,
	"tier" varchar(20) DEFAULT 'basic' NOT NULL,
	"settings" jsonb DEFAULT '{"remove_branding": false, "retention_days": 30}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug"),
	CONSTRAINT "projects_api_key_unique" UNIQUE("api_key")
);
--> statement-breakpoint
CREATE TABLE "webhooks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"url" text NOT NULL,
	"events" text DEFAULT ARRAY[]::TEXT[] NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"secret_key" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "provider" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "keycloak_id" varchar(255);--> statement-breakpoint
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhooks" ADD CONSTRAINT "webhooks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_feedbacks_project_date" ON "feedbacks" USING btree ("project_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_feedbacks_project_rating" ON "feedbacks" USING btree ("project_id","rating");--> statement-breakpoint
CREATE INDEX "idx_feedbacks_answers" ON "feedbacks" USING gin ("answers");