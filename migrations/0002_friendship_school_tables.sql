CREATE TABLE "friendship_schools" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"token" text NOT NULL,
	"contact_person" text NOT NULL,
	"contact_email" text,
	"sheets_tab_name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "friendship_schools_slug_unique" UNIQUE("slug"),
	CONSTRAINT "friendship_schools_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "friendship_school_leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"school_id" integer NOT NULL,
	"student_name" text NOT NULL,
	"grade" text NOT NULL,
	"parent_name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"source" text DEFAULT 'manual' NOT NULL,
	"status" text DEFAULT 'Open' NOT NULL,
	"commission_paid" boolean,
	"remarks" text,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"synced_to_sheets" boolean DEFAULT false NOT NULL,
	"sync_failed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "friendship_school_leads" ADD CONSTRAINT "friendship_school_leads_school_id_friendship_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."friendship_schools"("id") ON DELETE no action ON UPDATE no action;
