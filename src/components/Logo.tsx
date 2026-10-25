type LogoProps = {
  variant?: "default" | "light";
  className?: string;
};

export function Logo({ variant = "default", className = "" }: LogoProps) {
  const light = variant === "light";

  return (
    <span className={`inline-flex items-center gap-[9px] whitespace-nowrap sm:gap-[11px] ${className}`}>
      <svg
        width="38"
        height="38"
        viewBox="0 0 38 38"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect width="38" height="38" rx="2" fill={light ? "#ffffff" : "#0b3f6b"} />
        <path
          d="M16.4 8.2h5.2v8.2h8.2v5.2h-8.2v8.2h-5.2v-8.2h-8.2v-5.2h8.2V8.2Z"
          fill={light ? "#0b3f6b" : "#ffffff"}
        />
        <rect x="29" y="5" width="4" height="4" fill="#9fc4dc" />
      </svg>
      <span className="flex flex-col">
        <span
          className={`text-[18px] font-semibold leading-none tracking-[-0.04em] sm:text-[20px] ${
            light ? "text-white" : "text-brand-deep"
          }`}
        >
          GovCare <span className={light ? "font-normal text-white/75" : "font-normal text-link"}>Queue</span>
        </span>
        <span
          className={`mt-[5px] hidden text-[8.5px] font-medium uppercase leading-none tracking-[0.14em] sm:block ${
            light ? "text-white/60" : "text-copy"
          }`}
        >
          Government Hospital Network
        </span>
      </span>
    </span>
  );
}
