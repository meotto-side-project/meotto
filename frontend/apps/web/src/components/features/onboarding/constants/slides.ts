export interface OnboardingSlide {
  titleBefore?: string;
  titleHighlight: string;
  titleAfter: string;
  description: string;
  image: { src: string; width: number; height: number };
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    titleBefore: "친구의 ",
    titleHighlight: "멋을 발견",
    titleAfter: "해봐요!",
    description:
      "일상 속 무심코 지나쳤던 친구의 모습에서 반짝이는 멋을 발견해보세요.",
    image: {
      src: "/images/onboarding/onboarding-1.svg",
      width: 258,
      height: 322,
    },
  },
  {
    titleHighlight: "토마토 도장",
    titleAfter: "에 마음을 담아\n친구에게 전달해보세요!",
    description:
      "평소 말로는 전하기 쑥스러웠던 마음을 귀여운 토마토 도장에 담아 전해보세요.",
    image: {
      src: "/images/onboarding/onboarding-2.svg",
      width: 270,
      height: 336,
    },
  },
  {
    titleHighlight: "받은 토마토",
    titleAfter: "를 차곡차곡 모아요!",
    description:
      "친구들이 보내준 토마토 도장을 나만의 칭찬판에 기록하고 언제든 다시 확인해요.",
    image: {
      src: "/images/onboarding/onboarding-3.svg",
      width: 366,
      height: 330,
    },
  },
];

export const LOGIN_PATH = "/login";
