import { prisma } from "@/lib/prisma";
import {
  getAuthenticatedUserId,
  getOwnedProjectOrResponse,
  jsonError,
} from "@/lib/project-api";
import {
  formatCollaborators,
  isValidCollaboratorEmail,
  normalizeCollaboratorEmail,
  collaboratorSelect,
} from "@/lib/project-collaborators";
import {
  getAccessibleProject,
  getCurrentClerkIdentity,
} from "@/lib/project-access";

interface ProjectCollaboratorsRouteContext {
  params: Promise<{
    projectId: string;
  }>;
}

async function readInviteInput(request: Request) {
  const body = await request.text();

  if (!body.trim()) {
    return { error: jsonError("Email is required.", 400) };
  }

  try {
    const parsed: unknown = JSON.parse(body);

    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof (parsed as { email?: unknown }).email !== "string"
    ) {
      return { error: jsonError("Email is required.", 400) };
    }

    const email = normalizeCollaboratorEmail(
      (parsed as { email: string }).email,
    );

    if (!isValidCollaboratorEmail(email)) {
      return { error: jsonError("Enter a valid email address.", 400) };
    }

    return { email };
  } catch {
    return { error: jsonError("Invalid JSON body.", 400) };
  }
}

export async function GET(
  _request: Request,
  { params }: ProjectCollaboratorsRouteContext,
) {
  const [{ projectId }, identity] = await Promise.all([
    params,
    getCurrentClerkIdentity(),
  ]);

  if (!identity) {
    return jsonError("Unauthorized.", 401);
  }

  const project = await getAccessibleProject(projectId, identity);

  if (!project) {
    return jsonError("Project not found.", 404);
  }

  const collaborators = await prisma.projectCollaborator.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
    select: collaboratorSelect,
  });

  return Response.json({
    collaborators: await formatCollaborators(collaborators),
    canManageAccess: project.ownerId === identity.userId,
  });
}

export async function POST(
  request: Request,
  { params }: ProjectCollaboratorsRouteContext,
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

  const input = await readInviteInput(request);

  if ("error" in input) {
    return input.error;
  }

  const collaborator = await prisma.projectCollaborator.upsert({
    where: {
      projectId_collaboratorEmail: {
        projectId,
        collaboratorEmail: input.email,
      },
    },
    update: {},
    create: {
      projectId,
      collaboratorEmail: input.email,
    },
    select: collaboratorSelect,
  });

  const [formattedCollaborator] = await formatCollaborators([collaborator]);

  return Response.json({ collaborator: formattedCollaborator }, { status: 201 });
}
