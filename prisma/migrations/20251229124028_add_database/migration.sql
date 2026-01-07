-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'WORKER', 'INSTITUTION');

-- CreateEnum
CREATE TYPE "ProfileStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "MissionStatus" AS ENUM ('OPEN', 'CLOSED', 'CANCELED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELED');

-- CreateEnum
CREATE TYPE "InterventionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'CANCELED');

-- CreateTable
CREATE TABLE "User" (
    "user_id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Region" (
    "region_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("region_id")
);

-- CreateTable
CREATE TABLE "City" (
    "city_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "region_id" INTEGER NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("city_id")
);

-- CreateTable
CREATE TABLE "WorkerProfile" (
    "user_id" INTEGER NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "status" "ProfileStatus" NOT NULL DEFAULT 'PENDING',
    "address" TEXT,
    "city_id" INTEGER,
    "phone" TEXT,
    "bio" TEXT,
    "profile_pic_url" TEXT,

    CONSTRAINT "WorkerProfile_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "InstitutionProfile" (
    "user_id" INTEGER NOT NULL,
    "company_name" TEXT NOT NULL,
    "ice_number" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "city_id" INTEGER,
    "status" "ProfileStatus" NOT NULL DEFAULT 'PENDING',
    "service" TEXT,
    "logo_url" TEXT,

    CONSTRAINT "InstitutionProfile_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Speciality" (
    "speciality_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Speciality_pkey" PRIMARY KEY ("speciality_id")
);

-- CreateTable
CREATE TABLE "WorkerSpeciality" (
    "worker_profile_id" INTEGER NOT NULL,
    "speciality_id" INTEGER NOT NULL,

    CONSTRAINT "WorkerSpeciality_pkey" PRIMARY KEY ("worker_profile_id","speciality_id")
);

-- CreateTable
CREATE TABLE "Diploma" (
    "diploma_id" SERIAL NOT NULL,
    "worker_profile_id" INTEGER NOT NULL,
    "title" TEXT,
    "diploma_url" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Diploma_pkey" PRIMARY KEY ("diploma_id")
);

-- CreateTable
CREATE TABLE "Experience" (
    "experience_id" SERIAL NOT NULL,
    "worker_profile_id" INTEGER NOT NULL,
    "institution_name" TEXT,
    "service_type" TEXT,
    "description" TEXT,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Experience_pkey" PRIMARY KEY ("experience_id")
);

-- CreateTable
CREATE TABLE "Availability" (
    "availability_id" SERIAL NOT NULL,
    "worker_profile_id" INTEGER NOT NULL,
    "start_datetime" TIMESTAMP(3),
    "end_datetime" TIMESTAMP(3),

    CONSTRAINT "Availability_pkey" PRIMARY KEY ("availability_id")
);

-- CreateTable
CREATE TABLE "Mission" (
    "mission_id" SERIAL NOT NULL,
    "institution_profile_id" INTEGER NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "status" "MissionStatus" NOT NULL DEFAULT 'OPEN',

    CONSTRAINT "Mission_pkey" PRIMARY KEY ("mission_id")
);

-- CreateTable
CREATE TABLE "MissionSpeciality" (
    "mission_id" INTEGER NOT NULL,
    "speciality_id" INTEGER NOT NULL,

    CONSTRAINT "MissionSpeciality_pkey" PRIMARY KEY ("mission_id","speciality_id")
);

-- CreateTable
CREATE TABLE "Application" (
    "application_id" SERIAL NOT NULL,
    "worker_profile_id" INTEGER NOT NULL,
    "mission_id" INTEGER NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("application_id")
);

-- CreateTable
CREATE TABLE "Intervention" (
    "intervention_id" SERIAL NOT NULL,
    "application_id" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "status" "InterventionStatus" NOT NULL,

    CONSTRAINT "Intervention_pkey" PRIMARY KEY ("intervention_id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "feedback_id" SERIAL NOT NULL,
    "intervention_id" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("feedback_id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "notification_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("notification_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "InstitutionProfile_ice_number_key" ON "InstitutionProfile"("ice_number");

-- CreateIndex
CREATE UNIQUE INDEX "Intervention_application_id_key" ON "Intervention"("application_id");

-- CreateIndex
CREATE UNIQUE INDEX "Feedback_intervention_id_key" ON "Feedback"("intervention_id");

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "Region"("region_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerProfile" ADD CONSTRAINT "WorkerProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerProfile" ADD CONSTRAINT "WorkerProfile_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "City"("city_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstitutionProfile" ADD CONSTRAINT "InstitutionProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstitutionProfile" ADD CONSTRAINT "InstitutionProfile_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "City"("city_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerSpeciality" ADD CONSTRAINT "WorkerSpeciality_worker_profile_id_fkey" FOREIGN KEY ("worker_profile_id") REFERENCES "WorkerProfile"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerSpeciality" ADD CONSTRAINT "WorkerSpeciality_speciality_id_fkey" FOREIGN KEY ("speciality_id") REFERENCES "Speciality"("speciality_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Diploma" ADD CONSTRAINT "Diploma_worker_profile_id_fkey" FOREIGN KEY ("worker_profile_id") REFERENCES "WorkerProfile"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Experience" ADD CONSTRAINT "Experience_worker_profile_id_fkey" FOREIGN KEY ("worker_profile_id") REFERENCES "WorkerProfile"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_worker_profile_id_fkey" FOREIGN KEY ("worker_profile_id") REFERENCES "WorkerProfile"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_institution_profile_id_fkey" FOREIGN KEY ("institution_profile_id") REFERENCES "InstitutionProfile"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionSpeciality" ADD CONSTRAINT "MissionSpeciality_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "Mission"("mission_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionSpeciality" ADD CONSTRAINT "MissionSpeciality_speciality_id_fkey" FOREIGN KEY ("speciality_id") REFERENCES "Speciality"("speciality_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_worker_profile_id_fkey" FOREIGN KEY ("worker_profile_id") REFERENCES "WorkerProfile"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "Mission"("mission_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Intervention" ADD CONSTRAINT "Intervention_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "Application"("application_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_intervention_id_fkey" FOREIGN KEY ("intervention_id") REFERENCES "Intervention"("intervention_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
