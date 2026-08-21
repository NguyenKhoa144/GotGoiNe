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

## 2026-07-09 - Thêm đăng nhập admin + công cụ tạo Poster

### Cập nhật

- Cài `next-auth@beta` (Auth.js v5), `bcryptjs`, `html2canvas`.
- `auth.config.ts`: config dùng chung, gồm `pages.signIn`, `callbacks.authorized` (chặn `/admin/*` nếu chưa đăng nhập admin), và `callbacks.jwt`/`callbacks.session` (gắn `role` vào session).
- `auth.ts`: thêm `Credentials` provider — so khớp `ADMIN_USERNAME` + `bcrypt.compare` với hash từ biến môi trường, trả `role: "admin"`.
- `proxy.ts` (root, thay `middleware.ts` — xem mục "Bài học" bên dưới): bảo vệ route `/admin/:path*`.
- `app/api/auth/[...nextauth]/route.ts`: expose `GET`/`POST` từ `auth.ts`.
- `app/login/page.tsx` + `app/login/actions.ts`: form đăng nhập dùng `useActionState` + Server Action gọi `signIn()`.
- `app/admin/page.tsx`: redirect sang `/admin/poster`. `app/admin/poster/page.tsx`: render công cụ poster + nút đăng xuất (`signOut()` qua Server Action).
- `data/poster.ts`: port `FRUIT_DB`/`lookupFruit` từ `Poster/index.html` (dự án `got-goi-ne-poster` cũ, không phải `Poster-1` — bản đó bị lỗi, không dùng làm nguồn).
- `components/admin/poster-generator.tsx` + `.module.css`: port toàn bộ UI/logic sang React (state thay DOM manipulation), dùng CSS Modules để cô lập hoàn toàn khỏi `home.css`. `html2canvas` import động (`import()`) trong `handleDownload` — chỉ tải khi bấm nút, không nằm trong bundle ban đầu.
- `.env.local.example`: thêm `AUTH_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH_B64`. `.gitignore` đã có ngoại lệ cho `.env.local.example` từ trước.

### Thuật ngữ

- **Proxy (trước là Middleware)**: code chạy trước khi request tới route, dùng để chặn/redirect. Next.js 16 đổi tên file quy ước từ `middleware.ts` sang `proxy.ts`.
- **JWT session**: thông tin đăng nhập được mã hoá và ký, lưu trong cookie `authjs.session-token`, không cần lưu ở database.
- **Credentials provider**: cách Auth.js xác thực bằng username/password tự viết logic, khác với đăng nhập qua Google/Facebook.

### Bài học (2 lỗi khó thấy, mất nhiều bước debug mới ra)

1. **Next.js 16 đổi `middleware.ts` → `proxy.ts`**: build báo lỗi "must export a function". Thêm hiểu lầm phụ: export dạng destructure trực tiếp (`export const { auth: proxy } = NextAuth(...)`) **không được Next.js nhận diện** dù chạy đúng lúc runtime — Next chỉ dò tìm export qua AST tĩnh, và chỉ nhận `export const proxy = ...` (identifier đơn giản) hoặc `export function proxy() {}`/`export default`. Phải tách: gọi `NextAuth()` trước, gán biến, rồi mới `export const proxy = auth;`.
2. **Bug khó phát hiện nhất: đăng nhập xong, F5 lại bị đá về `/login`.** Nguyên nhân: `callbacks.jwt`/`callbacks.session` (nơi gắn `role: "admin"` vào session) lúc đầu chỉ khai báo trong `auth.ts` (instance NextAuth đầy đủ, dùng để đăng nhập) — nhưng `proxy.ts` lại tạo **một instance NextAuth riêng** chỉ từ `authConfig` (không có 2 callback đó) để kiểm tra session mỗi request. Cookie vẫn hợp lệ và giải mã được, nhưng vì proxy không có callback gắn `role`, `auth?.user?.role` luôn `undefined` → `authorized()` luôn từ chối. Sửa bằng cách chuyển `jwt`/`session` vào `authConfig` dùng chung, để cả 2 instance (proxy và auth.ts) đều gắn `role` giống nhau.
3. **Hash bcrypt bị hỏng khi để thẳng trong `.env`**: bộ đọc file `.env` của Next.js hiểu dấu `$` là tham chiếu biến (kiểu `dotenv-expand`) và âm thầm cắt mất phần `$2b$10$...` của hash, không báo lỗi gì. Escape bằng `$$` cho kết quả không nhất quán (chỉ hoạt động đúng cho 2/3 nhóm `$`, không rõ vì sao). Giải pháp chắc chắn: mã hoá cả hash bằng base64 trước khi lưu vào `.env` (biến đổi tên thành `ADMIN_PASSWORD_HASH_B64`), decode lại bằng `Buffer.from(..., "base64")` trong code — tránh hoàn toàn ký tự `$` trong file `.env`.

### Rủi ro

- Chỉ có 1 tài khoản admin qua biến môi trường, chưa có database/user thường — đúng như phạm vi đã thống nhất, mở rộng sau khi cần thật.
- `.env.local` hiện dùng tài khoản test cục bộ (`admin` / `test1234`, `AUTH_SECRET` giả) — **phải đổi bằng giá trị thật khi deploy** (xem Hướng phát triển).

### Quản trị rủi ro

- Đã revert và làm lại đúng 1 lần khi phát hiện bug session (mục 2 ở trên) — không đoán mò, dùng `curl` + cookie jar để cô lập vấn đề (loại trừ khả năng do trình duyệt/preview tool caching) trước khi kết luận nguyên nhân.
- Chạy `npm run verify` sau mỗi lần sửa lớn; kiểm tra toàn bộ luồng qua preview + `curl`: chưa đăng nhập bị chặn, sai mật khẩu bị từ chối, đăng nhập đúng vào được và giữ session sau F5, tải poster không lỗi console, đăng xuất xong bị chặn lại.

### Hướng phát triển

- Trước khi deploy thật: đổi `AUTH_SECRET` bằng giá trị ngẫu nhiên thật (`openssl rand -base64 32`), đặt `ADMIN_USERNAME`/`ADMIN_PASSWORD_HASH_B64` với mật khẩu thật (không dùng `test1234`), set cả 3 biến này trên Vercel (Project Settings → Environment Variables).
- Khi cần user thường: thêm database + provider mới vào `auth.ts`, giữ nguyên cấu trúc `authConfig`/`auth.ts`/`proxy.ts` hiện tại — không cần viết lại từ đầu.
- Ảnh sản phẩm trong poster vẫn là emoji — nếu sau này muốn ảnh thật, cần sửa `data/poster.ts` và `poster-generator.tsx` để nhận URL ảnh thay vì emoji.

### Kiểm chứng

```bash
npm run verify
```

Kết quả: pass `lint`, `typecheck`, `build`. Đã test thủ công qua preview + `curl`: luồng chưa đăng nhập → chặn → đăng nhập sai → lỗi → đăng nhập đúng → vào được, giữ session qua F5 → tạo poster, tải ảnh không lỗi → đăng xuất → bị chặn lại, đúng như kịch bản kiểm chứng đã đề ra trong plan ban đầu.

## 2026-07-09 - Đăng ký user thường (database thật đầu tiên: Neon Postgres + Prisma)

### Cập nhật

- Cài `prisma`/`@prisma/client` **ghim bản 6.x** (`6.19.2`/`6.19.3`), không dùng `latest` (hiện là 7.8.0) — xem "Bài học" bên dưới.
- `prisma/schema.prisma`: model `User` (fullName, username unique, dateOfBirth, passwordHash, phone unique, email unique, role mặc định `"user"`, createdAt).
- `lib/prisma.ts`: Prisma Client dạng singleton qua `globalThis`, tránh Next.js dev hot-reload tạo nhiều connection pool.
- `auth.ts`: `authorize()` giờ rẽ nhánh — kiểm tra admin (biến môi trường) trước, nếu username không khớp admin mới tra bảng `User` qua Prisma. Vẫn 1 provider Credentials duy nhất, không thêm provider thứ 2.
- `types/next-auth.d.ts`: mở rộng `role` từ `"admin"` thành `"admin" | "user"`.
- `app/register/page.tsx` + `app/register/actions.ts`: form đăng ký (họ tên, tên đăng nhập, ngày sinh, SĐT, email, mật khẩu + xác nhận), validate cơ bản, `prisma.user.create()` trực tiếp (bắt lỗi Prisma `P2002` thay vì `findUnique` trước — tránh race condition), tự đăng nhập (`signIn`) sau khi tạo tài khoản, về `/`.
- `app/login/page.tsx`/`actions.ts`: bỏ chữ "quản trị" (trang này giờ dùng chung cho cả admin và user thường), bỏ hardcode `redirectTo: "/admin/poster"` — giờ tôn trọng `callbackUrl` thực tế (mặc định về `/`), thêm link qua lại giữa `/login` và `/register`.
- `package.json`: thêm script `postinstall: "prisma generate"` (bắt buộc để Vercel build ra được Prisma Client) và `prisma:studio` cho tiện xem dữ liệu.
- Database: Neon Postgres tạo qua Vercel Storage (Marketplace → Neon → Free tier), áp dụng cho cả 3 môi trường Production/Preview/Development.

### Thuật ngữ

- **ORM (Prisma)**: lớp trung gian giúp thao tác database bằng code TypeScript thay vì viết SQL tay, tự sinh type-safe client từ file `schema.prisma`.
- **Migration**: 1 file SQL ghi lại sự thay đổi cấu trúc bảng theo thời gian (`prisma/migrations/`) — có thể chạy lại để tái tạo đúng cấu trúc database ở máy/môi trường khác.
- **Unique constraint**: ràng buộc ở cấp database đảm bảo 1 giá trị (username/email/phone) không thể trùng ở 2 dòng dữ liệu, kể cả khi 2 yêu cầu ghi cùng lúc (race condition) — khác với chỉ kiểm tra "đã tồn tại chưa" bằng code trước khi ghi (vẫn có khoảng hở).
- **Connection pooling (pooled vs unpooled/direct)**: Neon cung cấp 2 kiểu kết nối — pooled (`DATABASE_URL`) dùng lúc app chạy bình thường (nhiều kết nối ngắn), direct/unpooled (`DATABASE_URL_UNPOOLED`) chỉ dùng khi chạy migration (cần 1 phiên kết nối thật, không qua pool).

### Công dụng

- Khách hàng tự đăng ký tài khoản, không cần admin tạo tay.
- Có database thật đầu tiên của dự án, mở đường cho các tính năng sau này cần lưu dữ liệu người dùng (giỏ hàng, lịch sử đơn, v.v.) mà không cần đổi kiến trúc auth hiện có.

### Lợi ích

- Không đụng gì đến luồng admin hiện có ngoài việc mở rộng type `role` — đã test lại kỹ luồng đăng nhập admin sau khi sửa để chắc chắn.
- `prisma.user.create()` + bắt lỗi `P2002` vừa đơn giản hơn (ít hơn 1 lượt truy vấn) vừa an toàn hơn race condition so với kiểm tra tồn tại trước rồi mới ghi.

### Bài học (phát hiện khi nghiên cứu, tránh lặp lại)

1. **Không cài Prisma bản mới nhất.** `npm view prisma dist-tags` cho thấy `latest` là **7.8.0**, nhưng Prisma 7 bắt buộc dùng "driver adapter" (`new PrismaClient({ adapter })` thay vì cách viết cổ điển `new PrismaClient()`), di chuyển cấu hình sang file `prisma.config.ts` mới, và có báo cáo lỗi khi kết hợp với Next.js 16 + Turbopack (đúng stack đang dùng). Đã ghim bản **6.x** (tag `prev` trên npm) để giữ cách dùng đơn giản, không cần adapter.
2. **Vercel Storage sinh tên biến môi trường phụ thuộc "Custom Prefix" người dùng tự gõ** — gõ nhầm chính tả ("DATABSE" thay vì "DATABASE") vẫn hoạt động bình thường, vì code chỉ cần khớp đúng tên biến, không quan tâm nó có đúng chính tả tiếng Anh hay không. Lúc mới phát hiện đã tạm sửa `prisma/schema.prisma` cho khớp tên gõ sai để không mất công làm lại — nhưng sau đó người dùng muốn tên đúng chính tả hẳn hoi, nên đã dùng `vercel env add`/`vercel env rm` (qua CLI, không cần vào lại dashboard) để tạo `DATABASE_URL`/`DATABASE_URL_UNPOOLED` đúng tên và xoá 2 biến gõ sai, rồi cập nhật lại schema. Bài học: luôn chạy `vercel env ls` để xem tên chính xác trước khi viết schema, đừng đoán — và nếu cần sửa lại sau, `vercel env add --value` là cách nhanh nhất nhưng **phải hỏi xác nhận người dùng trước** vì thao tác này khiến giá trị secret hiện ra trong lệnh chạy.
3. **Prisma CLI (`prisma migrate dev`, `prisma studio`...) không tự đọc `.env.local`** như cách Next.js dev server làm — nó chỉ đọc `.env` mặc định. Cách xử lý không cần thêm file `.env` riêng (tránh 2 nguồn sự thật lệch nhau): chạy `set -a && source .env.local && set +a && npx prisma ...` để nạp biến vào shell trước khi gọi lệnh Prisma.

