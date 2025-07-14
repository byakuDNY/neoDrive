import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(32),
});

export const signUpSchema = z
  .object({
    name: z.string().min(2).max(32),
    email: z.string().email(),
    password: z.string().min(8).max(32),
    confirmPassword: z.string().min(8).max(32),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const presignedUrlSchema = z.object({
  name: z.string().min(1).max(255),
  size: z.number().min(1),
  mimeType: z.string().min(1),
  path: z.string().min(1),
});

export const fileMetadataSchema = z.object({
  id: z.string().min(1).max(255).optional(),
  s3Key: z.string().min(1).max(255).optional(),
  userId: z.string().min(1).max(255),
  name: z.string().min(1).max(255),
  type: z.enum(["file", "folder"]),
  size: z.number().min(0),
  mimeType: z.string().nullable(),
  path: z.string().min(1),
  isFavorited: z.boolean(),
});
