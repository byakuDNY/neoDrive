import { config } from "dotenv";
import { z } from "zod/v4";

config();

const envSchema = z.object({
  MONGODB_URL: z.url().min(1, "MONGO_URL field is required"),
  S3_ACCESS_KEY: z.string().min(1, "S3_ACCESS_KEY field is required"),
  S3_SECRET_KEY: z.string().min(1, "S3_SECRET_KEY field is required"),
  S3_BUCKET: z.string().min(1, "S3_BUCKET field is required"),
  S3_ENDPOINT: z.url().min(1, "S3_END_POINT field is required"),
  S3_REGION: z.string().min(1, "S3_REGION field is required"),
  STRIPE_PUBLISHABLE_KEY: z
    .string()
    .min(1, "STRIPE_PUBLISHABLE_KEY field is required"),
  STRIPE_SECRET_KEY: z.string().min(1, "STRIPE_SECRET_KEY field is required"),
  STRIPE_WEBHOOK_SECRET: z
    .string()
    .min(1, "STRIPE_WEBHOOK_SECRET field is required"),
});

const { success, error, data } = envSchema.safeParse(process.env);
if (!success) {
  throw new Error(`Invalid environment variables: ${z.prettifyError(error)}`);
}

export const envConfig = data;
