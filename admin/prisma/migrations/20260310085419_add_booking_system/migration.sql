-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('DRAFT', 'OPEN', 'FULL', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('FIXED', 'PERCENT');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PARTIAL', 'PAID', 'REFUNDED');

-- CreateTable
CREATE TABLE "departure_sessions" (
    "id" UUID NOT NULL,
    "post_id" UUID NOT NULL,
    "package_option_id" VARCHAR(100),
    "departure_date" DATE NOT NULL,
    "return_date" DATE,
    "label" VARCHAR(300) NOT NULL,
    "base_price" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'MNT',
    "discount_type" "DiscountType",
    "discount_value" DECIMAL(10,2),
    "discount_reason" VARCHAR(500),
    "final_price" DECIMAL(10,2) NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 0,
    "seats_booked" INTEGER NOT NULL DEFAULT 0,
    "status" "SessionStatus" NOT NULL DEFAULT 'DRAFT',
    "public_note" TEXT,
    "internal_note" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "departure_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" UUID NOT NULL,
    "booking_code" VARCHAR(50) NOT NULL,
    "post_id" UUID NOT NULL,
    "departure_session_id" UUID NOT NULL,
    "package_option_id" VARCHAR(100),
    "contact_name" VARCHAR(300) NOT NULL,
    "contact_phone" VARCHAR(50) NOT NULL,
    "contact_email" VARCHAR(300) NOT NULL,
    "passenger_count" INTEGER NOT NULL DEFAULT 1,
    "total_price_snapshot" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'MNT',
    "booking_status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "admin_note" TEXT,
    "source" VARCHAR(50) NOT NULL DEFAULT 'admin',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "travelers" (
    "id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "full_name" VARCHAR(300) NOT NULL,
    "gender" VARCHAR(20),
    "date_of_birth" DATE,
    "passport_number" VARCHAR(100),
    "nationality" VARCHAR(100),
    "phone" VARCHAR(50),
    "email" VARCHAR(300),
    "emergency_contact" VARCHAR(500),
    "special_request" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "travelers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "departure_sessions_post_id_idx" ON "departure_sessions"("post_id");

-- CreateIndex
CREATE INDEX "departure_sessions_departure_date_idx" ON "departure_sessions"("departure_date");

-- CreateIndex
CREATE INDEX "departure_sessions_status_idx" ON "departure_sessions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_booking_code_key" ON "bookings"("booking_code");

-- CreateIndex
CREATE INDEX "bookings_post_id_idx" ON "bookings"("post_id");

-- CreateIndex
CREATE INDEX "bookings_departure_session_id_idx" ON "bookings"("departure_session_id");

-- CreateIndex
CREATE INDEX "bookings_booking_status_idx" ON "bookings"("booking_status");

-- CreateIndex
CREATE INDEX "bookings_booking_code_idx" ON "bookings"("booking_code");

-- CreateIndex
CREATE INDEX "travelers_booking_id_idx" ON "travelers"("booking_id");

-- AddForeignKey
ALTER TABLE "departure_sessions" ADD CONSTRAINT "departure_sessions_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_departure_session_id_fkey" FOREIGN KEY ("departure_session_id") REFERENCES "departure_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travelers" ADD CONSTRAINT "travelers_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
