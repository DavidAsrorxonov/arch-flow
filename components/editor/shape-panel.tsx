"use client";

import type { LucideIcon } from "lucide-react";
import {
  Circle,
  Cylinder,
  Diamond,
  Hexagon,
  RectangleHorizontal,
  Square,
} from "lucide-react";
import { useEffect, useState } from "react";

import { CanvasShape } from "@/components/editor/canvas-shape";
import { Button } from "@/components/ui/button";
import type { CanvasNodeShape } from "@/types/canvas";
import { DEFAULT_NODE_COLOR, NODE_SHAPES } from "@/types/canvas";

export const SHAPE_DRAG_MIME_TYPE = "application/x-archflow-shape";

export interface ShapeSize {
  width: number;
  height: number;
}

export interface ShapeDragPayload {
  shape: CanvasNodeShape;
  size: ShapeSize;
}

interface ShapeDragPreviewState extends ShapeDragPayload {
  cursor: {
    x: number;
    y: number;
  };
}

export const SHAPE_DEFAULT_SIZES = {
  rectangle: { width: 180, height: 92 },
  diamond: { width: 150, height: 150 },
  circle: { width: 112, height: 112 },
  pill: { width: 172, height: 76 },
  cylinder: { width: 148, height: 112 },
  hexagon: { width: 164, height: 112 },
} satisfies Record<CanvasNodeShape, ShapeSize>;

const SHAPE_ICONS = {
  rectangle: RectangleHorizontal,
  diamond: Diamond,
  circle: Circle,
  pill: Square,
  cylinder: Cylinder,
  hexagon: Hexagon,
} satisfies Record<CanvasNodeShape, LucideIcon>;

export function parseShapeDragPayload(payload: string): ShapeDragPayload | null {
  try {
    const parsed: unknown = JSON.parse(payload);

    if (!isShapeDragPayload(parsed)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function isShapeDragPayload(value: unknown): value is ShapeDragPayload {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const payload = value as Partial<ShapeDragPayload>;

  return (
    typeof payload.shape === "string" &&
    NODE_SHAPES.includes(payload.shape as CanvasNodeShape) &&
    typeof payload.size?.width === "number" &&
    typeof payload.size.height === "number" &&
    payload.size.width > 0 &&
    payload.size.height > 0
  );
}

export function ShapePanel() {
  const [dragPreview, setDragPreview] =
    useState<ShapeDragPreviewState | null>(null);
  const isDraggingShape = dragPreview !== null;

  useEffect(() => {
    if (!isDraggingShape) {
      return;
    }

    function updatePreviewPosition(event: DragEvent) {
      if (event.clientX === 0 && event.clientY === 0) {
        return;
      }

      setDragPreview((current) =>
        current
          ? {
              ...current,
              cursor: {
                x: event.clientX,
                y: event.clientY,
              },
            }
          : current,
      );
    }

    function clearPreview() {
      setDragPreview(null);
    }

    window.addEventListener("dragover", updatePreviewPosition);
    window.addEventListener("drop", clearPreview);
    window.addEventListener("dragend", clearPreview);

    return () => {
      window.removeEventListener("dragover", updatePreviewPosition);
      window.removeEventListener("drop", clearPreview);
      window.removeEventListener("dragend", clearPreview);
    };
  }, [isDraggingShape]);

  return (
    <>
      <div
        className="pointer-events-auto absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border border-surface-border bg-surface/90 p-1.5 shadow-lg shadow-base/50 backdrop-blur"
        aria-label="Shape tools"
      >
        {NODE_SHAPES.map((shape) => (
          <ShapeButton
            key={shape}
            shape={shape}
            onPreviewChange={setDragPreview}
          />
        ))}
      </div>
      {dragPreview ? <ShapeDragPreview preview={dragPreview} /> : null}
    </>
  );
}

function ShapeButton({
  shape,
  onPreviewChange,
}: {
  shape: CanvasNodeShape;
  onPreviewChange: (preview: ShapeDragPreviewState | null) => void;
}) {
  const Icon = SHAPE_ICONS[shape];
  const size = SHAPE_DEFAULT_SIZES[shape];

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      draggable
      aria-label={`Drag ${shape} shape`}
      title={shape}
      className="size-9 rounded-full text-copy-secondary hover:bg-accent-dim hover:text-brand"
      onDragStart={(event) => {
        const payload = {
          shape,
          size,
        } satisfies ShapeDragPayload;

        event.dataTransfer.effectAllowed = "copy";
        event.dataTransfer.setData(
          SHAPE_DRAG_MIME_TYPE,
          JSON.stringify(payload),
        );
        event.dataTransfer.setDragImage(createTransparentDragImage(), 0, 0);
        onPreviewChange({
          ...payload,
          cursor: {
            x: event.clientX,
            y: event.clientY,
          },
        });
      }}
      onDrag={(event) => {
        if (event.clientX === 0 && event.clientY === 0) {
          return;
        }

        onPreviewChange({
          shape,
          size,
          cursor: {
            x: event.clientX,
            y: event.clientY,
          },
        });
      }}
      onDragEnd={() => {
        onPreviewChange(null);
      }}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
    </Button>
  );
}

function ShapeDragPreview({ preview }: { preview: ShapeDragPreviewState }) {
  return (
    <div
      className="pointer-events-none fixed z-50 opacity-70"
      style={{
        left: preview.cursor.x + 12,
        top: preview.cursor.y + 12,
        width: preview.size.width,
        height: preview.size.height,
      }}
      aria-hidden="true"
    >
      <CanvasShape
        shape={preview.shape}
        color={DEFAULT_NODE_COLOR}
        className="shadow-lg shadow-base/50"
      />
    </div>
  );
}

function createTransparentDragImage() {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  return canvas;
}
