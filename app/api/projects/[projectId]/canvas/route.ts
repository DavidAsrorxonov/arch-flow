import { get, put } from "@vercel/blob";

import { prisma } from "@/lib/prisma";
import {
  getAccessibleProject,
  getCurrentClerkIdentity,
} from "@/lib/project-access";
import { isCanvasSnapshot } from "@/lib/canvas-snapshot";
import { jsonError } from "@/lib/project-api";

async function getAuthorizedProject(projectId: string) {
  const identity = await getCurrentClerkIdentity();

  if (!identity) {
    return { error: jsonError("Unauthorized.", 401) };
  }

  const project = await getAccessibleProject(projectId, identity);

  if (!project) {
    return { error: jsonError("Forbidden.", 403) };
  }

  return { project };
}

async function readCanvasSnapshot(request: Request) {
  try {
    const parsed: unknown = await request.json();

    if (!isCanvasSnapshot(parsed)) {
      return { error: jsonError("Canvas snapshot is invalid.", 400) };
    }

    return { canvas: parsed };
  } catch {
    return { error: jsonError("Invalid JSON body.", 400) };
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  const authorization = await getAuthorizedProject(projectId);

  if ("error" in authorization) {
    return authorization.error;
  }

  if (!authorization.project.canvasJsonPath) {
    return Response.json({ canvas: null });
  }

  try {
    const blob = await get(authorization.project.canvasJsonPath, {
      access: "private",
      useCache: false,
    });

    if (!blob || blob.statusCode !== 200 || !blob.stream) {
      return Response.json({ canvas: null });
    }

    const parsed: unknown = await new Response(blob.stream).json();

    if (!isCanvasSnapshot(parsed)) {
      return jsonError("Saved canvas snapshot is invalid.", 500);
    }

    return Response.json({ canvas: parsed });
  } catch (error) {
    console.error("Canvas load failed.", error);

    return jsonError("Unable to load canvas.", 500);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  const [authorization, input] = await Promise.all([
    getAuthorizedProject(projectId),
    readCanvasSnapshot(request),
  ]);

  if ("error" in authorization) {
    return authorization.error;
  }

  if ("error" in input) {
    return input.error;
  }

  try {
    const blob = await put(
      `canvas/${projectId}.json`,
      JSON.stringify(input.canvas),
      {
        access: "private",
        allowOverwrite: true,
        contentType: "application/json",
      },
    );

    await prisma.project.update({
      where: { id: projectId },
      data: { canvasJsonPath: blob.url },
      select: { id: true },
    });

    return Response.json({ canvasJsonPath: blob.url });
  } catch (error) {
    console.error("Canvas save failed.", error);

    return jsonError("Unable to save canvas.", 500);
  }
}
