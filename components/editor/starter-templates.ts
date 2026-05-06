import { MarkerType } from "@xyflow/react";

import type {
  CanvasEdge,
  CanvasNode,
  CanvasNodeShape,
} from "@/types/canvas";
import { NODE_COLORS } from "@/types/canvas";

export interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

function node(
  id: string,
  label: string,
  x: number,
  y: number,
  shape: CanvasNodeShape,
  colorIndex: number,
  width = 148,
  height = 68,
): CanvasNode {
  return {
    id,
    type: "canvasNode",
    position: { x, y },
    width,
    height,
    data: {
      label,
      color: NODE_COLORS[colorIndex] ?? NODE_COLORS[0],
      shape,
    },
  };
}

function edge(
  id: string,
  source: string,
  target: string,
  label = "",
): CanvasEdge {
  return {
    id,
    source,
    target,
    type: "canvasEdge",
    data: {
      label,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "var(--text-primary)",
      width: 18,
      height: 18,
    },
    interactionWidth: 24,
  };
}

export const CANVAS_TEMPLATES = [
  {
    id: "microservices-platform",
    name: "Microservices Platform",
    description:
      "API gateway, domain services, service databases, cache, queue, and observability boundaries.",
    nodes: [
      node("ms-client", "Web / Mobile Clients", 0, 90, "hexagon", 1),
      node("ms-gateway", "API Gateway", 220, 90, "pill", 7),
      node("ms-auth", "Auth Service", 450, 0, "pill", 2),
      node("ms-orders", "Orders Service", 450, 110, "pill", 3),
      node("ms-billing", "Billing Service", 450, 220, "pill", 4),
      node("ms-auth-db", "User DB", 700, 0, "cylinder", 1, 122, 72),
      node("ms-orders-db", "Orders DB", 700, 110, "cylinder", 3, 122, 72),
      node("ms-billing-db", "Ledger DB", 700, 220, "cylinder", 4, 122, 72),
      node("ms-cache", "Shared Cache", 220, 235, "cylinder", 6, 142, 72),
      node("ms-events", "Event Bus", 450, 350, "rectangle", 5, 160, 64),
      node("ms-observability", "Observability", 700, 350, "hexagon", 2),
    ],
    edges: [
      edge("ms-client-gateway", "ms-client", "ms-gateway"),
      edge("ms-gateway-auth", "ms-gateway", "ms-auth"),
      edge("ms-gateway-orders", "ms-gateway", "ms-orders"),
      edge("ms-gateway-billing", "ms-gateway", "ms-billing"),
      edge("ms-auth-db-edge", "ms-auth", "ms-auth-db"),
      edge("ms-orders-db-edge", "ms-orders", "ms-orders-db"),
      edge("ms-billing-db-edge", "ms-billing", "ms-billing-db"),
      edge("ms-gateway-cache", "ms-gateway", "ms-cache"),
      edge("ms-orders-events", "ms-orders", "ms-events", "publishes"),
      edge("ms-billing-events", "ms-billing", "ms-events", "publishes"),
      edge("ms-events-observability", "ms-events", "ms-observability"),
    ],
  },
  {
    id: "ci-cd-pipeline",
    name: "CI/CD Pipeline",
    description:
      "Source control, build, test, security scan, artifact registry, deploy decision, and runtime environments.",
    nodes: [
      node("cicd-dev", "Developer", 0, 110, "hexagon", 1, 130, 68),
      node("cicd-repo", "Git Repository", 190, 110, "rectangle", 2),
      node("cicd-ci", "CI Runner", 390, 110, "pill", 7),
      node("cicd-build", "Build", 590, 0, "rectangle", 3, 130, 64),
      node("cicd-test", "Automated Tests", 590, 110, "rectangle", 6),
      node("cicd-scan", "Security Scan", 590, 220, "rectangle", 4),
      node("cicd-registry", "Artifact Registry", 800, 110, "cylinder", 5, 150, 76),
      node("cicd-approval", "Deploy?", 1010, 110, "diamond", 3, 116, 86),
      node("cicd-staging", "Staging", 1200, 10, "hexagon", 7),
      node("cicd-prod", "Production", 1200, 210, "hexagon", 4),
    ],
    edges: [
      edge("cicd-dev-repo", "cicd-dev", "cicd-repo", "push"),
      edge("cicd-repo-ci", "cicd-repo", "cicd-ci", "trigger"),
      edge("cicd-ci-build", "cicd-ci", "cicd-build"),
      edge("cicd-ci-test", "cicd-ci", "cicd-test"),
      edge("cicd-ci-scan", "cicd-ci", "cicd-scan"),
      edge("cicd-build-registry", "cicd-build", "cicd-registry"),
      edge("cicd-test-registry", "cicd-test", "cicd-registry"),
      edge("cicd-scan-registry", "cicd-scan", "cicd-registry"),
      edge("cicd-registry-approval", "cicd-registry", "cicd-approval"),
      edge("cicd-approval-staging", "cicd-approval", "cicd-staging", "yes"),
      edge("cicd-approval-prod", "cicd-approval", "cicd-prod", "promote"),
    ],
  },
  {
    id: "event-driven-commerce",
    name: "Event-Driven Commerce",
    description:
      "Order intake, brokered domain events, consumers, projections, notifications, and analytics.",
    nodes: [
      node("event-client", "Shopfront", 0, 130, "hexagon", 1),
      node("event-api", "Orders API", 220, 130, "pill", 7),
      node("event-order-db", "Order Store", 440, 20, "cylinder", 3, 136, 76),
      node("event-broker", "Event Broker", 440, 170, "rectangle", 5, 160, 66),
      node("event-inventory", "Inventory Consumer", 690, 0, "pill", 6),
      node("event-payment", "Payment Consumer", 690, 110, "pill", 4),
      node("event-email", "Email Worker", 690, 220, "pill", 2),
      node("event-read-model", "Read Model", 930, 0, "cylinder", 7, 136, 76),
      node("event-analytics", "Analytics Lake", 930, 160, "cylinder", 1, 150, 76),
      node("event-alerts", "Ops Alerts", 930, 300, "circle", 3, 116, 86),
    ],
    edges: [
      edge("event-client-api", "event-client", "event-api"),
      edge("event-api-db", "event-api", "event-order-db"),
      edge("event-api-broker", "event-api", "event-broker", "OrderCreated"),
      edge("event-broker-inventory", "event-broker", "event-inventory"),
      edge("event-broker-payment", "event-broker", "event-payment"),
      edge("event-broker-email", "event-broker", "event-email"),
      edge("event-inventory-read", "event-inventory", "event-read-model"),
      edge("event-payment-read", "event-payment", "event-read-model"),
      edge("event-broker-analytics", "event-broker", "event-analytics"),
      edge("event-payment-alerts", "event-payment", "event-alerts"),
    ],
  },
] satisfies CanvasTemplate[];
