import { type ComponentProps } from "react";

import cn from "@/lib/helpers/cn";

interface AvatarProps extends Omit<ComponentProps<"div">, "children"> {
  src?: string | null;
  alt: string;
}

const Avatar = ({ src, alt, className, ...props }: AvatarProps) => {
  return (
    <div
      className={cn(
        "relative size-37.5 overflow-hidden rounded-full bg-gray-50",
        className,
      )}
      {...props}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- 업로드된 사진의 호스트를 next/image 설정에 고정할 수 없다
        <img src={src} alt={alt} className="size-full object-cover" />
      ) : (
        <svg
          viewBox="0 0 150 150"
          fill="currentColor"
          role="img"
          aria-label={alt}
          className="size-full text-gray-100"
        >
          <path d="M53.8541 72.2333L48.2979 46.3579L62.9807 28.907L88.2544 26.5L103.639 46.3579V67.5844L73.7922 82.4891L53.8541 72.2333Z" />
          <path d="M149.032 156.782L149.083 117.846L127 99L96.7592 84.8287L74.9957 93.6677L53.8541 84.8287L21.5 99L2.81444 116.846L1 156.782L10.4869 198H142.905L149.032 156.782Z" />
        </svg>
      )}
    </div>
  );
};

export default Avatar;
