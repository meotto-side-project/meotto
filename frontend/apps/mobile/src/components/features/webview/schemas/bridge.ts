import { z } from "zod";

import { BRIDGE_MESSAGE_TYPE } from "@/components/features/webview/constants/messages";

export const incomingBridgeMessageSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal(BRIDGE_MESSAGE_TYPE.authLoginSuccess) }),
]);

export type IncomingBridgeMessage = z.infer<typeof incomingBridgeMessageSchema>;

export type OutgoingBridgeMessage = {
  type: typeof BRIDGE_MESSAGE_TYPE.authState;
  payload: { loggedIn: boolean };
};

export function parseIncomingBridgeMessage(
  data: string,
): IncomingBridgeMessage | null {
  let json: unknown;
  try {
    json = JSON.parse(data);
  } catch {
    return null;
  }

  const result = incomingBridgeMessageSchema.safeParse(json);
  return result.success ? result.data : null;
}

export function serializeOutgoingBridgeMessage(
  message: OutgoingBridgeMessage,
): string {
  return JSON.stringify(message);
}
