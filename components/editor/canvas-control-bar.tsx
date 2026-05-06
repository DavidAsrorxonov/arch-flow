"use client";

import type { LucideIcon } from "lucide-react";
import { Maximize2, Redo2, Undo2, ZoomIn, ZoomOut } from "lucide-react";
import type { ReactFlowInstance } from "@xyflow/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";

const VIEWPORT_ANIMATION_DURATION = 180;

interface CanvasControlBarProps {
  reactFlowInstance: ReactFlowInstance<CanvasNode, CanvasEdge> | null;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function CanvasControlBar({
  reactFlowInstance,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: CanvasControlBarProps) {
  return (
    <div
      className="pointer-events-auto absolute bottom-20 left-5 z-10 flex items-center gap-1 rounded-full border border-surface-border bg-surface/90 p-1.5 shadow-lg shadow-base/50 backdrop-blur"
      aria-label="Canvas controls"
    >
      <ControlButton
        label="Zoom out"
        icon={ZoomOut}
        onClick={() => {
          void reactFlowInstance?.zoomOut({
            duration: VIEWPORT_ANIMATION_DURATION,
          });
        }}
      />
      <ControlButton
        label="Fit view"
        icon={Maximize2}
        onClick={() => {
          void reactFlowInstance?.fitView({
            duration: VIEWPORT_ANIMATION_DURATION,
            padding: 0.2,
          });
        }}
      />
      <ControlButton
        label="Zoom in"
        icon={ZoomIn}
        onClick={() => {
          void reactFlowInstance?.zoomIn({
            duration: VIEWPORT_ANIMATION_DURATION,
          });
        }}
      />
      <div className="mx-1 h-6 w-px bg-surface-border" aria-hidden="true" />
      <ControlButton
        label="Undo"
        icon={Undo2}
        onClick={onUndo}
        disabled={!canUndo}
      />
      <ControlButton
        label="Redo"
        icon={Redo2}
        onClick={onRedo}
        disabled={!canRedo}
      />
    </div>
  );
}

function ControlButton({
  label,
  icon: Icon,
  onClick,
  disabled,
}: {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "size-9 rounded-full text-copy-secondary hover:bg-accent-dim hover:text-brand",
        "disabled:text-copy-faint disabled:opacity-40",
      )}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
    </Button>
  );
}
