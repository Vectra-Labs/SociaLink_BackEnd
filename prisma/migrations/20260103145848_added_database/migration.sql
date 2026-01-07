/*
  Warnings:

  - The values [INSTITUTION] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `applied_at` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `diploma_url` on the `Diploma` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Diploma` table. All the data in the column will be lost.
  - You are about to drop the column `verified` on the `Diploma` table. All the data in the column will be lost.
  - You are about to drop the column `worker_profile_id` on the `Diploma` table. All the data in the column will be lost.
  - You are about to drop the column `institution_name` on the `Experience` table. All the data in the column will be lost.
  - You are about to drop the column `service_type` on the `Experience` table. All the data in the column will be lost.
  - You are about to drop the column `worker_profile_id` on the `Experience` table. All the data in the column will be lost.
  - You are about to drop the column `comment` on the `Feedback` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Feedback` table. All the data in the column will be lost.
  - You are about to drop the column `end_date` on the `Intervention` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `Intervention` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Intervention` table. All the data in the column will be lost.
  - You are about to drop the column `institution_profile_id` on the `Mission` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `WorkerProfile` table. All the data in the column will be lost.
  - The primary key for the `WorkerSpeciality` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `worker_profile_id` on the `WorkerSpeciality` table. All the data in the column will be lost.
  - You are about to drop the `InstitutionProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MissionSpeciality` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `Region` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Speciality` will be added. If there are existing duplicate values, this will fail.
  - Made the column `start_datetime` on table `Availability` required. This step will fail if there are existing NULL values in that column.
  - Made the column `end_datetime` on table `Availability` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `file_url` to the `Diploma` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Diploma` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Diploma` table without a default value. This is not possible if the table is not empty.
  - Added the required column `establishment_name` to the `Experience` table without a default value. This is not possible if the table is not empty.
  - Added the required column `job_title` to the `Experience` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Experience` table without a default value. This is not possible if the table is not empty.
  - Made the column `start_date` on table `Experience` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `content` to the `Feedback` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city_id` to the `Mission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `establishment_id` to the `Mission` table without a default value. This is not possible if the table is not empty.
  - Made the column `title` on table `Mission` required. This step will fail if there are existing NULL values in that column.
  - Made the column `start_date` on table `Mission` required. This step will fail if there are existing NULL values in that column.
  - Made the column `end_date` on table `Mission` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `status` on the `Mission` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `type` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `WorkerSpeciality` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('INFO', 'WARNING', 'SUCCESS');

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('WORKER', 'ESTABLISHMENT', 'ADMIN');
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Diploma" DROP CONSTRAINT "Diploma_worker_profile_id_fkey";

-- DropForeignKey
ALTER TABLE "Experience" DROP CONSTRAINT "Experience_worker_profile_id_fkey";

-- DropForeignKey
ALTER TABLE "InstitutionProfile" DROP CONSTRAINT "InstitutionProfile_city_id_fkey";

-- DropForeignKey
ALTER TABLE "InstitutionProfile" DROP CONSTRAINT "InstitutionProfile_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Mission" DROP CONSTRAINT "Mission_institution_profile_id_fkey";

-- DropForeignKey
ALTER TABLE "MissionSpeciality" DROP CONSTRAINT "MissionSpeciality_mission_id_fkey";

-- DropForeignKey
ALTER TABLE "MissionSpeciality" DROP CONSTRAINT "MissionSpeciality_speciality_id_fkey";

-- DropForeignKey
ALTER TABLE "WorkerSpeciality" DROP CONSTRAINT "WorkerSpeciality_worker_profile_id_fkey";

-- DropIndex
DROP INDEX "Feedback_intervention_id_key";

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "applied_at",
DROP COLUMN "status",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Availability" ALTER COLUMN "start_datetime" SET NOT NULL,
ALTER COLUMN "end_datetime" SET NOT NULL;

-- AlterTable
ALTER TABLE "Diploma" DROP COLUMN "diploma_url",
DROP COLUMN "title",
DROP COLUMN "verified",
DROP COLUMN "worker_profile_id",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "file_url" TEXT NOT NULL,
ADD COLUMN     "institution" TEXT,
ADD COLUMN     "issue_date" TIMESTAMP(3),
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL,
ADD COLUMN     "verification_status" "VerificationStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Experience" DROP COLUMN "institution_name",
DROP COLUMN "service_type",
DROP COLUMN "worker_profile_id",
ADD COLUMN     "establishment_name" TEXT NOT NULL,
ADD COLUMN     "is_current_role" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "job_title" TEXT NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL,
ALTER COLUMN "start_date" SET NOT NULL;

-- AlterTable
ALTER TABLE "Feedback" DROP COLUMN "comment",
DROP COLUMN "created_at",
ADD COLUMN     "content" TEXT NOT NULL,
ALTER COLUMN "rating" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Intervention" DROP COLUMN "end_date",
DROP COLUMN "start_date",
DROP COLUMN "status";

-- AlterTable
ALTER TABLE "Mission" DROP COLUMN "institution_profile_id",
ADD COLUMN     "city_id" INTEGER NOT NULL,
ADD COLUMN     "establishment_id" INTEGER NOT NULL,
ALTER COLUMN "title" SET NOT NULL,
ALTER COLUMN "start_date" SET NOT NULL,
ALTER COLUMN "end_date" SET NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "type",
ADD COLUMN     "type" "NotificationType" NOT NULL;

-- AlterTable
ALTER TABLE "WorkerProfile" DROP COLUMN "status",
ADD COLUMN     "cv_url" TEXT,
ADD COLUMN     "experience_years" INTEGER,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "verification_status" "VerificationStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "WorkerSpeciality" DROP CONSTRAINT "WorkerSpeciality_pkey",
DROP COLUMN "worker_profile_id",
ADD COLUMN     "user_id" INTEGER NOT NULL,
ADD CONSTRAINT "WorkerSpeciality_pkey" PRIMARY KEY ("user_id", "speciality_id");

-- DropTable
DROP TABLE "InstitutionProfile";

-- DropTable
DROP TABLE "MissionSpeciality";

-- DropEnum
DROP TYPE "ApplicationStatus";

-- DropEnum
DROP TYPE "InterventionStatus";

-- DropEnum
DROP TYPE "MissionStatus";

-- DropEnum
DROP TYPE "ProfileStatus";

-- CreateTable
CREATE TABLE "EstablishmentProfile" (
    "user_id" INTEGER NOT NULL,
    "structure_id" INTEGER,
    "name" TEXT NOT NULL,
    "contact_first_name" TEXT NOT NULL,
    "contact_last_name" TEXT NOT NULL,
    "contact_function" TEXT,
    "ice_number" TEXT NOT NULL,
    "rc_number" TEXT,
    "address" TEXT,
    "city_id" INTEGER,
    "phone" TEXT,
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "service" TEXT,
    "logo_url" TEXT,

    CONSTRAINT "EstablishmentProfile_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Structure" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Structure_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EstablishmentProfile_ice_number_key" ON "EstablishmentProfile"("ice_number");

-- CreateIndex
CREATE UNIQUE INDEX "Structure_label_key" ON "Structure"("label");

-- CreateIndex
CREATE UNIQUE INDEX "Region_name_key" ON "Region"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Speciality_name_key" ON "Speciality"("name");

-- AddForeignKey
ALTER TABLE "EstablishmentProfile" ADD CONSTRAINT "EstablishmentProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstablishmentProfile" ADD CONSTRAINT "EstablishmentProfile_structure_id_fkey" FOREIGN KEY ("structure_id") REFERENCES "Structure"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstablishmentProfile" ADD CONSTRAINT "EstablishmentProfile_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "City"("city_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerSpeciality" ADD CONSTRAINT "WorkerSpeciality_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "WorkerProfile"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Experience" ADD CONSTRAINT "Experience_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "WorkerProfile"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Diploma" ADD CONSTRAINT "Diploma_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "WorkerProfile"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_establishment_id_fkey" FOREIGN KEY ("establishment_id") REFERENCES "EstablishmentProfile"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "City"("city_id") ON DELETE RESTRICT ON UPDATE CASCADE;
