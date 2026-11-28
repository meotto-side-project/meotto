import { type ComponentProps } from "react";

type IconProps = ComponentProps<"svg">;

const PencilIcon = ({ ...props }: IconProps) => {
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
      <path d="M21 9.5L26.5 15M9 27L10.5 20.5L23.2 7.8C24 7 25.2 7 26 7.8L28.2 10C29 10.8 29 12 28.2 12.8L15.5 25.5L9 27ZM9 30H27" />
    </svg>
  );
};

export default PencilIcon;
