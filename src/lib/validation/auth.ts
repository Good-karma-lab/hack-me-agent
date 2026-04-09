import { z } from "zod";

const email = z.email("Enter a valid work email.").trim().toLowerCase();
const password = z
  .string()
  .min(10, "Use at least 10 characters.")
  .max(128, "Password is too long.");

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(80),
  email,
  password,
  organizationName: z.string().trim().min(2, "Enter your company or workspace name.").max(80),
});

export const loginSchema = z.object({
  email,
  password,
});
