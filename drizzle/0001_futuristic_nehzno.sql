ALTER TABLE "items" ADD COLUMN "username" varchar;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "items" ADD CONSTRAINT "items_username_users_username_fk" FOREIGN KEY ("username") REFERENCES "public"."users"("username") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
