-- CreateTable: library_inclusions
CREATE TABLE "library_inclusions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(500) NOT NULL,
    "description" TEXT,
    "icon" VARCHAR(100),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "library_inclusions_pkey" PRIMARY KEY ("id")
);

-- CreateTable: library_highlights
CREATE TABLE "library_highlights" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(500) NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "library_highlights_pkey" PRIMARY KEY ("id")
);

-- CreateTable: library_locations
CREATE TABLE "library_locations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(500) NOT NULL,
    "slug" VARCHAR(500) NOT NULL,
    "short_description" VARCHAR(1000),
    "description" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "cover_image" TEXT,
    "gallery" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "region" VARCHAR(200),
    "country" VARCHAR(200),
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "library_locations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: unique slug on library_locations
CREATE UNIQUE INDEX "library_locations_slug_key" ON "library_locations"("slug");

-- CreateTable: post_inclusions (join table)
CREATE TABLE "post_inclusions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "post_id" UUID NOT NULL,
    "inclusion_id" UUID NOT NULL,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "label_snapshot" VARCHAR(500) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_inclusions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: unique per post-inclusion pair
CREATE UNIQUE INDEX "post_inclusions_post_id_inclusion_id_key" ON "post_inclusions"("post_id", "inclusion_id");

-- CreateIndex
CREATE INDEX "post_inclusions_post_id_idx" ON "post_inclusions"("post_id");

-- CreateTable: post_highlights (join table)
CREATE TABLE "post_highlights" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "post_id" UUID NOT NULL,
    "highlight_id" UUID NOT NULL,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "label_snapshot" VARCHAR(500) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_highlights_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: unique per post-highlight pair
CREATE UNIQUE INDEX "post_highlights_post_id_highlight_id_key" ON "post_highlights"("post_id", "highlight_id");

-- CreateIndex
CREATE INDEX "post_highlights_post_id_idx" ON "post_highlights"("post_id");

-- AlterTable: add location_id to route_points
ALTER TABLE "route_points" ADD COLUMN "location_id" UUID;

-- AddForeignKey: post_inclusions -> posts
ALTER TABLE "post_inclusions" ADD CONSTRAINT "post_inclusions_post_id_fkey"
    FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: post_inclusions -> library_inclusions
ALTER TABLE "post_inclusions" ADD CONSTRAINT "post_inclusions_inclusion_id_fkey"
    FOREIGN KEY ("inclusion_id") REFERENCES "library_inclusions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: post_highlights -> posts
ALTER TABLE "post_highlights" ADD CONSTRAINT "post_highlights_post_id_fkey"
    FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: post_highlights -> library_highlights
ALTER TABLE "post_highlights" ADD CONSTRAINT "post_highlights_highlight_id_fkey"
    FOREIGN KEY ("highlight_id") REFERENCES "library_highlights"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: route_points -> library_locations
ALTER TABLE "route_points" ADD CONSTRAINT "route_points_location_id_fkey"
    FOREIGN KEY ("location_id") REFERENCES "library_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
