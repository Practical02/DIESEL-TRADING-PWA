-- CreateTable
CREATE TABLE "Stock" (
    "id" TEXT NOT NULL,
    "supplier" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "purchase_cost" DOUBLE PRECISION NOT NULL,
    "purchase_date" TIMESTAMP(3) NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("id")
);
