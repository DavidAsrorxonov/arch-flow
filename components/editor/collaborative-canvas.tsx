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
  ConnectionMode,
  MiniMap,
  ReactFlow,
} from "@xyflow/react";
import { useCallback, useState } from "react";

import type { CanvasEdge, CanvasNode } from "@/types/canvas";

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

  return (
    <ReactFlow<CanvasNode, CanvasEdge>
      className="bg-base"
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onDelete={onDelete}
      connectionMode={ConnectionMode.Loose}
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
