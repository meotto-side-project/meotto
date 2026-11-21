import { type ComponentProps, type ReactNode, useId } from "react";

import cn from "@/lib/helpers/cn";

interface ModalProps extends Omit<ComponentProps<"div">, "title"> {
  title: string;
  description?: string;
  actions: ReactNode;
}

const Modal = ({
  title,
  description,
  actions,
  className,
  ...props
}: ModalProps) => {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className={cn(
        "flex w-88.5 flex-col items-center gap-7.5 rounded-md bg-white p-5 shadow-modal",
        className,
      )}
      {...props}
    >
      <div className="flex w-full flex-col items-center gap-3.75 text-center">
        <h2
          id={titleId}
          className="px-3.25 py-2.5 text-button-l font-semibold text-gray-700"
        >
          {title}
        </h2>
        {description && (
          <p id={descriptionId} className="text-body-m text-black">
            {description}
          </p>
        )}
      </div>
      <div className="flex w-full gap-2.5">{actions}</div>
    </div>
  );
};

export default Modal;