### Rủi ro

- SĐT (`phone`) là unique — 1 gia đình dùng chung 1 SĐT chỉ đăng ký được 1 tài khoản. Chấp nhận được ở quy mô hiện tại (landing page bán trái cây nhỏ), cân nhắc lại nếu sau này cần nhiều tài khoản chung SĐT.
- Chưa xác thực email/SĐT thật (không gửi OTP/email xác nhận) — đúng theo yêu cầu "chỉ cơ bản thôi" của người dùng, ai cũng đăng ký được bằng SĐT/email bất kỳ (kể cả không có thật). Cân nhắc thêm xác thực nếu sau này có tính năng cần định danh chắc chắn hơn (ví dụ thanh toán).
- Neon free tier giới hạn 0.5GB storage — đủ dùng lâu dài ở quy mô nhỏ, nhưng cần theo dõi nếu lượng user tăng nhanh.

### Quản trị rủi ro

- Test đầy đủ qua preview + query trực tiếp database: đăng ký hợp lệ → tự đăng nhập → session đúng `role: "user"`; đăng ký trùng username/email/phone → thông báo đúng, không ghi đè; mật khẩu không khớp → chặn, không tới database; đăng nhập admin vẫn hoạt động bình thường sau khi sửa `auth.ts`/`types/next-auth.d.ts`.
- Đã xoá dữ liệu test (`testuser1`) khỏi database thật sau khi kiểm chứng xong, không để lại rác.

### Hướng phát triển

