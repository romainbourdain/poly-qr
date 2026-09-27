import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./vitest.setup.mts"],
    // Les suites de `server/db` et `server/services` partagent une même base
    // Postgres de test (DATABASE_URL_TEST) : les exécuter en parallèle fait
    // se percuter des tests de fichiers différents sur des contraintes
    // partagées (ex. un seul événement actif à la fois).
    fileParallelism: false,
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
