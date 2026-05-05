"use client";

import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
  useErrorListener,
} from "@liveblocks/react";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import {
  Background,
  BackgroundVariant,
  ConnectionLineType,
  ConnectionMode,
  MarkerType,
  MiniMap,
  ReactFlow,
  type DefaultEdgeOptions,
  type EdgeTypes,
  type NodeTypes,
  type ReactFlowInstance,
} from "@xyflow/react";
import { useCallback, useMemo, useRef, useState, type DragEvent } from "react";

import { CanvasEdgeRenderer } from "@/components/editor/canvas-edge";
import { CanvasNodeRenderer } from "@/components/editor/canvas-node";
import {
  parseShapeDragPayload,
  ShapePanel,
  SHAPE_DRAG_MIME_TYPE,
} from "@/components/editor/shape-panel";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";
import { DEFAULT_NODE_COLOR } from "@/types/canvas";

interface CollaborativeCanvasProps {
  roomId: string;
}

export function CollaborativeCanvas({ roomId }: CollaborativeCanvasProps) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider
        id={roomId}
        initialPresence={{ cursor: null, isThinking: false }}
      >
        <ClientSideSuspense fallback={<CanvasLoadingState />}>
          {() => <CanvasConnectionBoundary />}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}

function CanvasConnectionBoundary() {
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const handleError = useCallback((error: Error) => {
    setConnectionError(error.message || "Unable to connect to Liveblocks.");
  }, []);

  useErrorListener(handleError);

  if (connectionError) {
    return <CanvasErrorState message={connectionError} />;
  }

  return <LiveblocksReactFlowCanvas />;
}

function LiveblocksReactFlowCanvas() {
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance<CanvasNode, CanvasEdge> | null>(null);
  const nodeCounterRef = useRef(0);
  const nodeTypes = useMemo(
    () =>
      ({
        canvasNode: CanvasNodeRenderer,
      }) satisfies NodeTypes,
    [],
  );
  const edgeTypes = useMemo(
    () =>
      ({
        canvasEdge: CanvasEdgeRenderer,
      }) satisfies EdgeTypes,
    [],
  );
  const defaultEdgeOptions = useMemo(
    () =>
      ({
        type: "canvasEdge",
        data: {
          label: "",
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "var(--text-primary)",
          width: 18,
          height: 18,
        },
        interactionWidth: 24,
      }) satisfies DefaultEdgeOptions,
    [],
  );
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      suspense: true,
      nodes: {
        initial: [],
      },
      edges: {
        initial: [],
      },
    });

  const handleConnect = useCallback(
    (connection: Parameters<typeof onConnect>[0]) => {
      onConnect({
        ...defaultEdgeOptions,
        ...connection,
      } as Parameters<typeof onConnect>[0]);
    },
    [defaultEdgeOptions, onConnect],
  );

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    if (!event.dataTransfer.types.includes(SHAPE_DRAG_MIME_TYPE)) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (!reactFlowInstance) {
        return;
      }

      const payload = parseShapeDragPayload(
        event.dataTransfer.getData(SHAPE_DRAG_MIME_TYPE),
      );

      if (!payload) {
        return;
      }

      nodeCounterRef.current += 1;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: CanvasNode = {
        id: `${payload.shape}-${Date.now()}-${nodeCounterRef.current}`,
        type: "canvasNode",
        position,
        width: payload.size.width,
        height: payload.size.height,
        data: {
          label: "",
          color: DEFAULT_NODE_COLOR,
          shape: payload.shape,
        },
      };

      reactFlowInstance.addNodes(newNode);
    },
    [reactFlowInstance],
  );

  return (
    <ReactFlow<CanvasNode, CanvasEdge>
      className="bg-base"
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      defaultEdgeOptions={defaultEdgeOptions}
      onInit={setReactFlowInstance}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={handleConnect}
      onDelete={onDelete}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      connectionMode={ConnectionMode.Loose}
      connectionLineType={ConnectionLineType.SmoothStep}
      connectionLineStyle={{
        stroke: "var(--text-primary)",
        strokeOpacity: 0.6,
        strokeWidth: 2,
      }}
      defaultMarkerColor="var(--text-primary)"
      fitView
    >
      <MiniMap<CanvasNode>
        bgColor="var(--bg-surface)"
        maskColor="var(--bg-base)"
        maskStrokeColor="var(--border-default)"
        nodeColor={(node) => node.data.color.fill}
        nodeStrokeColor="var(--border-subtle)"
        pannable
        zoomable
      />
      <Background
        color="var(--border-subtle)"
        gap={24}
        size={1.5}
        variant={BackgroundVariant.Dots}
      />
      <ShapePanel />
    </ReactFlow>
  );
}

function CanvasLoadingState() {
  return (
    <div className="flex h-full items-center justify-center bg-base px-6 text-center">
      <p className="text-sm font-medium text-copy-secondary">
        Loading shared canvas...
      </p>
    </div>
  );
}

function CanvasErrorState({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center bg-base px-6 text-center">
      <div>
        <p className="text-sm font-semibold text-copy-primary">
          Canvas connection failed
        </p>
        <p className="mt-2 max-w-md text-sm leading-6 text-copy-muted">
          {message}
        </p>
      </div>
    </div>
  );
}
