/*
  Warnings:

  - You are about to drop the column `contact_person` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `remarks` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `trn_number` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `remarks` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `invoice_date` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `invoice_no` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `lpo_date` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `lpo_no` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `stockId` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `total_profit` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `vat_rate` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the `Document` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Stock` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `status` on the `Sale` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_paymentId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_saleId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_clientId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_saleId_fkey";

-- DropForeignKey
ALTER TABLE "Sale" DROP CONSTRAINT "Sale_stockId_fkey";

-- AlterTable
ALTER TABLE "Client" DROP COLUMN "contact_person",
DROP COLUMN "created_at",
DROP COLUMN "remarks",
DROP COLUMN "trn_number",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "created_at",
DROP COLUMN "location",
DROP COLUMN "remarks",
DROP COLUMN "status",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Sale" DROP COLUMN "created_at",
DROP COLUMN "invoice_date",
DROP COLUMN "invoice_no",
DROP COLUMN "lpo_date",
DROP COLUMN "lpo_no",
DROP COLUMN "stockId",
DROP COLUMN "total_profit",
DROP COLUMN "updated_at",
DROP COLUMN "vat_rate",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL,
ALTER COLUMN "sale_date" DROP DEFAULT;

-- DropTable
DROP TABLE "Document";

-- DropTable
DROP TABLE "Payment";

-- DropTable
DROP TABLE "Stock";

-- DropEnum
DROP TYPE "DocumentType";

-- DropEnum
DROP TYPE "SaleStatus";

-- CreateTable
CREATE TABLE "LPO" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "lpo_no" TEXT NOT NULL,
    "lpo_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LPO_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "lpoId" TEXT NOT NULL,
    "invoice_no" TEXT NOT NULL,
    "invoice_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LPO_saleId_key" ON "LPO"("saleId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_lpoId_key" ON "Invoice"("lpoId");

-- AddForeignKey
ALTER TABLE "LPO" ADD CONSTRAINT "LPO_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_lpoId_fkey" FOREIGN KEY ("lpoId") REFERENCES "LPO"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
