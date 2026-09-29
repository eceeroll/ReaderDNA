import { CircleAlert } from "lucide-react";
import clsx from "clsx";

export function FieldError({
  message,
  align = "center",
  className,
}: {
  message: string;
  align?: "center" | "start";
  className?: string;
}) {
  return (
    <p
      className={clsx(
        "flex gap-2 rounded-md bg-error-tint px-3 py-2 text-[13px] text-error",
        align === "start" ? "items-start" : "items-center",
        className,
      )}
    >
      <CircleAlert
        size={16}
        strokeWidth={1.75}
        aria-hidden
        className="shrink-0"
      />
      {message}
    </p>
  );
}
