/**
 * So khớp tìm kiếm cho tên trái cây tiếng Việt.
 *
 * Khách gõ trên điện thoại hiếm khi bỏ dấu đầy đủ: "dua hau", "xoai",
 * "buoi hong". Nếu so khớp thẳng chuỗi thì không ra gì cả và ô tìm kiếm coi
 * như vô dụng. Nên cả tên sản phẩm lẫn từ khoá đều được bỏ dấu trước khi so.
 */

/**
 * "Dưa Hấu Không Hạt" -> "dua hau khong hat".
 *
 * `normalize("NFD")` tách nguyên âm có dấu thành ký tự gốc + dấu rời (ế ->
 * e + ́), rồi xoá hết dấu rời đi. Riêng chữ "đ" không phải là "d" cộng dấu
 * mà là một ký tự riêng, nên NFD không đụng tới — phải thay tay.
 */
export function normalizeVi(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Khớp khi MỌI từ trong từ khoá đều xuất hiện đâu đó trong văn bản, không cần
 * đúng thứ tự — "hau dua" vẫn ra "Dưa hấu". Từ khoá rỗng thì khớp tất cả, để
 * chỗ gọi không phải kiểm tra riêng.
 */
export function matchesQuery(text: string, query: string): boolean {
  const words = normalizeVi(query).split(" ").filter(Boolean);
  if (words.length === 0) return true;
  const haystack = normalizeVi(text);
  return words.every((word) => haystack.includes(word));
}
