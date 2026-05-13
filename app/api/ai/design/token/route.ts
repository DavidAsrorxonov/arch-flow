import { auth } from "@trigger.dev/sdk";

import {
  getDesignRequestIdentity,
  getOwnedDesignTaskRun,
  readDesignTokenInput,
} from "@/lib/ai-design-api";
import { jsonError } from "@/lib/project-api";

export async function POST(request: Request) {
  const [identityResult, input] = await Promise.all([
    getDesignRequestIdentity(),
    readDesignTokenInput(request),
  ]);

  if ("error" in identityResult) {
    return identityResult.error;
  }

  if ("error" in input) {
    return input.error;
  }

  const taskRunResult = await getOwnedDesignTaskRun(
    input.runId,
    identityResult.identity.userId,
  );

  if ("error" in taskRunResult) {
    return taskRunResult.error;
  }

  try {
    const token = await auth.createPublicToken({
      scopes: {
        read: {
          runs: [taskRunResult.taskRun.runId],
        },
      },
      expirationTime: "1h",
    });

    return Response.json({ token });
  } catch (error) {
    console.error("Design task token creation failed.", error);

    return jsonError("Unable to create design task token.", 500);
  }
}