- Chưa có khu vực/trang riêng cho user thường (không có dashboard) — đăng ký xong chỉ về trang chủ, đúng phạm vi đã thống nhất. Khi cần, thêm route mới (ví dụ `/tai-khoan`) và mở rộng `authConfig.callbacks.authorized` để bảo vệ route đó theo `role === "user"` hoặc bất kỳ role nào đã đăng nhập.
- Muốn quản lý user qua giao diện: chạy `npm run prisma:studio` (cần nạp env qua `.env.local` như mục "Bài học" #3).

### Kiểm chứng

```bash
npm run verify
```

Kết quả: pass `lint`, `typecheck`, `build`. Đã test qua preview: đăng ký hợp lệ → tự đăng nhập → về `/` với session `role: "user"`; đăng ký trùng tên đăng nhập → báo lỗi đúng, không crash; mật khẩu xác nhận sai → chặn trước khi chạm database; đăng nhập admin (`/login` → `/admin/poster`) vẫn hoạt động bình thường. Đã query trực tiếp database xác nhận chỉ có đúng 1 user hợp lệ được lưu, sau đó xoá dữ liệu test.

## 2026-07-14 - Hero banner ảnh thật + How-section dạng scrollytelling

### Cập nhật

- Thêm 4 ảnh hộp trái cây thật (nén qua `sips`, ~250-370KB/ảnh) vào `public/images/boxes/`: `hero-tao-cam.jpg`, `quy-trinh-buoc-1.jpg`, `quy-trinh-buoc-2.jpg`, `quy-trinh-buoc-3.jpg`.
- `components/home/hero.tsx`: đổi bố cục 2 cột (chữ trái / panel xanh phải) sang banner ảnh full-width — ảnh làm nền `.home-hero`, lớp scrim gradient tối dần từ dưới lên để chữ trắng đọc được, giữ nguyên toàn bộ logic/copy/props cũ (card sản phẩm, nút "+", 2 tag nổi, `onAdd`/`flash`).
- `components/home/how-section.tsx`: đổi từ lưới 4 card tĩnh trên nền gradient xanh sang dạng cuộn có nhịp (scrollytelling) — 4 khối chữ mô tả từng bước xen giữa 3 khối ảnh nền cố định (`background-attachment: fixed`), có thanh tiến độ cuộn ở trên và hiệu ứng chữ mờ dần hiện ra qua `IntersectionObserver`. Giữ nguyên toàn bộ copy 4 bước thật trong `home-strings.tsx`, chỉ thêm 1 chuỗi mới `how.stepPrefix` ("Bước"/"Step") cho nhãn nhỏ trên ảnh.
- `app/home.css`: viết lại toàn bộ CSS cho `.home-hero*` và `.home-how-section`/`.home-process-*`, dọn các rule cũ không còn dùng (`.home-step-card`, `.home-steps-grid` và tham chiếu trong 2 media query).

### Thuật ngữ

- **Scrollytelling**: kỹ thuật kể chuyện qua cuộn trang — chữ chạy bình thường, xen giữa là các đoạn ảnh full màn hình. Ví dụ kinh điển: "Snow Fall" của New York Times (2012).
- **`background-attachment: fixed`**: thuộc tính CSS khiến ảnh nền đứng yên so với khung nhìn (viewport) trong lúc nội dung phía trên vẫn cuộn bình thường, tạo cảm giác nội dung "trôi qua" ảnh. Không chạy trên Safari/Chrome iOS — đã có fallback `@supports (-webkit-touch-callout: none)` tự chuyển về cuộn thường trên di động.
- **Scrim**: lớp phủ gradient màu tối (thường là đen/xanh đậm trong suốt dần) đặt giữa ảnh nền và chữ, để chữ trắng luôn đọc được bất kể vùng ảnh phía dưới sáng hay tối.
- **`IntersectionObserver`**: API trình duyệt để biết khi nào 1 phần tử cuộn vào/ra khung nhìn, dùng để bật hiệu ứng "mờ dần hiện ra" cho từng khối chữ đúng lúc người dùng cuộn tới, không cần tính toán vị trí cuộn thủ công.

### Công dụng

- Trang chủ giờ dùng ảnh thật (chụp sản phẩm thật của Gọt Gòi Nè) thay vì card nhỏ + emoji, nhìn "thật" và đáng tin hơn với khách hàng lần đầu ghé trang — mục tiêu chính hiện tại là marketing/gây thiện cảm, chưa có backend đặt hàng thật.
- Phần quy trình 4 bước từ dạng lưới tĩnh (đọc lướt qua, dễ bỏ sót) chuyển sang dạng cuộn có nhịp, giữ chân người xem lâu hơn và kể câu chuyện quy trình rõ ràng hơn.

### Lợi ích

- Không đổi bất kỳ copy/dữ liệu thật nào (`data/home.ts`, `home-strings.tsx`) — chỉ đổi cách trình bày, không có rủi ro sai lệch nội dung.
- Không đụng tới `ProductsSection` (menu) — ảnh hộp mix hiện có chưa khớp chính xác với từng sản phẩm cụ thể trong menu thật, nên cố tình chưa dùng ở đó để tránh gắn nhầm ảnh cho sản phẩm (xem "Hướng phát triển").
- Đã kiểm tra kỹ layout responsive (mobile 375px) và xác nhận không tràn ngang, card + 2 tag nổi trong hero không đè lên nhau.

### Bài học (phát hiện khi làm, tránh lặp lại)

1. Khi bỏ `background: <color>` cố định của 1 khung chứa (`.home-hero-right`) để nó "trong suốt" nhìn xuyên ảnh nền phía sau, các phần tử con định vị `position: absolute` bên trong (2 tag nổi) mất luôn không gian đệm (padding) vốn dùng làm mốc toạ độ — khiến chúng đè lên card chính. Phải giữ lại `padding` dù đã bỏ màu nền, vì padding vẫn quyết định kích thước khung chứa cho `position: absolute` bên trong dùng làm mốc.
2. CSS shorthand `background: <gradient>` sẽ **ghi đè về giá trị mặc định** mọi thuộc tính `background-*` không được nêu tên tường minh (kể cả khi khai báo ở rule khác có độ ưu tiên thấp hơn nhưng đứng sau trong file) — nếu 1 rule cha đã set `background-attachment: fixed`, rule con chỉ nên dùng `background-image:`, không dùng `background:` shorthand, nếu không sẽ vô tình tắt mất `fixed`.
3. Công cụ xem trước (preview tool) dùng trong lúc làm việc có `IntersectionObserver` không bao giờ bắn callback (đã tự kiểm chứng bằng 1 observer tối giản, không có bug logic nào cả) — giống hiện tượng `requestAnimationFrame` không chạy ổn định đã gặp trước đây. Không phải lỗi thật, chỉ là hạn chế riêng của công cụ preview; đã xác nhận phần còn lại (ảnh tải đúng, `background-attachment: fixed` đúng, thanh tiến độ cuộn theo `scroll` event bình thường) hoạt động tốt qua kiểm tra DOM trực tiếp thay vì chụp màn hình.

### Rủi ro

- 4 ảnh dùng trong bản này (`hero-tao-cam.jpg` + 3 ảnh quy trình) là ảnh hộp mix nhiều loại trái, không gắn với 1 sản phẩm cụ thể nào trong menu — phù hợp làm ảnh minh hoạ không khí (hero, quy trình) nhưng **chưa nên dùng để minh hoạ đúng 1 món hàng có giá cụ thể**.
- Ảnh nền dùng `background-image` CSS thuần (không qua `next/image`) nên không tự sinh `srcset` đa độ phân giải theo thiết bị — chấp nhận được ở quy mô hiện tại (đã nén tay xuống 250-370KB/ảnh), nhưng nếu sau này có nhiều ảnh nền hơn nên cân nhắc `next/image` với `fill` để tối ưu tự động.

### Quản trị rủi ro

- Chỉ dùng ảnh hộp mix cho các vị trí mang tính "minh hoạ không khí" (hero, quy trình gọt-rửa-đóng gói), không gắn tên/giá sản phẩm cụ thể lên ảnh đó.
- Đã kiểm tra qua DOM (`getComputedStyle`, network request status) rằng cả 4 ảnh tải thành công (200 OK) và `background-attachment: fixed` áp dụng đúng trên cả 3 khối quy trình.

### Hướng phát triển

- `ProductsSection` (menu hôm nay) **chưa** được áp ảnh thật — cần ảnh chụp đúng từng món riêng lẻ (không phải ảnh hộp mix nhiều loại) trước khi làm, để tránh gắn nhầm ảnh cho sản phẩm có giá cụ thể.
- Có thể cân nhắc thêm 1 trang/section "Câu chuyện Gọt Gòi Nè" riêng dùng lại đúng pattern scrollytelling này với nội dung dài hơn, nếu muốn đầu tư thêm cho mảng marketing.

## 2026-07-23 - Gom token màu/bo góc dùng chung toàn site (UI consistency)

### Cập nhật

- Rà lại toàn bộ CSS trong repo (`app/home.css`, `components/auth/auth-scene.module.css`, `components/admin/poster-generator.module.css`, `app/login/page.tsx`, `app/register/page.tsx`) và phát hiện 3 hệ màu xanh thương hiệu tồn tại song song, lệch nhau: `home.css` dùng token `--green-dark:#1e5c2e` / `--green-mid:#2d7a42` / `--accent:#f5a800`, trong khi trang login/register (Tailwind arbitrary-value hex trong JSX) và poster-generator (CSS Module, port từ project Poster gốc) dùng hex gõ tay `#1e5c2d` / `#3a7d44` / `#f4a832` — lệch 1-2 ký tự hex, không dùng chung nguồn nào.
- Thay toàn bộ hex gõ tay ở 2 nơi đó bằng `var(--green-dark)` / `var(--green-mid)` / `var(--accent)` (đã có sẵn trong `:root` của `home.css`, tự động global vì `home.css` được import ở `app/layout.tsx` cho mọi route).
- `auth-scene.module.css`: `background: #f0f9e1` (đúng bằng `--bg` sẵn có, không lệch giá trị) → đổi thành `var(--bg)` để không lệch nếu sau này đổi màu nền.
- `poster-generator.module.css`: 2 badge pill (`.datePill`, `.greenBanner`) đang có `border-radius: 20px` — vì chiều cao thực tế của 2 khối này nhỏ hơn 40px nên trình duyệt đã tự kẹp về hình viên thuốc tròn đều rồi (border-radius > nửa chiều cao = tự động full pill), nên đổi sang `var(--r-pill)` (999px) là **đổi nguồn, không đổi hình dạng hiển thị**.

### Thuật ngữ

- **Single source of truth (nguồn sự thật duy nhất)**: nguyên lý chỉ lưu 1 giá trị gốc ở đúng 1 nơi, mọi chỗ khác tham chiếu tới nó thay vì chép lại — sửa 1 chỗ, mọi nơi tự cập nhật theo, tránh lệch dần theo thời gian như đã xảy ra ở đây.
- **CSS custom property (`--tên-biến`)**: biến CSS khai báo trong `:root`, có hiệu lực toàn trang (mọi route, mọi file CSS/JSX đã tải trang đó) miễn nơi khai báo được import — không cần build tool hay framework riêng để chia sẻ.

### Công dụng

- Từ nay chỉ cần sửa đúng 1 nơi (`:root` trong `home.css`) để đổi màu thương hiệu/bo góc cho toàn site — kể cả trang login/register/poster tool trước đây tách biệt hoàn toàn.

### Lợi ích

- Không đổi giao diện nhìn thấy: 2 hệ hex chênh nhau 1-2 ký tự (dưới ngưỡng phân biệt bằng mắt ở diện tích nhỏ như text/button), và bản thân "được thấy" 20px vs 999px trên 2 pill badge vốn đã render giống hệt nhau từ trước (browser tự kẹp). Đã build (`npm run verify`) pass và soi trực tiếp `/login` qua preview để xác nhận không lệch màu.
- Không đụng tới cấu trúc component nào, chỉ đổi giá trị màu/bo góc tại chỗ khai báo — rủi ro hồi quy gần như bằng 0.

### Rủi ro

- Chưa xác minh trực quan `/admin/poster` (cần đăng nhập admin, không có sẵn thông tin đăng nhập trong phiên làm việc này) — chỉ xác minh qua build pass + đối chiếu giá trị hex bằng tay. Nếu có lệch màu bất ngờ ở đó, khả năng cao là do 1 trong các hex khác chưa được rà (ví dụ `.page { background: #d4e8c2 }`, các màu chữ `#1a2e1c`/`#4a6e4d`/`#123f1c`) — cố ý chưa đụng tới vì không nằm trong 3 cặp giá trị đã xác nhận bị lệch.
- Thang bo góc (`--r-sm/md/lg`) của `home.css` **chưa** được áp cho các bo góc khác (10px/16px/18px trên nút, ô nhập, khung poster ở login/register/poster tool) vì các giá trị đó chênh lệch thấy rõ so với thang hiện có (14/22/32px) — ép về thang chung sẽ đổi kích thước góc thật sự, cần 1 quyết định UI riêng, không gộp chung vào bước dọn token lần này.

### Quản trị rủi ro

- `npm run verify` pass (lint, typecheck, build) sau khi sửa.
- Đã mở `/login` qua preview local, xác nhận màu nút/label/link giữ nguyên như trước khi sửa.
- `/admin/poster` cần người dùng tự kiểm tra 1 lần qua giao diện thật sau khi deploy (đăng nhập admin) để chắc chắn không lệch màu ngoài dự kiến.

### Hướng phát triển

- Nếu muốn dọn tiếp: gom nốt các màu chữ còn hardcode riêng ở login/register/poster (`#1a2e1c`, `#4a6e4d`, `#123f1c`, `#2d6b3a` một số chỗ, `#d4e8c2` nền trang poster) thành token `--text`/`--text-muted` chung — nhưng cần đối chiếu kỹ hơn vì các giá trị này không lệch rõ ràng theo cặp như 3 màu xanh/cam đã xử lý, có thể là màu cố ý khác biệt.
- Muốn đồng bộ luôn thang bo góc (10/16/18px → 14/22/32px chuẩn) thì nên làm thành 1 bước riêng, có xem trước ảnh trước/sau vì đây là thay đổi hình ảnh thật sự, không chỉ đổi nguồn quản lý.

### Kiểm chứng

```bash
npm run verify
```

Kết quả: pass lint, typecheck, build. Đã xem `/login` qua preview local (localhost:3000), xác nhận màu nút "Đăng nhập" và các label giữ nguyên sắc thái xanh như trước khi gộp token.

## 2026-07-23 - Fix góc phải poster tool bị vuông (không tròn theo card)

### Cập nhật

- Sửa `components/admin/poster-generator.module.css`: `.rightCol` (khối chứa `.heroOval`, phủ toàn bộ chiều cao bên phải poster) không tự có `border-radius`, chỉ trông cậy vào `border-radius: 18px` + `overflow: hidden` của `.poster` (phần tử cha) để được bo tròn theo đúng hình chữ nhật bo góc của card. Trên production thực tế, 2 góc phải (nơi `.heroOval` màu xanh nằm) hiển thị vuông cứng thay vì bo tròn khớp 2 góc trái — phát hiện qua ảnh chụp `/admin/poster` thật do người dùng gửi trực tiếp, không phải qua công cụ xem trước.
- Thêm biến `--poster-radius: 18px` khai báo tại `.poster`, rồi cho `.rightCol` tự bo `border-top-right-radius`/`border-bottom-right-radius: var(--poster-radius)` — để nó tự cắt đúng hình theo `overflow: hidden` sẵn có của chính nó, không còn phụ thuộc hoàn toàn vào việc `.poster` có bo/cắt đúng con của nó ở 2 góc phải hay không.

### Thuật ngữ

- **Nested overflow:hidden clipping (cắt lồng nhau)**: khi 1 phần tử con có `position: absolute` + `overflow: hidden` + `z-index` riêng nằm bên trong 1 cha cũng có `border-radius` + `overflow: hidden`, phần tử con đó tạo ra ngữ cảnh render/compositing riêng — một số trình duyệt không luôn áp đúng phần bo góc của cha lên đúng biên của con trong ngữ cảnh đó, dù về lý thuyết CSS nó phải được cắt đúng. Cách phòng tránh chắc chắn nhất: bo góc trực tiếp trên chính phần tử con thay vì chỉ trông cậy vào cha.

### Công dụng

- Poster xuất ra (dùng để đăng Facebook/TikTok hằng ngày) giờ có 4 góc bo tròn đều, đúng như thiết kế ban đầu, không còn góc vuông lộ ra ở phía hình trái cây.

### Lợi ích

- Chỉ thêm 2 dòng CSS bo góc + 1 biến dùng chung, không đổi kích thước/vị trí/màu sắc gì khác trong poster.

### Rủi ro

- Chưa có ảnh "trước khi sửa" lưu lại để so trực tiếp (chỉ có mô tả bằng lời + ảnh người dùng gửi ngoài luồng chat lưu trữ) — nếu cần đối chiếu lại sau này, dựa vào chính ảnh đã gửi trong hội thoại lúc phát hiện lỗi.

### Quản trị rủi ro

- `npm run verify` pass sau khi sửa.
- Đã mirror đúng thay đổi này vào bản demo tĩnh (ngoài repo, dùng để đối chiếu màu) để 2 nơi luôn khớp nhau nếu cần dùng lại sau này.

### Hướng phát triển

- Nếu sau này phát hiện thêm chỗ nào khác trong repo dùng pattern "cha bo góc + overflow:hidden, con absolute + overflow:hidden riêng" (hiện chưa rà hết toàn repo, chỉ mới xử lý đúng chỗ được báo), nên áp dụng luôn cách bo góc trực tiếp trên con để tránh lặp lại lỗi tương tự.

### Kiểm chứng

```bash
npm run verify
```

Kết quả: pass lint, typecheck, build. Người dùng xác nhận lỗi qua ảnh chụp `/admin/poster` thật trên production trước khi sửa; chưa có xác nhận lại bằng ảnh sau khi sửa trong phiên làm việc này.

## 2026-07-23 (tiếp) - Fix góc phải poster tool: thêm clip-path (nghi Safari không tôn trọng overflow:hidden + border-radius)

### Cập nhật

- Sau khi deploy fix `border-top-right-radius`/`border-bottom-right-radius` ở lần sửa trước, người dùng xác nhận qua ảnh chụp `/admin/poster` thật (đã hard refresh + tab ẩn danh) rằng góc phải **vẫn vuông**.
- Kiểm chứng lại kỹ bằng cách tự dựng route tạm `app/dev-poster-preview` (không qua đăng nhập, không đụng tới `/admin/*`) để render thẳng `<PosterGenerator />`, đo bằng `getComputedStyle`/`getBoundingClientRect`/`document.elementFromPoint` — xác nhận trong Chromium (công cụ xem trước đang dùng), `border-top-right-radius: 18px` đã áp dụng đúng và điểm ở góc thực sự bị cắt (không render nội dung `.rightCol` ở đó). Tức là về mặt CSS, rule đã đúng và hoạt động đúng trong Chromium.
- Vì người dùng thao tác trên Mac (nhiều khả năng trình duyệt mặc định là Safari) và bug vẫn còn sau khi code đã đúng trong Chromium, nghi vấn cao nhất là **Safari không tôn trọng `overflow: hidden` + `border-radius` khi clip 1 phần tử `position: absolute` có nền `linear-gradient` và ngữ cảnh compositing riêng** (`.heroOval` bên trong `.rightCol`) — đây là loại bug từng gặp ở WebKit, không phải lỗi logic CSS.
- Thêm `clip-path: inset(0 round 0 var(--poster-radius) var(--poster-radius) 0);` vào `.rightCol` — 1 cơ chế cắt độc lập, không đi qua cùng pipeline với `overflow: hidden`, làm lá chắn dự phòng cho đúng trường hợp WebKit không cắt đúng.

### Thuật ngữ

- **`clip-path`**: thuộc tính CSS định nghĩa vùng hiển thị của phần tử bằng 1 hình dạng tường minh (ở đây là `inset()` — hình chữ nhật có thể bo góc riêng từng cạnh) — độc lập với `overflow`/`border-radius`, dùng 1 pipeline render khác trong trình duyệt.

### Công dụng

- Có thêm 1 lớp phòng vệ cho đúng trình duyệt (Safari) mà người dùng thực tế đang dùng để kiểm tra, thay vì chỉ dựa vào cơ chế `overflow:hidden` vốn đã xác nhận hoạt động đúng trong Chromium nhưng chưa chắc đúng ở WebKit.

### Rủi ro

- **Chưa xác nhận được bằng Safari thật** (không có sẵn môi trường Safari để tự kiểm chứng trong phiên làm việc này) — đây là suy luận có cơ sở (đo đạc kỹ trong Chromium loại trừ lỗi logic CSS, kết hợp với thiết bị người dùng đang dùng) chứ chưa phải bằng chứng trực tiếp. Nếu `clip-path` vẫn không giải quyết được, cần hỏi người dùng xem thử bằng Chrome trên cùng máy để xác định chắc chắn đây có phải lỗi riêng của Safari hay không.

### Quản trị rủi ro

- `npm run verify` pass sau khi sửa (đã xoá `.next` cache cũ do route debug tạm để lại trước khi build lại cho sạch).
- Route debug tạm (`app/dev-poster-preview`) đã xoá hoàn toàn trước khi commit, không lọt vào git.
- Đã mirror `clip-path` vào bản demo tĩnh ngoài repo cho khớp.

### Kiểm chứng

```bash
npm run verify
```

Kết quả: pass lint, typecheck, build. Chờ người dùng xác nhận lại trên Safari thật sau khi deploy.

## 2026-07-23 (tiếp) - Không phải bug: người dùng muốn bo tròn nhiều hơn hẳn

### Cập nhật

- Sau khi kiểm chứng kỹ (đo bằng lưới điểm `elementsFromPoint`, khớp chính xác đường tròn 18px lý thuyết ở mọi mẫu), xác nhận 2 lần sửa trước **không hề có bug** — CSS đã tôn trọng đúng bán kính 18px từ đầu. Điều người dùng thực sự muốn không phải sửa lỗi, mà là **tăng độ bo tròn lên** ("bo tròn nhất có thể").
- Tăng `--poster-radius` từ `18px` → `36px` (gấp đôi) tại `.poster` — do `.rightCol` đã tham chiếu `var(--poster-radius)` từ 2 lần sửa trước, chỉ cần đổi 1 chỗ là card + góc phải cùng bo tròn hơn đồng bộ.

### Bài học (tránh lặp lại)

- Khi người dùng gửi ảnh chê "chưa ổn" nhiều lần liên tiếp dù code đã đo được là đúng, nên hỏi thẳng "đây là lỗi kỹ thuật hay không thích thiết kế" sớm hơn, thay vì tiếp tục đoán và vá kỹ thuật — tiết kiệm được 1-2 vòng sửa không cần thiết. `document.elementFromPoint`/`elementsFromPoint` bỏ qua phần tử có `pointer-events: none` khi hit-test — nếu dùng để kiểm tra vùng bị clip, phải tạm gỡ `pointer-events: none` (chỉ ảnh hưởng hit-test, không ảnh hưởng render) trước khi đo, nếu không kết quả sẽ sai lệch mà không báo lỗi gì.

### Kiểm chứng

```bash
npm run verify
```

Kết quả: pass lint, typecheck, build. Tự dựng route debug tạm (đã xoá trước khi commit) để xem trực tiếp bằng `zoom` CSS + screenshot, xác nhận góc bo tròn rõ hơn hẳn so với 18px cũ.

## 2026-07-23 (tiếp) - Làm lại giao diện poster theo ảnh tham khảo người dùng gửi

### Cập nhật

- Người dùng gửi 1 ảnh poster tham khảo (nền kem, khối ảnh dome lớn bên phải ~55% bề rộng, pill ngày dạng viền thay vì nền đặc, badge trái cây tròn to nền xanh nhạt phẳng, đường kẻ đứt giữa các món) và muốn đổi toàn bộ giao diện poster theo hướng đó — không phải bug, là yêu cầu redesign thật.
- Đã lập kế hoạch qua Plan Mode trước khi sửa (do phạm vi lớn hơn hẳn các lần chỉnh 1 dòng trước đó), giới hạn phạm vi rõ: **giữ nguyên icon emoji** (không tạo icon minh hoạ riêng như ảnh mẫu — cần asset mới, ngoài phạm vi), **giữ nguyên toàn bộ logic** (upload ảnh, xuất PNG, dữ liệu trái cây) — chỉ đổi CSS + 2 chỗ JSX nhỏ.
- `components/admin/poster-generator.module.css`:
  - `.poster` nền `#eaf0e3` (xanh nhạt) → `#f4efe2` (kem ấm).
  - `.datePill` từ nền cam đặc → viền xanh đậm 1.5px, chữ xanh, nền trong suốt (dạng outline pill).
  - `.greenBanner` đổi `display: inline-block` → `inline-flex` + `gap` để chứa 2 icon lá 2 bên text.
  - `.menuIcon` nền gradient xanh đậm → nền phẳng xanh nhạt `#dce9cd`.
  - `.menuItem` border-bottom từ `solid` → `dashed`.
  - `.leftCol` hẹp lại (195px → 165px), `.rightCol` rộng ra (145px → 190px), `.heroOval` rộng ra (190px → 245px, right offset -28px → -35px) — để khối ảnh/màu bên phải chiếm tỉ lệ lớn hơn, giống ảnh mẫu.
- `components/admin/poster-generator.tsx`:
  - Đổi emoji 🌿 trong banner "Nhà gọt hôm nay có" thành icon `Leaf` từ `lucide-react` (thư viện đã có sẵn trong project, dùng ở `app/login/page.tsx` cho icon khoá/mắt) — 2 icon 2 bên chữ "NHÀ GỌT CÓ:" (rút gọn, viết hoa, bỏ "hôm nay" theo đúng ảnh mẫu).
  - `getScales()`: tăng khoảng `iconSize` (20-28px → 28-40px) và `heroSize` (22-30px → 26-36px) để badge/emoji to hơn, khớp tỉ lệ mới.

### Công dụng

- Giao diện poster giờ gần với phong cách ảnh mẫu người dùng thích: ấm áp hơn (nền kem), khối ảnh nổi bật hơn, badge/pill nhẹ nhàng thoáng hơn — trong khi vẫn giữ nguyên toàn bộ chức năng cũ (nhập trái cây, upload ảnh hero, tải PNG).

### Rủi ro

- Không phục chế được đúng 100% icon minh hoạ trong ảnh mẫu (ảnh mẫu dùng icon vẽ tay/illustration riêng cho từng loại trái cây — vượt phạm vi, cần assets mới nếu muốn làm tiếp).
- Đường cong khối ảnh bên phải là ước lượng bằng mắt (border-radius hình oval + overflow), không phải sao chép chính xác đường cong trong ảnh mẫu (không rõ ảnh mẫu dùng shape/SVG gì) — đã xem trực tiếp qua route debug tạm và thấy khá sát, nhưng chưa có xác nhận từ người dùng.

### Quản trị rủi ro

- Đã tự dựng route debug tạm (`app/dev-poster-preview`, không qua đăng nhập) để xem trực tiếp component thật, zoom bằng `el.style.zoom` + `scrollIntoView` (kỹ thuật đã dùng ổn ở các lần trước) — xác nhận cả phần trên (banner, badge, pill ngày) và phần dưới (góc bo, footer) đều hiển thị đúng ý đồ trước khi xoá route và commit.
- Route debug + `.next` cache cũ đã xoá sạch trước khi build lại, tránh lặp lỗi type-validator đã gặp ở 2 lần sửa poster trước trong ngày.

### Kiểm chứng

```bash
npm run verify
```

Kết quả: pass lint, typecheck, build. Đang chờ người dùng xác nhận qua ảnh chụp `/admin/poster` thật trước khi coi là xong.

## 2026-07-23 (tiếp) - Sửa chữ mô tả bị chật/tràn sau khi thu hẹp cột trái

### Cập nhật

- Ảnh chụp `/admin/poster` thật người dùng gửi sau lần redesign trước cho thấy mô tả các món dài (XOÀI, CAM...) bị xuống dòng chật, gần như chạm vào khối màu bên phải — hệ quả của việc thu hẹp `.leftCol` (195px → 165px) quá tay để nhường chỗ cho khối ảnh lớn hơn.
- Cân bằng lại: `.leftCol` 165px → 185px, `.rightCol` 190px → 165px, `.heroOval` 245px → 215px (right offset -35px → -30px) — khối ảnh vẫn lớn hơn hẳn bản gốc (145px), nhưng nhường lại đủ chỗ cho chữ.
- Đã đo lại bằng script (không chỉ nhìn ảnh): kiểm tra `clientHeight / lineHeight` của từng `.menuDesc` — xác nhận cả 7 món mẫu hiện đều gọn 1 dòng, không còn món nào xuống dòng.

### Bài học

- Khi đổi tỉ lệ cột trong 1 layout co giãn theo nội dung (fruit list dài ngắn khác nhau tuỳ người dùng nhập), không đủ chỉ xem 1 bộ dữ liệu mẫu ngắn qua ảnh chụp — nên đo trực tiếp số dòng chữ bằng code (`clientHeight`/`lineHeight`) thay vì chỉ nhìn mắt, để chắc chắn không có món nào (đặc biệt mô tả dài) bị tràn.

### Kiểm chứng

```bash
npm run verify
```

Kết quả: pass lint, typecheck, build. Đo lại 7/7 mô tả mẫu đều 1 dòng qua route debug tạm (đã xoá trước khi commit).

## 2026-07-23 (tiếp) - Bỏ hình vòm, chia thẳng 50/50

### Cập nhật

- Người dùng tải ảnh thật lên thử (khớp khá tốt với khối dome), nhưng sau đó quyết định đổi hướng: bỏ hẳn hiệu ứng cong (dome/oval), chia poster thành 2 nửa thẳng đứng đơn giản (cột chữ | ảnh) — không còn theo sát ảnh tham khảo dome nữa.
- `.leftCol`/`.rightCol` đổi về đúng 170px/170px (= 340px / 2).
- `.heroOval`: bỏ `border-radius: 50% 0 0 50%`, bỏ `position: absolute` + `right: -Npx` (kỹ thuật tràn viền để tạo hình oval không còn cần nữa) → chỉ còn `width: 100%; height: 100%` lấp đầy `.rightCol` như 1 khối chữ nhật thường.
- `.heroImgWrap`: bỏ `border-radius: 50% 0 0 50%`, chỉ còn `position: absolute; inset: 0`.
- Góc ngoài cùng (top-right/bottom-right của card) vẫn giữ bo tròn qua `.rightCol`'s `border-top-right-radius`/`border-bottom-right-radius` + `clip-path` (từ các lần sửa trước trong ngày) — không đổi.
- Code gọn hơn hẳn: bỏ được toàn bộ phần tính toán offset tràn viền cho hình oval.

### Rủi ro

- Mô tả dài nhất trong 7 món mẫu (CAM: "Bổ sung vitamin C, tăng đề kháng") xuống 2 dòng ở bề rộng cột 170px (đã đo bằng `clientHeight/lineHeight`) — không phải lỗi, chỉ là ngắt dòng bình thường khi mô tả dài, không tràn/đè lên vùng ảnh như lần lỗi trước. Chấp nhận được, không phải mọi món đều 1 dòng.

### Kiểm chứng

```bash
npm run verify
```

Kết quả: pass lint, typecheck, build. Xem trực tiếp qua route debug tạm (đã xoá trước khi commit): đường phân chia thẳng, góc ngoài vẫn tròn đều, không có khoảng hở hay lệch.

## 2026-07-23 (tiếp) - Nút tinh chỉnh vị trí ảnh hero (8 hướng + kéo thả)

### Cập nhật

- Nghiên cứu nguyên lý trước khi làm: `object-fit: cover` (đã dùng sẵn) chỉ giải quyết việc ảnh không bị méo/kéo giãn ("bể ảnh") — nó cắt ảnh để lấp đầy khung, không làm méo tỉ lệ. Vấn đề còn lại là **điểm neo cắt** (`object-position`) luôn mặc định ở giữa ảnh, không có cách chọn phần nào của ảnh được giữ lại — đây mới là thứ cần thêm nút chỉnh, đúng nguyên lý "focal point" mà Facebook/Instagram dùng cho ảnh bìa.
- **Phát hiện quan trọng làm đổi cả cách implement**: `html2canvas` (thư viện dùng để xuất PNG — chức năng chính của tool) có bug tồn đọng lâu năm, bỏ qua hoàn toàn `object-fit`/`object-position` trên thẻ `<img>`, ảnh xuất ra sẽ bị kéo méo thay vì đúng như xem trước (xem [html2canvas#725](https://github.com/niklasvh/html2canvas/issues/725), [#1064](https://github.com/niklasvh/html2canvas/issues/1064)). Cách né lỗi được cộng đồng xác nhận: dùng `<div>` với `background-image` + `background-position` thay vì thẻ `<img>` — `html2canvas` xử lý đúng background-position. Đã đổi `.heroImgWrap` từ `<img>` sang `<div>` nền ảnh vì lý do này, không chỉ để thêm tính năng mới.
- `components/admin/poster-generator.tsx`: thêm state `heroPosition` (%, mặc định 50/50), reset về mặc định mỗi khi tải ảnh mới; 8 nút mũi tên (dùng icon có sẵn từ `lucide-react`) di chuyển 4% mỗi lần bấm; kéo thả trực tiếp trên ảnh qua Pointer Events (`pointerdown` trên ảnh, `pointermove`/`pointerup` gắn tạm vào `window` trong lúc kéo); nút "Đặt lại vị trí".
- `components/admin/poster-generator.module.css`: `.heroImgWrap` thêm `background-size:cover`, `cursor:grab`/`grabbing`, và **`pointer-events: auto`** để ghi đè `pointer-events: none` của `.rightCol` cha (`.rightCol` cố tình tắt pointer-events để không chặn click khi chưa có ảnh — phải bật lại riêng cho đúng phần tử ảnh mới kéo được). Thêm cụm nút 3x3 (`.nudgeGrid`/`.nudgeBtn`) tái dùng phong cách viền xanh của `.uploadBtn` sẵn có, không tạo style thứ 3.

### Thuật ngữ

- **Focal point (điểm neo tiêu điểm)**: toạ độ % đánh dấu phần quan trọng nhất của ảnh cần luôn hiển thị khi ảnh bị cắt để lấp khung có tỉ lệ khác — cơ chế đứng sau tính năng "kéo ảnh bìa" quen thuộc trên Facebook.
- **Pointer Events**: API trình duyệt hợp nhất chuột + cảm ứng (`pointerdown/pointermove/pointerup`) thành 1 bộ sự kiện, không cần viết riêng cho mouse và touch.

### Rủi ro

- Chưa có điều khiển bàn phím đầy đủ cho việc kéo (chỉ có `tabIndex` để focus được, chưa bind phím mũi tên) — với người dùng chỉ có 1 tài khoản admin dùng chuột/cảm ứng, chấp nhận được ở quy mô hiện tại.

### Quản trị rủi ro

- Kiểm chứng đúng theo đúng lo ngại kỹ thuật đã nêu ở trên (không chỉ nhìn preview): dựng ảnh test 4 màu (đỏ/xanh dương/xanh lá/vàng), kéo lệch vị trí, gọi thẳng luồng `handleDownload` thật (chặn tạm `HTMLAnchorElement.prototype.click` để lấy data URL thay vì tải file), decode lại PNG xuất ra và đọc màu pixel tại đúng toạ độ — **màu khớp chính xác với vị trí đã kéo trên preview** (đỏ ở trên, xanh lá ở dưới), xác nhận file xuất ra không bị lỗi html2canvas đã lo từ đầu.
- Đã thử đủ 3 cách tương tác: bấm nút mũi tên (đo qua `aria-label`), kéo chuột (`left_click_drag`), và nút đặt lại — tất cả đều đúng.

### Kiểm chứng

```bash
npm run verify
```

Kết quả: pass lint, typecheck, build.

## 2026-07-23 (tiếp) - Bỏ nút mũi tên, thêm thu phóng — giải thích tại sao trước đó chỉ chỉnh được ngang

### Cập nhật

- Bỏ hẳn cụm 8 nút mũi tên (thừa so với kéo thả trực tiếp).
- Thêm thanh trượt "🔍 Thu phóng" (100%-250%). Đây không chỉ là tính năng mới mà còn **sửa đúng nguyên nhân gốc** của việc "chỉ chỉnh được ngang": ảnh do người dùng tải lên thường có tỉ lệ ngang (rộng hơn cao), trong khi khung ảnh hero rất cao hẹp (170×604px, tỉ lệ ~1:3.55). Với `background-size: cover`, trình duyệt luôn scale theo chiều bị giới hạn nhiều hơn — với khung cao hẹp này, hầu như luôn là chiều cao khớp khít container (dư 0px để kéo dọc), còn chiều ngang dư rất nhiều (kéo ngang thoải mái). Đã tính cụ thể: ảnh test 400×200px → sau `cover` ra đúng 1208×604px, chiều cao **khớp chính xác** container (604px) → kéo dọc không có tác dụng gì (hệ số nhân trong công thức `background-position` bằng 0), đúng như người dùng phản ánh — không phải bug, là hệ quả hình học tất yếu của `cover` trong khung tỉ lệ cực đoan này.
- Phóng to (`heroZoom` > 100%) làm ảnh lớn hơn mức "vừa khít" tối thiểu ở **cả 2 chiều**, tạo dư địa kéo dọc thật sự. Đã tính tay và đo lại: ở 180%, ảnh test 400×200 scale ra 2174×1087px, chiều cao dư 483px so với container → kéo dọc giờ có tác dụng rõ ràng.
- `components/admin/poster-generator.tsx`: thêm state `heroImageSize` (kích thước gốc ảnh, đọc qua `new Image()` sau khi tải lên) + `heroZoom`; tính `heroBackgroundSize` bằng công thức `max(khung_rộng/ảnh_rộng, khung_cao/ảnh_cao) × zoom`, gán trực tiếp vào `backgroundSize` inline thay vì để CSS cố định `cover`. Cả `heroPosition` lẫn `heroZoom` đều reset khi tải ảnh mới.
- Bỏ `NUDGE_DIRECTIONS`, `handleNudge`, import 8 icon mũi tên không còn dùng.

### Rủi ro

- `heroCoverScale`/`heroBackgroundSize` phụ thuộc `heroImageSize` — trong khoảnh khắc rất ngắn giữa lúc `heroImageUrl` được set và `Image().onload` hoàn tất, `heroBackgroundSize` fallback về chuỗi `"cover"` (không lỗi, chỉ là 1-2 frame đầu chưa áp zoom, không đáng kể với ảnh nhỏ qua data URL).

### Quản trị rủi ro

- Kiểm chứng lại đúng bằng ảnh test 4 màu tỉ lệ ngang thật (400×200, mô phỏng đúng tình huống "ảnh rộng, khung cao hẹp" gây ra lỗi ban đầu): xác nhận ở 100% zoom, kéo dọc đổi state nhưng **không đổi hình ảnh** (đúng như người dùng mô tả); ở 180% zoom, kéo dọc đổi cả state lẫn hình ảnh rõ rệt.
- Kiểm chứng lại luồng xuất PNG thật (không chỉ preview) ở trạng thái đã zoom + lệch tâm — màu pixel trong file xuất ra khớp đúng theo công thức tính tay (ranh giới màu ở đúng 55.6% theo cả chiều ngang lẫn dọc), xác nhận cơ chế `background-size` bằng px tường minh (không phải từ khoá `cover`) vẫn được `html2canvas` xử lý đúng.

### Kiểm chứng

```bash
npm run verify
```

Kết quả: pass lint, typecheck, build.

## 2026-07-23 (tiếp) - Làm mờ đường phân tách giữa nền và khối ảnh hero

### Cập nhật

- Thêm 1 lớp gradient mờ dần (`.heroFade`) phủ lên khoảng 38% bên trái của `.heroOval` — từ màu kem đặc của card (`#f4efe2`, khớp đúng màu nền `.poster`) mờ dần về trong suốt, tạo cảm giác 2 nửa "chảy" vào nhau thay vì cắt đôi bằng đường thẳng cứng.
- Áp dụng cho cả 2 trạng thái: khi chưa có ảnh (che lên nền gradient xanh mặc định) và khi đã upload ảnh thật (che lên `.heroImgWrap`).
- `pointer-events: none` trên lớp phủ để không chặn kéo thả — đã test lại, kéo ảnh vẫn hoạt động bình thường qua lớp này.

### Kiểm chứng

```bash
npm run verify
```

Kết quả: pass lint, typecheck, build. Đã xem qua route debug tạm ở cả 2 trạng thái (có ảnh/chưa có ảnh) và test kéo thả vẫn hoạt động.

## 2026-07-23 (tiếp) - Thêm hiệu ứng làm mờ (blur) thật ở mép nối, không chỉ phủ màu

### Cập nhật

- Sau khi tinh chỉnh lại độ đậm/độ rộng của lớp phủ màu kem (`.heroFade`) mà đường ranh giới vẫn còn rõ theo phản hồi người dùng, nhận ra vấn đề gốc: **phủ 1 lớp màu bán trong suốt lên trên ảnh KHÔNG xoá được ranh giới hình học** — ranh giới thật (nơi div ảnh bắt đầu/kết thúc) vẫn còn nguyên, nhất là với ảnh trái cây thật nhiều màu sắc/tương phản cao (không giống ảnh gradient mượt dùng test lúc đầu) — lớp phủ chỉ làm nhạt màu đi chứ không làm mất đường viền sắc nét.
- Giải pháp thật: thêm 1 lớp `<div>` thứ 2 (`.heroBlurLayer`) — bản sao chính xác của ảnh hero (cùng `backgroundImage`/`backgroundPosition`/`backgroundSize`), áp `filter: blur(14px)` để làm mờ thật, rồi dùng `mask-image: linear-gradient(...)` để lớp mờ này chỉ hiện rõ ở đúng mép trái (0-26%) rồi tự mờ dần biến mất, hoà vào bản ảnh sắc nét gốc bên dưới — tạo hiệu ứng "feather" (mép lông vũ) đúng nghĩa, kiểu Photoshop, thay vì chỉ tô màu lên trên.
- Giữ lại `.heroFade` (lớp phủ màu kem) với độ đậm/rộng đã tinh chỉnh, xếp trên cùng `.heroBlurLayer`, để tạo thêm chút gần màu với nền card — 2 lớp cộng hưởng nhau.

### Rủi ro kỹ thuật đã lo và đã xác minh

- `filter: blur()` + `mask-image` là loại hiệu ứng CSS mà `html2canvas` có tiếng là hỗ trợ kém/không đầy đủ (giống bug `object-fit` đã gặp trước đó trong ngày) — nếu không kiểm tra kỹ, rất có thể chỉ đẹp trên preview nhưng file PNG xuất ra lại mất hiệu ứng, quay về đường viền cứng.
- Đã kiểm chứng trực tiếp: gọi luồng xuất PNG thật, hiển thị file xuất ra ngay trên trang để so sánh bằng mắt — **xác nhận hiệu ứng mờ + mask giữ nguyên đúng trong file xuất ra**, không bị mất.
- Test bằng ảnh giả lập nhiều màu/tương phản cao (mô phỏng ảnh trái cây thật) thay vì ảnh gradient mượt như lần test trước — để đánh giá đúng hơn hiệu ứng có thực sự "giấu" được ranh giới hay không trên nội dung phức tạp.

### Kiểm chứng

```bash
npm run verify
```

Kết quả: pass lint, typecheck, build.

## 2026-08-21 - SEO cơ bản: sitemap, robots.txt, dữ liệu có cấu trúc

### Cập nhật

- Thêm `app/sitemap.ts` và `app/robots.ts` — Next.js 16 tự sinh `/sitemap.xml` và `/robots.txt` từ file TypeScript, không phải viết XML tay.
- `robots.txt` chặn `/admin`, `/login`, `/api` để các trang quản trị không lọt vào kết quả tìm kiếm.
- Thêm JSON-LD kiểu `LocalBusiness` vào `app/layout.tsx`: địa chỉ Đường 30/4 (Phú Lợi), giờ mở cửa 10:00-20:00 mọi ngày.

### Thuật ngữ

- **SEO**: tối ưu để máy tìm kiếm hiểu đúng nội dung trang và xếp hạng cao hơn với từ khoá liên quan.
- **Sitemap**: bản đồ liệt kê URL của site, giúp Google dò trang đầy đủ, không bỏ sót.
- **JSON-LD / dữ liệu có cấu trúc**: đoạn dữ liệu máy đọc được mô tả cơ sở kinh doanh, là điều kiện để Google hiển thị thẻ thông tin (rich snippet) thay vì chỉ dòng link xanh.

### Rủi ro

- Thông tin trong JSON-LD sai thì Google hiển thị sai — đã hỏi và lấy đúng thông tin thật từ chủ quán trước khi điền.
- Chưa có số điện thoại nên **cố ý không khai trường `telephone`** thay vì để chuỗi rỗng — khai trường rỗng còn tệ hơn không khai.

### Hướng phát triển

- Điền `telephone` khi có số chính thức.
- Cụm "Đặt trước 30-60 phút" hiện nằm trong phần mô tả vì schema.org không có trường chuẩn cho thời gian đặt trước.

### Kiểm chứng

```bash
npm run verify
```

Pass lint, typecheck, build. Đã mở trực tiếp `/robots.txt`, `/sitemap.xml` và đọc thẻ JSON-LD trong DOM trên cả localhost lẫn bản production.

## 2026-08-21 (tiếp) - Đưa sản phẩm từ file tĩnh vào cơ sở dữ liệu

### Cập nhật

- Thêm model `Product` vào `prisma/schema.prisma`, seed 8 sản phẩm đang có từ `data/home.ts` (`prisma/seed.mjs`).
- `app/page.tsx` chuyển từ Client Component sang Server Component, đọc sản phẩm qua `lib/products.ts`; toàn bộ phần tương tác (lọc danh mục, hiệu ứng thêm giỏ) tách sang `components/home/home-content.tsx`.
- Thêm trang quản trị `/admin/products` với Server Actions thêm/sửa/xoá, và `app/admin/layout.tsx` làm thanh điều hướng dùng chung.
- `/admin` từ chỗ chuyển hướng thẳng sang `/admin/poster` trở thành trang tổng quan thật; đăng nhập trực tiếp (không qua `callbackUrl`) giờ vào `/admin` thay vì lạc về trang chủ.

### Rủi ro

- **Trang chủ bị Next.js dựng sẵn thành tĩnh** (`○ Static` trong bảng route sau khi build) — nghĩa là admin sửa dữ liệu xong trang live vẫn giữ nội dung cũ cho tới lần deploy kế. Phát hiện nhờ đọc bảng route sau `npm run verify` chứ không phải qua thử nghiệm.
- Nút "thêm vào giỏ" ở khối hero trước đây tra tên sản phẩm bằng `id === "p4"`; id giờ do cơ sở dữ liệu sinh (cuid) nên phép so sánh này chết âm thầm — đã đổi sang lấy tên từ chính chuỗi hiển thị của hero.

### Quản trị rủi ro

- Đặt `export const dynamic = "force-dynamic"` cho các trang đọc dữ liệu sống, kiểm chứng lại bằng bảng route (`ƒ Dynamic`).
- Danh mục trong form quản trị là danh sách cố định lấy từ `PRODUCT_CATEGORIES` (chính là `data/home.ts`), không cho gõ tay — gõ sai một ký tự là sản phẩm biến mất khỏi mọi tab lọc ở trang chủ.

### Kiểm chứng

```bash
npm run verify
```

Pass. Đã thử trên preview: lọc danh mục ra đúng dữ liệu từ cơ sở dữ liệu, đổi sang tiếng Anh vẫn dùng đúng bản tĩnh, không lỗi console.

## 2026-08-21 (tiếp) - Thực đơn theo ngày, tủ lạnh và chốt ngày tự động

### Cập nhật

- Thêm `DailyMenuEntry` (mỗi ngày một bộ dòng riêng, khoá duy nhất `[productId, date]`) và `InventoryLoss` (nhật ký hao hụt bắt buộc có lý do).
- Trang chủ đọc theo **thực đơn hôm nay**, bỏ loại đã bán hết; sản phẩm nằm trong danh sách nhưng chưa đưa vào thực đơn thì khách không thấy.
- `/admin/products` dựng lại thành 2 cột: danh sách trái cây bên trái (tìm kiếm, nút thêm vào thực đơn, modal tạo nhanh) và thực đơn hôm nay bên phải (đổi thứ tự, giá, nhập, đã bán, còn lại).
- Thêm tab **Tủ lạnh** (`/admin/fridge`): tồn kho hôm nay, form ghi nhận hư hỏng, nhật ký 7 ngày.
- Chốt ngày qua `app/api/cron/close-day/route.ts` + `vercel.json`, kèm nút bấm tay và dải cảnh báo khi cron lỡ.

### Thuật ngữ

- **Chốt ngày**: không phải xoá thực đơn. Còn lại = nhập − đã bán − hư hỏng; còn > 0 thì loại đó sang thực đơn hôm sau với đúng phần còn lại, còn ≤ 0 thì rời thực đơn. Dòng của ngày cũ giữ nguyên làm lịch sử.
- **Idempotent**: chạy lại nhiều lần cho ra cùng một kết quả, không cộng dồn.

### Rủi ro

- **Múi giờ.** Vercel chạy UTC, quán chạy giờ Việt Nam (UTC+7). Dùng thẳng `new Date()` thì từ 17h chiều giờ Việt Nam máy chủ đã sang ngày mới trong khi quán còn đang bán — thực đơn lệch một ngày một cách âm thầm, rất khó phát hiện về sau.
- Cron chết mà không ai biết thì sáng hôm sau thực đơn trống và trang chủ trắng sản phẩm.
- Trừ kho và ghi nhật ký hao hụt mà tách rời nhau thì một lần lỗi giữa chừng sẽ để lại kho bị trừ nhưng không có dòng nào giải thích.

### Quản trị rủi ro

- Gom mọi khái niệm "hôm nay" vào `lib/date-vn.ts`, cron đặt `0 17 * * *` (17:00 UTC = 00:00 giờ Việt Nam).
- Nhờ khoá duy nhất `[productId, date]`, chạy cron hai lần chỉ ghi đè đúng một dòng — đã kiểm chứng bằng cách gọi endpoint lần thứ hai.
- `getPendingCarryDate()` phát hiện tình trạng chưa chốt và hiện dải cảnh báo vàng kèm nút bấm tay, để admin thấy trước khi khách thấy.
- `reportSpoilage` gói cả hai thao tác vào một `$transaction`.

### Kiểm chứng

```bash
npm run verify
```

Pass. Dựng kịch bản 3 loại rồi gọi thật endpoint chốt ngày:

- nhập 1000g, bán 300g → chuyển sang hôm nay đúng 700g, đã bán/hư hỏng về 0;
- bán hết → rời thực đơn;
- hỏng hết phần còn lại → rời thực đơn;
- gọi lại lần hai → vẫn một dòng, không nhân đôi;
- thiếu hoặc sai `CRON_SECRET` → HTTP 401.

Dữ liệu thử đã dọn sạch khỏi cơ sở dữ liệu sau khi kiểm chứng.

## 2026-08-21 (tiếp) - Sửa sai thiết kế: định lượng luôn tính bằng gram

### Cập nhật

- Gỡ hoàn toàn khái niệm "đơn vị bán" (kg/hộp/ly/set) khỏi phần định lượng. Mọi ô nhập và hiển thị đều là gram.
- Bỏ ô chọn đơn vị khỏi form thêm/sửa sản phẩm; `lib/qty.ts` rút gọn còn `DEFAULT_QTY_GRAMS` và `formatGrams`.

### Vì sao phải sửa

- Bản thiết kế bàn giao mô tả hàng cân (ổi, xoài nguyên trái) nên đặt ra khái niệm đơn vị. Áp nguyên si vào đây là sai: trái cây nhập về **luôn** là hàng cân, bán ra dưới dạng hộp hay ly chỉ là chuyện đóng gói. Kết quả là giao diện hiện những dòng vô nghĩa như "Hộp quà trái cây mini: nhập 1000g", rồi sau khi sửa nửa vời thành "10 set" thì vẫn sai bản chất.
- **Bài học**: bản thiết kế bàn giao mô tả một hoàn cảnh cụ thể; trước khi bê nguyên một khái niệm trong đó vào, phải kiểm tra xem hoàn cảnh ấy có đúng với dữ liệu thật của dự án không. Catalog lúc đó toàn hàng đóng sẵn — đọc qua dữ liệu là thấy ngay.

### Rủi ro

- Khi mỗi loại một đơn vị, các thẻ chỉ số cộng gộp số lượng cho ra con số vô nghĩa ("500g xoài + 2 hộp quà = 502"). Lỗi này lọt qua hai lần rà soát vì chỉ nhìn từng dòng chứ không nhìn phần tổng hợp.

### Quản trị rủi ro

- Sau khi thống nhất một đơn vị, các số tổng hợp lại cộng được. Tủ lạnh hiện hao hụt theo gram kèm **tỷ lệ trên tổng bày bán** — 500g hỏng trên 1kg khác hẳn 500g hỏng trên 20kg, chỉ con số tuyệt đối thì không nói lên điều gì.
- Bỏ mục "doanh thu tạm tính": lượng bán tính bằng gram còn giá là giá một phần bán cho khách, nhân hai thứ đó ra số sai. Thà không hiện còn hơn hiện số sai.
- Cột `Product.unit` tạm giữ lại trong cơ sở dữ liệu (không còn dùng ở đâu) để tránh migration phá bản đang chạy.

### Kiểm chứng

```bash
npm run verify
```

Pass. Đưa dữ liệu 4 dòng thực đơn về 1000g và xem lại trên preview.

## 2026-08-21 (tiếp) - Nối phần "Tự tay ghép hộp" vào thực đơn

### Cập nhật

- `data/fruit-box.ts` thêm `fruitBoxItemsFromProducts()`; `FruitBoxSection` nhận danh sách qua props thay vì tự đọc file tĩnh.
- Thêm trạng thái rỗng khi hôm nay chưa có gì để ghép.

### Vì sao

- Mục này vẫn cho khách chọn từ 8 loại viết cứng trong code (Kiwi, Dâu tây, Nho...) không liên quan gì tới thực đơn hay tồn kho — khách ghép được hộp bằng những loại quán không hề có, và admin không có cách nào sửa. Đây là phần sót lại khi chuyển trang chủ sang đọc cơ sở dữ liệu: chỉ nhìn khu sản phẩm mà quên rằng trang chủ còn một chỗ khác cũng liệt kê trái cây.

### Rủi ro

- Tên hiển thị giờ là tên sản phẩm đầy đủ ("Xoài cát Hòa Lộc" thay vì "Xoài"), dài hơn trong ô vuông nhỏ. Đã hỏi và chủ quán chọn giữ tên đầy đủ.
- `pricePerPart` và `fee` khai báo trong `data/fruit-box.ts` nhưng không được dùng ở đâu trong giao diện — nút "Đặt hộp này" mới chỉ bật thông báo "sắp ra mắt". Phần giá của tính năng này vẫn bỏ ngỏ.

### Quản trị rủi ro

- Màu nền từng loại chọn theo id sản phẩm, để một loại luôn giữ đúng một màu dù thứ tự thực đơn thay đổi.

### Kiểm chứng

```bash
npm run verify
```

Pass. Đã đối chiếu trên preview: phần ghép hộp hiện đúng các loại đang có trong thực đơn hôm nay.

## 2026-08-21 (tiếp) - Tab thống kê theo tháng và dọn code chết

### Cập nhật

- Thêm `lib/stats.ts` và `/admin/stats`: lượng bán, tổng bày bán, hao hụt, tỷ lệ hao hụt, tỷ lệ bán được, biểu đồ cột theo tuần (CSS thuần), xếp hạng bán chạy, hao hụt tách theo lý do. Ô chọn tháng lọc thật qua query `?thang=YYYY-MM`.
- Xoá mảng `products` tiếng Việt trong `data/home.ts` (đã thành code chết vì trang chủ đọc từ cơ sở dữ liệu); tách danh sách tiếng Anh thành `EN_PRODUCTS` riêng và bỏ `products` khỏi kiểu `HomeContent`.

### Vì sao không làm giao diện tĩnh như bản bàn giao đề xuất

- Bản bàn giao cho rằng phải có bảng đơn hàng mới tính được số thật. Nhận định đó không còn đúng sau khi mỗi ngày đều lưu lượng bán và hao hụt — dữ liệu đã đủ, dựng số giả sẽ lãng phí và gây hiểu nhầm.

### Rủi ro

- Hàng tồn được chuyển tiếp sang hôm sau, nên cùng một lượng trái cây được tính vào "tổng bày bán" của nhiều ngày. Các tỷ lệ vì thế là so với lượng bày bán mỗi ngày, **không phải** lượng nhập mới trong tháng — đã ghi chú thẳng dưới trang để không ai đọc nhầm thành báo cáo nhập hàng.
- Bản tiếng Anh của trang chủ vẫn dùng danh sách tĩnh, không theo tồn kho thật. Chấp nhận theo phạm vi đã thống nhất (chỉ quản lý bản tiếng Việt), nhưng sẽ thành vấn đề nếu có khách nước ngoài thật.

### Hướng phát triển

- Muốn có doanh thu thì phải chốt giá theo kg trước, khi đó giá hiển thị cho khách trên trang chủ cũng thành giá/kg.
- Bản tiếng Anh nên đọc từ cơ sở dữ liệu nếu tính năng song ngữ được dùng thật.

### Kiểm chứng

```bash
npm run verify
```

Pass. Kiểm chứng phần rủi ro nhất là truy vấn theo mốc ngày UTC: khoảng 01/08-01/09 lấy đúng các dòng của ngày 21/08, và ngày 21 rơi đúng vào cột T3 (15-21). Đã đối chiếu cả hai ngôn ngữ trên preview sau khi dọn `data/home.ts`.

## 2026-08-21 (tiếp) - Ghi chú kỹ thuật gặp trong ngày

Những chỗ mất thời gian, ghi lại để lần sau không vấp lại:

- **Next.js 16 giữ typegen cũ.** Xoá một trang (`app/admin/products/new/page.tsx`) rồi chạy typecheck vẫn báo `Cannot find module '../../app/admin/products/new/page.js'` — do `.next/types/validator.ts` còn tham chiếu trang đã xoá. Xoá `.next` và `tsconfig.tsbuildinfo` rồi build lại. Lưu ý xoá `.next` khi dev server còn chạy sẽ làm hỏng cache Turbopack (log đầy `Compaction failed`), phải tắt server trước.
- **File `"use server"` chỉ được export async function.** Khai một hằng số trong đó là lỗi build. Tách sang file `constants.ts` riêng — dự án đã có tiền lệ ở `app/register/constants.ts`.
- **Quy tắc lint chặn `setState` trong `useEffect`.** Thay vì đồng bộ state theo props bằng effect, đặt `key` của component gộp cả số liệu máy chủ — dữ liệu đổi thì component tự dựng lại và ô nhập lấy giá trị mới. Không cần effect, không có render dây chuyền.
- **Không truyền hàm từ Server Component sang Client Component.** Props phải chuyển được thành dữ liệu thuần. Tính sẵn nhãn ở phía máy chủ rồi truyền mảng dữ liệu.
- **Prisma CLI không đọc `.env.local`.** Dùng `set -a && source .env.local && set +a && npx prisma ...` — đã ghi ở mục trước, nhắc lại vì vẫn dễ quên.

### Việc còn treo

- **Chưa đặt `CRON_SECRET` trên Vercel** — endpoint chốt ngày đang trả HTTP 500 kèm thông báo thiếu cấu hình. Phải đặt trước khi cron chạy lần đầu, nếu không thực đơn sáng hôm sau phải chuyển tay.
- Cột `Product.unit` còn trong cơ sở dữ liệu nhưng không còn dùng — xoá bằng migration khi chắc chắn không cần.

## 2026-08-21 - Bước 1/7: đổi tên tab "Sản phẩm" thành "Daily menu"

### Cập nhật

- `app/admin/products/` đổi tên thư mục thành `app/admin/menu/` (dùng `git mv` để giữ lịch sử file).
- Cập nhật mọi tham chiếu `/admin/products` → `/admin/menu`: `app/admin/layout.tsx`, `app/admin/page.tsx`, `app/admin/menu/[id]/edit/page.tsx`, `app/admin/fridge/actions.ts`, `app/api/cron/close-day/route.ts`, và 5 component trong `components/admin/`.
- Đổi nhãn hiển thị "Sản phẩm" → "Daily menu" ở thanh điều hướng quản trị và ở thẻ điều hướng trong trang Tổng quan.
- Chưa đụng vào schema, logic hay giao diện bên trong trang — thuần đổi tên.

### Thuật ngữ

- **Route**: đường dẫn URL của một trang; trong Next.js App Router, tên thư mục trong `app/` chính là đường dẫn.
- **`revalidatePath`**: lệnh bảo Next.js làm mới bộ nhớ đệm của một đường dẫn. Đổi tên thư mục mà quên sửa lệnh này thì trang cũ vẫn được làm mới, còn trang mới thì không — dữ liệu hiển thị sẽ cũ mà không báo lỗi.

### Công dụng

- Tên tab khớp với vai trò thật của trang trong thiết kế mới: nơi chọn lọc thực đơn mỗi ngày, không phải nơi quản lý danh mục sản phẩm chung chung.
- Tách riêng bước đổi tên khỏi bước đổi kiến trúc, để nếu bước sau có sai thì vẫn phân biệt được lỗi do đâu.

### Lợi ích

- Bước nhỏ, không rủi ro dữ liệu, quay đầu chỉ bằng một lệnh `git revert`.
- Dọn sẵn đường dẫn trước khi viết lại nội dung trang ở bước 4.

### Rủi ro

- Ai đã lưu bookmark `/admin/products` sẽ gặp lỗi 404 (không có redirect). Chấp nhận được vì chỉ một người dùng khu vực quản trị.
- Đổi tên thư mục làm typegen của Next.js 16 trở nên lỗi thời.

### Quản trị rủi ro

- Đã đổi toàn bộ tham chiếu bằng tìm kiếm toàn dự án (`grep -rn "admin/products"`), kiểm tra lại sau khi đổi thấy không còn kết quả nào.

### Hướng phát triển

- Bước 2: tách định lượng ra khỏi `DailyMenuEntry`, đưa về `Product.stockGrams` làm tồn kho chạy dài, thêm bảng nhật ký biến động kho.

### Kiểm chứng

- `npm run verify` lần đầu báo `Cannot find module '../../app/admin/products/[id]/edit/page.js'` trong `.next/types/validator.ts` — đúng cái bẫy typegen cũ đã ghi ở mục 2026-07-09. Xoá `.next` và `tsconfig.tsbuildinfo` rồi chạy lại: lint → typecheck → build đều xanh, danh sách route in ra đã là `/admin/menu` và `/admin/menu/[id]/edit`.

## 2026-08-21 - Bước 2/7: tách tồn kho ra khỏi thực đơn theo ngày

### Cập nhật

- `prisma/schema.prisma`: thêm `Product.stockGrams` (mặc định 0) và model mới `StockMovement` (`productId`, `date`, `kind`, `amountGrams`, `deltaGrams`, `reason`, `note`). Migration `20260821072723_add_stock_and_movements`.
- **Chỉ thêm, không xoá.** `DailyMenuEntry.qtyGrams/soldGrams/spoiledGrams/priceToday` và bảng `InventoryLoss` vẫn còn nguyên, code cũ vẫn chạy y như trước.
- `prisma/backup.mjs`: sao lưu toàn bộ 4 bảng ra `backups/neon-<timestamp>.json`. Thư mục `backups/` đã thêm vào `.gitignore`.
- `prisma/backfill-stock.mjs`: nạp `stockGrams` = phần còn lại của dòng thực đơn mới nhất mỗi loại, sinh dòng `IMPORT` tương ứng, và chép `InventoryLoss` cũ sang `StockMovement` kind `LOSS`.
- `lib/stock.ts` (mới): `applyStockMovement` và `applyStockMovements` — cửa ngõ duy nhất để thay đổi tồn kho.

### Thuật ngữ

- **Expand / migrate / contract**: cách đổi cấu trúc database an toàn theo ba nhịp — *mở rộng* (thêm cột mới, giữ cột cũ), *chuyển* (đổi từng nơi dùng sang cột mới), *thu hẹp* (xoá cột cũ khi không còn ai dùng). Bước 2 này mới là nhịp đầu, nên không có lúc nào hệ thống bị gãy.
- **Transaction**: nhóm nhiều lệnh ghi database thành một khối "được ăn cả, ngã về không". Nửa chừng lỗi thì mọi thứ quay lại như cũ.
- **Backfill**: nạp dữ liệu cho cột vừa thêm, dựa trên dữ liệu cũ đã có.
- **`deltaGrams`**: chênh lệch thực tế đã áp vào kho (dương = cộng, âm = trừ). `amountGrams` luôn dương, hướng nằm ở `kind` — nhờ vậy cộng thống kê không phải nhớ quy ước dấu riêng cho từng loại.

### Công dụng

- Tồn kho thôi bị gắn vào *ngày*, chuyển sang gắn vào *trái cây*. Đây là chỗ sai gốc sinh ra cron "chốt ngày": trước đây mỗi sáng phải bê số tồn sang dòng mới, giờ số tồn tự nó chạy dài.
- Quy tắc "hết hàng thì tự tắt khỏi menu" rút gọn còn một phép so sánh `stockGrams > 0`, không cần job nền nào.
- `StockMovement` cho phép truy ngược: tồn kho sai thì dò được đúng thao tác nào gây ra.

### Lợi ích

- `Product.stockGrams` luôn bằng tổng `deltaGrams` của các dòng nhật ký — có thể viết script đối chiếu bất cứ lúc nào.
- `applyStockMovements` kiểm tra đủ hàng cho *tất cả* các loại trước khi ghi, nên chốt một hộp nhiều loại mà thiếu một loại thì cả đơn không chốt, không có chuyện trừ được nửa chừng rồi kẹt.
- Chặn tồn kho âm ngay tại cửa ngõ.

### Rủi ro

- Local dev và production dùng chung một database Neon, nên migration này chạm thẳng dữ liệu đang chạy thật.
- Cron `/api/cron/close-day` **vẫn đang chạy theo mô hình cũ**. Đêm nay lúc 00:00 nó vẫn sinh dòng thực đơn mới với `qtyGrams` kiểu cũ, không biết gì về `stockGrams` — hai con số sẽ lệch nhau cho tới khi bước 4 viết lại nó.
- Hiện có hai nơi ghi hao hụt (`InventoryLoss` qua `reportSpoilage`, và `StockMovement` qua `lib/stock.ts`). Cho tới bước 3, ghi hư hỏng ở tab Tủ lạnh **chỉ trừ `spoiledGrams` cũ, không trừ `stockGrams`**.

### Quản trị rủi ro

- Đã sao lưu đầy đủ trước khi migrate: `backups/neon-2026-08-21T07-25-46-364Z.json` (4 Product · 4 DailyMenuEntry · 1 InventoryLoss · 0 User).
- Đã in bảng đối chiếu số liệu chuyển đổi và được duyệt trước khi ghi vào database.
- `backfill-stock.mjs` chạy lại nhiều lần không nhân đôi (xoá sạch `StockMovement` trước khi ghi).
- Hai rủi ro lệch số ở trên đều được đóng lại ở bước 3 và 4, và dữ liệu hiện tại gần như là dữ liệu thử nên lệch cũng không mất mát gì thật.

### Hướng phát triển

- Bước 3: viết lại tab Tủ lạnh trên nền `lib/stock.ts` — nhập hàng, trừ hao hụt (Thảo ăn, hư/dập), nhật ký biến động.
- Bước 4: `DailyMenuEntry` rút gọn còn "hôm nay bày bán loại nào", cron đổi thành chỉ bê danh sách (không bê định lượng).
- Nhịp *contract*: xoá `qtyGrams/soldGrams/spoiledGrams/priceToday` và bảng `InventoryLoss` sau khi bước 3–5 xong.

### Kiểm chứng

- `npx prisma migrate dev` áp migration thành công, Prisma Client sinh lại sạch.
- `backfill-stock.mjs` in ra đúng số đã duyệt: Xoài cát Hòa Lộc 0g (đã ghi hỏng hết 1000g), ba loại còn lại mỗi loại 1000g; 4 dòng `StockMovement`.
- `npm run verify` xanh cả ba chặng lint → typecheck → build.

## 2026-08-21 - Bước 3/7: viết lại tab Tủ lạnh trên nền lib/stock.ts

### Cập nhật

- `app/admin/fridge/constants.ts`: thay `SPOILAGE_REASONS` bằng `FRIDGE_ACTIONS` — một danh sách thao tác duy nhất gồm Nhập thêm hàng · Bán tại chỗ · Thảo ăn · Hư/dập · Hết hạn · Lý do khác · Đếm lại sửa tồn thành.
- `app/admin/fridge/actions.ts`: `reportSpoilage` được thay bằng `recordFridgeChange`, gọi xuống `applyStockMovement`.
- `components/admin/fridge-row.tsx` (mới) thay cho `components/admin/spoilage-form.tsx` (đã xoá).
- `app/admin/fridge/page.tsx`: liệt kê **toàn bộ** trái cây theo `Product.stockGrams` (trước đây chỉ liệt kê loại có trong thực đơn hôm nay), thêm nhãn trạng thái Khách đang thấy / Chưa lên menu / Hết hàng, và nhật ký đọc từ `StockMovement`.
- `lib/products.ts`: điều kiện lọc đổi từ `qtyGrams − soldGrams − spoiledGrams > 0` sang `product.stockGrams > 0`.

### Thuật ngữ

- **Server Action**: hàm chạy trên máy chủ nhưng gọi được thẳng từ nút bấm trong trình duyệt, không cần tự viết API.
- **`revalidatePath`**: bảo Next.js vứt bộ nhớ đệm của một đường dẫn để lần vào sau đọc lại dữ liệu mới.
- **Thao tác "Đếm lại"**: admin nhập số gram *thật sự* vừa đếm được trong tủ, máy tự tính chênh lệch rồi ghi một dòng `ADJUST`. Bắt admin tự tính chênh lệch là cách chắc chắn nhất để có số sai.

### Công dụng

- Tủ lạnh từ chỗ chỉ là màn hình *xem* đã thành nơi **nhập liệu thật**: cộng hàng vào, trừ hàng ra, mỗi lần đều có lý do.
- Danh sách không còn phụ thuộc vào thực đơn hôm nay, nên mua hàng về là nhập được ngay, chưa cần đưa lên menu.
- Đóng lại lỗ hổng số 2 của bước 2: trang chủ giờ đọc thẳng tồn kho, nên "hết ổi thì ổi biến mất khỏi trang khách" đã chạy thật.

### Lợi ích

- Không nơi nào ghi thẳng vào `stockGrams`; mọi thay đổi đều qua `lib/stock.ts` nên luôn có dòng nhật ký giải thích.
- Có "Đếm lại" nên admin không bao giờ phải sửa trần database khi số trên máy lệch số thật.
- Tỷ lệ hao hụt tính trên *lượng nhập trong tuần* chứ không trên lượng nhập một ngày — mẫu số trung thực hơn.

### Rủi ro

- `DailyMenuEntry.soldGrams/spoiledGrams` giờ **không còn ai ghi vào nữa**, nhưng vẫn còn được đọc ở `app/admin/page.tsx` (thẻ "Đã bán hôm nay") và `lib/stats.ts`. Hai chỗ này sẽ đứng im ở số cũ cho tới khi chuyển sang đọc `StockMovement`.
- Cron `/api/cron/close-day` vẫn chạy theo mô hình cũ (rủi ro còn nguyên từ bước 2), sẽ xử lý ở bước 4.
- Bảng `InventoryLoss` không còn được ghi vào; dữ liệu cũ đã chép sang `StockMovement` ở bước 2.

### Quản trị rủi ro

- Chỉ thay phần ghi, chưa xoá cột nào — số cũ vẫn nằm nguyên trong database nếu cần đối chiếu.
- `applyStockMovement` chặn tồn kho âm, nên gõ nhầm số lớn sẽ bị từ chối kèm thông báo rõ còn bao nhiêu.
- Thao tác "Lý do khác" bắt buộc phải ghi rõ lý do mới cho ghi nhận.

### Hướng phát triển

- Bước 4: viết lại Daily menu (thêm trái cây + ảnh, kéo thả vào menu), rút gọn `DailyMenuEntry`, đổi cron thành chỉ bê danh sách.

### Kiểm chứng

- `npm run verify` xanh cả ba chặng.
- Mở trang chủ thật ở `localhost:3000`: **Xoài cát Hòa Lộc biến mất khỏi cả lưới sản phẩm lẫn phần ghép hộp**, đúng như mong đợi vì `stockGrams = 0`; ba loại còn hàng vẫn hiện. Đây là bằng chứng quy tắc `stockGrams > 0` chạy thật, không chỉ biên dịch được.
- Lưu ý vận hành: xoá `.next` trong lúc dev server đang chạy làm hỏng cache Turbopack của tiến trình đó — trang trả `Internal Server Error` cho tới khi khởi động lại server. Đúng cái bẫy đã ghi ở mục 2026-07-09, đã dính lại lần nữa ở bước 1.

### Điều chỉnh sau khi dùng thử (cùng ngày)

- Bốn thẻ KPI bày sẵn và mục "Nhật ký kho" dài được gộp vào **một nút "📊 Thống kê"** bật/tắt (`components/admin/fridge-stats.tsx`), có hai chế độ xem: **Hôm nay** và **7 ngày qua**.
- Chỉ còn một dòng số liệu luôn hiện: tổng đang có trong tủ và số loại còn hàng.
- Lý do: việc chính ở tab Tủ lạnh là *nhập liệu*. Bày số liệu thường trực làm rối mắt và đẩy danh sách trái cây xuống dưới màn hình. Số liệu chỉ cần khi muốn xem.
- Lọc theo ngày làm ở phía trình duyệt bằng cách so sánh chuỗi `"2026-08-21"` thay vì so `Date` — đổi qua lại giữa hai chế độ xem không phải gọi lại máy chủ, và không có chỗ nào để múi giờ chen vào làm lệch ngày.

## 2026-08-21 - Bước 4/7: viết lại Daily menu, thêm ảnh và kéo thả

### Cập nhật

- `lib/upload.ts` (mới): tải ảnh lên Vercel Blob, có `isBlobConfigured()` để giao diện tự biết đã bật kho ảnh hay chưa. Cài thêm gói `@vercel/blob`.
- `next.config.ts`: khai báo `images.remotePatterns` cho `*.public.blob.vercel-storage.com`.
- `components/admin/product-image-field.tsx` (mới): ô chọn ảnh dùng chung cho form thêm và form sửa, có xem trước.
- `components/admin/catalog-panel.tsx`: đổi tiêu đề thành "Trái cây tổng", hiện ảnh thật, hiện tồn kho ngay trên thẻ, và thẻ **kéo được**.
- `components/admin/menu-panel.tsx`: viết lại hoàn toàn. Bỏ hết ô giá / nhập / đã bán; giờ chỉ còn tên, mô tả và trạng thái tồn kho. Là **vùng thả** để nhận thẻ kéo từ bên trái, và kéo đổi thứ tự ngay trong bảng.
- `app/admin/menu/actions.ts`: `createProduct`/`updateProduct` nhận ảnh; thêm `reorderTodayMenu`; bỏ `updateMenuEntry` và `moveMenuEntry`.
- `lib/close-day.ts`: `carryForwardToToday` giờ chỉ bê **danh sách**, không bê định lượng. `getPendingCarryDate` được thay bằng `wasCarriedFromYesterday`.
- `app/admin/page.tsx`: các thẻ số liệu đọc từ `StockMovement` và `Product.stockGrams` thay cho các cột cũ.
- Đã xoá: `carry-action.ts`, `carry-forward-banner.tsx`.

### Thuật ngữ

- **Vercel Blob**: kho file riêng của Vercel. Phải dùng nó vì máy chủ Vercel có ổ đĩa **chỉ đọc** — file ghi vào `public/` lúc chạy sẽ biến mất ở lần deploy kế tiếp.
- **`dataTransfer`**: túi dữ liệu trình duyệt mang theo trong lúc kéo thả. Đặt một định dạng riêng (`application/x-gotgoine-product`) để bảng thực đơn không nhận nhầm thứ kéo từ nơi khác vào.
- **`remotePatterns`**: danh sách tên miền mà Next.js cho phép `<Image>` tải ảnh về. Mặc định chặn hết để website không bị lợi dụng làm máy chủ trung chuyển ảnh.

### Công dụng

- Daily menu giờ đúng vai trò anh mô tả: bên trái là cơ sở dữ liệu trái cây tổng (thêm mới kèm **tên, mô tả, ảnh**), bên phải là thực đơn hôm nay, chuyển qua lại bằng kéo thả.
- Bảng thực đơn không còn ô định lượng nào — định lượng đã về hẳn tủ lạnh, không còn hai nơi cùng giữ một con số.
- Mỗi dòng thực đơn hiện thẳng tồn kho: còn hàng thì "Còn 1500g", hết thì "Hết hàng · khách không thấy". Nhìn là biết khách đang thấy gì.

### Lợi ích

- Tính năng ảnh **dùng được ngay** dù chưa dựng Blob: chưa có token thì ô tải file bị khoá và admin dán link ảnh, có token rồi thì tải file chạy luôn, không phải sửa code.
- `reorderTodayMenu` nhận nguyên mảng id theo thứ tự mới thay vì "đổi chỗ hai dòng liền kề" — kéo một dòng từ cuối lên đầu chỉ tốn một lần gọi máy chủ.
- Chốt ngày đơn giản hẳn: không còn phép tính tồn nào, chỉ là "hôm qua bày loại nào, còn hàng thì hôm nay bày tiếp".

### Rủi ro

- **Chưa bật Vercel Blob** nên tải file lên chưa chạy được; hiện chỉ dán link ảnh. Cần tạo Blob store trên Vercel rồi thêm `BLOB_READ_WRITE_TOKEN`.
- Ảnh xem trước trong form và ảnh trong bảng quản trị dùng `<img>` thường thay vì `<Image>` (đã tắt cảnh báo eslint tại chỗ) — vì link ảnh dán vào có thể thuộc tên miền bất kỳ chưa khai báo. Ảnh hiển thị cho khách vẫn đi qua `<Image>`.
- Kéo thả bằng HTML5 **không hoạt động trên màn hình cảm ứng**. Vì vậy nút "+ Thêm" và nút "×" vẫn được giữ nguyên làm đường đi thay thế, không bỏ.
- `DailyMenuEntry.priceToday/qtyGrams/soldGrams/spoiledGrams` vẫn còn trong database và vẫn được ghi giá trị khi thêm dòng mới (vì đang là cột bắt buộc), nhưng **không còn ai đọc để ra quyết định**. Sẽ xoá ở nhịp thu hẹp.
- `lib/stats.ts` (tab Thống kê) vẫn đọc các cột cũ nên số liệu ở đó đứng im.

### Quản trị rủi ro

- Ô dán link ảnh kiểm tra phải bắt đầu bằng `http://` hoặc `https://` mới nhận.
- Tải file giới hạn 4MB và chỉ nhận JPG/PNG/WEBP/AVIF.
- `addRandomSuffix` khi tải lên, để hai lần tải trùng tên file không đè lên nhau — ảnh cũ có thể vẫn đang được dùng ở chỗ khác.
- Thanh thông báo "Thực đơn này đang y nguyên từ hôm qua" nhắc admin xem lại menu đầu ngày, đúng yêu cầu "vẫn phải cập nhật menu mỗi ngày".

### Hướng phát triển

- Bước 5: trang chủ hiển thị ảnh thật + tên + mô tả, bỏ giá từng loại (giá tính theo cỡ hộp).
- Bước 6: tab Báo giá — chọn cỡ hộp, chọn trái, máy chia gram đều, chốt đơn thì trừ kho qua `applyStockMovements`.

### Kiểm chứng

- `npm run verify` xanh cả ba chặng.

### Bổ sung: nén ảnh ở phía trình duyệt (`lib/compress-image.ts`)

- Ảnh được thu nhỏ về tối đa 1200px, **cắt vuông từ giữa**, nén thành JPEG chất lượng 0.82 **ngay trên máy admin**, trước khi gửi đi. Kết quả điển hình: 4MB → ~150KB.
- File đã nén được **đặt ngược vào chính ô `<input type="file">`** bằng `DataTransfer`, nên form vẫn gửi như bình thường, không cần thêm ô ẩn nào, và ảnh xem trước đúng là ảnh sẽ được lưu.
- Chạy chung một đường cho mọi nguồn ảnh — iPhone, máy Mac, ảnh tải từ mạng — không phân biệt thiết bị.

**Vì sao đáng làm:** ảnh chỉ hiển thị trong ô vuông cỡ 150px; tải lên 4MB để hiện ở 150px là lãng phí hàng chục lần. Ngoài ra máy chủ Vercel chỉ nhận request tối đa 4.5MB — ảnh iPhone 12MP thường 3–5MB, tức là đụng trần. Nén trước ở máy khách xoá luôn cả hai vấn đề, đồng thời tự thoát bẫy HEIC (canvas luôn xuất ra JPEG).

**Rủi ro và cách xử lý:**
- Cắt vuông từ giữa có thể cắt mất trái cây nằm lệch góc → hiện ô xem trước ngay sau khi chọn để admin thấy và đổi ảnh khác. Công cụ kéo khung cắt bằng tay để dành làm sau.
- Chrome/Firefox trên máy tính **không giải mã được HEIC** → bắt lỗi rồi trả về file gốc kèm thông báo hướng dẫn, thay vì chặn im lặng.
- Ảnh PNG nền trong suốt khi xuất sang JPEG sẽ ra nền đen → đã tô nền trắng trước khi vẽ.
- Ảnh vốn đã rất nhỏ mà nén xong lại to hơn → giữ nguyên bản gốc.

## 2026-08-21 - Bước 5/7: trang khách hiển thị ảnh thật, bỏ giá từng loại

### Cập nhật

- `data/home.ts`: kiểu `Product` thêm `imageUrl`.
- `lib/products.ts`: `getTodayMenu` trả kèm `imageUrl`.
- `data/fruit-box.ts`: `fruitBoxItemsFromProducts` truyền ảnh xuống phần ghép hộp (trường `image` vốn đã có sẵn nhưng chưa ai truyền vào).
- `components/home/products-section.tsx`: có ảnh thì hiện ảnh trong khung vuông, không có thì giữ emoji như cũ. **Bỏ hẳn `home-p-price` và `home-p-weight`.**
- `app/home.css`: thêm `.home-p-photo` (khung vuông, `object-fit: cover`); `.home-p-footer` đổi sang `justify-content: flex-end` vì chân thẻ giờ chỉ còn nút thêm.
- `lib/image-url.ts` (mới): quyết định ảnh nào đi qua bộ tối ưu của Next, ảnh nào không.

### Thuật ngữ

- **`next/image` + `remotePatterns`**: Next.js chỉ tối ưu ảnh từ tên miền đã khai báo, để website không bị người ngoài lợi dụng làm máy chủ trung chuyển ảnh.
- **`unoptimized`**: bảo `<Image>` tải thẳng ảnh, bỏ qua bộ tối ưu — và bỏ qua luôn việc kiểm tra tên miền.

### Công dụng

- Khách nhìn thấy đúng ba thứ anh yêu cầu: **ảnh · tên · mô tả**. Không còn giá lẻ từng loại, vì giá bán tính theo cỡ hộp.
- Ảnh admin tải lên ở tab Daily menu tự hiện ở cả hai chỗ trang khách, không phải tải lên hai lần.

### Rủi ro

- **Lỗi đã phát hiện và sửa ngay trong bước này:** admin được phép dán link ảnh bất kỳ, nhưng `next/image` chỉ chấp nhận tên miền đã khai báo → ảnh dán link sẽ hỏng im lặng, chỉ hiện ô trống. Đã sửa bằng `lib/image-url.ts`: ảnh trong kho Blob (hoặc trong `public/`) thì tối ưu bình thường, ảnh ngoài thì đặt `unoptimized`. Đổi lại ảnh ngoài không được thu nhỏ tự động — chấp nhận được vì đó chỉ là đường tạm trong lúc chưa bật Blob.
- **Hiện khách không thấy giá ở bất kỳ đâu.** Thẻ trái cây đã bỏ giá, mà cỡ hộp thì chưa gắn giá. Khoảng trống này đóng lại ở bước 6.
- `EN_PRODUCTS` (tiếng Anh, tĩnh) vẫn còn trường `price` nhưng không còn được hiển thị.

### Kiểm chứng

- `npm run verify` xanh.
- Gán tạm một ảnh thật cho "Xoài cát Hòa Lộc" rồi kiểm tra HTML máy chủ trả về: có `home-p-photo` kèm thẻ `<img>`, `home-p-price` và `home-p-weight` đều **0 lần xuất hiện**. Bộ tối ưu ảnh `/_next/image` trả `HTTP 200 · image/jpeg · 35965 byte`. Đã gỡ ảnh thử và xoá script sau khi kiểm tra.
- Lưu ý công cụ: khung xem trước trong Claude Code báo `window.innerWidth = 0` và `getBoundingClientRect` cho số đo sai (thẻ 110px, ảnh 52px) khi pane đang ẩn — cùng họ với lỗi `document.hidden` đã ghi trước đây. **Đừng tin số đo bố cục lấy từ pane đang ẩn**; dùng `curl` vào HTML và kiểm tra CSS trực tiếp thì chắc chắn hơn.
