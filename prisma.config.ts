import { defineConfig } from "prisma/config";

// With a config file Prisma no longer reads .env automatically. Load it for
// local development; on Vercel the variables are already in the environment.
try {
  process.loadEnvFile();
} catch {
  /* no .env file — rely on the real environment */
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
