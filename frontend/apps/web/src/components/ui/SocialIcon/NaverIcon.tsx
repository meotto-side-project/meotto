import { type ComponentProps } from "react";

const NaverIcon = (props: ComponentProps<"svg">) => (
  <svg
    viewBox="0 0 24 24"
    width={24}
    height={24}
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M15.3833 12.6682L8.33879 2.5H2.5V21.5H8.61667V11.3302L15.6612 21.5H21.5V2.5H15.3833V12.6682Z"
      fill="currentColor"
    />
  </svg>
);

export default NaverIcon;
