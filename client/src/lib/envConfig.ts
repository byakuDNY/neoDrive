import { z } from 'zod/v4'

const envSchema = z.object({
  VITE_API_URL: z.url().default('http://localhost:3000'),
})

const { success, error, data } = envSchema.safeParse(import.meta.env)
if (!success) {
  throw new Error(`Invalid environment variables: ${z.prettifyError(error)}`)
}

export const envConfig = data
