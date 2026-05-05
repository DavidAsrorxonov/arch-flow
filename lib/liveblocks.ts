import { Liveblocks } from "@liveblocks/node";

export const LIVEBLOCKS_CURSOR_COLORS = [
  "#00c8d4",
  "#8b82ff",
  "#34d399",
  "#fbbf24",
  "#ff6166",
  "#f75f8f",
  "#52a8ff",
  "#ff990a",
] as const;

const globalForLiveblocks = globalThis as typeof globalThis & {
  liveblocks?: Liveblocks;
};

export function getCursorColorForUserId(userId: string) {
  let hash = 0;

  for (let index = 0; index < userId.length; index += 1) {
    hash = (hash * 31 + userId.charCodeAt(index)) >>> 0;
  }

  return LIVEBLOCKS_CURSOR_COLORS[hash % LIVEBLOCKS_CURSOR_COLORS.length];
}

export function getLiveblocksClient() {
  if (globalForLiveblocks.liveblocks) {
    return globalForLiveblocks.liveblocks;
  }

  const secret = process.env.LIVEBLOCKS_SECRET_KEY;

  if (!secret) {
    throw new Error("LIVEBLOCKS_SECRET_KEY is required to initialize Liveblocks.");
  }

  const liveblocks = new Liveblocks({ secret });

  globalForLiveblocks.liveblocks = liveblocks;

  return liveblocks;
}
