"use client";

import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
  useCanRedo,
  useCanUndo,
  useErrorListener,
  useRedo,
  useRoom,
  useUndo,
  useUpdateMyPresence,
} from "@liveblocks/react";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import {
  Background,
  BackgroundVariant,
  ConnectionLineType,
  ConnectionMode,
  MarkerType,
  ReactFlow,
  type DefaultEdgeOptions,
  type EdgeTypes,
  type NodeTypes,
  type ReactFlowInstance,
} from "@xyflow/react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type MouseEvent,
} from "react";

import { CanvasEdgeRenderer } from "@/components/editor/canvas-edge";
import { CanvasControlBar } from "@/components/editor/canvas-control-bar";
import { CanvasNodeRenderer } from "@/components/editor/canvas-node";
import {
  CanvasPresenceAvatars,
  LiveCanvasCursors,
} from "@/components/editor/canvas-presence";
import {
  parseShapeDragPayload,
  ShapePanel,
  SHAPE_DRAG_MIME_TYPE,
} from "@/components/editor/shape-panel";
import type { CanvasTemplate } from "@/components/editor/starter-templates";
import { StarterTemplatesModal } from "@/components/editor/starter-templates-modal";
import {
  type CanvasSaveStatus,
  useCanvasAutosave,
} from "@/hooks/use-canvas-autosave";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { isCanvasSnapshot } from "@/lib/canvas-snapshot";
import type { CanvasEdge, CanvasNode, CanvasSnapshot } from "@/types/canvas";
import { DEFAULT_NODE_COLOR } from "@/types/canvas";

interface CollaborativeCanvasProps {
  roomId: string;
  isStarterTemplatesOpen: boolean;
  onSaveStatusChange?: (status: CanvasSaveStatus) => void;
  onStarterTemplatesOpenChange: (open: boolean) => void;
}

export function CollaborativeCanvas({
  roomId,
  isStarterTemplatesOpen,
  onSaveStatusChange,
  onStarterTemplatesOpenChange,
}: CollaborativeCanvasProps) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider
        id={roomId}
        initialPresence={{ cursor: null, thinking: false }}
      >
        <ClientSideSuspense fallback={<CanvasLoadingState />}>
          {() => (
            <CanvasConnectionBoundary
              roomId={roomId}
              isStarterTemplatesOpen={isStarterTemplatesOpen}
              onSaveStatusChange={onSaveStatusChange}
              onStarterTemplatesOpenChange={onStarterTemplatesOpenChange}
            />
          )}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}

function CanvasConnectionBoundary({
  roomId,
  isStarterTemplatesOpen,
  onSaveStatusChange,
  onStarterTemplatesOpenChange,
}: CollaborativeCanvasProps) {
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const handleError = useCallback((error: Error) => {
    setConnectionError(error.message || "Unable to connect to Liveblocks.");
  }, []);

  useErrorListener(handleError);

  if (connectionError) {
    return <CanvasErrorState message={connectionError} />;
  }

  return (
    <LiveblocksReactFlowCanvas
      roomId={roomId}
      isStarterTemplatesOpen={isStarterTemplatesOpen}
      onSaveStatusChange={onSaveStatusChange}
      onStarterTemplatesOpenChange={onStarterTemplatesOpenChange}
    />
  );
}

