import { type ComponentProps } from "react";

type IconProps = ComponentProps<"svg">;

const CloseIcon = ({ ...props }: IconProps) => {
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
      <path d="M10.1406 25.8657L18.0051 18.0012L25.8696 25.8657M25.8696 10.1367L18.0036 18.0012L10.1406 10.1367" />
    </svg>
  );
};

export default CloseIcon;
