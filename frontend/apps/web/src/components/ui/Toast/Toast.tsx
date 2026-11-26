import { type ComponentProps } from "react";

import cn from "@/lib/helpers/cn";

interface ToastProps extends Omit<ComponentProps<"div">, "children"> {
  message: string | null;
}

const Toast = ({ message, className, ...props }: ToastProps) => {
  return (
    <div
      role="status"
      className={cn(
        "pointer-events-none fixed inset-x-6.75 bottom-[max(env(safe-area-inset-bottom),2rem)] flex justify-center",
        className,
      )}
      {...props}
    >
      {message && (
        <p className="rounded-md bg-danger px-6 py-3 text-center text-body-s font-medium text-white shadow-modal">
          {message}
        </p>
      )}
    </div>
  );
};

export default Toast;
