# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Project dialog integration

## Current Goal

- Project dialog slug validation from `context/feature-specs/04-project-dialogs.md` is implemented and verified.

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

## In Progress

- None.

## Next Up

- Continue to the next feature unit from `context/feature-specs/`.

## Open Questions

- None.

## Architecture Decisions

- shadcn/ui generated files in `components/ui/` remain unmodified after CLI generation.
- The app is dark-only: `:root` contains the dark palette, and the root `<html>` carries the `dark` class for shadcn variants.
- Auth is protected-first through root `proxy.ts`; only `/`, the configured Clerk sign-in route, and the configured Clerk sign-up route are public.

## Session Notes

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
