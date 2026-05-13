import { defineConfig } from "@trigger.dev/sdk";
import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

const projectRef = process.env.TRIGGER_PROJECT_REF;
if (!projectRef) {
  throw new Error("TRIGGER_PROJECT_REF is required to run Trigger.dev tasks.");
}

export default defineConfig({
  project: projectRef,
  runtime: "node",
  dirs: ["./trigger"],
  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  build: {
    extensions: [],
  },
  maxDuration: 3600,
});
