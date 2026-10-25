import { Accessibility, ArrowRight, Phone } from "lucide-react";

export function AccessibilityPanel({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <section
      id="accessibility"
      aria-labelledby="accessibility-heading"
      className="container-page mt-16 scroll-mt-24 sm:mt-20 lg:mt-24"
    >
      <div className="relative border border-brand-line bg-brand-light">
        <div className="max-w-[640px] px-6 py-8 sm:px-9 sm:py-10 lg:max-w-[680px] lg:py-11 lg:pl-12 lg:pr-8">
          <p className="flex items-center gap-2 text-[9.5px] font-semibold uppercase tracking-[0.15em] text-link">
            <Accessibility size={14} strokeWidth={1.9} aria-hidden="true" />
            Accessible care
          </p>
          <h2
            id="accessibility-heading"
            className="mt-3 max-w-[470px] text-[28px] font-semibold leading-[1.15] tracking-[-0.03em] text-ink sm:text-[32px]"
          >
            Healthcare navigation for everyone
          </h2>
          <p className="mt-4 max-w-[485px] text-[13.5px] leading-[1.78] text-[#4a5c6c]">
            Clear step-free routes, straightforward directions and patient support at every stage.
            Our teams help elderly patients, wheelchair users and visitors move confidently through
            the hospital — from the entrance to the department they need.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <button
              type="button"
              onClick={() => onOpen("accessibility")}
              aria-haspopup="dialog"
              className="inline-flex h-[42px] items-center gap-2 rounded-[2px] bg-brand px-4 text-[12px] font-semibold text-white transition-colors hover:bg-brand-deep"
            >
              Learn more
              <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
            </button>
            <a
              href="tel:0800600200"
              className="inline-flex items-center gap-2 text-[12px] font-medium text-brand transition-colors hover:text-link hover:underline hover:underline-offset-[3px]"
            >
              <Phone size={14} strokeWidth={1.8} aria-hidden="true" />
              Accessibility Desk · 0800 600 200
            </a>
          </div>
        </div>

        <div className="px-6 pb-7 sm:px-9 sm:pb-9 lg:absolute lg:-top-8 lg:right-9 lg:w-[366px] lg:px-0 lg:pb-0">
          <img
            src="/images/accessibility.jpg"
            alt="A nurse accompanying an elderly patient in a wheelchair along a step-free hospital corridor"
            loading="lazy"
            className="aspect-[4/3] w-full object-cover object-center shadow-[0_20px_46px_-22px_rgba(7,43,76,0.55)]"
          />
        </div>
      </div>
    </section>
  );
}
