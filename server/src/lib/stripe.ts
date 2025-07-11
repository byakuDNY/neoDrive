import { z } from "zod";

export const createProductSchema = z.object({
    name: z.string().min(1).max(100).transform(val => val.trim()),
    price: z.number().positive(),
})

export const createCheckoutSessionSchema = z.object({
    productId: z.string(),
    successUrl: z.string(),
    cancelUrl: z.string(),
})