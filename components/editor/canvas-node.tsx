"use client";

import type { NodeProps } from "@xyflow/react";

import type { CanvasNode } from "@/types/canvas";

export function CanvasNodeRenderer({ data }: NodeProps<CanvasNode>) {
  return (
    <div
      className="flex h-full min-h-12 w-full min-w-24 items-center justify-center rounded-xl border border-border-subtle px-4 py-3 text-center text-sm font-medium shadow-sm shadow-base/40"
      style={{
        backgroundColor: data.color.fill,
        color: data.color.text,
      }}
    >
      <span className="block truncate">{data.label}</span>
    </div>
  );
}
