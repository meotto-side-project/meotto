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
          <path d="M53 38L75 28L97 40L100 66L84 82H64L50 64Z" />
          <path d="M20 150C22 118 48 98 75 98C102 98 128 118 130 150Z" />
        </svg>
      )}
    </div>
  );
};

export default Avatar;
