-- CreateTable
CREATE TABLE "posts" (
    "id" UUID NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "slug" VARCHAR(500) NOT NULL,
    "cover_image" TEXT,
    "excerpt" TEXT,
    "content" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routes" (
    "id" UUID NOT NULL,
    "post_id" UUID NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route_points" (
    "id" UUID NOT NULL,
    "route_id" UUID NOT NULL,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "name" VARCHAR(500) NOT NULL,
    "description" TEXT,
    "interesting_fact" TEXT,
    "recommended_time_to_visit" VARCHAR(200),
    "images" TEXT[],
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "route_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_images" (
    "id" UUID NOT NULL,
    "post_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "posts_slug_key" ON "posts"("slug");

-- CreateIndex
CREATE INDEX "routes_post_id_idx" ON "routes"("post_id");

-- CreateIndex
CREATE INDEX "route_points_route_id_idx" ON "route_points"("route_id");

-- CreateIndex
CREATE INDEX "route_points_route_id_order_index_idx" ON "route_points"("route_id", "order_index");

-- CreateIndex
CREATE INDEX "post_images_post_id_idx" ON "post_images"("post_id");

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_points" ADD CONSTRAINT "route_points_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_images" ADD CONSTRAINT "post_images_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
