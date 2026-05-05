# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Node color toolbar

## Current Goal

- `context/feature-specs/15-nodes-color-toolbar.md` is implemented and verified: selected canvas nodes show a floating predefined color-pair toolbar, and swatch selection updates node background and text color through the existing collaborative canvas state.

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
- Added `/editor/[roomId]` as the project workspace route shell so project creation and sidebar navigation have a concrete workspace target.
- Added `lib/project-access.ts` with current Clerk identity lookup and owner-or-collaborator project access checks.
- Added `components/editor/access-denied.tsx` for missing or unauthorized workspace access.
- Added a server-rendered `/editor/[roomId]` page that redirects unauthenticated users to `/sign-in` and renders `AccessDenied` for missing or unauthorized projects.
- Added `components/editor/editor-workspace-shell.tsx` with the full-viewport workspace layout, current project navbar title, existing project sidebar, current room highlighting, canvas placeholder, and right AI sidebar placeholder.
- Extended `components/editor/editor-navbar.tsx` to support an optional project title and workspace actions.
- Added collaborator API routes for listing, inviting, and removing project collaborators.
- Added `lib/project-collaborators.ts` for collaborator email normalization, validation, and Clerk Backend API profile enrichment.
- Added `types/collaborators.ts` with the share dialog response contracts.
- Added `components/editor/share-dialog.tsx` with owner invite/remove controls, read-only collaborator mode, collaborator avatars/names when available from Clerk, and temporary `Copied!` link feedback.
- Wired the workspace navbar Share button to open the share dialog.
- Normalized Clerk email addresses before matching shared projects and accessible workspace records.
- Installed `@liveblocks/node` because the server SDK was missing from the project dependencies.
- Configured `liveblocks.config.ts` with typed cursor presence, `isThinking`, and user metadata for name, avatar, and cursor color.
- Added `lib/liveblocks.ts` with a cached Liveblocks node client and deterministic user ID to cursor color mapping.
- Extended the Clerk project identity helper with display name and avatar URL metadata for Liveblocks sessions.
- Added `POST /api/liveblocks-auth` with JSON body validation, Clerk auth, project access checks, private room creation via the project ID, and room-scoped Liveblocks session authorization.
- Allowed `/api/liveblocks-auth` through the Clerk proxy layer so the route handler can return explicit JSON `401` and `403` responses.
- Added `types/canvas.ts` with shared canvas node data, node color palette, node shape list, and `canvasNode` / `canvasEdge` React Flow types.
- Extended `liveblocks.config.ts` with an optional typed `flow` storage key for Liveblocks React Flow.
- Imported the React Flow stylesheet through `app/globals.css`.
- Added `components/editor/collaborative-canvas.tsx` with `LiveblocksProvider`, `RoomProvider`, `ClientSideSuspense`, initial presence, Liveblocks error fallback, and `useLiveblocksFlow` wired to React Flow.
- Replaced the workspace canvas placeholder with the collaborative canvas surface while keeping the `/editor/[roomId]` page server-side.
- Added `components/editor/shape-panel.tsx` with a bottom-center floating pill toolbar and draggable icon buttons for rectangle, diamond, circle, pill, cylinder, and hexagon nodes.
- Added typed shape drag payload parsing with shape names and sensible default sizes for each supported node shape.
- Added React Flow dragover and drop handling to convert screen coordinates to canvas coordinates and create Liveblocks-synced `canvasNode` nodes with empty labels, default node color, dragged shape data, and IDs generated from shape name, timestamp, and a counter.
- Added `components/editor/canvas-node.tsx` as the basic custom `canvasNode` renderer for this unit, rendering every shape as a simple bordered rectangle with centered label text.
- Added `components/editor/canvas-shape.tsx` with shared node shape drawing for rectangle, pill, circle, diamond, hexagon, and cylinder nodes.
- Replaced the placeholder `canvasNode` renderer with shape-specific rendering, using CSS for rectangle, pill, and circle and scalable inline SVGs for diamond, hexagon, and cylinder.
- Added selected-state shape styling so node borders are subtle at rest and brighter when selected.
- Added a shape drag ghost preview that follows the cursor while dragging, uses the same shape and default size as the drag payload, and clears on drop or drag cancellation.
- Added four hover-revealed React Flow connection handles to custom canvas nodes so shapes can be connected from the top, right, bottom, or left side.
- Replaced the single loose-mode node handles with explicit source and target handle pairs on every node side for reliable React Flow connection start and end behavior.
- Added selected-only React Flow node resize handles with minimum node dimensions and dark canvas styling.
- Added centered inline node label display, empty-label placeholder text, and double-click-to-edit behavior.
- Added textarea-based inline label editing that updates node labels through `useReactFlow().updateNodeData()` as users type.
- Added blur and Escape handling to close label editing while preventing textarea interactions from dragging or panning the canvas.
- Added a selected-node floating color toolbar with one swatch for each predefined node background/text color pair.
- Wired color swatches to update node color data through `useReactFlow().updateNodeData()` so changes stay inside the existing Liveblocks-backed canvas state.
- Updated selected node outlines and resize handles to reflect the active node text color while preserving the selected node background/text pair.

