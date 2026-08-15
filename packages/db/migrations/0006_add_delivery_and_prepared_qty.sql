ALTER TABLE "order_items" ADD COLUMN "prepared_quantity" integer;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "estimated_delivery_date" timestamp with time zone;