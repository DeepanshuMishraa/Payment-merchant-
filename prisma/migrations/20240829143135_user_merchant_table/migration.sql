/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `Merchant` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Merchant_username_key" ON "Merchant"("username");
