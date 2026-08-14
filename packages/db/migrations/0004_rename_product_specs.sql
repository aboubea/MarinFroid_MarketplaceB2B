ALTER TABLE "products" RENAME COLUMN "storage_temp" TO "storage_info";--> statement-breakpoint
ALTER TABLE "products" RENAME COLUMN "shelf_life" TO "validity_info";--> statement-breakpoint
ALTER TABLE "products" RENAME COLUMN "nutritional_info" TO "specifications";
