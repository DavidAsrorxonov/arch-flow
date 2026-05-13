import { prisma } from "@/lib/prisma";
import {
  type ClerkProjectIdentity,
  getAccessibleProject,
  getCurrentClerkIdentity,
} from "@/lib/project-access";
import { jsonError } from "@/lib/project-api";

interface JsonBody {
  [key: string]: unknown;
}

export interface DesignTriggerInput {
  prompt: string;
  projectId: string;
  roomId: string;
}

export interface DesignTokenInput {
  runId: string;
}

async function readJsonObject(request: Request) {
  const body = await request.text();

  if (!body.trim()) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(body);

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }

    return parsed as JsonBody;
  } catch {
    return null;
  }
}

export async function readDesignTriggerInput(request: Request) {
  const body = await readJsonObject(request);

  if (!body) {
    return { error: jsonError("Invalid JSON body.", 400) };
  }

  if (typeof body.prompt !== "string" || !body.prompt.trim()) {
    return { error: jsonError("Design prompt is required.", 400) };
  }

  if (typeof body.projectId !== "string" || !body.projectId.trim()) {
    return { error: jsonError("Project ID is required.", 400) };
  }

  if (typeof body.roomId !== "string" || !body.roomId.trim()) {
    return { error: jsonError("Room ID is required.", 400) };
  }

  const projectId = body.projectId.trim();
  const roomId = body.roomId.trim();

  if (projectId !== roomId) {
    return { error: jsonError("Project ID and room ID must match.", 400) };
  }

  return {
    prompt: body.prompt.trim(),
    projectId,
    roomId,
  } satisfies DesignTriggerInput;
}

export async function readDesignTokenInput(request: Request) {
  const body = await readJsonObject(request);

  if (!body) {
    return { error: jsonError("Invalid JSON body.", 400) };
  }

  if (typeof body.runId !== "string" || !body.runId.trim()) {
    return { error: jsonError("Run ID is required.", 400) };
  }

  return {
    runId: body.runId.trim(),
  } satisfies DesignTokenInput;
}

export async function getDesignRequestIdentity() {
  const identity = await getCurrentClerkIdentity();

  if (!identity) {
    return { error: jsonError("Unauthorized.", 401) };
  }

  return { identity };
}

export async function getAccessibleDesignProject(
  projectId: string,
  identity: ClerkProjectIdentity,
) {
  const project = await getAccessibleProject(projectId, identity);

  if (!project) {
    return { error: jsonError("Forbidden.", 403) };
  }

  return { project };
}

export async function getOwnedDesignTaskRun(runId: string, userId: string) {
  const taskRun = await prisma.taskRun.findUnique({
    where: { runId },
    select: {
      runId: true,
      projectId: true,
      userId: true,
    },
  });

  if (!taskRun || taskRun.userId !== userId) {
    return { error: jsonError("Task run not found.", 404) };
  }

  return { taskRun };
}
