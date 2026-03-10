-- CreateEnum
CREATE TYPE "TransportMode" AS ENUM ('WALKING', 'DRIVING', 'CYCLING', 'BUS', 'TRAIN', 'TRAM', 'SUBWAY', 'BOAT', 'FERRY', 'PLANE', 'HELICOPTER');

-- AlterTable
ALTER TABLE "routes" ADD COLUMN     "transport_type" "TransportMode" NOT NULL DEFAULT 'WALKING';
