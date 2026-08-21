-- Bỏ cột `unit` khỏi Product.
--
-- Cột này từng dùng để đếm định lượng theo đơn vị bán (kg/hộp/ly/set), nhưng
-- mô hình đó sai với thực tế: trái cây nhập về luôn là hàng cân, bán ra dưới
-- dạng hộp hay ly chỉ là chuyện đóng gói. Toàn bộ định lượng đã chuyển sang
-- gram và không còn dòng code nào đọc cột này.
ALTER TABLE "Product" DROP COLUMN "unit";
