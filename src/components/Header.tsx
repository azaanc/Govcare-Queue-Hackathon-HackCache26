import { useEffect, useState } from "react";
import { Menu, Phone, ShieldCheck, Stethoscope, UserRound, X } from "lucide-react";
import { navItems } from "../data";
import { Logo } from "./Logo";

type HeaderProps = {
  onOpenPortal: () => void;
  onOpenStaff: () => void;
  onOpenOpd: () => void;
  onHome: () => void;
};

function UtilityStrip({ onOpenPortal, onOpenStaff, onOpenOpd }: Omit<HeaderProps, "onHome">) {
  return (
    <div className="bg-brand-deep text-white/75">
      <div className="container-page flex h-8 items-center justify-between text-[10.5px] tracking-[0.015em]">
        <div className="flex items-center gap-3">
          <span className="font-medium text-white/90">Public Health Service</span>
          <span aria-hidden="true" className="hidden h-3 w-px bg-white/20 sm:block" />
          <span className="hidden sm:block">Government Hospital Network</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onOpenPortal}
            className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
          >
            <UserRound size={11} strokeWidth={1.8} aria-hidden="true" />
            Patient portal
          </button>
          <span aria-hidden="true" className="h-3 w-px bg-white/20" />
          <button
            type="button"
            onClick={onOpenStaff}
            className="hidden items-center gap-1.5 transition-colors hover:text-white sm:inline-flex"
          >
            <ShieldCheck size={11} strokeWidth={1.8} aria-hidden="true" />
            Staff access
          </button>
          <span aria-hidden="true" className="hidden h-3 w-px bg-white/20 sm:block" />
          <button
            type="button"
            onClick={onOpenOpd}
            className="inline-flex items-center gap-1.5 font-semibold text-white transition-colors hover:text-[#cfe4f2]"
          >
            <Stethoscope size={11} strokeWidth={1.9} aria-hidden="true" />
            OPD Saathi
          </button>
        </div>
      </div>
    </div>
  );
}

export function Header({ onOpenPortal, onOpenStaff, onOpenOpd, onHome }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header className="relative z-40 bg-white">
      <UtilityStrip onOpenPortal={onOpenPortal} onOpenStaff={onOpenStaff} onOpenOpd={onOpenOpd} />
      <div className="border-b border-rule bg-white">
        <div className="container-page flex h-[76px] items-center justify-between gap-6">
          <a
            href="#top"
            aria-label="GovCare Queue home"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onHome();
            }}
            className="rounded-sm transition-opacity hover:opacity-85"
          >
            <Logo />
          </a>

          <nav aria-label="Primary" className="ml-auto hidden items-center gap-7 lg:flex">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="group relative py-2 text-[13.5px] font-medium tracking-[-0.005em] text-[#24323f] transition-colors hover:text-link"
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className="absolute -bottom-0.5 left-0 h-[2px] w-0 bg-brand transition-all duration-200 group-hover:w-full"
                />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={onOpenPortal}
              className="hidden h-[38px] items-center gap-2 rounded-full border border-[#c8d7e2] bg-white px-3.5 text-[12px] font-semibold text-brand transition-colors hover:border-brand/40 hover:bg-brand-light sm:inline-flex"
            >
              <UserRound size={14} strokeWidth={1.8} aria-hidden="true" />
              Patient portal
            </button>
            <a
              href="tel:108"
              aria-label="Emergency contact: call 108"
              className="inline-flex h-[38px] items-center gap-2 rounded-full border border-[#cdd9e4] bg-white px-3.5 transition-colors hover:border-brand/40 hover:bg-brand-light sm:px-4"
            >
              <Phone size={14} strokeWidth={1.8} className="text-alert" />
              <span className="hidden text-[10.5px] font-medium uppercase tracking-[0.09em] text-copy sm:inline">
                Emergency
              </span>
              <span aria-hidden="true" className="hidden h-3 w-px bg-[#d8e1e9] sm:block" />
              <span className="text-[13px] font-semibold tracking-[0.01em] text-brand">108</span>
            </a>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-sm border border-[#cdd9e4] text-brand transition-colors hover:bg-brand-light lg:hidden"
            >
              {menuOpen ? <X size={18} strokeWidth={1.8} /> : <Menu size={18} strokeWidth={1.8} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div id="mobile-navigation" className="border-t border-rule bg-white lg:hidden">
            <nav aria-label="Mobile navigation" className="container-page py-3">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between border-b border-rule/70 py-3.5 text-[14px] font-medium text-ink last:border-b-0 hover:text-link"
                >
                  {item.label}
                  <span aria-hidden="true" className="text-brand/50">
                    →
                  </span>
                </a>
              ))}
              <div className="mt-2 grid grid-cols-2 gap-2 pb-1">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenOpd();
                  }}
                  className="col-span-2 inline-flex h-[42px] items-center justify-center gap-1.5 border border-brand bg-brand-light text-[12px] font-semibold text-brand"
                >
                  <Stethoscope size={14} strokeWidth={1.9} aria-hidden="true" />
                  OPD Saathi — register, queue and find your room
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenPortal();
                  }}
                  className="inline-flex h-[40px] items-center justify-center gap-1.5 bg-brand text-[12px] font-semibold text-white"
                >
                  <UserRound size={13} strokeWidth={1.8} aria-hidden="true" />
                  Patient portal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenStaff();
                  }}
                  className="inline-flex h-[40px] items-center justify-center gap-1.5 border border-[#cddbe5] text-[12px] font-semibold text-brand"
                >
                  <ShieldCheck size={13} strokeWidth={1.8} aria-hidden="true" />
                  Staff access
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
