# Gọt Gòi Nè

Landing page Next.js cho Gọt Gòi Nè, thương hiệu trái cây gọt sẵn tại Cần Thơ.

## Yêu cầu môi trường

- Node.js tương thích với Next.js 16
- npm

## Chạy dự án

```bash
npm run dev
```

Mở trình duyệt tại:

```text
http://localhost:3000
```

Nếu không mở được, kiểm tra xem cổng `3000` có process cũ đang giữ không:

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN
```

Nếu thấy một process `node` cũ, dừng nó bằng PID được hiển thị:

```bash
kill <PID>
```

## Kiểm tra chất lượng

Chạy toàn bộ kiểm tra nền:

```bash
npm run verify
```

Lệnh này chạy lần lượt:

- `npm run lint`: kiểm tra quy tắc code.
- `npm run typecheck`: kiểm tra kiểu TypeScript, không tạo file output.
- `npm run build`: tạo bản production để chắc chắn app có thể deploy.

## Cấu trúc chính

- `app/page.tsx`: trang chủ — ghép section và quản lý state.
- `app/layout.tsx`: layout gốc, metadata và cấu hình HTML/body.
- `app/globals.css`: CSS global và Tailwind import.
- `app/home.css`: style landing page.
- `components/home/`: các section UI của trang chủ.
- `data/home.ts`: dữ liệu tĩnh và types.
- `public/images`: hình ảnh tĩnh dùng trong trang.

## Ghi chú phát triển

Thư mục `.next` là output tự sinh bởi Next.js. Không sửa code trong đó.

## Tài liệu kỹ thuật

- `docs/project-structure.md`: cấu trúc dự án đầy đủ — thư mục, file, luồng dữ liệu, UI mapping.
- `docs/technical-spec.md`: thông số kỹ thuật hiện tại của codebase.
- `docs/refactor-notes.md`: nhật ký refactor và quản trị rủi ro theo từng bước.
