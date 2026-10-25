import { ArrowRight, ArrowUpRight, Clock3 } from "lucide-react";
import type { Guide, Service, VisitCard } from "../data";

export function ServiceCard({
  service,
  onViewQueue,
}: {
  service: Service;
  onViewQueue: () => void;
}) {
  return (
    <article className="group flex h-full flex-col border border-rule bg-white transition-[box-shadow,border-color] duration-200 hover:border-[#cfdae4] hover:shadow-[0_20px_46px_-28px_rgba(7,43,76,0.45)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-mist">
        <img
          src={service.image}
          alt={service.alt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]"
        />
        <span className="absolute left-3.5 top-3.5 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-[5px] text-[10.5px] font-medium tracking-[0.005em] text-[#2c3c4b] shadow-[0_2px_8px_rgba(7,43,76,0.12)] backdrop-blur-[2px]">
          <span aria-hidden="true" className="h-[6px] w-[6px] rounded-full bg-[#2f7d5a]" />
          {service.availability}
        </span>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-[18px] lg:px-6 lg:pb-6 lg:pt-5">
        <p className="text-[9.5px] font-medium uppercase leading-[1.5] tracking-[0.115em] text-[#74818e]">
          {service.location}
        </p>
        <h3 className="mt-[7px] text-[20px] font-semibold leading-[1.25] tracking-[-0.02em] text-ink">
          {service.name}
        </h3>
        <p className="mt-2 text-[13px] leading-[1.65] text-copy">{service.description}</p>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-rule pt-[15px]">
          <div>
            <p className="text-[9.5px] font-medium uppercase tracking-[0.115em] text-[#74818e]">
              Estimated wait
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-brand">
              <Clock3 size={15} strokeWidth={1.8} aria-hidden="true" />
              <span className="text-[21px] font-semibold leading-none tracking-[-0.025em]">
                {service.waitMinutes}
              </span>
              <span className="mb-[1px] self-end text-[11.5px] font-medium">min</span>
            </p>
          </div>
          <a
            href={service.href}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onViewQueue();
            }}
            className="text-link pb-0.5 text-[12px]"
          >
            {service.linkLabel}
            <ArrowRight size={14} strokeWidth={1.9} aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  );
}

export function GuideCard({
  guide,
  onOpen,
}: {
  guide: Guide;
  onOpen: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(guide.id)}
      aria-haspopup="dialog"
      aria-label={`${guide.title} — ${guide.readTime} patient guide`}
      className="group relative block aspect-[4/3] w-full overflow-hidden bg-brand-deep text-left"
    >
      <img
        src={guide.image}
        alt={guide.alt}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[550ms] ease-out group-hover:scale-[1.03]"
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,26,47,0)_28%,rgba(4,26,47,0.48)_56%,rgba(4,26,47,0.94)_100%)]"
      />
      <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 px-5 pb-5 pt-14 sm:px-6 sm:pb-6">
        <span className="block">
          <span className="mb-2 block text-[9.5px] font-medium uppercase tracking-[0.13em] text-[#b6d3e6]">
            {guide.category}
          </span>
          <span className="block max-w-[270px] text-[18px] font-semibold leading-[1.32] tracking-[-0.015em] text-white sm:text-[19px]">
            {guide.title}
          </span>
          <span className="mt-2.5 block text-[10.5px] text-white/65">{guide.readTime}</span>
        </span>
        <span className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/35 text-white transition-colors duration-200 group-hover:border-white group-hover:bg-white group-hover:text-brand-deep">
          <ArrowUpRight size={15} strokeWidth={1.8} aria-hidden="true" />
        </span>
      </span>
    </button>
  );
}

export function VisitCard({
  card,
  onOpen,
}: {
  card: VisitCard;
  onOpen: (id: string) => void;
}) {
  return (
    <article className="group flex h-full flex-col border border-rule bg-white transition-[box-shadow,border-color] duration-200 hover:border-[#cfdae4] hover:shadow-[0_20px_46px_-28px_rgba(7,43,76,0.45)]">
      <div className="aspect-[16/10] overflow-hidden bg-mist">
        <img
          src={card.image}
          alt={card.alt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]"
        />
      </div>
      <div className="flex flex-1 flex-col px-5 pb-5 pt-[18px] lg:px-6 lg:pb-6 lg:pt-[22px]">
        <p className="text-[9.5px] font-semibold uppercase tracking-[0.13em] text-link">
          {card.category}
        </p>
        <h3 className="mt-2 text-[20px] font-semibold leading-[1.25] tracking-[-0.02em] text-ink">
          {card.title}
        </h3>
        <p className="mt-2 text-[13px] leading-[1.65] text-copy">{card.description}</p>
        <button
          type="button"
          onClick={() => onOpen(card.topicId)}
          aria-haspopup="dialog"
          className="text-link mt-auto self-start pt-4 text-[12px]"
        >
          {card.linkLabel}
          <ArrowRight size={14} strokeWidth={1.9} aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
