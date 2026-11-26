import { type ComponentProps } from "react";

const KakaoIcon = (props: ComponentProps<"svg">) => (
  <svg
    viewBox="0 0 24 24"
    width={24}
    height={24}
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.0983 1.00781C5.58882 1.00781 0.3125 5.08431 0.3125 10.112C0.3125 13.2388 2.35328 15.9953 5.46095 17.6348L4.15339 22.4113C4.03786 22.8334 4.52056 23.1698 4.89122 22.9252L10.6229 19.1424C11.1066 19.189 11.5981 19.2163 12.0983 19.2163C18.6072 19.2163 23.8839 15.1399 23.8839 10.112C23.8839 5.08431 18.6072 1.00781 12.0983 1.00781"
      fill="currentColor"
    />
  </svg>
);

export default KakaoIcon;
