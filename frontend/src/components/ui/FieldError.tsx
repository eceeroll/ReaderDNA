import clsx from "clsx";

function WarningIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}

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
      <WarningIcon />
      {message}
    </p>
  );
}
