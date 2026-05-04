import { clerkClient } from "@clerk/nextjs/server";

import type { Prisma } from "@/app/generated/prisma/client";
import type { CollaboratorListItem } from "@/types/collaborators";

export const collaboratorSelect = {
  id: true,
  projectId: true,
  collaboratorEmail: true,
  createdAt: true,
} satisfies Prisma.ProjectCollaboratorSelect;

type CollaboratorRecord = Prisma.ProjectCollaboratorGetPayload<{
  select: typeof collaboratorSelect;
}>;

export function normalizeCollaboratorEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidCollaboratorEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function formatDisplayName(user: {
  firstName: string | null;
  lastName: string | null;
  username: string | null;
}) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");

  return fullName || user.username || null;
}

export async function formatCollaborators(
  collaborators: CollaboratorRecord[],
): Promise<CollaboratorListItem[]> {
  const emails = collaborators.map(
    (collaborator) => collaborator.collaboratorEmail,
  );
  const usersByEmail = new Map<
    string,
    {
      displayName: string | null;
      avatarUrl: string | null;
    }
  >();

  if (emails.length > 0) {
    try {
      const client = await clerkClient();
      const users = await client.users.getUserList({
        emailAddress: emails,
        limit: emails.length,
      });

      for (const user of users.data) {
        for (const emailAddress of user.emailAddresses) {
          const email = normalizeCollaboratorEmail(emailAddress.emailAddress);

          if (emails.includes(email)) {
            usersByEmail.set(email, {
              displayName: formatDisplayName(user),
              avatarUrl: user.imageUrl || null,
            });
          }
        }
      }
    } catch {
      // Collaborator access should still work if Clerk profile enrichment fails.
    }
  }

  return collaborators.map((collaborator) => {
    const enrichedUser = usersByEmail.get(collaborator.collaboratorEmail);

    return {
      id: collaborator.id,
      email: collaborator.collaboratorEmail,
      displayName: enrichedUser?.displayName ?? null,
      avatarUrl: enrichedUser?.avatarUrl ?? null,
      createdAt: collaborator.createdAt.toISOString(),
    };
  });
}
