"use client";

import {
  EdgeLabelRenderer,
  getSmoothStepPath,
  Position,
  useReactFlow,
  type EdgeProps,
} from "@xyflow/react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type SyntheticEvent,
} from "react";

import { cn } from "@/lib/utils";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";

const EDGE_STROKE = "var(--text-primary)";
const EDGE_REST_OPACITY = 0.42;
const EDGE_ACTIVE_OPACITY = 0.92;
const EDGE_INTERACTION_WIDTH = 24;
const EMPTY_LABEL_HINT = "Label";

export function CanvasEdgeRenderer({
  id,
  data,
  markerEnd,
  selected,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition = Position.Bottom,
  targetPosition = Position.Top,
}: EdgeProps<CanvasEdge>) {
  const { updateEdgeData } = useReactFlow<CanvasNode, CanvasEdge>();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const savedLabel = data?.label ?? "";
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftLabel, setDraftLabel] = useState(savedLabel);
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 12,
    offset: 24,
  });
  const isActive = selected || isHovered || isEditing;
  const shouldShowLabel = isEditing || Boolean(savedLabel) || isActive;
  const edgeOpacity = isActive ? EDGE_ACTIVE_OPACITY : EDGE_REST_OPACITY;

  useEffect(() => {
    if (!isEditing || !inputRef.current) {
      return;
    }

    inputRef.current.focus();
    inputRef.current.select();
  }, [isEditing]);

  const beginEditing = useCallback(
    (event?: SyntheticEvent) => {
      event?.stopPropagation();
      setDraftLabel(savedLabel);
      setIsEditing(true);
    },
    [savedLabel],
  );

  const commitLabel = useCallback(() => {
    updateEdgeData(id, { label: draftLabel.trim() });
    setIsEditing(false);
  }, [draftLabel, id, updateEdgeData]);

  function handleLabelKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    event.stopPropagation();

    if (event.key === "Enter" || event.key === "Escape") {
      event.preventDefault();
      commitLabel();
    }
  }

  function stopCanvasInteraction(event: SyntheticEvent) {
    event.stopPropagation();
  }

  const labelStyle = {
    transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
    "--edge-label-width": `${Math.max(4, Math.min(28, draftLabel.length + 1))}ch`,
  } as CSSProperties;

  return (
    <>
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={EDGE_INTERACTION_WIDTH}
        className="cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDoubleClick={beginEditing}
      />
      <path
        d={edgePath}
        fill="none"
        markerEnd={markerEnd}
        pointerEvents="none"
        stroke={EDGE_STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity={edgeOpacity}
        strokeWidth={2}
        className="transition-[stroke-opacity]"
      />
      {shouldShowLabel ? (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan nowheel pointer-events-auto absolute z-20"
            style={labelStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onPointerDown={stopCanvasInteraction}
            onMouseDown={stopCanvasInteraction}
            onClick={stopCanvasInteraction}
            onDoubleClick={stopCanvasInteraction}
          >
            {isEditing ? (
              <input
                ref={inputRef}
                value={draftLabel}
                placeholder={EMPTY_LABEL_HINT}
                className="h-7 min-w-14 max-w-60 rounded-xl border border-surface-border bg-elevated px-2 text-center text-xs font-medium text-copy-primary shadow-lg shadow-base/40 outline-none placeholder:text-copy-faint focus-visible:ring-2 focus-visible:ring-brand/70"
                style={{ width: "var(--edge-label-width)" }}
                onBlur={commitLabel}
                onChange={(event) => setDraftLabel(event.target.value)}
                onKeyDown={handleLabelKeyDown}
              />
            ) : (
              <button
                type="button"
                className={cn(
                  "max-w-60 rounded-xl border px-2 py-1 text-xs font-medium leading-none shadow-lg shadow-base/30 backdrop-blur transition-[border-color,background-color,color,opacity]",
                  savedLabel
                    ? "border-surface-border bg-elevated/95 text-copy-primary"
                    : "border-surface-border/70 bg-surface/70 text-copy-faint opacity-80",
                )}
                onDoubleClick={beginEditing}
              >
                <span className="block truncate">
                  {savedLabel || EMPTY_LABEL_HINT}
                </span>
              </button>
            )}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}
