/*
  Warnings:

  - You are about to drop the column `file_url` on the `Diploma` table. All the data in the column will be lost.
  - Added the required column `file_path` to the `Diploma` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Diploma" DROP COLUMN "file_url",
ADD COLUMN     "file_path" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "is_read" BOOLEAN NOT NULL DEFAULT false;
