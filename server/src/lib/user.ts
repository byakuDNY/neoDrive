import { z } from "zod";

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