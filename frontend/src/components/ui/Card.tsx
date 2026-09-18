import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";
import type { HTMLAttributes } from "react";

const cardStyles = cva(
  "bg-white border-[0.5px] border-line rounded-lg p-4 md:p-6",
  {
    variants: {
      variant: {
        resting: "",
        interactive:
          "transition-all duration-[250ms] ease-soft hover:shadow-sm hover:-translate-y-0.5",
      },
    },
    defaultVariants: { variant: "resting" },
  },
);

export interface CardProps
  extends
    HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardStyles> {}

export function Card({ variant, className, ...props }: CardProps) {
  return (
    <div className={clsx(cardStyles({ variant }), className)} {...props} />
  );
}
