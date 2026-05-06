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
import {
  NODE_COLORS,
  type CanvasEdge,
  type CanvasNode,
  type CanvasNodeColor,
  type CanvasNodeShape,
} from "@/types/canvas";

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
        color={data.color.text}
        handleStyle={{
          width: 8,
          height: 8,
          backgroundColor: "var(--bg-surface)",
          border: `1px solid ${data.color.text}`,
          borderRadius: 999,
        }}
        lineStyle={{
          borderColor: data.color.text,
          opacity: 0.55,
        }}
      />
      {selected ? (
        <NodeColorToolbar
          activeColor={data.color}
          onSelectColor={(color) => updateNodeData(id, { color })}
          onCanvasInteraction={stopCanvasInteraction}
        />
      ) : null}
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

function NodeColorToolbar({
  activeColor,
  onSelectColor,
  onCanvasInteraction,
}: {
  activeColor: CanvasNodeColor;
  onSelectColor: (color: CanvasNodeColor) => void;
  onCanvasInteraction: (event: SyntheticEvent) => void;
}) {
  return (
    <div
      className="nodrag nopan nowheel absolute -top-10 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-surface-border bg-elevated/95 p-1 shadow-lg shadow-base/50 backdrop-blur"
      onPointerDown={onCanvasInteraction}
      onMouseDown={onCanvasInteraction}
      onClick={onCanvasInteraction}
      onDoubleClick={onCanvasInteraction}
    >
      {NODE_COLORS.map((color, index) => {
        const isActive =
          color.fill === activeColor.fill && color.text === activeColor.text;
        const swatchStyle = {
          "--swatch-fill": color.fill,
          "--swatch-text": color.text,
          "--swatch-glow": `color-mix(in srgb, ${color.text} 38%, transparent)`,
          backgroundColor: "var(--swatch-fill)",
          borderColor: isActive ? "var(--swatch-text)" : "var(--border-subtle)",
        } as CSSProperties;

        return (
          <button
            key={`${color.fill}-${color.text}`}
            type="button"
            aria-label={`Apply node color ${index + 1}`}
            aria-pressed={isActive}
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-xl border transition-[border-color,box-shadow,transform] hover:scale-105 hover:shadow-[0_0_0_3px_var(--swatch-glow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--swatch-text)] focus-visible:ring-offset-2 focus-visible:ring-offset-elevated",
              isActive && "shadow-[0_0_0_2px_var(--swatch-glow)]",
            )}
            style={swatchStyle}
            onClick={(event) => {
              event.stopPropagation();
              onSelectColor(color);
            }}
            onPointerDown={onCanvasInteraction}
            onMouseDown={onCanvasInteraction}
            onDoubleClick={onCanvasInteraction}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: "var(--swatch-text)" }}
            />
          </button>
        );
      })}
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
