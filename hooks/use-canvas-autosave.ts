"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { CanvasSnapshot } from "@/types/canvas";

export type CanvasSaveStatus = "saving" | "saved" | "error";

interface UseCanvasAutosaveOptions extends CanvasSnapshot {
  debounceMs?: number;
  enabled: boolean;
  projectId: string;
  onStatusChange?: (status: CanvasSaveStatus) => void;
}

export function useCanvasAutosave({
  debounceMs = 900,
  edges,
  enabled,
  nodes,
  onStatusChange,
  projectId,
}: UseCanvasAutosaveOptions) {
  const [status, setStatus] = useState<CanvasSaveStatus>("saved");
  const hasObservedInitialSnapshotRef = useRef(false);
  const isSavingRef = useRef(false);
  const isSavePendingRef = useRef(false);
  const lastSavedSnapshotRef = useRef<string | null>(null);
  const latestSnapshotRef = useRef("");
  const timeoutRef = useRef<number | null>(null);
  const snapshot = useMemo(
    () =>
      JSON.stringify({
        nodes,
        edges,
      } satisfies CanvasSnapshot),
    [edges, nodes],
  );

  useEffect(() => {
    onStatusChange?.(status);
  }, [onStatusChange, status]);

  useEffect(() => {
    latestSnapshotRef.current = snapshot;
  }, [snapshot]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (!hasObservedInitialSnapshotRef.current) {
      hasObservedInitialSnapshotRef.current = true;
      lastSavedSnapshotRef.current = snapshot;
      return;
    }

    if (snapshot === lastSavedSnapshotRef.current) {
      return;
    }

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    const saveLatestSnapshot = async (): Promise<void> => {
      const snapshotToSave = latestSnapshotRef.current;

      if (snapshotToSave === lastSavedSnapshotRef.current) {
        setStatus("saved");
        return;
      }

      if (isSavingRef.current) {
        isSavePendingRef.current = true;
        return;
      }

      isSavingRef.current = true;
      setStatus("saving");

      try {
        const response = await fetch(
          `/api/projects/${encodeURIComponent(projectId)}/canvas`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: snapshotToSave,
          },
        );

        if (!response.ok) {
          throw new Error("Canvas save failed.");
        }

        lastSavedSnapshotRef.current = snapshotToSave;
        setStatus("saved");
      } catch (error) {
        console.error(error);
        setStatus("error");
      } finally {
        isSavingRef.current = false;

        if (
          isSavePendingRef.current &&
          latestSnapshotRef.current !== lastSavedSnapshotRef.current
        ) {
          isSavePendingRef.current = false;
          timeoutRef.current = window.setTimeout(
            () => void saveLatestSnapshot(),
            debounceMs,
          );
        }
      }
    };

    timeoutRef.current = window.setTimeout(
      () => void saveLatestSnapshot(),
      debounceMs,
    );

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [debounceMs, enabled, projectId, snapshot]);

  return status;
}
