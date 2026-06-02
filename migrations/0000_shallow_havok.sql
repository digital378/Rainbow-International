CREATE TABLE "brochure_requests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"card_number" text NOT NULL,
	"name" text,
	"email" text,
	"phone" text,
	"requested_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "callback_requests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"preferred_time" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "career_applications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"position" text NOT NULL,
	"experience" text,
	"qualification" text,
	"current_location" text,
	"resume_filename" text,
	"resume_mime_type" text,
	"resume_size" text,
	"message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"date" text NOT NULL,
	"category" text NOT NULL,
	"image_url" text
);
--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_name" text NOT NULL,
	"email" text,
	"phone" text NOT NULL,
	"student_name" text NOT NULL,
	"grade" text NOT NULL,
	"preferred_time" text,
	"source" text,
	"message" text,
	"page_path" text,
	"page_title" text,
	"form_location" text,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"utm_term" text,
	"utm_content" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ras" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"branch" text DEFAULT 'Main' NOT NULL,
	"school" text DEFAULT 'RIS' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ras_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "walkin_checkins" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ra_id" varchar NOT NULL,
	"ra_name" text NOT NULL,
	"ra_branch" text NOT NULL,
	"school" text DEFAULT 'RIS' NOT NULL,
	"parent_name" text NOT NULL,
	"student_name" text NOT NULL,
	"grade" text NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"synced_to_sheets" boolean DEFAULT false NOT NULL,
	"sheet_sync_error" text
);
--> statement-breakpoint
ALTER TABLE "walkin_checkins" ADD CONSTRAINT "walkin_checkins_ra_id_ras_id_fk" FOREIGN KEY ("ra_id") REFERENCES "public"."ras"("id") ON DELETE no action ON UPDATE no action;