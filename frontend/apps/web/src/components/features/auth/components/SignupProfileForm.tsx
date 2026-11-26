"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import Avatar from "@/components/ui/Avatar/Avatar";
import Button from "@/components/ui/Button/Button";
import ChevronLeftIcon from "@/components/ui/Icon/ChevronLeftIcon";
import PencilIcon from "@/components/ui/Icon/PencilIcon";
import IconButton from "@/components/ui/IconButton/IconButton";
import TextField from "@/components/ui/TextField/TextField";
import Toast from "@/components/ui/Toast/Toast";
import { useToast } from "@/components/ui/Toast/useToast";
import { ApiError } from "@/lib/api/ApiError";

import { AUTH_ERROR_NAMES } from "../constants/errorNames";
import { SIGNUP_MESSAGES } from "../constants/messages";
import { AUTH_ROUTES } from "../constants/routes";
import { useProfileImagePicker } from "../hooks/useProfileImagePicker";
import { useSignupProfileMutation } from "../queries/useSignupProfileMutation";
import { handleSchema, nicknameSchema } from "../schemas/auth";

interface SignupProfileFormProps {
  initialNickname: string;
  initialHandle: string;
  initialProfileImageUrl: string | null;
}

const SignupProfileForm = ({
  initialNickname,
  initialHandle,
  initialProfileImageUrl,
}: SignupProfileFormProps) => {
  const router = useRouter();
  const { message, showToast } = useToast();
  const [nickname, setNickname] = useState(initialNickname);
  const [handle, setHandle] = useState(initialHandle);
  const [nicknameTouched, setNicknameTouched] = useState(false);
  const [handleTouched, setHandleTouched] = useState(false);
  const [nicknameServerError, setNicknameServerError] = useState<string>();
  const [handleServerError, setHandleServerError] = useState<string>();
  const { mutate, isPending } = useSignupProfileMutation();
  const { imageUrl, isUploading, pick } = useProfileImagePicker(
    initialProfileImageUrl,
    (reason) =>
      showToast(
        reason === "denied"
          ? SIGNUP_MESSAGES.photoPermissionDenied
          : SIGNUP_MESSAGES.serverError,
      ),
  );

  const nicknameValid = nicknameSchema.safeParse(nickname).success;
  const handleValid = handleSchema.safeParse(handle).success;
  const nicknameFormatError =
    !nicknameValid && (nicknameTouched || nickname !== "")
      ? SIGNUP_MESSAGES.nicknameInvalid
      : undefined;
  const handleFormatError =
    !handleValid && (handleTouched || handle !== "")
      ? SIGNUP_MESSAGES.handleInvalid
      : undefined;

  const changeNickname = (value: string) => {
    setNickname(value);
    setNicknameTouched(true);
    setNicknameServerError(undefined);
  };

  const changeHandle = (value: string) => {
    setHandle(value);
    setHandleTouched(true);
    setHandleServerError(undefined);
  };

  const handleSubmitError = (error: unknown) => {
    const code = error instanceof ApiError ? error.code : undefined;
    if (code === AUTH_ERROR_NAMES.alreadySignedUp) {
      router.replace(AUTH_ROUTES.home);
    } else if (code === AUTH_ERROR_NAMES.handleDuplicated) {
      setHandleServerError(SIGNUP_MESSAGES.handleDuplicated);
    } else if (code === AUTH_ERROR_NAMES.invalidHandle) {
      setHandleServerError(SIGNUP_MESSAGES.handleInvalid);
    } else if (code === AUTH_ERROR_NAMES.invalidNickname) {
      setNicknameServerError(SIGNUP_MESSAGES.nicknameInvalid);
    } else {
      showToast(SIGNUP_MESSAGES.serverError);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNicknameTouched(true);
    setHandleTouched(true);
    if (!nicknameValid || !handleValid || isPending || isUploading) {
      return;
    }

    mutate(
      {
        nickname,
        handle,
        ...(imageUrl ? { profileImageUrl: imageUrl } : {}),
      },
      {
        onSuccess: () => router.replace(AUTH_ROUTES.home),
        onError: handleSubmitError,
      },
    );
  };

  return (
    <main className="flex min-h-dvh flex-col bg-white px-6.75 pt-[max(env(safe-area-inset-top),1rem)] pb-[max(env(safe-area-inset-bottom),2rem)]">
      <header className="relative flex h-11.5 items-center justify-center">
        <IconButton
          label="뒤로가기"
          className="absolute left-0"
          onClick={() => router.replace(AUTH_ROUTES.login)}
        >
          <ChevronLeftIcon />
        </IconButton>
        <h1 className="text-title font-medium text-black">프로필 설정</h1>
      </header>
      <form
        noValidate
        onSubmit={handleSubmit}
        className="flex flex-1 flex-col gap-8"
      >
        <div className="flex flex-1 flex-col gap-8">
          <div className="mt-8 flex flex-col items-center gap-3">
            <div className="relative">
              <Avatar src={imageUrl} alt="프로필 사진 미리보기" />
              <IconButton
                variant="dark"
                label="프로필 사진 변경"
                disabled={isUploading}
                className="absolute right-0 bottom-0"
                onClick={pick}
              >
                <PencilIcon className="size-6" />
              </IconButton>
            </div>
            <span className="text-title font-medium text-black">
              프로필 사진
            </span>
          </div>
          <TextField
            label="이름"
            required
            value={nickname}
            placeholder="이름을 입력해주세요."
            autoComplete="off"
            error={nicknameServerError ?? nicknameFormatError}
            onChange={(event) => changeNickname(event.target.value)}
            onBlur={() => setNicknameTouched(true)}
            onClear={() => changeNickname("")}
          />
          <TextField
            label="멋토 아이디"
            required
            value={handle}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            error={handleServerError ?? handleFormatError}
            onChange={(event) => changeHandle(event.target.value)}
            onBlur={() => setHandleTouched(true)}
            onClear={() => changeHandle("")}
          />
        </div>
        <Button
          type="submit"
          disabled={!nicknameValid || !handleValid || isPending || isUploading}
        >
          완료
        </Button>
      </form>
      <Toast message={message} />
    </main>
  );
};

export default SignupProfileForm;
