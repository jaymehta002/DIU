/*
  Warnings:

  - Added the required column `registeredVoters` to the `Booth` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booth" ADD COLUMN     "registeredVoters" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Booth" ALTER COLUMN "registeredVoters" DROP DEFAULT;
