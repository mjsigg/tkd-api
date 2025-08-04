import { z } from "zod";

// Zod schemas for runtime validation
export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  password_hash: z.string(),
  name: z.string(),
  role: z.enum(["member", "admin"]),
  created_at: z.date(),
  updated_at: z.date(),
});

export const UserResponseSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(["member", "admin"]),
});

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  role: z.enum(["member", "admin"]).optional().default("member"),
});

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const AuthResponseSchema = z.object({
  message: z.string(),
  user: UserResponseSchema,
  token: z.string(),
});

export const JWTPayloadSchema = z.object({
  userId: z.number(),
  email: z.string().email(),
  role: z.enum(["member", "admin"]),
  iat: z.number().optional(),
  exp: z.number().optional(),
});

// TypeScript types inferred from Zod schemas
export type User = z.infer<typeof UserSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type JWTPayload = z.infer<typeof JWTPayloadSchema>;
