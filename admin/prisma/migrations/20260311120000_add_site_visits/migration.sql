CREATE TABLE "site_visits" (
    "id" UUID NOT NULL,
    "visitor_id" VARCHAR(100) NOT NULL,
    "path" VARCHAR(500) NOT NULL,
    "referrer" VARCHAR(1000),
    "user_agent" VARCHAR(1000),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "site_visits_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "site_visits_created_at_idx" ON "site_visits"("created_at");
CREATE INDEX "site_visits_path_idx" ON "site_visits"("path");
CREATE INDEX "site_visits_visitor_id_idx" ON "site_visits"("visitor_id");
