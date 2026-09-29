import { config } from "dotenv";

config({ path: ".env.test" });

// Tests set their own variables; the schema itself is tested in tests/server/env.test.ts.
process.env.SKIP_ENV_VALIDATION = "1";
