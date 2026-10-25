import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Check, Phone, X } from "lucide-react";
import type { InfoTopic } from "../data";

const ctaTargets: Record<string, string> = {
  queue: "#live-queue",
  wayfinding: "#find-your-way",
  "accessible-routes": "#accessibility",
  accessibility: "tel:0800600200",
  prepare: "tel:0800600100",
  navigation: "#find-your-way",
  "queue-help": "tel:0800600100",
};

type InfoDialogProps = {
  topic: InfoTopic | null;
  onClose: () => void;
  onSelectCta: (topicId: string) => void;
};

export function InfoDialog({ topic, onClose, onSelectCta }: InfoDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!topic) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [topic, onClose]);

  if (!topic) return null;

  const target = ctaTargets[topic.id] ?? "#contact-desk";

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-[#04182b]/70"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="info-dialog-title"
        className="relative z-10 flex max-h-[92dvh] w-full max-w-[650px] flex-col overflow-hidden rounded-t-[4px] bg-white shadow-[0_30px_80px_-20px_rgba(3,20,36,0.65)] sm:max-h-[calc(100dvh-3rem)] sm:rounded-[3px]"
      >
        <div aria-hidden="true" className="h-[3px] w-full shrink-0 bg-brand" />
        <div className="relative shrink-0 border-b border-rule px-6 pb-5 pt-6 sm:px-8 sm:pt-7">
          <p className="pr-10 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-link">
            {topic.kicker}
          </p>
          <h2
            id="info-dialog-title"
            className="mt-2 max-w-[520px] text-[23px] font-semibold leading-[1.2] tracking-[-0.025em] text-ink sm:text-[26px]"
          >
            {topic.title}
          </h2>
          <p className="mt-2.5 max-w-[540px] text-[13px] leading-[1.65] text-copy">
            {topic.summary}
          </p>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-sm text-[#576471] transition-colors hover:bg-mist hover:text-brand sm:right-5 sm:top-5"
          >
            <X size={18} strokeWidth={1.8} />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-6 sm:px-8">
          <div className="space-y-3.5">
            {topic.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 32)} className="text-[13px] leading-[1.75] text-[#485867]">
                {paragraph}
              </p>
            ))}
          </div>

          {topic.points && (
            <div className="mt-6 grid gap-4 border-t border-rule pt-5 sm:grid-cols-3">
              {topic.points.map((point) => (
                <div key={point.title}>
                  <p className="flex items-start gap-1.5 text-[12px] font-semibold leading-[1.4] text-ink">
                    <Check
                      size={13}
                      strokeWidth={2.4}
                      aria-hidden="true"
                      className="mt-[1px] shrink-0 text-link"
                    />
                    {point.title}
                  </p>
                  <p className="mt-1 pl-[19px] text-[11.5px] leading-[1.6] text-copy">{point.text}</p>
                </div>
              ))}
            </div>
          )}

          {topic.note && (
            <p className="mt-5 border border-brand-line border-l-2 border-l-[#5b94bd] bg-brand-light px-3.5 py-2.5 text-[11.5px] leading-[1.65] text-[#3f5262]">
              {topic.note}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-4 border-t border-rule bg-[#fbfcfd] px-6 py-4 sm:px-8">
          <a
            href={target}
            onClick={(event) => {
              if (target.startsWith("tel:")) {
                onClose();
                return;
              }
              event.preventDefault();
              event.stopPropagation();
              onSelectCta(topic.id);
            }}
            className="inline-flex h-[40px] items-center gap-2 rounded-[2px] bg-brand px-4 text-[12px] font-semibold text-white transition-colors hover:bg-brand-deep"
          >
            {topic.cta ?? "Learn more"}
            {target.startsWith("tel:") ? (
              <Phone size={14} strokeWidth={1.9} aria-hidden="true" />
            ) : (
              <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
            )}
          </a>
          <button
            type="button"
            onClick={onClose}
            className="text-[12px] font-medium text-[#61707e] transition-colors hover:text-brand"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
