import { createEnv } from "@t3-oss/env-core";
import { defineConfig } from "drizzle-kit";
import { serverSchema } from "./src/server/env-schema";

// Only DATABASE_URL matters for migrations: don't demand the SMTP/HelloAsso
// variables just to run drizzle-kit.
const env = createEnv({
  server: { DATABASE_URL: serverSchema.DATABASE_URL },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});

export default defineConfig({
  schema: "./src/server/db/schema.ts",
  out: "./src/server/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
