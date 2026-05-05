"use client";

import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";
import type { CanvasNodeColor, CanvasNodeShape } from "@/types/canvas";

interface CanvasShapeProps {
  shape: CanvasNodeShape;
  color: CanvasNodeColor;
  selected?: boolean;
  className?: string;
  children?: ReactNode;
}

const selectedStroke = "var(--node-text)";
const restStroke = "var(--border-subtle)";

export function CanvasShape({
  shape,
  color,
  selected = false,
  className,
  children,
}: CanvasShapeProps) {
  const stroke = selected ? selectedStroke : restStroke;
  const shapeStyle = {
    "--node-fill": color.fill,
    "--node-text": color.text,
    "--node-stroke": stroke,
  } as CSSProperties;

  if (shape === "diamond" || shape === "hexagon" || shape === "cylinder") {
    return (
      <div
        className={cn(
          "relative flex h-full min-h-12 w-full min-w-12 items-center justify-center text-center text-sm font-medium text-[color:var(--node-text)]",
          selected &&
            "drop-shadow-[0_0_10px_color-mix(in_srgb,var(--node-text)_22%,transparent)]",
          className,
        )}
        style={shapeStyle}
      >
        <SvgShape shape={shape} />
        {children ? (
          <span className="relative z-10 block max-w-[68%] truncate">
            {children}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex h-full min-h-12 w-full min-w-12 items-center justify-center border px-4 py-3 text-center text-sm font-medium text-[color:var(--node-text)] shadow-sm shadow-base/40",
        shape === "rectangle" && "rounded-xl",
        shape === "pill" && "rounded-full",
        shape === "circle" && "rounded-full px-3 py-3",
        selected ? "border-[color:var(--node-text)]" : "border-border-subtle",
        selected && "shadow-[0_0_0_1px_color-mix(in_srgb,var(--node-text)_18%,transparent)]",
        className,
      )}
      style={{
        ...shapeStyle,
        backgroundColor: "var(--node-fill)",
      }}
    >
      {children ? <span className="block truncate">{children}</span> : null}
    </div>
  );
}

function SvgShape({ shape }: { shape: "diamond" | "hexagon" | "cylinder" }) {
  if (shape === "diamond") {
    return (
      <svg
        className="absolute inset-0 h-full w-full overflow-visible"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <polygon
          points="50,2 98,50 50,98 2,50"
          fill="var(--node-fill)"
          stroke="var(--node-stroke)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  }

  if (shape === "hexagon") {
    return (
      <svg
        className="absolute inset-0 h-full w-full overflow-visible"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <polygon
          points="24,3 76,3 98,50 76,97 24,97 2,50"
          fill="var(--node-fill)"
          stroke="var(--node-stroke)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  }

  return (
    <svg
      className="absolute inset-0 h-full w-full overflow-visible"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M8 18C8 9.7 92 9.7 92 18V82C92 90.3 8 90.3 8 82V18Z"
        fill="var(--node-fill)"
        stroke="var(--node-stroke)"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
      <ellipse
        cx="50"
        cy="18"
        rx="42"
        ry="12"
        fill="var(--node-fill)"
        stroke="var(--node-stroke)"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M8 82C8 73.7 92 73.7 92 82"
        fill="none"
        stroke="var(--node-stroke)"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
