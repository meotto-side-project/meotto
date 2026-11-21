import { type ComponentProps } from "react";

interface IconProps extends ComponentProps<"svg"> {
  filled?: boolean;
}

const EmojiIcon = ({ filled = false, ...props }: IconProps) => {
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
      <g transform="translate(1.25 1.25)">
        <path
          d="M10.75 20.75C5.227 20.75 0.75 16.273 0.75 10.75C0.75 5.227 5.227 0.75 10.75 0.75C16.273 0.75 20.75 5.227 20.75 10.75C20.75 16.273 16.273 20.75 10.75 20.75Z"
          fill={filled ? "currentColor" : "none"}
        />
        <path
          d="M15.25 13.25C15.25 13.25 13.75 15.25 10.75 15.25C7.75 15.25 6.25 13.25 6.25 13.25"
          stroke={filled ? "var(--color-gray-50)" : "currentColor"}
        />
        <path
          d="M14.25 7.75C14.1174 7.75 13.9902 7.69732 13.8964 7.60355C13.8027 7.50979 13.75 7.38261 13.75 7.25C13.75 7.11739 13.8027 6.99021 13.8964 6.89645C13.9902 6.80268 14.1174 6.75 14.25 6.75C14.3826 6.75 14.5098 6.80268 14.6036 6.89645C14.6973 6.99021 14.75 7.11739 14.75 7.25C14.75 7.38261 14.6973 7.50979 14.6036 7.60355C14.5098 7.69732 14.3826 7.75 14.25 7.75ZM7.25 7.75C7.11739 7.75 6.99021 7.69732 6.89645 7.60355C6.80268 7.50979 6.75 7.38261 6.75 7.25C6.75 7.11739 6.80268 6.99021 6.89645 6.89645C6.99021 6.80268 7.11739 6.75 7.25 6.75C7.38261 6.75 7.50979 6.80268 7.60355 6.89645C7.69732 6.99021 7.75 7.11739 7.75 7.25C7.75 7.38261 7.69732 7.50979 7.60355 7.60355C7.50979 7.69732 7.38261 7.75 7.25 7.75Z"
          fill={filled ? "var(--color-gray-50)" : "currentColor"}
          stroke={filled ? "var(--color-gray-50)" : "currentColor"}
        />
      </g>
    </svg>
  );
};

export default EmojiIcon;
