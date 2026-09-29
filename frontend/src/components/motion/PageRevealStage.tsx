import clsx from "clsx";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

export type PageRevealDirection = "forward" | "reverse" | "enter";

/** Extensible later: soft-rise, fade. Only corner-turn is implemented now. */
export type PageRevealVariant = "corner-turn";

type PageRevealStageProps = {
  children: ReactNode;
  pageKey: string;
  direction: PageRevealDirection;
  /**
   * Renders a page by key for the outgoing layer. Prefer this over freezing
   * Outlet elements — frozen route elements can resolve to the wrong page.
   */
  renderPage: (pageKey: string) => ReactNode;
  variant?: PageRevealVariant;
  durationMs?: number;
  className?: string;
};

const DEFAULT_DURATION_MS = 600;
const REDUCED_DURATION_MS = 180;

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

/**
 * Soft page-reveal stage with measured height lock + CSS corner reveal.
 */
export function PageRevealStage({
  children,
  pageKey,
  direction,
  renderPage,
  variant = "corner-turn",
  durationMs = DEFAULT_DURATION_MS,
  className,
}: PageRevealStageProps) {
  const reducedMotion = usePrefersReducedMotion();
  const motionMs = reducedMotion ? REDUCED_DURATION_MS : durationMs;

  const stageRef = useRef<HTMLDivElement>(null);
  const incomingRef = useRef<HTMLDivElement>(null);
  const outgoingRef = useRef<HTMLDivElement>(null);
  const transitionGenRef = useRef(0);
  const idleKeyRef = useRef(pageKey);
  const idleHeightRef = useRef(0);

  const [activeKey, setActiveKey] = useState(pageKey);
  const [outgoingKey, setOutgoingKey] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);
  const [motionDirection, setMotionDirection] =
    useState<PageRevealDirection>(direction);

  useLayoutEffect(() => {
    if (animating) return;
    idleKeyRef.current = pageKey;
    idleHeightRef.current = stageRef.current?.offsetHeight ?? 0;
  }, [animating, pageKey, children]);

  if (pageKey !== activeKey) {
    setOutgoingKey(idleKeyRef.current);
    setActiveKey(pageKey);
    setMotionDirection(direction);
    setAnimating(true);
  }

  useLayoutEffect(() => {
    if (!animating || outgoingKey === null) return;

    const stageEl = stageRef.current;
    const incomingEl = incomingRef.current;
    if (!stageEl || !incomingEl) return;

    const toHeight = incomingEl.offsetHeight;
    const startHeight =
      idleHeightRef.current > 0
        ? idleHeightRef.current
        : (outgoingRef.current?.offsetHeight ?? toHeight);

    const generation = ++transitionGenRef.current;
    const ease = reducedMotion
      ? "var(--ease-standard)"
      : "var(--ease-page-reveal)";

    stageEl.style.transition = "none";
    stageEl.style.height = `${startHeight}px`;
    stageEl.style.overflow = "hidden";
    void stageEl.offsetHeight;

    const raf = requestAnimationFrame(() => {
      if (transitionGenRef.current !== generation) return;
      stageEl.style.transition = `height ${motionMs}ms ${ease}`;
      stageEl.style.height = `${toHeight}px`;
    });

    const timer = window.setTimeout(() => {
      if (transitionGenRef.current !== generation) return;
      stageEl.style.transition = "none";
      stageEl.style.height = "";
      stageEl.style.overflow = "";
      setOutgoingKey(null);
      setAnimating(false);
    }, motionMs);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [animating, outgoingKey, motionMs, reducedMotion, activeKey]);

  const stageStyle: CSSProperties = {
    ["--page-reveal-duration" as string]: `${motionMs}ms`,
  };

  const revealClass =
    variant === "corner-turn" && !reducedMotion
      ? motionDirection === "reverse"
        ? "is-reverse"
        : "is-forward"
      : null;

  return (
    <div
      ref={stageRef}
      className={clsx(
        "page-reveal-stage",
        animating && "is-animating",
        className,
      )}
      data-variant={variant}
      data-direction={motionDirection}
      style={stageStyle}
    >
      {outgoingKey !== null && (
        <div
          key={`out-${outgoingKey}`}
          ref={outgoingRef}
          className={clsx(
            "page-reveal-layer",
            "page-reveal-layer--outgoing",
            animating &&
              (reducedMotion
                ? "page-reveal-motion-fade-out"
                : clsx("page-reveal-motion-out", revealClass)),
          )}
          aria-hidden="true"
          inert
        >
          {renderPage(outgoingKey)}
        </div>
      )}

      <div
        key={`in-${pageKey}`}
        ref={incomingRef}
        className={clsx(
          "page-reveal-layer",
          "page-reveal-layer--incoming",
          animating &&
            (reducedMotion
              ? "page-reveal-motion-fade-in"
              : clsx("page-reveal-motion-in", revealClass)),
        )}
      >
        {children}
      </div>
    </div>
  );
}
