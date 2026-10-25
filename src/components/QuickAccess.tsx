import { ArrowRight, Info } from "lucide-react";
import { quickLinks } from "../data";

export function QuickLinks({
  onOpenPortal,
}: {
  onOpenPortal: (tab: "visit" | "wayfinding" | "aftercare", checkIn?: boolean) => void;
}) {
  const portalActions: Record<string, { tab: "visit" | "wayfinding" | "aftercare"; checkIn?: boolean }> = {
    "Live Queue": { tab: "visit" },
    "Patient Registration": { tab: "visit", checkIn: true },
    "Find a Department": { tab: "wayfinding" },
  };

  return (
    <nav aria-label="Quick navigation" className="container-page mt-5">
      <ul className="grid grid-cols-2 border-y border-rule sm:grid-cols-3 lg:grid-cols-5 lg:divide-x lg:divide-rule">
        {quickLinks.map((link, index) => {
          const Icon = link.icon;
          const action = portalActions[link.label];
          return (
            <li
              key={link.label}
              className={index === quickLinks.length - 1 ? "col-span-2 sm:col-span-1" : undefined}
            >
              {action ? (
                <button
                  type="button"
                  onClick={() => onOpenPortal(action.tab, action.checkIn)}
                  className="group flex h-[60px] w-full items-center gap-2.5 px-2 text-left text-[12.5px] font-medium tracking-[-0.005em] text-[#263442] transition-colors hover:text-link lg:justify-center lg:px-3"
                >
                  <Icon
                    size={17}
                    strokeWidth={1.65}
                    aria-hidden="true"
                    className="shrink-0 text-link transition-colors group-hover:text-brand-deep"
                  />
                  <span className="group-hover:underline group-hover:underline-offset-[3px]">
                    {link.label}
                  </span>
                </button>
              ) : (
                <a
                  href={link.href}
                  className="group flex h-[60px] items-center gap-2.5 px-2 text-[12.5px] font-medium tracking-[-0.005em] text-[#263442] transition-colors hover:text-link lg:justify-center lg:px-3"
                >
                  <Icon
                    size={17}
                    strokeWidth={1.65}
                    aria-hidden="true"
                    className="shrink-0 text-link transition-colors group-hover:text-brand-deep"
                  />
                  <span className="group-hover:underline group-hover:underline-offset-[3px]">
                    {link.label}
                  </span>
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function QueueNotice({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <div className="container-page mt-5">
      <div className="flex flex-col gap-2 border border-brand-line border-l-2 border-l-[#5b94bd] bg-[#f2f8fc] px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex items-start gap-2.5 sm:items-center">
          <Info
            size={15}
            strokeWidth={1.8}
            aria-hidden="true"
            className="mt-[2px] shrink-0 text-link sm:mt-0"
          />
          <p className="text-[12px] leading-[1.55] text-[#3f5060]">
            <strong className="font-semibold text-[#243441]">Queue estimates can change.</strong>{" "}
            Emergencies and urgent cases always receive clinical priority.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onOpen("queue")}
          aria-haspopup="dialog"
          className="text-link shrink-0 self-start text-[11.5px] sm:self-auto"
        >
          How priority works
          <ArrowRight size={13} strokeWidth={1.9} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
