/*
  Warnings:

  - The `status` column on the `Availability` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Availability" DROP COLUMN "status",
ADD COLUMN     "status" "AvailabilityStatus" NOT NULL DEFAULT 'AVAILABLE';