## In Progress

- None.

## Next Up

- Add custom edge rendering only when its feature spec is active.
- Add canvas controls, persistence, starter imports, and AI behavior only when their feature specs are active.
- Add AI chat only when its feature spec is active.

## Open Questions

- None.

## Architecture Decisions

- shadcn/ui generated files in `components/ui/` remain unmodified after CLI generation.
- The app is dark-only: `:root` contains the dark palette, and the root `<html>` carries the `dark` class for shadcn variants.
- Auth is protected-first through root `proxy.ts`; `/`, the configured Clerk sign-in route, the configured Clerk sign-up route, and `/api/projects` are public at the proxy layer. `/api/projects` performs its own route-level Clerk checks to return JSON `401` and `403` responses.
- Project IDs double as Liveblocks room IDs; the create flow generates a slug-based ID with a short random suffix before calling the project API.
- Workspace URLs use `/editor/[roomId]`; the room ID is the project ID.
- Collaborators remain database email records only; Clerk Backend API is used only to enrich display names and avatars at read time.
- Liveblocks rooms are created as private rooms with `defaultAccesses: []`; application authorization is enforced before issuing a room-scoped session token.
- Liveblocks cursor colors are deterministic from the Clerk user ID and come from a fixed palette in `lib/liveblocks.ts`.
- React Flow canvas state is stored under Liveblocks Storage key `flow`; the key is optional in the app type because `useLiveblocksFlow` initializes it with empty nodes and edges after storage loads.
- Shape drops create nodes through `ReactFlowInstance.addNodes()`, which triggers the controlled `onNodesChange` path backed by `useLiveblocksFlow`.

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
- `npm run lint` passed after implementing the editor workspace shell.
- `npx tsc --noEmit` initially failed because `.next/types` still referenced the removed `/editor/[projectId]` route, then passed after `npx next typegen` regenerated route types.
- `npm run build` initially failed in the sandbox because `next/font/google` could not fetch Google Fonts, then passed on an escalated rerun. The build output includes `/editor/[roomId]`.
- `npm run lint` passed after implementing the share dialog.
- `npx tsc --noEmit` passed after implementing the share dialog.
- `npm run build` initially failed in the sandbox because `next/font/google` could not fetch Google Fonts, then passed on an escalated rerun. The build output includes `/api/projects/[projectId]/collaborators` and `/api/projects/[projectId]/collaborators/[collaboratorId]`.
- `npm run lint` passed after Liveblocks setup with the pre-existing warning in `components/editor/share-dialog.tsx` about an unused caught `error`.
- `npx tsc --noEmit` passed after Liveblocks setup.
- `npm run build` initially failed in the sandbox because `next/font/google` could not fetch Google Fonts, then passed on an escalated rerun. The build output includes `/api/liveblocks-auth`.
- `npm run lint` passed after base canvas implementation with the pre-existing warning in `components/editor/share-dialog.tsx` about an unused caught `error`.
- `npx tsc --noEmit` passed after base canvas implementation.
- `npm run build` initially failed in the sandbox because `next/font/google` could not fetch Google Fonts, then passed on an escalated rerun. The build output includes `/editor/[roomId]`.
- `npm run lint` passed after shape panel implementation with the pre-existing warning in `components/editor/share-dialog.tsx` about an unused caught `error`.
- `npx tsc --noEmit` passed after shape panel implementation.
- `npm run build` initially failed in the sandbox because `next/font/google` could not fetch Google Fonts, then passed on an escalated rerun.
- `npm run lint` passed after node shape rendering with the pre-existing warning in `components/editor/share-dialog.tsx` about an unused caught `error`.
- `npx tsc --noEmit` passed after node shape rendering.
- `npm run build` initially failed in the sandbox because `next/font/google` could not fetch Google Fonts, then passed on an escalated rerun.
- `npm run lint` passed after adding node connection handles with the pre-existing warning in `components/editor/share-dialog.tsx` about an unused caught `error`.
- `npx tsc --noEmit` passed after adding node connection handles.
- `npm run build` initially failed in the sandbox because `next/font/google` could not fetch Google Fonts, then passed on an escalated rerun.
- `npm run lint` passed after replacing node handles with source/target pairs with the pre-existing warning in `components/editor/share-dialog.tsx` about an unused caught `error`.
- `npx tsc --noEmit` passed after replacing node handles with source/target pairs.
- `npm run build` initially failed in the sandbox because `next/font/google` could not fetch Google Fonts, then passed on an escalated rerun.
- `npm run lint` passed after node editing implementation with the pre-existing warning in `components/editor/share-dialog.tsx` about an unused caught `error`.
- `npx tsc --noEmit` passed after node editing implementation.
- `npm run build` initially failed in the sandbox because `next/font/google` could not fetch Google Fonts, then passed on an escalated rerun.
- `npm run lint` passed after node color toolbar implementation with the pre-existing warning in `components/editor/share-dialog.tsx` about an unused caught `error`.
- `npx tsc --noEmit` passed after node color toolbar implementation.
- `npm run build` initially failed in the sandbox because `next/font/google` could not fetch Google Fonts, then passed on an escalated rerun after node color toolbar implementation.
