CREATE TABLE IF NOT EXISTS "notification_event_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_key" text NOT NULL,
	"label" text NOT NULL,
	"customer_email_enabled" boolean DEFAULT true NOT NULL,
	"ops_email_enabled" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "notification_event_settings_key_idx" ON "notification_event_settings" USING btree ("event_key");