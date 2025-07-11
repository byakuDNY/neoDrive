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

export const nameChangeSchema = z.object({
  name: z.string().min(2).max(32).transform(val => val.trim()),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(8).max(32).transform(val => val.trim()),
  newPassword: z.string().min(8).max(32).transform(val => val.trim()),
  confirmNewPassword: z.string().min(8).max(32).transform(val => val.trim()),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: "New passwords do not match",
  path: ["confirmNewPassword"]
});