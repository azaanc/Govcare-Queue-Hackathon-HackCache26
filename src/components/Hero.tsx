import { SearchBar } from "./SearchBar";

export function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="relative">
      <div className="relative h-[334px] overflow-hidden bg-brand-deep sm:h-[360px] xl:h-[382px]">
        <img
          src="/images/hero.jpg"
          alt="Hospital staff walking with a visitor through the bright main atrium of GovCare Queue hospital"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover object-[70%_center] sm:object-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,26,47,0.94)_0%,rgba(6,38,67,0.82)_36%,rgba(6,38,67,0.42)_68%,rgba(6,38,67,0.08)_100%)]"
        />
        <div className="container-page relative flex h-full flex-col justify-center pb-2">
          <p className="flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a9cae1]">
            <span aria-hidden="true" className="h-px w-6 bg-[#8fb8d3]" />
            Smart queue · Accessible navigation
          </p>
          <h1
            id="hero-heading"
            className="mt-4 max-w-[620px] text-[36px] font-semibold leading-[1.07] tracking-[-0.035em] text-white sm:text-[42px] lg:text-[48px]"
          >
            Better care starts
            <br className="hidden sm:block" /> with a clearer path.
          </h1>
          <p className="mt-4 max-w-[470px] text-[13.5px] leading-[1.65] text-white/80 sm:text-[14.5px]">
            Check live waiting times, find the right department and plan an accessible route — so
            you can spend less time searching and more time in care.
          </p>
        </div>
      </div>

      <div className="container-page relative z-30 -mt-[27px]">
        <SearchBar />
      </div>
    </section>
  );
}
