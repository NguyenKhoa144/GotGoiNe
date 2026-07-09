# Refactor Notes

Tài liệu này ghi lại các bước refactor quan trọng để dự án dễ theo dõi, dễ học lại, và giảm rủi ro khi phát triển dài hạn.

## 2026-05-17 - Tách CSS khỏi trang chủ

### Cập nhật

- Tạo `app/home.css`.
- Chuyển toàn bộ CSS trước đây nằm trong `<style jsx global>` của `app/page.tsx` sang `app/home.css`.
- Import `app/home.css` trong `app/layout.tsx` sau `app/globals.css`.
- Giữ nguyên class name, JSX, dữ liệu, màu sắc và bố cục hiện tại.

### Thuật ngữ

- **CSS**: mã định kiểu giao diện, ví dụ màu sắc, khoảng cách, layout, responsive.
- **Global CSS**: CSS áp dụng theo tên class toàn cục như `.hero`, `.product-card`. Nếu trùng tên class ở nơi khác thì có thể ảnh hưởng lẫn nhau.
- **Root layout**: file `app/layout.tsx`, lớp khung ngoài cùng của Next.js App Router.
- **Import order**: thứ tự import CSS. File import sau có thể ghi đè file import trước nếu selector có cùng độ ưu tiên.

### Công dụng

- Giảm `app/page.tsx` từ khoảng 965 dòng xuống khoảng 243 dòng.
- Tách phần cấu trúc UI khỏi phần style để dễ đọc, dễ review và dễ tách component tiếp.
- Giữ CSS ở một nơi rõ ràng, tránh việc page component vừa chứa logic vừa chứa style quá dài.

### Lợi ích

- Ít rủi ro hơn việc tách component ngay vì không thay đổi data flow hoặc state.
- Dễ kiểm tra bằng `npm run verify`.
- Chuẩn bị nền cho các bước tiếp theo như tách `Header`, `Hero`, `ProductsSection`.

### Rủi ro

- Vì đây vẫn là global CSS, nếu sau này thêm nhiều page/component dùng class trùng tên thì có thể xung đột style.
- CSS trong `app/home.css` hiện vẫn áp dụng toàn app vì được import từ root layout.

### Quản trị rủi ro

- Không đổi tên class trong bước này để tránh lệch giao diện.
- Không chuyển sang CSS Modules ngay để tránh phải sửa hàng loạt `className`.
- Đã chạy `npm run verify` sau khi tách.

### Hướng phát triển

- Bước kế tiếp nên tách component nhưng vẫn dùng class hiện tại.
- Khi nhiều page hơn, cân nhắc chuyển từng nhóm style sang CSS Modules hoặc Tailwind theo component để giảm xung đột.
- Chưa nên tối ưu quá mức bằng abstraction phức tạp cho đến khi có nhu cầu thật như cart, ordering, localization hoặc admin.

### Kiểm chứng

```bash
npm run verify
```

Kết quả: pass `lint`, `typecheck`, và `build`.

## 2026-05-17 - Cố định dev server ở localhost:3000

### Cập nhật

- Đổi script `dev` trong `package.json` thành `next dev --port 3000 --hostname localhost`.
- Dừng process Next.js cũ đang giữ cổng `3000`.
- Cập nhật README với cách kiểm tra và dừng process cũ khi localhost không mở được.

### Thuật ngữ

- **localhost**: địa chỉ trỏ về chính máy đang chạy dự án.
- **Port**: cổng mạng của app local. Dự án này dùng `3000`.
- **PID**: mã số của một process đang chạy trong hệ điều hành.
- **Process cũ bị kẹt**: server dev vẫn còn chạy nền dù terminal/browser hiện tại không dùng được nữa.

### Công dụng

- Tránh việc Next.js tự chuyển sang `3001`, làm người dùng mở sai địa chỉ.
- Giữ một địa chỉ phát triển duy nhất: `http://localhost:3000`.
- Dễ debug hơn vì chỉ cần kiểm tra một cổng.

### Lợi ích

