import { auth, currentUser } from "@clerk/nextjs/server";

import type { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizeCollaboratorEmail } from "@/lib/project-collaborators";

export interface ClerkProjectIdentity {
  userId: string;
  primaryEmail: string | null;
}

export const accessibleProjectSelect = {
  id: true,
  ownerId: true,
  name: true,
  description: true,
  status: true,
  canvasJsonPath: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProjectSelect;

export type AccessibleProject = Prisma.ProjectGetPayload<{
  select: typeof accessibleProjectSelect;
}>;

export async function getCurrentClerkIdentity() {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return null;
  }

  const user = await currentUser();
  const primaryEmail =
    user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses[0]?.emailAddress;

  return {
    userId,
    primaryEmail: primaryEmail ? normalizeCollaboratorEmail(primaryEmail) : null,
  } satisfies ClerkProjectIdentity;
}

export async function getAccessibleProject(
  roomId: string,
  identity: ClerkProjectIdentity,
) {
  const accessConditions: Prisma.ProjectWhereInput[] = [
    { ownerId: identity.userId },
  ];

  if (identity.primaryEmail) {
    accessConditions.push({
      collaborators: {
        some: {
          collaboratorEmail: identity.primaryEmail,
        },
      },
    });
  }

  return prisma.project.findFirst({
    where: {
      id: roomId,
      OR: accessConditions,
    },
    select: accessibleProjectSelect,
  });
}
