import { config } from "dotenv";
import z from "zod";

if (process.env.NODE_ENV === "test") {
  config({
    path: ".env.test",
  });
} else {
  config();
}

const envSchema = z.object({
  DATABASE_URL: z.string(),
  PORT: z.number().default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("production"),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("Invalid environment variables", _env.error.format());

  throw new Error("Invalid environment variables");
}

export const env = _env.data;
