import { tasks } from "@trigger.dev/sdk";

import type { designAgentTask } from "@/trigger/design-agent";
import {
  getAccessibleDesignProject,
  getDesignRequestIdentity,
  readDesignTriggerInput,
} from "@/lib/ai-design-api";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/project-api";

export async function POST(request: Request) {
  const [identityResult, input] = await Promise.all([
    getDesignRequestIdentity(),
    readDesignTriggerInput(request),
  ]);

  if ("error" in identityResult) {
    return identityResult.error;
  }

  if ("error" in input) {
    return input.error;
  }

  const projectResult = await getAccessibleDesignProject(
    input.projectId,
    identityResult.identity,
  );

  if ("error" in projectResult) {
    return projectResult.error;
  }

  try {
    const handle = await tasks.trigger<typeof designAgentTask>("design-agent", {
      prompt: input.prompt,
      roomId: input.roomId,
    });

    await prisma.taskRun.create({
      data: {
        runId: handle.id,
        projectId: input.projectId,
        userId: identityResult.identity.userId,
      },
      select: { runId: true },
    });

    return Response.json({ runId: handle.id }, { status: 201 });
  } catch (error) {
    console.error("Design task trigger failed.", error);

    return jsonError("Unable to trigger design task.", 500);
  }
}
