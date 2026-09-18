import { cva } from "class-variance-authority";
import clsx from "clsx";
import type { InputHTMLAttributes, ReactNode } from "react";

const inputStyles = cva(
  "w-full font-sans text-[15px] text-ink bg-white border border-line rounded-full py-3 px-6 placeholder:text-ink-muted outline-none transition-all duration-[250ms] ease-soft disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      hasIcon: {
        true: "pl-10",
        false: "",
      },
      state: {
        default:
          "focus:border-warm focus:shadow-[0_0_0_3px_var(--color-warm-tint)]",
        invalid:
          "border-error focus:border-error focus:shadow-[0_0_0_3px_var(--color-error-tint)]",
      },
    },
    defaultVariants: { hasIcon: false, state: "default" },
  },
);

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  leadingIcon?: ReactNode;
  invalid?: boolean;
}

export function Input({
  leadingIcon,
  invalid,
  className,
  ...props
}: InputProps) {
  const inputClassName = clsx(
    inputStyles({
      hasIcon: Boolean(leadingIcon),
      state: invalid ? "invalid" : "default",
    }),
    className,
  );

  if (leadingIcon) {
    return (
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-ink-muted">
          {leadingIcon}
        </span>
        <input className={inputClassName} {...props} />
      </div>
    );
  }

  return <input className={inputClassName} {...props} />;
}
