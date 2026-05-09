import { task } from "@trigger.dev/sdk";

interface TriggerHealthcheckPayload {
  message?: string;
}

export const triggerHealthcheck = task({
  id: "trigger-healthcheck",
  run: async (payload: TriggerHealthcheckPayload) => {
    return {
      message: payload.message ?? "Trigger.dev is configured for ArchFlow.",
      timestamp: new Date().toISOString(),
    };
  },
});
