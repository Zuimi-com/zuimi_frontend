"use client";

import { AdminTutorialDefinition } from "@/lib/tutorials/adminTutorials";
import { Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Rect = {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

const GAP = 8;
const TOOLTIP_WIDTH = 360;
const TOOLTIP_HEIGHT = 280;

function findTarget(tutorial: AdminTutorialDefinition, stepIndex: number) {
  const step = tutorial.steps[stepIndex];
  const selectors = step.targets || (step.target ? [step.target] : []);
  for (const selector of selectors) {
    for (const element of document.querySelectorAll<HTMLElement>(selector)) {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      if (rect.width > 0 && rect.height > 0 && style.visibility !== "hidden") {
        return element;
      }
    }
  }
  return null;
}

function measure(element: HTMLElement): Rect {
  const raw = element.getBoundingClientRect();
  const top = Math.max(GAP, raw.top - GAP);
  const left = Math.max(GAP, raw.left - GAP);
  const right = Math.min(window.innerWidth - GAP, raw.right + GAP);
  const bottom = Math.min(window.innerHeight - GAP, raw.bottom + GAP);
  return {
    top,
    left,
    right,
    bottom,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
  };
}

function sameRect(first: Rect | null, second: Rect | null) {
  if (first === second) return true;
  if (!first || !second) return false;
  return ["top", "left", "right", "bottom", "width", "height"].every(
    (key) => Math.abs(first[key as keyof Rect] - second[key as keyof Rect]) < 0.5,
  );
}

function positionTooltip(rect: Rect | null, width: number, height: number) {
  const margin = 12;
  if (!rect) {
    return {
      top: Math.max(margin, (window.innerHeight - height) / 2),
      left: Math.max(margin, (window.innerWidth - width) / 2),
    };
  }
  const fitsRight = rect.right + margin + width <= window.innerWidth;
  const fitsLeft = rect.left - margin - width >= 0;
  const left = fitsRight
    ? rect.right + margin
    : fitsLeft
      ? rect.left - width - margin
      : Math.min(window.innerWidth - width - margin, Math.max(margin, rect.left));
  const top = Math.min(
    window.innerHeight - height - margin,
    Math.max(margin, rect.top),
  );
  return { top: Math.max(margin, top), left: Math.max(margin, left) };
}

export default function AdminGuidedTutorialOverlay({
  tutorial,
  stepIndex,
  onStepChange,
  onClose,
  onSkip,
  onComplete,
}: {
  tutorial: AdminTutorialDefinition;
  stepIndex: number;
  onStepChange: (step: number) => void;
  onClose: () => void;
  onSkip: () => void;
  onComplete: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [targetLoading, setTargetLoading] = useState(true);
  const [tooltipSize, setTooltipSize] = useState({
    width: TOOLTIP_WIDTH,
    height: TOOLTIP_HEIGHT,
  });
  const tooltipRef = useRef<HTMLElement>(null);
  const primaryButtonRef = useRef<HTMLButtonElement>(null);
  const step = tutorial.steps[stepIndex];
  const isLast = stepIndex === tutorial.steps.length - 1;

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    let attempts = 0;
    let retryTimer: number | undefined;
    let settleTimer: number | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let currentTarget: HTMLElement | null = null;

    const refresh = () => {
      if (cancelled) return;
      const target = findTarget(tutorial, stepIndex);
      if (!target) {
        setTargetRect(null);
        setTargetLoading(true);
        attempts += 1;
        if (attempts < 40) retryTimer = window.setTimeout(refresh, 125);
        else setTargetLoading(false);
        return;
      }

      const raw = target.getBoundingClientRect();
      if (
        currentTarget !== target &&
        (raw.top < 12 || raw.bottom > window.innerHeight - 12)
      ) {
        currentTarget = target;
        target.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
        settleTimer = window.setTimeout(refresh, 280);
        return;
      }

      currentTarget = target;
      const next = measure(target);
      setTargetRect((previous) => (sameRect(previous, next) ? previous : next));
      setTargetLoading(false);
      resizeObserver?.disconnect();
      if (typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(refresh);
        resizeObserver.observe(target);
      }
    };

    refresh();
    const mutationObserver = new MutationObserver(refresh);
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", refresh);
    window.addEventListener("scroll", refresh, true);
    primaryButtonRef.current?.focus();

    return () => {
      cancelled = true;
      window.clearTimeout(retryTimer);
      window.clearTimeout(settleTimer);
      mutationObserver.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener("resize", refresh);
      window.removeEventListener("scroll", refresh, true);
    };
  }, [mounted, stepIndex, tutorial]);

  useLayoutEffect(() => {
    if (!mounted || !tooltipRef.current) return;
    const refresh = () => {
      const rect = tooltipRef.current?.getBoundingClientRect();
      if (rect?.width && rect.height) {
        setTooltipSize({ width: rect.width, height: rect.height });
      }
    };
    refresh();
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(refresh);
    observer?.observe(tooltipRef.current);
    return () => observer?.disconnect();
  }, [mounted, stepIndex]);

  useEffect(() => {
    if (!mounted) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "ArrowLeft" && stepIndex > 0) {
        onStepChange(stepIndex - 1);
      } else if (event.key === "ArrowRight") {
        if (isLast) onComplete();
        else onStepChange(stepIndex + 1);
      } else if (event.key === "Tab" && tooltipRef.current) {
        const focusable = Array.from(
          tooltipRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
          ),
        );
        if (!focusable.length) {
          event.preventDefault();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLast, mounted, onClose, onComplete, onStepChange, stepIndex]);

  if (!mounted) return null;

  const position = positionTooltip(
    targetRect,
    tooltipSize.width,
    tooltipSize.height,
  );

  return createPortal(
    <div className="fixed inset-0 z-[12000]" aria-live="polite">
      {targetRect ? (
        <div
          className="pointer-events-none fixed rounded-xl border-2 border-[#7DE0B5] shadow-[0_0_0_9999px_rgba(2,18,13,0.72)] transition-all duration-200 motion-reduce:transition-none"
          style={{
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
          }}
          aria-hidden="true"
        />
      ) : (
        <div className="pointer-events-none fixed inset-0 bg-[rgba(2,18,13,0.72)]" />
      )}

      <section
        ref={tooltipRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-tutorial-title"
        className="fixed w-[calc(100vw-24px)] max-w-[360px] rounded-2xl border border-blue-100 bg-white p-5 text-slate-950 shadow-2xl"
        style={position}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
              {tutorial.category} · Step {stepIndex + 1} of {tutorial.steps.length}
            </p>
            <h2 id="admin-tutorial-title" className="mt-2 text-lg font-bold">
              {step.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-slate-500 hover:bg-slate-100"
            aria-label="Exit tutorial"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-3 text-sm leading-6 text-slate-600">{step.body}</p>
        {targetLoading ? (
          <p className="mt-3 text-xs font-medium text-amber-700">
            Waiting for this dashboard area to finish loading…
          </p>
        ) : null}

        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-600 transition-all"
            style={{ width: `${((stepIndex + 1) / tutorial.steps.length) * 100}%` }}
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onSkip}
            className="text-sm font-semibold text-slate-500 hover:text-slate-900"
          >
            Skip tutorial
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onStepChange(Math.max(0, stepIndex - 1))}
              disabled={stepIndex === 0}
              className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-slate-300 px-3 text-sm font-semibold disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
            <button
              ref={primaryButtonRef}
              type="button"
              onClick={() => (isLast ? onComplete() : onStepChange(stepIndex + 1))}
              className="inline-flex min-h-10 items-center gap-1 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
            >
              {isLast ? (
                <>
                  <Check className="h-4 w-4" /> Finish
                </>
              ) : (
                <>
                  Next <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </section>
    </div>,
    document.body,
  );
}

