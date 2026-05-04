import { prisma } from "@/lib/prisma";
import {
  getAuthenticatedUserId,
  getOwnedProjectOrResponse,
  jsonError,
  projectSelect,
  readRenameProjectInput,
} from "@/lib/project-api";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return jsonError("Unauthorized.", 401);
  }

  const { projectId } = await params;
  const ownership = await getOwnedProjectOrResponse(projectId, userId);

  if ("error" in ownership) {
    return ownership.error;
  }

  const input = await readRenameProjectInput(request);

  if ("error" in input) {
    return input.error;
  }

  const project = await prisma.project.update({
    where: { id: projectId },
    data: { name: input.name },
    select: projectSelect,
  });

  return Response.json({ project });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return jsonError("Unauthorized.", 401);
  }

  const { projectId } = await params;
  const ownership = await getOwnedProjectOrResponse(projectId, userId);

  if ("error" in ownership) {
    return ownership.error;
  }

  await prisma.project.delete({
    where: { id: projectId },
  });

  return Response.json({ success: true });
}
