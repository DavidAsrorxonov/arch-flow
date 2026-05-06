"use client";

import { UserButton, useAuth } from "@clerk/nextjs";
import {
  shallow,
  useOther,
  useOthersConnectionIds,
  useOthersMapped,
} from "@liveblocks/react";

import { cn } from "@/lib/utils";

const MAX_VISIBLE_COLLABORATORS = 5;

interface CollaboratorAvatar {
  id: string;
  name: string;
  avatar: string;
  cursorColor: string;
}

interface CursorState {
  id: string;
  name: string;
  cursor: { x: number; y: number } | null;
  cursorColor: string;
}

export function CanvasPresenceAvatars() {
  const { userId } = useAuth();
  const collaborators = useOthersMapped(
    (other) => ({
      id: other.id,
      name: other.info.name,
      avatar: other.info.avatar,
      cursorColor: other.info.cursorColor,
    }),
    shallow,
  )
    .map(([, collaborator]) => collaborator)
    .filter((collaborator) => collaborator.id !== userId);

  const visibleCollaborators = collaborators.slice(0, MAX_VISIBLE_COLLABORATORS);
  const overflowCount = collaborators.length - visibleCollaborators.length;

  return (
    <div className="pointer-events-auto absolute right-4 top-4 z-20 flex items-center rounded-2xl border border-surface-border bg-surface/85 px-2.5 py-2 shadow-lg backdrop-blur">
      {visibleCollaborators.length > 0 ? (
        <>
          <div className="flex items-center">
            {visibleCollaborators.map((collaborator, index) => (
              <CollaboratorAvatar
                key={`${collaborator.id}-${index}`}
                collaborator={collaborator}
                className={index > 0 ? "-ml-2" : undefined}
              />
            ))}
            {overflowCount > 0 ? (
              <div className="-ml-2 flex h-8 min-w-8 items-center justify-center rounded-full border border-surface-border bg-subtle px-2 text-xs font-semibold text-copy-secondary ring-2 ring-base">
                +{overflowCount}
              </div>
            ) : null}
          </div>
          <div className="mx-2 h-6 w-px bg-border-subtle" aria-hidden="true" />
        </>
      ) : null}
      <UserButton
        appearance={{
          elements: {
            userButtonAvatarBox: "h-8 w-8",
          },
        }}
      />
    </div>
  );
}

export function LiveCanvasCursors() {
  const { userId } = useAuth();
  const connectionIds = useOthersConnectionIds();

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {connectionIds.map((connectionId) => (
        <LiveCanvasCursor
          key={connectionId}
          connectionId={connectionId}
          currentUserId={userId}
        />
      ))}
    </div>
  );
}

function CollaboratorAvatar({
  collaborator,
  className,
}: {
  collaborator: CollaboratorAvatar;
  className?: string;
}) {
  const initials = getInitials(collaborator.name);

  return (
    <div
      className={cn(
        "flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-surface-border bg-subtle text-xs font-semibold text-copy-primary ring-2 ring-base",
        className,
      )}
      aria-label={collaborator.name}
      title={collaborator.name}
    >
      {collaborator.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={collaborator.avatar}
          alt=""
          className="h-full w-full object-cover"
          draggable={false}
        />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center"
          style={{ backgroundColor: collaborator.cursorColor }}
        >
          {initials}
        </span>
      )}
    </div>
  );
}

function LiveCanvasCursor({
  connectionId,
  currentUserId,
}: {
  connectionId: number;
  currentUserId: string | null | undefined;
}) {
  const cursorState = useOther(
    connectionId,
    (other) =>
      ({
        id: other.id,
        name: other.info.name,
        cursor: other.presence.cursor,
        cursorColor: other.info.cursorColor,
      }) satisfies CursorState,
    shallow,
  );

  if (cursorState.id === currentUserId || cursorState.cursor === null) {
    return null;
  }

  return (
    <div
      className="absolute left-0 top-0 flex items-start"
      style={{
        color: cursorState.cursorColor,
        transform: `translate3d(${cursorState.cursor.x}px, ${cursorState.cursor.y}px, 0)`,
      }}
    >
      <svg
        className="h-4 w-4 shrink-0 drop-shadow"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M2 1.5L13.5 7L8.4 8.6L6.2 13.5L2 1.5Z"
          fill="currentColor"
          stroke="var(--bg-base)"
          strokeWidth="1.25"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className="ml-1 mt-3 max-w-36 truncate rounded-xl px-2 py-1 text-xs font-semibold shadow-lg"
        style={{
          backgroundColor: cursorState.cursorColor,
          color: "var(--bg-base)",
        }}
      >
        {cursorState.name}
      </span>
    </div>
  );
}

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return initials || "?";
}
