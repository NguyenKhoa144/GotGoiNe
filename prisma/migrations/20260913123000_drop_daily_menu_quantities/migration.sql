-- Nhịp `contract` của expand/migrate/contract, treo từ đợt tách tồn kho
-- 2026-08-21. Bốn cột này đã nghỉ hưu từ hôm đó: định lượng chuyển hẳn sang
-- Product.stockGrams + StockMovement, còn DailyMenuEntry chỉ còn trả lời
-- "hôm nay có bày loại này không".
--
-- Tính tới 2026-09-13 không còn dòng code nào đọc hay ghi chúng; chỗ cuối
-- cùng là lib/stats.ts, đã viết lại trên nền StockMovement ở commit c3459d5.
--
-- Đã sao lưu toàn bộ 4 dòng DailyMenuEntry kèm giá trị 4 cột này trước khi
-- chạy (xem docs/refactor-notes.md mục 2026-09-13).
ALTER TABLE "DailyMenuEntry"
  DROP COLUMN "priceToday",
  DROP COLUMN "qtyGrams",
  DROP COLUMN "soldGrams",
  DROP COLUMN "spoiledGrams";
