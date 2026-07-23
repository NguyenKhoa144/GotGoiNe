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
