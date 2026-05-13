import { logger, task } from "@trigger.dev/sdk";

export interface DesignAgentPayload {
  prompt: string;
  roomId: string;
}

export const designAgentTask = task({
  id: "design-agent",
  run: async (payload: DesignAgentPayload) => {
    logger.info("Design agent task received input.", {
      prompt: payload.prompt,
      roomId: payload.roomId,
    });

    return {
      prompt: payload.prompt,
      roomId: payload.roomId,
    };
  },
});