- Ít nhầm lẫn khi chạy trong Cursor.
- Dễ hướng dẫn và ghi nhớ cho người mới.
- Dễ phát hiện lỗi thật: nếu `3000` bận, cần dừng process cũ thay vì chạy thêm server mới.

### Rủi ro

- Nếu có app khác đang dùng `3000`, `npm run dev` sẽ không chạy cho đến khi cổng được giải phóng.
- Khi cần chạy nhiều project Next.js cùng lúc, mỗi project phải có cổng riêng.

### Quản trị rủi ro

- Chỉ dùng một project local chính tại một thời điểm trong giai đoạn học/refactor.
- Khi lỗi localhost, chạy `lsof -nP -iTCP:3000 -sTCP:LISTEN` để tìm process giữ cổng.
- Dừng đúng PID bằng `kill <PID>`, không dùng lệnh xóa hay reset.

### Hướng phát triển

- Giữ `3000` là cổng mặc định trong giai đoạn MVP.
- Nếu sau này có backend/admin chạy song song, quy hoạch cổng rõ ràng trong README, ví dụ frontend `3000`, API `4000`.

### Kiểm chứng

```bash
npm run verify
```

Kết quả: pass `lint`, `typecheck`, và `build`.

## 2026-05-31 - Tách component trang chủ

### Cập nhật

- Tạo thư mục `components/home/` với 7 component theo ranh giới UI:
  - `header.tsx`
  - `hero.tsx`
  - `marquee-strip.tsx`
  - `why-section.tsx`
  - `products-section.tsx`
  - `how-section.tsx`
  - `cta-banner.tsx`
- Thêm types `HeroStat`, `WhyReason`, `Product`, `ProcessStep` trong `data/home.ts`.
- Rút gọn `app/page.tsx` thành composition root: giữ state (`activeCategory`, `flash`) và truyền dữ liệu qua props.
- Giữ nguyên class name, CSS, màu sắc và bố cục.

### Thuật ngữ

- **Component**: một khối UI tái sử dụng, mỗi file chịu trách nhiệm một section rõ ràng.
- **Props**: dữ liệu và hàm callback truyền từ component cha xuống con, giúp luồng dữ liệu dễ theo dõi.
- **Composition root**: `app/page.tsx` ghép các section lại, không chứa toàn bộ JSX chi tiết.

### Công dụng

- Giảm `app/page.tsx` từ khoảng 241 dòng xuống khoảng 45 dòng.
- Mỗi section có file riêng, dễ đọc và dễ sửa từng phần.
- Chuẩn bị nền cho cart (Zustand) vì state tương tác đã tập trung ở page.

### Lợi ích

- Không đổi giao diện vì class CSS và markup giữ nguyên.
- Data flow vẫn một chiều: `data/home.ts` → `page.tsx` → component con.
- Dễ kiểm tra bằng `npm run verify`.

### Rủi ro

- Component con vẫn dùng global CSS từ `home.css`, chưa giải quyết xung đột class giữa các page.
- `Header` dùng `next/image` nhưng không phải Client Component riêng — vẫn ổn vì được render trong cây client của page.

### Quản trị rủi ro

- Không đổi tên class hay cấu trúc HTML trong bước này.
- Không thêm Zustand hay routing trong cùng bước tách component.
- Chạy `npm run verify` sau khi tách.

### Hướng phát triển

- Bước kế tiếp: cart bằng Zustand, nút thêm sản phẩm cập nhật giỏ thật.
- Sau cart: luồng đặt hàng (Zalo/Messenger/form).
- Khi có nhiều page, cân nhắc CSS Modules hoặc Tailwind theo component.

### Kiểm chứng

```bash
npm run verify
```

Kết quả: pass `lint`, `typecheck`, và `build`.

## 2026-07-09 - Thêm Open Graph image và khung Analytics/Pixel

### Cập nhật

