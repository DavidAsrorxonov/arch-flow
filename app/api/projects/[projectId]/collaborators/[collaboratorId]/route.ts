import { prisma } from "@/lib/prisma";
import {
  getAuthenticatedUserId,
  getOwnedProjectOrResponse,
  jsonError,
} from "@/lib/project-api";

interface ProjectCollaboratorRouteContext {
  params: Promise<{
    projectId: string;
    collaboratorId: string;
  }>;
}

export async function DELETE(
  _request: Request,
  { params }: ProjectCollaboratorRouteContext,
) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return jsonError("Unauthorized.", 401);
  }

  const { projectId, collaboratorId } = await params;
  const ownership = await getOwnedProjectOrResponse(projectId, userId);

  if ("error" in ownership) {
    return ownership.error;
  }

  const deletedCollaborator = await prisma.projectCollaborator.deleteMany({
    where: {
      id: collaboratorId,
      projectId,
    },
  });

  if (deletedCollaborator.count === 0) {
    return jsonError("Collaborator not found.", 404);
  }

  return Response.json({ success: true });
}
