"use client";

import {
  Handle,
  NodeResizer,
  Position,
  useReactFlow,
  type NodeProps,
} from "@xyflow/react";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type KeyboardEvent,
  type SyntheticEvent,
} from "react";

import { CanvasShape } from "@/components/editor/canvas-shape";
import { cn } from "@/lib/utils";
import type { CanvasEdge, CanvasNode, CanvasNodeShape } from "@/types/canvas";

const HANDLE_POSITIONS = [
  Position.Top,
  Position.Right,
  Position.Bottom,
  Position.Left,
] as const;

const MIN_NODE_WIDTH = 88;
const MIN_NODE_HEIGHT = 56;
const LABEL_PLACEHOLDER = "Label";

export function CanvasNodeRenderer({
  id,
  data,
  selected,
  height,
}: NodeProps<CanvasNode>) {
  const { updateNodeData } = useReactFlow<CanvasNode, CanvasEdge>();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [draftLabel, setDraftLabel] = useState(data.label);

  useLayoutEffect(() => {
    if (!isEditing || !textareaRef.current) {
      return;
    }

    const textarea = textareaRef.current;
    const maxHeight = Math.max(MIN_NODE_HEIGHT - 24, (height ?? MIN_NODE_HEIGHT) - 24);

    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  }, [draftLabel, height, isEditing]);

  useEffect(() => {
    if (!isEditing || !textareaRef.current) {
      return;
    }

    textareaRef.current.focus();
    textareaRef.current.select();
  }, [isEditing]);

  const labelStyle = {
    "--node-text": data.color.text,
  } as CSSProperties;

  function beginEditing() {
    setDraftLabel(data.label);
    setIsEditing(true);
  }

  function updateLabel(event: ChangeEvent<HTMLTextAreaElement>) {
    const nextLabel = event.target.value;

    setDraftLabel(nextLabel);
    updateNodeData(id, { label: nextLabel });
  }

  function closeEditing() {
    setIsEditing(false);
  }

  function handleEditingKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    event.stopPropagation();

    if (event.key === "Escape") {
      event.preventDefault();
      closeEditing();
    }
  }

  function stopCanvasInteraction(event: SyntheticEvent) {
    event.stopPropagation();
  }

  return (
    <div className="group relative h-full w-full">
      <NodeResizer
        isVisible={selected}
        minWidth={MIN_NODE_WIDTH}
        minHeight={MIN_NODE_HEIGHT}
        color="var(--accent-primary)"
        handleStyle={{
          width: 8,
          height: 8,
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--accent-primary)",
          borderRadius: 999,
        }}
        lineStyle={{
          borderColor: "var(--accent-primary)",
          opacity: 0.55,
        }}
      />
      <CanvasShape shape={data.shape} color={data.color} selected={selected} />
      <div
        className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-3 py-2 text-center text-sm font-medium leading-5 text-[color:var(--node-text)]"
        style={labelStyle}
      >
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={draftLabel}
            placeholder={LABEL_PLACEHOLDER}
            rows={1}
            className={cn(
              "nodrag nopan nowheel pointer-events-auto block max-h-full resize-none overflow-hidden border-0 bg-transparent p-0 text-center text-sm font-medium leading-5 text-[color:var(--node-text)] outline-none placeholder:text-copy-faint",
              labelWidthClassName(data.shape),
            )}
            onChange={updateLabel}
            onBlur={closeEditing}
            onKeyDown={handleEditingKeyDown}
            onPointerDown={stopCanvasInteraction}
            onMouseDown={stopCanvasInteraction}
            onClick={stopCanvasInteraction}
            onDoubleClick={stopCanvasInteraction}
          />
        ) : (
          <button
            type="button"
            className={cn(
              "pointer-events-auto block max-h-full overflow-hidden bg-transparent p-0 text-center text-sm font-medium leading-5 text-[color:var(--node-text)] outline-none",
              data.label ? "whitespace-pre-wrap break-words" : "text-copy-faint",
              labelWidthClassName(data.shape),
            )}
            onDoubleClick={(event) => {
              event.stopPropagation();
              beginEditing();
            }}
          >
            {data.label || LABEL_PLACEHOLDER}
          </button>
        )}
      </div>
      {HANDLE_POSITIONS.map((position) => (
        <ConnectionHandlePair key={position} position={position} />
      ))}
    </div>
  );
}

function labelWidthClassName(shape: CanvasNodeShape) {
  if (shape === "diamond" || shape === "circle") {
    return "w-[68%]";
  }

  if (shape === "hexagon") {
    return "w-[72%]";
  }

  if (shape === "cylinder") {
    return "w-[74%]";
  }

  return "w-[calc(100%_-_2rem)]";
}

function ConnectionHandlePair({ position }: { position: (typeof HANDLE_POSITIONS)[number] }) {
  return (
    <>
      <ConnectionHandle type="target" position={position} />
      <ConnectionHandle type="source" position={position} />
    </>
  );
}

function ConnectionHandle({
  position,
  type,
}: {
  position: (typeof HANDLE_POSITIONS)[number];
  type: "source" | "target";
}) {
  return (
    <Handle
      id={`${type}-${position}`}
      type={type}
      position={position}
      className="opacity-0 transition-opacity group-hover:opacity-100"
      style={{
        width: 11,
        height: 11,
        background: "var(--text-primary)",
        border: "1px solid var(--bg-base)",
        zIndex: type === "source" ? 21 : 20,
      }}
    />
  );
}
