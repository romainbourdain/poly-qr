import type { NextConfig } from "next";
// Validates the environment at build/dev start (skipped with SKIP_ENV_VALIDATION=1).
import "./src/server/env";

const nextConfig: NextConfig = {
  // Self-contained server bundle for the Docker image.
  output: "standalone",
};

export default nextConfig;
