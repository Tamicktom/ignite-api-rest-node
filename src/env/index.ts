import "dotenv/config";

import z from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string(),
  PORT: z.number().default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("production"),
});

export const env = envSchema.parse(process.env);
