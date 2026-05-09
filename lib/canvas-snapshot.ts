import type { CanvasSnapshot } from "@/types/canvas";

export function isCanvasSnapshot(value: unknown): value is CanvasSnapshot {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const candidate = value as { nodes?: unknown; edges?: unknown };

  return (
    Array.isArray(candidate.nodes) &&
    Array.isArray(candidate.edges) &&
    candidate.nodes.every(isCanvasEntity) &&
    candidate.edges.every(isCanvasEntity)
  );
}

function isCanvasEntity(value: unknown) {
  return Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      typeof (value as { id?: unknown }).id === "string",
  );
}