function LiveblocksReactFlowCanvas({
  roomId,
  isStarterTemplatesOpen,
  onSaveStatusChange,
  onStarterTemplatesOpenChange,
}: CollaborativeCanvasProps) {
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance<
    CanvasNode,
    CanvasEdge
  > | null>(null);
  const [hasCheckedSavedCanvas, setHasCheckedSavedCanvas] = useState(false);
  const [hasSkippedSavedLoad, setHasSkippedSavedLoad] = useState(false);
  const [pendingFitNodeIds, setPendingFitNodeIds] = useState<string[]>([]);
  const undo = useUndo();
  const redo = useRedo();
  const room = useRoom();
  const updateMyPresence = useUpdateMyPresence();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
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
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  const isAutosaveEnabled =
    hasCheckedSavedCanvas ||
    hasSkippedSavedLoad ||
    nodes.length > 0 ||
    edges.length > 0;

  useCanvasAutosave({
    projectId: roomId,
    nodes,
    edges,
    enabled: isAutosaveEnabled,
    onStatusChange: onSaveStatusChange,
  });

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  const handleUndo = useCallback(() => {
    if (canUndo) {
      undo();
    }
  }, [canUndo, undo]);

  const handleRedo = useCallback(() => {
    if (canRedo) {
      redo();
    }
  }, [canRedo, redo]);

  useKeyboardShortcuts({
    reactFlowInstance,
    onUndo: handleUndo,
    onRedo: handleRedo,
  });

  useEffect(() => {
    if (!reactFlowInstance || pendingFitNodeIds.length === 0) {
      return;
    }

    const loadedNodeIds = new Set(nodes.map((node) => node.id));
    const isTemplateLoaded = pendingFitNodeIds.every((nodeId) =>
      loadedNodeIds.has(nodeId),
    );

    if (!isTemplateLoaded) {
      return;
    }

    const animationFrame = window.requestAnimationFrame(() => {
      void reactFlowInstance.fitView({
        nodes: pendingFitNodeIds.map((id) => ({ id })),
        padding: 0.22,
        duration: 320,
      });
      setPendingFitNodeIds([]);
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [nodes, pendingFitNodeIds, reactFlowInstance]);

  useEffect(() => {
    if (
      !reactFlowInstance ||
      hasCheckedSavedCanvas ||
      hasSkippedSavedLoad
    ) {
      return;
    }

    if (nodes.length > 0 || edges.length > 0) {
      const timeout = window.setTimeout(() => {
        setHasSkippedSavedLoad(true);
      }, 0);

      return () => window.clearTimeout(timeout);
    }

    let isMounted = true;
    const flow = reactFlowInstance;

    async function loadSavedCanvas() {
      try {
        const response = await fetch(
          `/api/projects/${encodeURIComponent(roomId)}/canvas`,
        );

        if (!response.ok) {
          throw new Error("Saved canvas load failed.");
        }

        const payload: unknown = await response.json();
        const canvas = readCanvasSnapshotResponse(payload);

        if (
          !isMounted ||
          !canvas ||
          nodesRef.current.length > 0 ||
          edgesRef.current.length > 0
        ) {
          return;
        }

        room.batch(() => {
          flow.addNodes(canvas.nodes);
          flow.addEdges(canvas.edges);
          setPendingFitNodeIds(canvas.nodes.map((node) => node.id));
        });
      } catch (error) {
        console.error(error);
        onSaveStatusChange?.("error");
      } finally {
        if (isMounted) {
          setHasCheckedSavedCanvas(true);
        }
      }
    }

    void loadSavedCanvas();

    return () => {
      isMounted = false;
    };
  }, [
    edges.length,
    hasCheckedSavedCanvas,
    hasSkippedSavedLoad,
    nodes.length,
    onSaveStatusChange,
    reactFlowInstance,
    room,
    roomId,
  ]);

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

  const handleCanvasMouseMove = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const bounds = event.currentTarget.getBoundingClientRect();

      updateMyPresence(
        {
          cursor: {
            x: event.clientX - bounds.left,
            y: event.clientY - bounds.top,
          },
        },
        { addToHistory: false },
      );
    },
    [updateMyPresence],
  );

  const handleCanvasMouseLeave = useCallback(() => {
    updateMyPresence({ cursor: null }, { addToHistory: false });
  }, [updateMyPresence]);

  const handleImportTemplate = useCallback(
    (template: CanvasTemplate) => {
      if (!reactFlowInstance) {
        return;
      }

      const idMap = new Map(
        template.nodes.map((node) => [node.id, crypto.randomUUID()]),
      );
      const templateNodes = template.nodes.map((node) =>
        cloneTemplateNode(node, idMap.get(node.id) ?? crypto.randomUUID()),
      );
      const templateEdges = template.edges.map((edge) =>
        cloneTemplateEdge(edge, idMap),
      );

      room.batch(() => {
        onDelete({ nodes, edges });
        reactFlowInstance.addNodes(templateNodes);
        reactFlowInstance.addEdges(templateEdges);
        setPendingFitNodeIds(templateNodes.map((node) => node.id));
      });
    },
    [edges, nodes, onDelete, reactFlowInstance, room],
  );

  return (
    <div className="relative h-full w-full bg-base">
      <ReactFlow<CanvasNode, CanvasEdge>
        className="h-full w-full bg-base"
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
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={handleCanvasMouseLeave}
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
        <Background
          color="var(--border-subtle)"
          gap={24}
          size={1.5}
          variant={BackgroundVariant.Dots}
        />
        <CanvasControlBar
          reactFlowInstance={reactFlowInstance}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canUndo}
          canRedo={canRedo}
        />
        <ShapePanel />
      </ReactFlow>
      <LiveCanvasCursors />
      <CanvasPresenceAvatars />

      <StarterTemplatesModal
        open={isStarterTemplatesOpen}
        onOpenChange={onStarterTemplatesOpenChange}
        onImport={handleImportTemplate}
      />
    </div>
  );
}

function cloneTemplateNode(node: CanvasNode, id: string): CanvasNode {
  return {
    ...node,
    id,
    selected: false,
    position: { ...node.position },
    data: {
      label: node.data.label,
      color: { ...node.data.color },
      shape: node.data.shape,
    },
  };
}

function cloneTemplateEdge(
  edge: CanvasEdge,
  idMap: ReadonlyMap<string, string>,
): CanvasEdge {
  return {
    ...edge,
    id: crypto.randomUUID(),
    source: idMap.get(edge.source) ?? edge.source,
    target: idMap.get(edge.target) ?? edge.target,
    selected: false,
    data: {
      label: edge.data?.label ?? "",
    },
    markerEnd:
      typeof edge.markerEnd === "object" ? { ...edge.markerEnd } : edge.markerEnd,
  };
}

function readCanvasSnapshotResponse(value: unknown): CanvasSnapshot | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const canvas = (value as { canvas?: unknown }).canvas;

  if (!isCanvasSnapshot(canvas)) {
    return null;
  }

  return canvas;
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
