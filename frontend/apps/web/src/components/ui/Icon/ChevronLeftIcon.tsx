import { type ComponentProps } from "react";

type IconProps = ComponentProps<"svg">;

const ChevronLeftIcon = ({ ...props }: IconProps) => {
  return (
    <svg
      width={36}
      height={36}
      viewBox="0 0 36 36"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M22.5 9L13.5 18L22.5 27" />
    </svg>
  );
};

export default ChevronLeftIcon;
