ALTER TABLE "branding_settings" ADD COLUMN "auth_image_zoom" integer DEFAULT 100 NOT NULL;--> statement-breakpoint
ALTER TABLE "branding_settings" ADD COLUMN "auth_image_position_x" integer DEFAULT 50 NOT NULL;--> statement-breakpoint
ALTER TABLE "branding_settings" ADD COLUMN "auth_image_position_y" integer DEFAULT 50 NOT NULL;