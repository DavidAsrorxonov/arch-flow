import { getAccessibleProject, getCurrentClerkIdentity } from "@/lib/project-access";
import { getCursorColorForUserId, getLiveblocksClient } from "@/lib/liveblocks";
import { jsonError } from "@/lib/project-api";

async function readLiveblocksAuthInput(request: Request) {
  const body = await request.text();

  if (!body.trim()) {
    return { error: jsonError("Project ID is required.", 400) };
  }

  try {
    const parsed: unknown = JSON.parse(body);

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { error: jsonError("Project ID is required.", 400) };
    }

    const candidate =
      (parsed as { projectId?: unknown }).projectId ??
      (parsed as { room?: unknown }).room;

    if (typeof candidate !== "string" || !candidate.trim()) {
      return { error: jsonError("Project ID is required.", 400) };
    }

    return { projectId: candidate.trim() };
  } catch {
    return { error: jsonError("Invalid JSON body.", 400) };
  }
}

export async function POST(request: Request) {
  const [input, identity] = await Promise.all([
    readLiveblocksAuthInput(request),
    getCurrentClerkIdentity(),
  ]);

  if ("error" in input) {
    return input.error;
  }

  if (!identity) {
    return jsonError("Unauthorized.", 401);
  }

  const project = await getAccessibleProject(input.projectId, identity);

  if (!project) {
    return jsonError("Forbidden.", 403);
  }

  try {
    const liveblocks = getLiveblocksClient();

    await liveblocks.getOrCreateRoom(project.id, {
      defaultAccesses: [],
    });

    const session = liveblocks.prepareSession(identity.userId, {
      userInfo: {
        name: identity.displayName,
        avatar: identity.avatarUrl,
        cursorColor: getCursorColorForUserId(identity.userId),
      },
    });

    session.allow(project.id, session.FULL_ACCESS);

    const { body, status } = await session.authorize();

    return new Response(body, {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Liveblocks auth failed.", error);

    return jsonError("Unable to authorize Liveblocks session.", 500);
  }
}
