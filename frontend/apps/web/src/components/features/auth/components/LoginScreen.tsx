"use client";

import Logo from "@/components/ui/Logo/Logo";
import TomatoSymbol from "@/components/ui/TomatoSymbol/TomatoSymbol";

import { useSocialLogin } from "../hooks/useSocialLogin";
import SocialLoginButton from "./SocialLoginButton";

const LoginScreen = () => {
  const { login, isPending, isError } = useSocialLogin();

  return (
    <main className="flex min-h-dvh flex-col bg-gray-50 px-6.75 pt-[max(env(safe-area-inset-top),0px)] pb-[max(env(safe-area-inset-bottom),2rem)]">
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <TomatoSymbol className="w-24" />
        <Logo className="w-47 text-logo-red" />
      </div>
      <div className="flex flex-col gap-2.5">
        {isError && (
          <p role="alert" className="text-center text-body-s text-danger">
            로그인에 실패했어요. 다시 시도해 주세요.
          </p>
        )}
        <SocialLoginButton
          provider="kakao"
          disabled={isPending}
          onClick={() => void login("kakao")}
        />
        <SocialLoginButton
          provider="naver"
          disabled
          className="disabled:opacity-100"
          title="네이버 로그인은 준비 중이에요"
        />
        <SocialLoginButton
          provider="apple"
          disabled={isPending}
          onClick={() => void login("apple")}
        />
      </div>
    </main>
  );
};

export default LoginScreen;
