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

export const adminLoginSchema = z.object({
  name: z.string().min(2).max(32),
  password: z.string().min(8).max(32),
});

export const nameChangeSchema = z.object({
  name: z.string().min(2).max(32).trim(),
  userId: z.string().min(1).max(255),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(8).max(32),
    newPassword: z.string().min(8).max(32),
    confirmNewPassword: z.string().min(8).max(32),
    userId: z.string().min(1).max(255),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ["confirmNewPassword"],
  });

export const presignedUrlSchema = z.object({
  userId: z.string().min(1).max(255),
  name: z.string().min(2).max(255),
  size: z.number().min(1),
  mimeType: z.string().min(1),
  path: z.string().min(1).max(255),
});

export const fileMetadataSchema = z.object({
  id: z.string().min(1).max(255).optional(),
  s3Key: z.string().min(1).max(255).nullable(),
  userId: z.string().min(1).max(255),
  name: z.string().min(2).max(255),
  type: z.enum(["file", "folder"]),
  size: z.number().min(0),
  mimeType: z.string().nullable(),
  path: z.string().min(1).max(255),
  isFavorited: z.boolean(),
  category: z
    .enum(["images", "videos", "audio", "documents", "others"])
    .nullable(),
});

export const renameFileSchema = z.object({
  id: z.string().min(1).max(255),
  userId: z.string().min(1).max(255),
  s3Key: z.string().min(1).max(255).nullable(),
  name: z.string().min(2).max(255),
  path: z.string().min(1).max(255),
  type: z.enum(["file", "folder"]),
});

export const favoriteFileSchema = z.object({
  id: z.string().min(1).max(255),
  userId: z.string().min(1).max(255),
  type: z.enum(["file", "folder"]),
  isFavorited: z.boolean(),
});

export const deleteFileSchema = z.object({
  id: z.string().min(1).max(255),
  userId: z.string().min(1).max(255),
  s3Key: z.string().min(1).max(255).nullable(),
  type: z.enum(["file", "folder"]),
});

export const createProductSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(100)
    .transform((val) => val.trim()),
  price: z.number().positive(),
});

export const createCheckoutSessionSchema = z.object({
  product: z.string(),
  successUrl: z.string(),
  cancelUrl: z.string(),
});
