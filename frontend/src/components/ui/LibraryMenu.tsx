import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ReadStatus } from "../../api/library";

const OPTIONS: { value: ReadStatus; label: string }[] = [
  { value: "WANT_TO_READ", label: "Want to Read" },
  { value: "CURRENTLY_READING", label: "Currently Reading" },
  { value: "READ", label: "Read" },
];

const buttonTone: Record<ReadStatus | "none", string> = {
  none: "border-line bg-white text-ink hover:bg-page",
  WANT_TO_READ: "border-line bg-surface text-ink hover:bg-white",
  CURRENTLY_READING:
    "border-line bg-brand-tint text-brand-strong hover:bg-white",
  READ: "border-line bg-warm-tint text-warm-strong hover:bg-white",
};

function StatusIcon({ status }: { status: ReadStatus | null }) {
  const className = "size-3.5 shrink-0";

  if (status === "WANT_TO_READ") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={className}
      >
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    );
  }

  if (status === "CURRENTLY_READING") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={className}
      >
        <path d="M12 7v14" />
        <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
      </svg>
    );
  }

  if (status === "READ") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={className}
      >
        <path d="M20 6L9 17l-5-5" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-4 shrink-0 text-ink-muted"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      className={clsx(
        "shrink-0 motion-safe:transition-transform motion-safe:duration-250 motion-safe:ease-soft",
        open && "rotate-180",
      )}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function LibraryMenu({
  status,
  onSelect,
  disabled = false,
}: {
  status: ReadStatus | null;
  onSelect: (status: ReadStatus) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLSpanElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const label =
    OPTIONS.find((option) => option.value === status)?.label ??
    "Add to Library";

  useEffect(() => {
    if (!open) {
      return;
    }

    function place() {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }
      setPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: Math.max(rect.width, 180),
      });
    }

    function onPointerDown(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      if (
        buttonRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <span ref={buttonRef} className="block w-full">
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          disabled={disabled}
          className={clsx(
            "grid h-10 w-full shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-1 rounded-full border px-2 font-sans text-[12px] leading-none font-medium whitespace-nowrap focus-visible:shadow-[0_0_0_3px_var(--color-warm-tint)] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 motion-safe:transition-colors motion-safe:duration-250 motion-safe:ease-standard",
            buttonTone[status ?? "none"],
          )}
          onClick={() => setOpen((current) => !current)}
        >
          <span className="flex items-center justify-self-start">
            <StatusIcon status={status} />
          </span>
          <span className="text-center whitespace-nowrap">{label}</span>
          <span className="flex items-center justify-self-end">
            <ChevronIcon open={open} />
          </span>
        </button>
      </span>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label="Library"
            style={{
              top: position.top,
              left: position.left,
              width: position.width,
            }}
            className="fixed z-40 rounded-lg bg-white p-1 shadow-md"
          >
            {OPTIONS.map((option) => {
              const selected = status === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="menuitem"
                  aria-current={selected ? "true" : undefined}
                  className={clsx(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left font-sans text-[13px] motion-safe:transition-colors motion-safe:duration-250 motion-safe:ease-standard",
                    selected
                      ? "bg-warm-tint font-medium text-ink"
                      : "text-ink hover:bg-surface",
                  )}
                  onClick={() => {
                    setOpen(false);
                    onSelect(option.value);
                  }}
                >
                  <span className="min-w-0 flex-1">{option.label}</span>
                  {selected && <CheckIcon />}
                </button>
              );
            })}
          </div>,
          document.body,
        )}
    </>
  );
}
