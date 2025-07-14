import { z } from 'zod/v4'

const envSchema = z.object({
  API_URL: z.url().default('http://localhost:3000'),
  S3_ACCESS_KEY: z.string().min(1, 'S3_ACCESS_KEY field is required'),
  S3_SECRET_KEY: z.string().min(1, 'S3_SECRET_KEY field is required'),
  S3_BUCKET: z.string().min(1, 'S3_BUCKET field is required'),
  S3_ENDPOINT: z.string().min(1, 'S3_END_POINT field is required'),
  S3_REGION: z.string().min(1, 'S3_REGION field is required'),
})

const { success, error, data } = envSchema.safeParse(import.meta.env)
if (!success) {
  throw new Error(`Invalid environment variables: ${z.prettifyError(error)}`)
}

export const envConfig = data
