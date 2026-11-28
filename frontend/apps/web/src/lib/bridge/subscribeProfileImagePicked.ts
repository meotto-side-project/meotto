import { z } from "zod";

const profileImagePickedSchema = z.object({
  type: z.literal("PROFILE_IMAGE_PICKED"),
  payload: z.discriminatedUnion("status", [
    z.object({
      status: z.literal("picked"),
      mimeType: z.string(),
      base64: z.string(),
    }),
    z.object({ status: z.literal("cancelled") }),
    z.object({ status: z.literal("denied") }),
    z.object({ status: z.literal("error") }),
  ]),
});

export type ProfileImagePickedPayload = z.infer<
  typeof profileImagePickedSchema
>["payload"];

const parseData = (data: unknown): unknown => {
  if (typeof data !== "string") {
    return data;
  }
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

export const subscribeProfileImagePicked = (
  listener: (payload: ProfileImagePickedPayload) => void,
): (() => void) => {
  // 웹뷰 구현에 따라 메시지가 window 또는 document로 오고, document 이벤트는 window로 버블링될 수 있어 같은 이벤트를 한 번만 처리한다.
  const handled = new WeakSet<Event>();

  const handleMessage = (event: Event) => {
    if (!(event instanceof MessageEvent) || handled.has(event)) {
      return;
    }
    handled.add(event);

    const result = profileImagePickedSchema.safeParse(parseData(event.data));
    if (result.success) {
      listener(result.data.payload);
    }
  };

  window.addEventListener("message", handleMessage);
  document.addEventListener("message", handleMessage);

  return () => {
    window.removeEventListener("message", handleMessage);
    document.removeEventListener("message", handleMessage);
  };
};
