import { createEnv } from "@t3-oss/env-core";
import { serverSchema } from "./env-schema";

/**
 * Single entry point for environment variables: nothing else reads
 * `process.env` (except `NODE_ENV`). Validation runs when this module is first
 * loaded — `next.config.ts` imports it so the build fails early too. Set
 * `SKIP_ENV_VALIDATION=1` to bypass it (Docker build without secrets, tests).
 */
export const env = createEnv({
  server: serverSchema,
  runtimeEnv: process.env,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
