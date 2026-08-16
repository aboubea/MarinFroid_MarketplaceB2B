ALTER TABLE "branding_settings" ALTER COLUMN "primary_color" SET DEFAULT '#0E7C7B';--> statement-breakpoint
ALTER TABLE "branding_settings" ALTER COLUMN "secondary_color" SET DEFAULT '#FF5A4E';--> statement-breakpoint
ALTER TABLE "branding_settings" ADD COLUMN "auth_image_url" text;