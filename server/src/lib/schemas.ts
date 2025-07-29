import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email().trim(),
  password: z.string().min(8).max(32).trim(),
});

export const signUpSchema = z
  .object({
    name: z.string().min(2).max(32).trim(),
    email: z.string().email().trim(),
    password: z.string().min(8).max(32).trim(),
    confirmPassword: z.string().min(8).max(32).trim(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const adminLoginSchema = z.object({
  name: z.string().min(2).max(32).trim(),
  password: z.string().min(8).max(32).trim(),
});

export const nameChangeSchema = z.object({
  name: z.string().min(2).max(32).trim(),
  userId: z.string().min(1).max(255).trim(),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(8).max(32).trim(),
    newPassword: z.string().min(8).max(32).trim(),
    confirmNewPassword: z.string().min(8).max(32).trim(),
    userId: z.string().min(1).max(255).trim(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ["confirmNewPassword"],
  });

export const presignedUrlSchema = z.object({
  userId: z.string().min(1).max(255).trim(),
  name: z.string().min(2).max(255).trim(),
  size: z.number().min(1),
  mimeType: z.string().min(1).trim(),
  path: z.string().min(1).max(255).trim(),
});

export const fileMetadataSchema = z.object({
  id: z.string().min(1).max(255).trim().optional(),
  s3Key: z.string().min(1).max(255).trim().nullable(),
  userId: z.string().min(1).max(255).trim(),
  name: z.string().min(2).max(255).trim(),
  type: z.enum(["file", "folder"]),
  size: z.number().min(0),
  mimeType: z.string().trim().nullable(),
  path: z.string().min(1).max(255).trim(),
  isFavorited: z.boolean(),
  category: z
    .enum(["images", "videos", "audio", "documents", "others"])
    .nullable(),
});

export const renameFileSchema = z.object({
  id: z.string().min(1).max(255).trim(),
  userId: z.string().min(1).max(255).trim(),
  s3Key: z.string().min(1).max(255).trim().nullable(),
  name: z.string().min(2).max(255).trim(),
  path: z.string().min(1).max(255).trim(),
  type: z.enum(["file", "folder"]),
});

export const favoriteFileSchema = z.object({
  id: z.string().min(1).max(255).trim(),
  userId: z.string().min(1).max(255).trim(),
  type: z.enum(["file", "folder"]),
  isFavorited: z.boolean(),
});

export const deleteFileSchema = z.object({
  id: z.string().min(1).max(255).trim(),
  userId: z.string().min(1).max(255).trim(),
  s3Key: z.string().min(1).max(255).trim().nullable(),
  type: z.enum(["file", "folder"]),
});

export const createProductSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  price: z.number().positive(),
});

export const createCheckoutSessionSchema = z.object({
  product: z.string().trim(),
  successUrl: z.string().trim(),
  cancelUrl: z.string().trim(),
  userId: z.string().min(1).max(255).trim(),
});
