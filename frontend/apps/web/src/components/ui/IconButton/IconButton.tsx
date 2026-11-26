import { type ComponentProps } from "react";

import cn from "@/lib/helpers/cn";

type IconButtonVariant = "back" | "dark" | "clear";

interface IconButtonProps extends Omit<ComponentProps<"button">, "aria-label"> {
  label: string;
  variant?: IconButtonVariant;
}

const variantClasses: Record<IconButtonVariant, string> = {
  back: "size-11.5 bg-white/30 text-black shadow-modal",
  dark: "size-9.5 bg-gray-800 text-white",
  clear: "size-6 bg-gray-200/40 text-white",
};

const IconButton = ({
  label,
  variant = "back",
  type = "button",
  className,
  ...props
}: IconButtonProps) => {
  return (
    <button
      type={type}
      aria-label={label}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full disabled:opacity-50",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
};

export default IconButton;
