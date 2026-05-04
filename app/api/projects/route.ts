import { prisma } from "@/lib/prisma";
import {
  getAuthenticatedUserId,
  jsonError,
  projectSelect,
  readCreateProjectInput,
} from "@/lib/project-api";

export async function GET() {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return jsonError("Unauthorized.", 401);
  }

  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { updatedAt: "desc" },
    select: projectSelect,
  });

  return Response.json({ projects });
}

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return jsonError("Unauthorized.", 401);
  }

  const input = await readCreateProjectInput(request);

  if ("error" in input) {
    return input.error;
  }

  if (input.id) {
    const existingProject = await prisma.project.findUnique({
      where: { id: input.id },
      select: { id: true },
    });

    if (existingProject) {
      return jsonError("Project ID already exists.", 409);
    }
  }

  const project = await prisma.project.create({
    data: {
      id: input.id,
      ownerId: userId,
      name: input.name,
    },
    select: projectSelect,
  });

  return Response.json({ project }, { status: 201 });
}
