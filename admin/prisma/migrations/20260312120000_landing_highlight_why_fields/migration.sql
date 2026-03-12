-- AlterTable: add hero highlight cards and "why it works" fields to landing_page_settings
ALTER TABLE "landing_page_settings"
    ADD COLUMN "highlight_1_title"       VARCHAR(200),
    ADD COLUMN "highlight_1_description" VARCHAR(500),
    ADD COLUMN "highlight_2_title"       VARCHAR(200),
    ADD COLUMN "highlight_2_description" VARCHAR(500),
    ADD COLUMN "highlight_3_title"       VARCHAR(200),
    ADD COLUMN "highlight_3_description" VARCHAR(500),
    ADD COLUMN "why_label"               VARCHAR(100),
    ADD COLUMN "why_heading"             VARCHAR(500),
    ADD COLUMN "why_body"                VARCHAR(1000);
