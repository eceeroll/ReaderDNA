import clsx from "clsx";
import {
  BookMarked,
  BookOpen,
  Check,
  ChevronDown,
  Plus,
} from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ReadStatus } from "../../api/library";

const OPTIONS: { value: ReadStatus; label: string }[] = [
  { value: "WANT_TO_READ", label: "Want to Read" },
  { value: "CURRENTLY_READING", label: "Currently Reading" },
  { value: "READ", label: "Read" },
];

const MENU_VIEWPORT_GAP = 8;
const MENU_MIN_WIDTH = 180;

const buttonTone: Record<ReadStatus | "none", string> = {
  none: "border-line bg-white text-ink hover:bg-page",
  WANT_TO_READ: "border-line bg-surface text-ink hover:bg-white",
  CURRENTLY_READING:
    "border-line bg-brand-tint text-brand-strong hover:bg-white",
  READ: "border-line bg-warm-tint text-warm-strong hover:bg-white",
};

function StatusIcon({ status }: { status: ReadStatus | null }) {
  const iconProps = {
    className: "size-3.5 shrink-0",
    strokeWidth: 1.75,
    "aria-hidden": true as const,
  };

  if (status === "WANT_TO_READ") {
    return <BookMarked {...iconProps} />;
  }

  if (status === "CURRENTLY_READING") {
    return <BookOpen {...iconProps} />;
  }

  if (status === "READ") {
    return <Check {...iconProps} />;
  }

  return <Plus {...iconProps} />;
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <ChevronDown
      size={12}
      strokeWidth={2}
      aria-hidden
      className={clsx(
        "shrink-0 motion-safe:transition-transform motion-safe:duration-250 motion-safe:ease-soft",
        open && "rotate-180",
      )}
    />
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

  useLayoutEffect(() => {
    if (!open) {
      return;
    }

    function place() {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }

      const width = Math.max(rect.width, MENU_MIN_WIDTH);
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const menuHeight = menuRef.current?.offsetHeight ?? 0;

      let left = rect.left;
      if (left + width > viewportWidth - MENU_VIEWPORT_GAP) {
        left = viewportWidth - width - MENU_VIEWPORT_GAP;
      }
      left = Math.max(MENU_VIEWPORT_GAP, left);

      const spaceBelow = viewportHeight - rect.bottom - MENU_VIEWPORT_GAP;
      const spaceAbove = rect.top - MENU_VIEWPORT_GAP;
      const shouldOpenUpward =
        menuHeight > 0 &&
        spaceBelow < menuHeight &&
        spaceAbove > spaceBelow;

      let top = shouldOpenUpward
        ? rect.top - menuHeight - MENU_VIEWPORT_GAP
        : rect.bottom + MENU_VIEWPORT_GAP;

      if (top < MENU_VIEWPORT_GAP) {
        top = MENU_VIEWPORT_GAP;
      }
      if (menuHeight > 0 && top + menuHeight > viewportHeight - MENU_VIEWPORT_GAP) {
        top = Math.max(
          MENU_VIEWPORT_GAP,
          viewportHeight - menuHeight - MENU_VIEWPORT_GAP,
        );
      }

      setPosition({ top, left, width });
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
    const frame = window.requestAnimationFrame(place);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <span ref={buttonRef} className="block w-full min-w-0">
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={label}
          title={label}
          disabled={disabled}
          className={clsx(
            "flex h-10 w-full min-w-0 items-center gap-1 rounded-full border px-2 font-sans text-[12px] leading-none font-medium focus-visible:shadow-[0_0_0_3px_var(--color-warm-tint)] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 motion-safe:transition-colors motion-safe:duration-250 motion-safe:ease-standard",
            buttonTone[status ?? "none"],
          )}
          onClick={() => setOpen((current) => !current)}
        >
          <StatusIcon status={status} />
          <span className="min-w-0 flex-1 truncate text-center">{label}</span>
          <ChevronIcon open={open} />
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
                  {selected && (
                    <Check
                      size={16}
                      strokeWidth={1.75}
                      aria-hidden
                      className="size-4 shrink-0 text-ink-muted"
                    />
                  )}
                </button>
              );
            })}
          </div>,
          document.body,
        )}
    </>
  );
}
