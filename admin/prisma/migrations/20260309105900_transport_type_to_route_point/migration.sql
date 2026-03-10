/*
  Warnings:

  - You are about to drop the column `transport_type` on the `routes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "route_points" ADD COLUMN     "transport_type" "TransportMode" NOT NULL DEFAULT 'WALKING';

-- AlterTable
ALTER TABLE "routes" DROP COLUMN "transport_type";
