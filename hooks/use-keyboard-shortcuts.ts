"use client";

import { useEffect } from "react";
import type { ReactFlowInstance } from "@xyflow/react";

import type { CanvasEdge, CanvasNode } from "@/types/canvas";

const VIEWPORT_ANIMATION_DURATION = 180;

interface UseKeyboardShortcutsOptions {
  reactFlowInstance: ReactFlowInstance<CanvasNode, CanvasEdge> | null;
  onUndo: () => void;
  onRedo: () => void;
}

export function useKeyboardShortcuts({
  reactFlowInstance,
  onUndo,
  onRedo,
}: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || isEditableTarget(event.target)) {
        return;
      }

      const usesCommandModifier = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();

      if (usesCommandModifier && key === "z" && event.shiftKey) {
        event.preventDefault();
        onRedo();
        return;
      }

      if (usesCommandModifier && key === "z") {
        event.preventDefault();
        onUndo();
        return;
      }

      if (usesCommandModifier && key === "y") {
        event.preventDefault();
        onRedo();
        return;
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        void reactFlowInstance?.zoomIn({
          duration: VIEWPORT_ANIMATION_DURATION,
        });
        return;
      }

      if (event.key === "-") {
        event.preventDefault();
        void reactFlowInstance?.zoomOut({
          duration: VIEWPORT_ANIMATION_DURATION,
        });
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onRedo, onUndo, reactFlowInstance]);
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();

  return (
    tagName === "input" ||
    tagName === "textarea" ||
    target.isContentEditable ||
    Boolean(target.closest("[contenteditable='true']"))
  );
}
