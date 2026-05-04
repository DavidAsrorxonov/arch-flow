# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Editor home API wiring

## Current Goal

- Editor home sidebar and dialogs from `context/feature-specs/07-wire-editor-home.md` are wired to the real project API and verified.

## Completed

- Installed and configured shadcn/ui with the Nova/Radix preset.
- Added Button, Card, Dialog, Input, Tabs, Textarea, and ScrollArea primitives in `components/ui/`.
- Installed `lucide-react` and shadcn dependencies.
- Added `lib/utils.ts` with the reusable `cn()` helper.
- Rebuilt `app/globals.css` around the documented dark-only CSS variables and Tailwind token mappings.
- Enabled the `dark` class at the root layout so generated dark variants are always active.
- Created `components/editor/editor-navbar.tsx` with fixed-height left, center, and right navbar sections plus a state-aware sidebar toggle button.
- Created `components/editor/project-sidebar.tsx` with a floating slide-in project sidebar, hidden-state focus isolation, tabs for My Projects and Shared, empty states, close control, and a full-width New Project button.
- Added `components/editor/editor-dialog-shell.tsx` as the reusable future dialog surface pattern with title, optional description, content, and footer actions.
- Installed `@clerk/ui` for Clerk's current theme package.
- Added shared Clerk appearance configuration in `lib/clerk-appearance.ts` using the `dark` theme and existing CSS variables.
- Wrapped the root layout with `ClerkProvider`.
- Added protected-by-default `proxy.ts`, with `/`, sign-in, and sign-up routes public.
- Added `/sign-in` and `/sign-up` Clerk pages with the specified two-panel large-screen layout and form-only small-screen layout.
- Updated `/` to redirect authenticated users to `/editor` and unauthenticated users to `/sign-in`.
- Added a minimal `/editor` route using the existing editor chrome so the authenticated redirect target exists.
- Added Clerk's built-in `UserButton` to the editor navbar right section.
- Added the `/editor` home empty state with the specified heading, description, and New Project action.
- Added a dedicated project dialog hook with mock owned/shared project data, dialog state, form state, slug preview, and loading state.
- Added create, rename, and delete project dialogs wired to editor home and sidebar actions.
- Added owned-project rename/delete sidebar actions while shared projects hide actions.
- Added a mobile-only project sidebar backdrop scrim that closes the sidebar when tapped.
- Added create/rename validation so symbol-heavy project names are accepted in the input but must produce a usable alphanumeric slug.
- Added Prisma `ProjectStatus`, `Project`, and `ProjectCollaborator` models with the specified owner, status, canvas path, timestamp, relation, unique constraint, and index fields.
- Added the first Prisma migration for project metadata and collaborator records.
- Generated Prisma Client output under `app/generated/prisma`.
- Added `lib/prisma.ts` as a cached Prisma client singleton that uses Accelerate for `prisma+postgres://` URLs and `@prisma/adapter-pg` for direct PostgreSQL URLs.
- Added an `id` primary key to `ProjectCollaborator` and applied the follow-up Prisma migration.
- Added backend project REST routes for owned project listing, creation, renaming, and deletion.
- Added shared project API request parsing, Clerk auth checks, owner checks, and consistent JSON error helpers.
- Allowed `/api/projects` requests through Clerk proxy protection so route handlers can return explicit JSON `401` responses while still using `auth()`.
- Added server-side project list fetching for `/editor`, including owned projects and collaborator-shared projects.
- Replaced the mock project dialog state with `useProjectActions`, which manages create, rename, and delete dialogs plus real API mutations.
- Added slug-plus-suffix room ID generation during project creation and pass that ID into `POST /api/projects` so project IDs and Liveblocks room IDs stay aligned.
- Added a `409` API guard for generated project ID collisions during project creation.
- Wired the project sidebar to real server-provided project data, project navigation links, active project highlighting, and owned-project rename/delete actions.
- Added `/editor/[projectId]` as the project workspace route shell so project creation and sidebar navigation have a concrete workspace target.

## In Progress

- None.

## Next Up

- Build the actual collaborative canvas workspace in a later feature unit.

## Open Questions

- None.

## Architecture Decisions

- shadcn/ui generated files in `components/ui/` remain unmodified after CLI generation.
- The app is dark-only: `:root` contains the dark palette, and the root `<html>` carries the `dark` class for shadcn variants.
- Auth is protected-first through root `proxy.ts`; `/`, the configured Clerk sign-in route, the configured Clerk sign-up route, and `/api/projects` are public at the proxy layer. `/api/projects` performs its own route-level Clerk checks to return JSON `401` and `403` responses.
- Project IDs double as Liveblocks room IDs; the create flow generates a slug-based ID with a short random suffix before calling the project API.

## Session Notes

- `npm run lint` passed after project API route implementation.
- `npx tsc --noEmit` initially failed because `RouteContext` is generated by Next.js, then passed after switching the dynamic route handler context to an explicit promised params type.
- `npm run build` initially failed in the sandbox because `next/font/google` could not fetch Google Fonts, then passed on an escalated rerun.
- `npm run lint` passed after wiring editor home to the project API.
- `npx tsc --noEmit` passed after wiring editor home to the project API.
- `npm run build` initially failed in the sandbox because `next/font/google` could not fetch Google Fonts, then passed on an escalated rerun.
- `npm run lint` passed.
- `npx tsc --noEmit` passed.
- `npm run lint` passed after editor chrome implementation.
- `npx tsc --noEmit` passed after editor chrome implementation.
- A direct `cn()` merge check passed via Node type stripping.
- `npm run build` was attempted but blocked by sandboxed access to Google Fonts for `next/font/google`; the escalated rerun was rejected.
- `npm run lint` passed after auth implementation.
- `npx tsc --noEmit` passed after auth implementation.
- `npm run build` passed after auth implementation on an escalated rerun that allowed `next/font/google` to fetch Google Fonts.
- `npm run lint` passed after project dialog implementation.
- `npx tsc --noEmit` passed after project dialog implementation.
- `npm run lint` passed after project slug validation.
- `npx tsc --noEmit` passed after project slug validation.
- `npx prisma format` passed after adding the project models.
- `npx prisma validate` passed after adding the project models.
- `npx prisma migrate dev --name add_project_models` initially failed in the sandbox with a schema engine connection error, then passed on an escalated rerun against the configured PostgreSQL database.
- `npx prisma generate` passed and generated Prisma Client 7.8.0.
- `npm run lint` passed after Prisma implementation.
- `npx tsc --noEmit` passed after Prisma implementation.
- `npm run build` initially failed in the sandbox because `next/font/google` could not fetch Google Fonts, then passed on an escalated rerun.
- `npx prisma format` passed after adding `ProjectCollaborator.id`.
- `npx prisma validate` passed after adding `ProjectCollaborator.id`.
- `npx prisma migrate dev --name add_project_collaborator_id` initially failed in the sandbox with a schema engine connection error, then passed on an escalated rerun against the configured PostgreSQL database.
- `npx prisma generate` passed after adding `ProjectCollaborator.id`.
- `npx prisma migrate status` confirmed 2 migrations and an up-to-date database after an escalated rerun.
- `npm run lint` passed after adding `ProjectCollaborator.id`.
- `npx tsc --noEmit` passed after adding `ProjectCollaborator.id`.
- `npm run build` initially failed in the sandbox because `next/font/google` could not fetch Google Fonts, then passed on an escalated rerun.
