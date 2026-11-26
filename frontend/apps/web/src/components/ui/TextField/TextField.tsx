"use client";

import { type ComponentProps, type FocusEvent, useId, useState } from "react";

import CloseIcon from "@/components/ui/Icon/CloseIcon";
import IconButton from "@/components/ui/IconButton/IconButton";
import cn from "@/lib/helpers/cn";

interface TextFieldProps extends ComponentProps<"input"> {
  label: string;
  error?: string;
  onClear?: () => void;
}

const TextField = ({
  label,
  error,
  onClear,
  id,
  required,
  className,
  onBlur,
  ...props
}: TextFieldProps) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const [focused, setFocused] = useState(false);

  const handleWrapperBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setFocused(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      <label htmlFor={inputId} className="text-title font-medium text-black">
        {label}
        {required && (
          <span aria-hidden="true" className="text-tomato">
            *
          </span>
        )}
      </label>
      <div
        className="relative"
        onFocus={() => setFocused(true)}
        onBlur={handleWrapperBlur}
      >
        <input
          id={inputId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "h-15.5 w-full rounded-md border border-transparent bg-gray-50 px-7.5 text-body-m text-black outline-none placeholder:text-gray-300",
            onClear && "pr-16",
            error && "border-danger",
          )}
          onBlur={onBlur}
          {...props}
        />
        {focused && onClear && (
          <IconButton
            variant="clear"
            label={`${label} 지우기`}
            className="absolute top-1/2 right-5 -translate-y-1/2"
            onMouseDown={(event) => event.preventDefault()}
            onClick={onClear}
          >
            <CloseIcon className="size-6" />
          </IconButton>
        )}
      </div>
      {error && (
        <p id={errorId} className="px-2 text-body-s text-danger">
          {error}
        </p>
      )}
    </div>
  );
};

export default TextField;
