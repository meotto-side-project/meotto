import { type ComponentProps } from "react";

import cn from "@/lib/helpers/cn";

type ButtonVariant = "primary" | "secondary" | "destructive";
type ButtonSize = "l" | "m";

interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-gray-800 text-white",
  secondary: "bg-gray-50 text-gray-700",
  destructive: "bg-gray-50 text-danger",
};

const sizeClasses: Record<ButtonSize, string> = {
  l: "h-18.75 text-button-l",
  m: "h-15.5 text-button-m",
};

const Button = ({
  variant = "primary",
  size = "l",
  type = "button",
  className,
  ...props
}: ButtonProps) => {
  return (
    <button
      type={type}
      className={cn(
        "flex w-full items-center justify-center rounded-md font-medium disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
};

export default Button;
