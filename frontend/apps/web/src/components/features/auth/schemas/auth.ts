import { z } from "zod";

const HANDLE_PATTERN = /^[A-Za-z0-9_]+(\.[A-Za-z0-9_]+)*$/;

export const handleSchema = z.string().min(3).max(30).regex(HANDLE_PATTERN);

export const handleSuggestionResponseSchema = z.object({
  handle: handleSchema,
});

export const signupProfileRequestSchema = z.object({
  nickname: z.string().min(1),
  handle: handleSchema,
  profileImageUrl: z.string().optional(),
});

export type HandleSuggestionResponse = z.infer<
  typeof handleSuggestionResponseSchema
>;
export type SignupProfileRequest = z.infer<typeof signupProfileRequestSchema>;
