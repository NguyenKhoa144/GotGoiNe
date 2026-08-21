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

- `Product` is the catalogue: every fruit the shop has ever sold. It also
  owns **`stockGrams` — the single source of truth for what's in the
  fridge**, a running balance that carries across days on its own.
- `StockMovement` is the ledger: one row per change, `kind` being
  `IMPORT` / `SALE` / `LOSS` / `ADJUST`. `stockGrams` always equals the sum
  of their `deltaGrams`, so a wrong number can be traced to the operation
  that caused it.
- `DailyMenuEntry` holds **no quantities**. It only answers "is this fruit
  on display today". One row per product per day
  (`@@unique([productId, date])`); old days are kept as history.
- `InventoryLoss` is the old spoilage log, superseded by `StockMovement`
  (`kind: "LOSS"`). Nothing writes to it any more.

At 00:00 Vietnam time a Vercel Cron hits `/api/cron/close-day`, which now
only carries the **list** forward: yesterday's fruit stays on today's menu
if the fridge still has some. Nothing is deleted, no quantity is computed.

**The Vietnamese landing page renders today's menu**, not `Product` rows.
A fruit is visible only when it is on today's menu **and** `stockGrams > 0`
— that one condition is the whole "sold out disappears, restocked
reappears" rule, no background job involved. Both the product grid and the
"Tự tay ghép hộp" builder read the same list; if you add a third place that
lists fruit, wire it to the same source.

### Invariants — breaking these has caused real bugs

- **Quantities are always grams.** Fruit comes in by weight; selling it as
  boxes is packaging. Do not reintroduce per-product selling units.
- **Never write `Product.stockGrams` directly.** Every change goes through
  `lib/stock.ts`, so it always carries a ledger row explaining why. Writing
  it raw is how a stock number becomes untraceable.
- **Customers are never shown a per-fruit price.** Pricing is per box size;
  fruit cards show image, name and description only.
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
- `app/admin/*` — Tổng quan · **Daily menu** (`/admin/menu`: catalogue +
  today's menu, drag & drop) · Tủ lạnh (stock in/out + ledger) · Thống kê
  (monthly, **still reading the retired columns — its numbers are stale**) ·
  Poster. Protected by `proxy.ts`.
- `lib/` — `stock.ts` (the only door into inventory), `products.ts` (today's
  menu for the landing page), `upload.ts` + `compress-image.ts` +
  `image-url.ts` (fruit photos), `close-day.ts`, `date-vn.ts`, `stats.ts`,
  `qty.ts`, `money.ts`, `prisma.ts`.
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
