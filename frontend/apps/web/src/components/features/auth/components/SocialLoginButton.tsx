import { type ComponentProps } from "react";

import AppleIcon from "@/components/ui/SocialIcon/AppleIcon";
import KakaoIcon from "@/components/ui/SocialIcon/KakaoIcon";
import NaverIcon from "@/components/ui/SocialIcon/NaverIcon";
import cn from "@/lib/helpers/cn";

type SocialProvider = "kakao" | "naver" | "apple";

interface SocialLoginButtonProps extends Omit<
  ComponentProps<"button">,
  "children"
> {
  provider: SocialProvider;
}

const providerStyles: Record<
  SocialProvider,
  { label: string; className: string; Icon: typeof KakaoIcon }
> = {
  kakao: {
    label: "카카오톡으로 시작하기",
    className: "bg-kakao text-gray-900",
    Icon: KakaoIcon,
  },
  naver: {
    label: "네이버로 시작하기",
    className: "bg-naver text-white",
    Icon: NaverIcon,
  },
  apple: {
    label: "Apple로 시작하기",
    className: "bg-black text-white",
    Icon: AppleIcon,
  },
};

const SocialLoginButton = ({
  provider,
  className,
  type = "button",
  ...props
}: SocialLoginButtonProps) => {
  const {
    label,
    className: providerClassName,
    Icon,
  } = providerStyles[provider];

  return (
    <button
      type={type}
      className={cn(
        "relative flex h-18.75 w-full items-center justify-center rounded-md text-button-m font-medium disabled:opacity-50",
        providerClassName,
        className,
      )}
      {...props}
    >
      <Icon className="absolute left-5.75" />
      {label}
    </button>
  );
};

export default SocialLoginButton;
