import { X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { RatingStars } from "../ui/RatingStars";

export function RateBookDialog({
  open,
  initialRating,
  canSave,
  isSaving,
  onClose,
  onSave,
}: {
  open: boolean;
  initialRating: number | null;
  canSave: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSave: (rating: number) => Promise<void>;
}) {
  const titleId = useId();
  const [selected, setSelected] = useState<number | null>(initialRating);
  const [saving, setSaving] = useState(false);
  const initialRatingRef = useRef(initialRating);
  const onCloseRef = useRef(onClose);
  initialRatingRef.current = initialRating;
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) {
      return;
    }
    setSelected(initialRatingRef.current);
    setSaving(false);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCloseRef.current();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!open) {
    return null;
  }

  async function handleRate(value: number) {
    if (saving || isSaving || !canSave) {
      return;
    }

    setSelected(value);
    setSaving(true);
    try {
      await onSave(value);
    } catch {
      setSaving(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-ink/30"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-sm rounded-xl bg-white px-6 pt-12 pb-10 shadow-lg"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full text-ink-muted hover:bg-surface hover:text-ink focus-visible:shadow-[0_0_0_3px_var(--color-warm-tint)] focus-visible:outline-none motion-safe:transition-colors motion-safe:duration-250 motion-safe:ease-standard"
        >
          <X size={16} strokeWidth={1.75} aria-hidden />
        </button>
        <h2
          id={titleId}
          className="text-center font-sans text-2xl leading-tight font-semibold text-ink"
        >
          Rate this book
        </h2>
        <div className="mt-8 flex justify-center">
          <RatingStars
            rating={selected}
            size="lg"
            disabled={saving || isSaving || !canSave}
            onRate={(value) => {
              void handleRate(value);
            }}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
