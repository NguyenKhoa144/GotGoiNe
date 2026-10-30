-- Ẩn thay cho xoá, để sổ cái và thống kê các tháng cũ không bao giờ tự đổi.
--
-- 1. Product.archivedAt: `null` = đang dùng, có ngày = đã ẩn. Cột rỗng, không
--    sửa dòng nào — code cũ đang chạy không đọc nó nên không bị ảnh hưởng.
-- 2. Khoá nối StockMovement -> Product đổi từ CASCADE sang RESTRICT: database
--    tự từ chối xoá một loại đã có sổ cái, kể cả khi code có lỗi.
--
-- Gói trong một transaction để không có khoảnh khắc nào sổ cái mất khoá nối.
-- Đã sao lưu trước khi chạy: backups/neon-2026-10-30T14-03-36-270Z.json.
BEGIN;

ALTER TABLE "StockMovement" DROP CONSTRAINT "StockMovement_productId_fkey";

ALTER TABLE "Product" ADD COLUMN "archivedAt" TIMESTAMP(3);

ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

COMMIT;
