import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

const buttonStyles = cva(
  "inline-flex items-center justify-center font-sans font-medium text-[15px] rounded-full transition-all duration-[250ms] ease-soft disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-warm text-white py-3 px-8 hover:bg-warm-strong hover:shadow-sm",
        secondary:
          "bg-transparent text-ink border-[1.5px] border-line py-3 px-8 hover:bg-surface",
        ghost: "bg-transparent text-ink-muted py-3 px-6 hover:text-ink",
      },
    },
    defaultVariants: { variant: "primary" },
  },
);

export interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonStyles> {}

export function Button({ variant, className, ...props }: ButtonProps) {
  return (
    <button className={clsx(buttonStyles({ variant }), className)} {...props} />
  );
}
