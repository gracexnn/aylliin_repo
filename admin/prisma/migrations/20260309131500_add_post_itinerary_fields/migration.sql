ALTER TABLE "posts"
ADD COLUMN "journey_overview" VARCHAR(1000),
ADD COLUMN "package_options" JSONB,
ADD COLUMN "included_items" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "attraction_items" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "itinerary_days" JSONB,
ADD COLUMN "travel_tips" TEXT;
