-- CreateIndex
CREATE INDEX "Product_status_category_idx" ON "Product"("status", "category");

-- CreateIndex
CREATE INDEX "Product_imageIds_idx" ON "Product" USING GIN ("imageIds");
