import { useEffect, useEffectEvent, useRef, useState } from "react";

import { postToNative } from "@/lib/bridge/postToNative";
import {
  type ProfileImagePickedPayload,
  subscribeProfileImagePicked,
} from "@/lib/bridge/subscribeProfileImagePicked";

import { useUploadProfileImageMutation } from "../queries/useUploadProfileImageMutation";
import { base64ToFile } from "../utils/base64ToFile";

export type ProfileImagePickFailure = "denied" | "failed";

export const useProfileImagePicker = (
  initialImageUrl: string | null,
  onFailure: (reason: ProfileImagePickFailure) => void,
) => {
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const waitingRef = useRef(false);
  const { mutate, isPending } = useUploadProfileImageMutation();

  const handlePicked = useEffectEvent((payload: ProfileImagePickedPayload) => {
    if (!waitingRef.current) {
      return;
    }
    waitingRef.current = false;

    if (payload.status === "cancelled") {
      return;
    }
    if (payload.status === "denied") {
      onFailure("denied");
      return;
    }
    if (payload.status === "error") {
      onFailure("failed");
      return;
    }

    try {
      const file = base64ToFile(
        payload.base64,
        payload.mimeType,
        "profile.jpg",
      );
      mutate(file, {
        onSuccess: ({ imageUrl: uploaded }) => setImageUrl(uploaded),
        onError: () => onFailure("failed"),
      });
    } catch {
      onFailure("failed");
    }
  });

  useEffect(() => subscribeProfileImagePicked(handlePicked), []);

  const pick = () => {
    if (isPending) {
      return;
    }
    waitingRef.current = true;
    postToNative({ type: "PICK_PROFILE_IMAGE" });
  };

  return { imageUrl, isUploading: isPending, pick };
};
