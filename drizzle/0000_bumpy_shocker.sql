CREATE TABLE IF NOT EXISTS "cart" (
	"cart_id" uuid DEFAULT gen_random_uuid(),
	"user_id" uuid DEFAULT gen_random_uuid(),
	"item_id" uuid DEFAULT gen_random_uuid(),
	CONSTRAINT "cart_cart_id_unique" UNIQUE("cart_id"),
	CONSTRAINT "cart_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "cart_item_id_unique" UNIQUE("item_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "items" (
	"item_id" uuid DEFAULT gen_random_uuid(),
	"user_id" uuid DEFAULT gen_random_uuid(),
	"item_name" varchar(255) NOT NULL,
	"item_description" text,
	"item_price" serial NOT NULL,
	"date_listed" timestamp DEFAULT now(),
	"quantity" integer DEFAULT 1,
	"image_url" text,
	CONSTRAINT "items_item_id_unique" UNIQUE("item_id"),
	CONSTRAINT "items_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transactions" (
	"transaction_id" uuid DEFAULT gen_random_uuid(),
	"item_id" uuid DEFAULT gen_random_uuid(),
	"buyer_id" uuid DEFAULT gen_random_uuid(),
	"seller_id" uuid DEFAULT gen_random_uuid(),
	"item_price" serial NOT NULL,
	"quantity" integer DEFAULT 1,
	CONSTRAINT "transactions_transaction_id_unique" UNIQUE("transaction_id"),
	CONSTRAINT "transactions_item_id_unique" UNIQUE("item_id"),
	CONSTRAINT "transactions_buyer_id_unique" UNIQUE("buyer_id"),
	CONSTRAINT "transactions_seller_id_unique" UNIQUE("seller_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid DEFAULT gen_random_uuid(),
	"username" varchar(50) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_id_unique" UNIQUE("id"),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cart" ADD CONSTRAINT "cart_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cart" ADD CONSTRAINT "cart_item_id_items_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("item_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "items" ADD CONSTRAINT "items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_item_id_items_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("item_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
