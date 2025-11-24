# Repository Guidelines

## Project Structure & Module Organization
- `app/` — Next.js App Router pages and API routes (e.g., `app/api/tasks/route.ts`, dashboard in `app/(dashboard)/`).
- `components/` — Reusable UI and view components (PascalCase, e.g., `TaskBoard.tsx`).
- `lib/` — Framework-agnostic utilities (e.g., `prisma.ts`, `calendar.ts`, `utils.ts`).
- `context/` — Client state stores and React hooks (e.g., `useTaskStore.ts`).
- `types/` — Shared TypeScript types and module augmentations.
- `prisma/` — Prisma schema and migrations (`schema.prisma`).
- Root config: `next.config.mjs`, `tailwind.config.ts`, `postcss.config.mjs`, `tsconfig.json`.

## Build, Test, and Development Commands
- `npm run dev` — Start local dev server with HMR.
- `npm run build` — Production build (Next.js).
- `npm start` — Run the built app.
- `npm run lint` — ESLint checks (Next.js rules).
- Prisma: `npx prisma generate` and `npx prisma migrate dev` (requires `DATABASE_URL`).

## Coding Style & Naming Conventions
- TypeScript, 2‑space indent, semicolons optional but be consistent.
- Components: PascalCase (`TaskCard.tsx`). Hooks: `useX` (`useTaskStore.ts`). Utils: camelCase.
- Co-locate small component styles with the component; global styles in `app/globals.css`.
- Run `npm run lint` before pushing; fix warnings when reasonable.

## Testing Guidelines
- No formal test suite yet. When adding tests: use `vitest` for units and `playwright` for e2e.
- Place unit tests alongside files or under `__tests__/`, named `*.test.ts(x)`.
- Aim for meaningful coverage on `lib/` and critical components. Add `npm test` script when introduced.

## Commit & Pull Request Guidelines
- Commits: imperative mood, concise scope. Conventional Commits encouraged (e.g., `feat: add task filters`).
- PRs: clear description, rationale, screenshots for UI, and steps to verify. Link issues (e.g., `Closes #123`).
- Keep PRs focused and small; include migration notes when Prisma schema changes.

## Security & Configuration
- Configure `.env` with required secrets: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`.
- Never commit secrets or `.env`. Rotate credentials after sharing.
- Validate API inputs in `app/api/**` and avoid leaking sensitive fields in responses.
