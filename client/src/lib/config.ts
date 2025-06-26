import { z } from 'zod'

const envSchema = z.object({
  API_URL: z.string().url().default('http://localhost:3000'),
  MINIO_ACCESS_KEY: z.string().min(1, 'MINIO_ACCESS_KEY field is required'),
  MINIO_SECRET_KEY: z.string().min(1, 'MINIO_SECRET_KEY field is required'),
  MINIO_BUCKET: z.string().min(1, 'MINIO_BUCKET field is required'),
})

const { success, error, data } = envSchema.safeParse(import.meta.env)
if (!success) {
  throw new Error(`Invalid environment variables: ${error.format()}`)
}

export const env = data
