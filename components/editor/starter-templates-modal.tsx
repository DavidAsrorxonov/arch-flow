"use client";

import { Download } from "lucide-react";
import type { ReactNode } from "react";

import type { CanvasTemplate } from "@/components/editor/starter-templates";
import { CANVAS_TEMPLATES } from "@/components/editor/starter-templates";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { CanvasNode, CanvasNodeShape } from "@/types/canvas";

interface StarterTemplatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (template: CanvasTemplate) => void;
}

interface Bounds {
  minX: number;
  minY: number;
  width: number;
  height: number;
}

const PREVIEW_PADDING = 56;
const FALLBACK_NODE_WIDTH = 148;
const FALLBACK_NODE_HEIGHT = 68;

export function StarterTemplatesModal({
  open,
  onOpenChange,
  onImport,
}: StarterTemplatesModalProps) {
  function handleImport(template: CanvasTemplate) {
    onImport(template);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] w-[min(92vw,88rem)] max-w-none gap-7 rounded-3xl border border-surface-border bg-surface p-6 text-copy-primary shadow-2xl shadow-base/60 sm:max-w-none sm:p-8">
        <DialogHeader className="pr-14">
          <DialogTitle className="text-2xl font-semibold text-copy-primary">
            Import template
          </DialogTitle>
          <DialogDescription className="max-w-4xl text-base leading-7">
            Choose a starter template to pre-populate your canvas. Existing
            nodes and edges will be replaced.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[66vh] pr-3">
          <div className="grid gap-5 lg:grid-cols-3">
            {CANVAS_TEMPLATES.map((template) => (
              <article
                key={template.id}
                className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-surface-border bg-elevated"
              >
                <TemplatePreview template={template} />
                <div className="flex flex-1 flex-col gap-5 p-5">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-copy-primary">
                      {template.name}
                    </h3>
                    <p className="min-h-24 text-sm leading-6 text-copy-secondary">
                      {template.description}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="mt-auto w-full gap-2"
                    onClick={() => handleImport(template)}
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    Import
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function TemplatePreview({ template }: { template: CanvasTemplate }) {
  const bounds = getTemplateBounds(template.nodes);
  const viewBox = `${bounds.minX - PREVIEW_PADDING} ${bounds.minY - PREVIEW_PADDING} ${
    bounds.width + PREVIEW_PADDING * 2
  } ${bounds.height + PREVIEW_PADDING * 2}`;

  return (
    <div className="h-56 border-b border-surface-border bg-base">
      <svg
        className="h-full w-full"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`${template.name} preview`}
      >
        <g stroke="var(--text-primary)" strokeOpacity="0.42" strokeWidth="2.5">
          {template.edges.map((edge) => {
            const source = template.nodes.find(
              (node) => node.id === edge.source,
            );
            const target = template.nodes.find(
              (node) => node.id === edge.target,
            );

            if (!source || !target) {
              return null;
            }

            const sourceCenter = getNodeCenter(source);
            const targetCenter = getNodeCenter(target);

            return (
              <line
                key={edge.id}
                x1={sourceCenter.x}
                y1={sourceCenter.y}
                x2={targetCenter.x}
                y2={targetCenter.y}
                strokeLinecap="round"
              />
            );
          })}
        </g>

        {template.nodes.map((node) => {
          const width = getNodeWidth(node);
          const height = getNodeHeight(node);

          return (
            <g key={node.id}>
              <PreviewNodeShape
                shape={node.data.shape}
                x={node.position.x}
                y={node.position.y}
                width={width}
                height={height}
                fill={node.data.color.fill}
                stroke={node.data.color.text}
              />
              <text
                x={node.position.x + width / 2}
                y={node.position.y + height / 2}
                fill={node.data.color.text}
                fontSize="18"
                fontWeight="600"
                opacity="0.72"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {node.data.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function PreviewNodeShape({
  shape,
  x,
  y,
  width,
  height,
  fill,
  stroke,
}: {
  shape: CanvasNodeShape;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
}) {
  const commonProps = {
    fill,
    stroke,
    strokeWidth: 2,
    vectorEffect: "non-scaling-stroke",
  };

  const shapes: Record<CanvasNodeShape, ReactNode> = {
    rectangle: (
      <rect
        {...commonProps}
        x={x}
        y={y}
        width={width}
        height={height}
        rx={14}
      />
    ),
    pill: (
      <rect
        {...commonProps}
        x={x}
        y={y}
        width={width}
        height={height}
        rx={height / 2}
      />
    ),
    circle: (
      <ellipse
        {...commonProps}
        cx={x + width / 2}
        cy={y + height / 2}
        rx={width / 2}
        ry={height / 2}
      />
    ),
    diamond: (
      <polygon
        {...commonProps}
        points={`${x + width / 2},${y} ${x + width},${y + height / 2} ${
          x + width / 2
        },${y + height} ${x},${y + height / 2}`}
      />
    ),
    hexagon: (
      <polygon
        {...commonProps}
        points={`${x + width * 0.24},${y} ${x + width * 0.76},${y} ${
          x + width
        },${y + height / 2} ${x + width * 0.76},${y + height} ${
          x + width * 0.24
        },${y + height} ${x},${y + height / 2}`}
      />
    ),
    cylinder: (
      <g>
        <path
          {...commonProps}
          d={`M${x} ${y + height * 0.22}C${x} ${y} ${x + width} ${y} ${
            x + width
          } ${y + height * 0.22}V${y + height * 0.82}C${x + width} ${
            y + height
          } ${x} ${y + height} ${x} ${y + height * 0.82}Z`}
        />
        <ellipse
          {...commonProps}
          cx={x + width / 2}
          cy={y + height * 0.22}
          rx={width / 2}
          ry={height * 0.18}
        />
      </g>
    ),
  };

  return shapes[shape];
}

function getTemplateBounds(nodes: CanvasNode[]): Bounds {
  if (nodes.length === 0) {
    return {
      minX: 0,
      minY: 0,
      width: 1,
      height: 1,
    };
  }

  const minX = Math.min(...nodes.map((node) => node.position.x));
  const minY = Math.min(...nodes.map((node) => node.position.y));
  const maxX = Math.max(
    ...nodes.map((node) => node.position.x + getNodeWidth(node)),
  );
  const maxY = Math.max(
    ...nodes.map((node) => node.position.y + getNodeHeight(node)),
  );

  return {
    minX,
    minY,
    width: Math.max(1, maxX - minX),
    height: Math.max(1, maxY - minY),
  };
}

function getNodeCenter(node: CanvasNode) {
  return {
    x: node.position.x + getNodeWidth(node) / 2,
    y: node.position.y + getNodeHeight(node) / 2,
  };
}

function getNodeWidth(node: CanvasNode) {
  return node.width ?? FALLBACK_NODE_WIDTH;
}

function getNodeHeight(node: CanvasNode) {
  return node.height ?? FALLBACK_NODE_HEIGHT;
}
