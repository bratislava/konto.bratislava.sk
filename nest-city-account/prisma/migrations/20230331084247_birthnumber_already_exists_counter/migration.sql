-- AlterTable
ALTER TABLE "User" ADD COLUMN     "birthnumberAlreadyExistsCounter" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "birthnumberAlreadyExistsLast" TEXT;
