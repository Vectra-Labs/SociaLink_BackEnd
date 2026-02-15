/*
  Warnings:

  - You are about to drop the column `end_datetime` on the `Availability` table. All the data in the column will be lost.
  - You are about to drop the column `start_datetime` on the `Availability` table. All the data in the column will be lost.
  - You are about to drop the column `file_path` on the `Diploma` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[worker_profile_id,date]` on the table `Availability` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,region_id]` on the table `City` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `date` to the `Availability` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_url` to the `Diploma` table without a default value. This is not possible if the table is not empty.
  - Added the required column `budget` to the `Mission` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'UNAVAILABLE', 'HOLIDAY');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED_BY_WORKER', 'COMPLETED_CONFIRMED', 'DISPUTED');

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Availability" DROP COLUMN "end_datetime",
DROP COLUMN "start_datetime",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'AVAILABLE';

-- AlterTable
ALTER TABLE "Diploma" DROP COLUMN "file_path",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "file_url" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Mission" ADD COLUMN     "budget" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "email_code" TEXT,
ADD COLUMN     "email_code_expires" TIMESTAMP(3),
ADD COLUMN     "email_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reset_password_expires" TIMESTAMP(3),
ADD COLUMN     "reset_password_token" TEXT;

-- CreateTable
CREATE TABLE "MissionSpeciality" (
    "mission_id" INTEGER NOT NULL,
    "speciality_id" INTEGER NOT NULL,

    CONSTRAINT "MissionSpeciality_pkey" PRIMARY KEY ("mission_id","speciality_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Availability_worker_profile_id_date_key" ON "Availability"("worker_profile_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "City_name_region_id_key" ON "City"("name", "region_id");

-- CreateIndex
CREATE INDEX "User_email_code_idx" ON "User"("email_code");

-- CreateIndex
CREATE INDEX "User_reset_password_token_idx" ON "User"("reset_password_token");

-- AddForeignKey
ALTER TABLE "MissionSpeciality" ADD CONSTRAINT "MissionSpeciality_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "Mission"("mission_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionSpeciality" ADD CONSTRAINT "MissionSpeciality_speciality_id_fkey" FOREIGN KEY ("speciality_id") REFERENCES "Speciality"("speciality_id") ON DELETE CASCADE ON UPDATE CASCADE;
