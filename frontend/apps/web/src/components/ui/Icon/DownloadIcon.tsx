import { type ComponentProps } from "react";

type IconProps = ComponentProps<"svg">;

const DownloadIcon = ({ ...props }: IconProps) => {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M5 14.7704V18.8164C5 19.3076 5.19513 19.7787 5.54245 20.126C5.88978 20.4733 6.36085 20.6684 6.85205 20.6684H17.9643C18.4555 20.6684 18.9266 20.4733 19.2739 20.126C19.6213 19.7787 19.8164 19.3076 19.8164 18.8164V14.7704M12.4082 4V15.1123M16.675 10.6674L12.4082 15.1123L8.14136 10.6674" />
    </svg>
  );
};

export default DownloadIcon;
