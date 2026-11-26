import { z } from "zod";

export const NICKNAME_PATTERN = /^[가-힣a-zA-Z0-9 ]{2,10}$/;
export const HANDLE_PATTERN = /^(?!\.)(?!.*\.\.)[A-Za-z0-9._]{3,30}(?<!\.)$/;

export const nicknameSchema = z.string().regex(NICKNAME_PATTERN);

export const handleSchema = z.string().regex(HANDLE_PATTERN);

export const socialLoginResponseSchema = z.object({
  needsProfileSetup: z.boolean(),
  memberId: z.number(),
});

export const handleSuggestionResponseSchema = z.object({
  handle: handleSchema,
});

export const signupProfileRequestSchema = z.object({
  nickname: nicknameSchema,
  handle: handleSchema,
  profileImageUrl: z.string().optional(),
});

export const memberMeResponseSchema = z.object({
  id: z.number(),
  nickname: z.string(),
  handle: z.string().nullable(),
  profileImageUrl: z.string().nullable(),
  notificationEnabled: z.boolean(),
  boardPublic: z.boolean(),
  sentPraiseVisibility: z.enum(["ALL", "NAME_ONLY", "PRIVATE"]),
  profileCompleted: z.boolean(),
});

export const profileImageResponseSchema = z.object({
  imageUrl: z.string(),
});

export type SocialLoginResponse = z.infer<typeof socialLoginResponseSchema>;
export type HandleSuggestionResponse = z.infer<
  typeof handleSuggestionResponseSchema
>;
export type SignupProfileRequest = z.infer<typeof signupProfileRequestSchema>;
export type MemberMeResponse = z.infer<typeof memberMeResponseSchema>;
export type ProfileImageResponse = z.infer<typeof profileImageResponseSchema>;
