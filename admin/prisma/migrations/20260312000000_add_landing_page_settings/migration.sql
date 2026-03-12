-- CreateTable: singleton landing page settings (one row, fixed UUID primary key)
CREATE TABLE "landing_page_settings" (
    "id"                      UUID NOT NULL,
    "hero_title"              VARCHAR(500),
    "hero_subtitle"           VARCHAR(1000),
    "hero_primary_cta_text"   VARCHAR(200),
    "hero_primary_cta_url"    VARCHAR(500),
    "hero_secondary_cta_text" VARCHAR(200),
    "hero_secondary_cta_url"  VARCHAR(500),
    "contact_email"           VARCHAR(320),
    "contact_phone"           VARCHAR(50),
    "contact_address"         VARCHAR(500),
    "contact_whatsapp"        VARCHAR(50),
    "facebook_url"            VARCHAR(500),
    "instagram_url"           VARCHAR(500),
    "linkedin_url"            VARCHAR(500),
    "announcement_text"       VARCHAR(500),
    "footer_blurb"            VARCHAR(500),
    "meta_title"              VARCHAR(200),
    "meta_description"        VARCHAR(500),
    "og_image_url"            VARCHAR(1000),
    "updated_by"              VARCHAR(320),
    "created_at"              TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"              TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "landing_page_settings_pkey" PRIMARY KEY ("id")
);
