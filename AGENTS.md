<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

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
