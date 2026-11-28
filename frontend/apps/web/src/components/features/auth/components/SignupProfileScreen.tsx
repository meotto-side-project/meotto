"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import Button from "@/components/ui/Button/Button";
import { ApiError } from "@/lib/api/ApiError";

import { AUTH_ROUTES } from "../constants/routes";
import { useHandleSuggestionQuery } from "../queries/useHandleSuggestionQuery";
import { useMeQuery } from "../queries/useMeQuery";
import SignupProfileForm from "./SignupProfileForm";

const SignupProfileScreen = () => {
  const router = useRouter();
  const me = useMeQuery();
  const needsSetup = me.data !== undefined && !me.data.profileCompleted;
  const suggestion = useHandleSuggestionQuery(needsSetup);

  const unauthorized = me.error instanceof ApiError && me.error.status === 401;
  const alreadyCompleted = me.data?.profileCompleted === true;

  useEffect(() => {
    if (unauthorized) {
      router.replace(AUTH_ROUTES.login);
    } else if (alreadyCompleted) {
      router.replace(AUTH_ROUTES.home);
    }
  }, [unauthorized, alreadyCompleted, router]);

  if (me.isError && !unauthorized) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-white px-6.75">
        <p role="alert" className="text-body-m text-black">
          정보를 불러오지 못했어요.
        </p>
        <Button size="m" onClick={() => void me.refetch()}>
          다시 시도
        </Button>
      </main>
    );
  }

  if (!me.data || me.data.profileCompleted || suggestion.isPending) {
    return (
      <main
        aria-busy="true"
        className="flex min-h-dvh items-center justify-center bg-white"
      >
        <p className="text-body-m text-gray-300">불러오는 중…</p>
      </main>
    );
  }

  return (
    <SignupProfileForm
      initialNickname={me.data.nickname}
      initialHandle={suggestion.data?.handle ?? ""}
      initialProfileImageUrl={me.data.profileImageUrl}
    />
  );
};

export default SignupProfileScreen;