- Thêm `metadataBase` và `openGraph.images` (dùng `public/images/logo-main.jpg`) trong `app/layout.tsx` để link chia sẻ trên Facebook/Zalo có ảnh preview.
- Tạo `lib/analytics.ts`: hàm `trackAddToCart()` gửi event "thêm sản phẩm" tới Facebook Pixel (`fbq`), TikTok Pixel (`ttq`), và Google Analytics 4 (`gtag`) — chỉ gọi nếu script tương ứng đã load.
- Tạo `components/analytics.tsx`: Client Component gắn script Facebook Pixel / TikTok Pixel / GA4 qua `next/script`, mỗi script chỉ render nếu có ID trong biến môi trường tương ứng.
- Gắn `<Analytics />` vào `app/layout.tsx`, gọi `trackAddToCart()` trong `handleAdd()` của `app/page.tsx`.
- Thêm `.env.local.example` liệt kê 3 biến: `NEXT_PUBLIC_FB_PIXEL_ID`, `NEXT_PUBLIC_TIKTOK_PIXEL_ID`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`.

### Thuật ngữ

- **Open Graph (`og:image`)**: thẻ meta cho biết ảnh nào hiện kèm link khi chia sẻ trên Facebook/Zalo/Messenger.
- **`metadataBase`**: URL gốc để Next.js quy đổi các đường dẫn ảnh/meta thành URL tuyệt đối đúng khi build production (thiếu thì sẽ lấy nhầm `localhost`).
- **Pixel (Facebook/TikTok)**: đoạn script của nền tảng quảng cáo, dùng để đo hành vi người dùng trên site và đưa dữ liệu về Ads Manager.
- **Biến môi trường (`NEXT_PUBLIC_*`)**: giá trị cấu hình đọc từ file `.env.local` (không commit lên git), tiền tố `NEXT_PUBLIC_` bắt buộc để Next.js cho phép trình duyệt đọc được.

### Công dụng

- Link chia sẻ có ảnh preview thật (logo) thay vì trống hoặc ảnh ngẫu nhiên.
- Có sẵn khung đo lường quảng cáo — khi tạo tài khoản Ads Manager/GA4 chỉ cần điền ID vào `.env.local`, không cần sửa code.

### Lợi ích

- An toàn khi chưa có ID: script chỉ render nếu ID tồn tại, không gửi dữ liệu rác hay lỗi console.
- `trackAddToCart()` tách riêng khỏi logic UI trong `page.tsx`, dễ tìm và sửa khi cần thêm nền tảng đo lường khác.

### Rủi ro

- Chưa parse giá tiền (`price` dạng chuỗi `"45.000₫"`) thành số cho event — hiện chỉ gửi `id` và `name`, thiếu giá trị đơn hàng cho báo cáo doanh thu quảng cáo.
- Sản phẩm hero vẫn hardcode tên/giá riêng trong `hero.tsx`, không lấy từ `data/home.ts` (rủi ro cũ, chưa xử lý ở bước này).

### Quản trị rủi ro

- Không đổi giao diện, không đổi luồng `handleAdd` hiện có — chỉ thêm lệnh gọi tracking.
- Chạy `npm run verify` sau khi thêm, kiểm tra bằng preview: script không render khi thiếu ID, không có lỗi console khi bấm nút thêm sản phẩm.

### Hướng phát triển

- Khi có ID Pixel/GA4 thật, điền vào `.env.local` (copy từ `.env.local.example`) và set biến môi trường tương ứng trên Vercel (Project Settings → Environment Variables) để chạy trên production.
- Cân nhắc parse giá tiền thành số khi cần báo cáo doanh thu theo quảng cáo chính xác hơn.

### Kiểm chứng

```bash
npm run verify
```

Kết quả: pass `lint`, `typecheck`, và `build`. Đã kiểm tra bằng preview: không có script nào render khi thiếu ID, không lỗi console khi bấm nút "＋".

## 2026-07-09 - Thêm tiền tố `home-` cho toàn bộ class trong `home.css`

### Cập nhật

- Đổi tên toàn bộ 71 class trong `app/home.css` và 7 component trong `components/home/*` sang tiền tố `home-` (ví dụ `.hero` → `.home-hero`, `.container` → `.home-container`, `.active` → `.home-active`).
- Không đổi bất kỳ key nghiệp vụ nào trùng tên (ví dụ chuỗi `"hero"` dùng để so sánh `flash === "hero"` trong `hero.tsx`/`page.tsx`, hoặc thuộc tính `product.featured` trong `data/home.ts`) — chỉ đổi phần class CSS thật sự.

### Thuật ngữ

- **Namespace/tiền tố CSS**: thêm một đoạn chữ cố định (`home-`) trước mọi tên class của một khu vực code, để class đó không trùng tên với class ở khu vực khác.
- **Compound selector**: selector CSS ghép nhiều class trên cùng 1 phần tử, ví dụ `.product-card.featured` (phần tử vừa có class `product-card` vừa có `featured`).

### Công dụng

- `.home-container`, `.home-active`, `.home-featured`... không còn là tên chung chung dễ đụng — đặc biệt `.container` trước đây trùng tên với utility class có sẵn của Tailwind CSS v4, tiềm ẩn xung đột ưu tiên CSS mà không báo lỗi.
- Khi sau này thêm trang thứ 2 (`/gio-hang`, `/don-hang`...), style của trang chủ không còn rò rỉ sang trang mới vì tên class đã rõ ràng là "thuộc về trang chủ".

### Lợi ích

- Không đổi giao diện — đã kiểm tra bằng preview ở màn desktop (1280px): hero, product card "featured", nút thêm sản phẩm đều render và hoạt động giống hệt trước.
- Không đổi cấu trúc component hay data flow, chỉ đổi tên class.

### Rủi ro

- **Bài học từ lần thử đầu tiên (đã revert)**: dùng script tự động đổi tên "mù" (blind find-replace theo văn bản) đã vô tình đổi luôn các chuỗi/thuộc tính JS trùng tên với class CSS — ví dụ biến đổi `product.featured` (thuộc tính dữ liệu) thành `product.home-featured` (lỗi cú pháp JS, sẽ crash build), và đổi nhầm khóa so sánh `flash === "hero"` thành `flash === "home-hero"` (làm sai luồng `handleAdd`/`trackAddToCart`). Bài học: khi đổi tên có ý nghĩa kép (vừa là CSS class vừa là chuỗi logic), không nên tự động hoá toàn bộ — phải sửa tay từng chỗ dùng để phân biệt ngữ cảnh.
- CSS vẫn là global (`app/home.css` import ở root layout) — tiền tố chỉ giảm rủi ro trùng tên, chưa cô lập hoàn toàn như CSS Modules.

### Quản trị rủi ro

- Sau khi phát hiện lỗi ở lần thử tự động đầu tiên, đã `git checkout` revert toàn bộ và làm lại: script tự động chỉ áp dụng cho `app/home.css` (thuần CSS, không có ngữ cảnh JS gây nhầm lẫn); 7 file component được sửa tay từng dòng `className`.
- Đối chiếu danh sách class dùng trong component với danh sách class định nghĩa trong CSS (qua script so khớp) để đảm bảo khớp 100%, không sót tên nào.
- Chạy `npm run verify` (lint, typecheck, build) và kiểm tra bằng preview: card "featured" hiển thị đúng nền xanh đậm, nút "＋" chuyển sang trạng thái "✓" (`home-is-done`) đúng và tự reset sau 900ms, không lỗi console.

### Hướng phát triển

- Nếu sau này có nhiều page hơn và namespace bằng tiền tố vẫn không đủ an toàn, cân nhắc chuyển hẳn sang CSS Modules (`home.module.css`) — sẽ cần sửa lại cách import/sử dụng class trong toàn bộ 7 component.

### Kiểm chứng

```bash
npm run verify
```

Kết quả: pass `lint`, `typecheck`, và `build`. Kiểm tra bằng preview ở viewport 1280×800: giao diện hero/product card/nút thêm không lệch so với trước khi đổi tên.
