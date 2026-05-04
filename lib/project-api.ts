import { auth, currentUser } from "@clerk/nextjs/server";

import type { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { ProjectListItem } from "@/types/projects";

export const projectSelect = {
  id: true,
  ownerId: true,
  name: true,
  description: true,
  status: true,
  canvasJsonPath: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProjectSelect;

export function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function getAuthenticatedUserId() {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return null;
  }

  return userId;
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

    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function readCreateProjectInput(request: Request) {
  const body = await readJsonObject(request);

  if (!body) {
    return { error: jsonError("Invalid JSON body.", 400) };
  }

  if (body.name !== undefined && typeof body.name !== "string") {
    return { error: jsonError("Project name must be a string.", 400) };
  }

  if (body.id !== undefined && typeof body.id !== "string") {
    return { error: jsonError("Project ID must be a string.", 400) };
  }

  const name = body.name?.trim() || "Untitled Project";
  const id = body.id?.trim();

  if (id && !/^[a-z0-9][a-z0-9-]{2,79}$/.test(id)) {
    return { error: jsonError("Project ID is invalid.", 400) };
  }

  return { id, name };
}

export async function readRenameProjectInput(request: Request) {
  const body = await readJsonObject(request);

  if (!body) {
    return { error: jsonError("Invalid JSON body.", 400) };
  }

  if (typeof body.name !== "string" || !body.name.trim()) {
    return { error: jsonError("Project name is required.", 400) };
  }

  return { name: body.name.trim() };
}

export async function getOwnedProjectOrResponse(
  projectId: string,
  ownerId: string,
) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      ownerId: true,
    },
  });

  if (!project) {
    return { error: jsonError("Project not found.", 404) };
  }

  if (project.ownerId !== ownerId) {
    return { error: jsonError("Forbidden.", 403) };
  }

  return { project };
}

function formatProjectListItem(
  project: Pick<Prisma.ProjectGetPayload<{ select: typeof projectSelect }>, "id" | "name">,
  isOwned: boolean,
): ProjectListItem {
  return {
    id: project.id,
    name: project.name,
    slug: project.id,
    ownerLabel: isOwned ? "Owned by you" : "Shared workspace",
    isOwned,
  };
}

export async function getEditorProjectLists() {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      ownedProjects: [] satisfies ProjectListItem[],
      sharedProjects: [] satisfies ProjectListItem[],
    };
  }

  const user = await currentUser();
  const emailAddresses =
    user?.emailAddresses.map((emailAddress) => emailAddress.emailAddress) ?? [];

  const [ownedProjects, sharedProjects] = await Promise.all([
    prisma.project.findMany({
      where: { ownerId: userId },
      orderBy: { updatedAt: "desc" },
      select: projectSelect,
    }),
    emailAddresses.length > 0
      ? prisma.project.findMany({
          where: {
            ownerId: { not: userId },
            collaborators: {
              some: {
                collaboratorEmail: {
                  in: emailAddresses,
                },
              },
            },
          },
          orderBy: { updatedAt: "desc" },
          select: projectSelect,
        })
      : Promise.resolve([]),
  ]);

  return {
    ownedProjects: ownedProjects.map((project) =>
      formatProjectListItem(project, true),
    ),
    sharedProjects: sharedProjects.map((project) =>
      formatProjectListItem(project, false),
    ),
  };
}
