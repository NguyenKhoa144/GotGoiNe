<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project overview

**Gọt Gòi Nè** — a fresh-cut fruit shop in Phú Lợi, Cần Thơ. Public landing
page in Vietnamese/English, plus a password-protected admin area the owner
uses daily to run the shop. Live at https://gotgoine.vercel.app (Vercel,
auto-deploys on push to `main`).

Stack: Next.js 16 (App Router, Turbopack) · React 19 · TypeScript ·
Tailwind v4 + global CSS · Prisma 6 (pinned, **not** 7) · Neon Postgres ·
Auth.js v5. `npm run dev` serves on port 3000; `npm run verify` runs
lint → typecheck → build.

### The core domain model — read this before touching product code

The shop is run as a **daily menu**, not a static catalogue:

- `Product` is the catalogue: every fruit the shop has ever sold.
- `DailyMenuEntry` is one fruit on sale on one specific date, holding
  `qtyGrams` / `soldGrams` / `spoiledGrams` and that day's price. One row
  per product per day (`@@unique([productId, date])`); old days are kept as
  history, never overwritten.
- `InventoryLoss` is the spoilage log — every write-off records a reason.

`còn lại = qtyGrams − soldGrams − spoiledGrams`. At 00:00 Vietnam time a
Vercel Cron hits `/api/cron/close-day`: fruit with stock left carries into
today's menu at exactly that remaining amount (sold/spoiled reset to 0),
fruit at zero drops out of the menu. Closing a day never deletes anything.

**The Vietnamese landing page renders today's menu**, not `Product` rows —
sold-out fruit disappears from the customer's view. Both the product grid
and the "Tự tay ghép hộp" builder read the same list; if you add a third
place that lists fruit, wire it to the same source.

### Invariants — breaking these has caused real bugs

- **Quantities are always grams.** Fruit comes in by weight; selling it as
  boxes is packaging. Do not reintroduce per-product selling units.
- **Never sum quantities across different units, and never multiply grams
  by a per-box price.** If a number cannot be derived honestly, leave it
  out rather than showing a plausible-looking wrong one.
- **Every "today" goes through `lib/date-vn.ts`.** The server runs UTC, the
  shop runs UTC+7 — a bare `new Date()` silently shifts the menu by a day
  from 17:00 Vietnam time onward.
- **Pages reading live data need `export const dynamic = "force-dynamic"`,**
  otherwise Next prerenders them and admin edits never reach the live site.
- Category strings are the join key between admin and the landing page's
  filter tabs — always pick from `PRODUCT_CATEGORIES`, never free text.
- English content is still static (`EN_PRODUCTS` in `data/home.ts`) by the
  owner's choice; only Vietnamese is DB-driven.

### Where things live

- `app/page.tsx` — Server Component, loads today's menu; interactivity lives
  in `components/home/home-content.tsx` (Client).
- `app/admin/*` — Tổng quan · Sản phẩm (catalogue + today's menu) · Tủ lạnh
  (stock & spoilage) · Thống kê (monthly) · Poster. Protected by `proxy.ts`.
- `lib/` — `products.ts` (today's menu for the landing page), `close-day.ts`,
  `date-vn.ts`, `stats.ts`, `qty.ts`, `money.ts`, `prisma.ts`.
- `prisma/*.mjs` — one-off data scripts. Prisma CLI does **not** read
  `.env.local`; run `set -a && source .env.local && set +a && npx prisma ...`.
- One Neon database is shared by production, preview and local dev — local
  writes hit the live site's data.

`docs/refactor-notes.md` is the authoritative chronological log, including
mistakes made and corrected; `docs/project-structure.md` is the deeper
structural reference. Read those before any substantial change.

## Project workflow

- The user is rebuilding programming skills and prefers step-by-step guidance with simple, technically precise explanations.
- For yes/no decisions, explain what the proposal is, why it matters, benefits, risks, and the recommended choice before acting.
- After making code or configuration changes, report what changed and why.
- Double-check changes with the smallest relevant verification command. Prefer `npm run verify` after meaningful code changes.
- Do not proceed to broad refactors until the current step has been checked and the project remains stable.

## Refactor principles

- Split components only along clear product and UI boundaries, so each file has one understandable responsibility.
- Keep data flow explicit and connected. Prefer passing typed props over hidden global coupling unless shared state is truly needed.
- Preserve the current visual design unless the user explicitly asks for UI or color changes.
- Before each refactor step, identify the technical purpose, expected benefit, likely risk, and rollback surface.
- After each refactor step, document what changed, explain relevant technical terms in simple language, and run verification.
- Manage risk proactively: make small changes, avoid mixing visual changes with structural changes, and keep each step independently testable.
- Optimize for long-term development. Avoid over-packaged abstractions that make the project harder to extend, but leave clear paths for cart, ordering, product management, localization, and future backend integration.
