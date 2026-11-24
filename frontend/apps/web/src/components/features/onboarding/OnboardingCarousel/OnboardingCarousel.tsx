"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { type ComponentProps, useState } from "react";

import {
  LOGIN_PATH,
  ONBOARDING_SLIDES,
} from "@/components/features/onboarding/constants/slides";
import Button from "@/components/ui/Button/Button";
import cn from "@/lib/helpers/cn";

const OnboardingCarousel = ({
  className,
  ...props
}: ComponentProps<"main">) => {
  const router = useRouter();
  const [index, setIndex] = useState(0);

  const slide = ONBOARDING_SLIDES[index];
  const total = ONBOARDING_SLIDES.length;
  const isLast = index === total - 1;

  const handleNext = () => {
    if (isLast) {
      router.push(LOGIN_PATH);
      return;
    }
    setIndex(index + 1);
  };

  return (
    <main
      className={cn(
        "flex min-h-dvh flex-col bg-gray-50 px-6.5 pt-[calc(env(safe-area-inset-top)+4rem)] pb-[calc(env(safe-area-inset-bottom)+0.5rem)]",
        className,
      )}
      {...props}
    >
      <section
        aria-roledescription="slide"
        aria-label={`${total}장 중 ${index + 1}번째`}
        className="flex flex-1 flex-col"
      >
        <div className="flex flex-col gap-3.75 pl-6 break-keep">
          <h1 className="text-h2 leading-8.75 font-medium whitespace-pre-line text-black">
            {slide.titleBefore}
            <span className="text-tomato">{slide.titleHighlight}</span>
            {slide.titleAfter}
          </h1>
          <p className="text-body-m leading-6.25 whitespace-pre-line text-gray-500">
            {slide.description}
          </p>
        </div>
        <div className="flex flex-1 items-center justify-center py-6">
          <Image
            src={slide.image.src}
            width={slide.image.width}
            height={slide.image.height}
            alt=""
            priority
          />
        </div>
      </section>

      <div aria-hidden className="flex justify-center gap-2 py-2">
        {ONBOARDING_SLIDES.map((item, i) => (
          <span
            key={item.titleHighlight}
            className={cn(
              "size-2 rounded-lg bg-black",
              i !== index && "opacity-20",
            )}
          />
        ))}
      </div>

      <Button className="mt-14" onClick={handleNext}>
        {isLast ? "멋토 시작하기" : "다음"}
      </Button>
    </main>
  );
};

export default OnboardingCarousel;
