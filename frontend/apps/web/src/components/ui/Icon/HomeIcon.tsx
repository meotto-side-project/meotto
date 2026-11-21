import { type ComponentProps } from "react";

interface IconProps extends ComponentProps<"svg"> {
  filled?: boolean;
}

const HomeIcon = ({ filled = false, ...props }: IconProps) => {
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
      <path
        d="M17 21.0018H7C5.93913 21.0018 4.92172 20.5803 4.17157 19.8302C3.42143 19.0801 3 18.0626 3 17.0018V10.7098C2.99999 10.022 3.17732 9.34582 3.51487 8.74656C3.85242 8.14731 4.33879 7.64522 4.927 7.28877L9.927 4.25877C10.5521 3.87997 11.2691 3.67969 12 3.67969C12.7309 3.67969 13.4479 3.87997 14.073 4.25877L19.073 7.28877C19.6611 7.64513 20.1473 8.14706 20.4849 8.74613C20.8224 9.34519 20.9998 10.0212 21 10.7088V17.0018C21 18.0626 20.5786 19.0801 19.8284 19.8302C19.0783 20.5803 18.0609 21.0018 17 21.0018Z"
        fill={filled ? "currentColor" : "none"}
      />
    </svg>
  );
};

export default HomeIcon;
