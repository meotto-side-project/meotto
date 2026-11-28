import { z } from "zod";

export const shareLinkResolveResponseSchema = z.object({
  receiverId: z.number(),
  receiverNickname: z.string(),
});

export type ShareLinkResolveResponse = z.infer<
  typeof shareLinkResolveResponseSchema
>;
