import { ArrowUpRight, Clock, MapPin, Phone } from "lucide-react";
import { footerColumns } from "../data";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t-[3px] border-[#7fa9c7] bg-brand-deep text-white sm:mt-20">
      <div className="container-page grid gap-10 py-12 lg:grid-cols-12 lg:gap-8 lg:py-14">
        <div className="lg:col-span-4">
          <Logo variant="light" />
          <p className="mt-5 max-w-[300px] text-[12.5px] leading-[1.75] text-white/65">
            A public hospital network built around transparent waiting times, clear navigation and
            accessible care for every patient.
          </p>
          <p className="mt-5 border-t border-white/15 pt-4 text-[10px] font-medium uppercase tracking-[0.13em] text-white/45">
            A Government Public Health Service
          </p>
        </div>

        {footerColumns.map((column) => (
          <div key={column.title} className="lg:col-span-2">
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#a8c7dc]">
              {column.title}
            </h2>
            <ul className="mt-4 space-y-[9px]">
              {column.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-[12px] leading-[1.5] text-white/72 transition-colors hover:text-white hover:underline hover:underline-offset-[3px]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div id="contact-desk" className="scroll-mt-28 lg:col-span-4">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#a8c7dc]">
            Patient contact centre
          </h2>
          <a
            href="tel:0800600100"
            className="mt-3 inline-flex items-center gap-2 text-[20px] font-semibold tracking-[-0.02em] text-white transition-colors hover:text-[#cfe4f2]"
          >
            <Phone size={17} strokeWidth={1.7} aria-hidden="true" className="text-[#96bcd6]" />
            0800 600 100
          </a>
          <p className="mt-1.5 text-[11.5px] text-white/60">
            For appointments, queue help and questions before your visit.
          </p>

          <a
            href="tel:108"
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/25 px-3.5 py-1.5 text-[11.5px] transition-colors hover:border-white/50 hover:bg-white/5"
          >
            <span aria-hidden="true" className="h-[6px] w-[6px] rounded-full bg-[#e58378]" />
            <span className="font-medium text-white/80">Emergency</span>
            <span className="font-semibold text-white">108</span>
          </a>

          <div className="mt-5 space-y-2 text-[11.5px] leading-[1.6] text-white/65">
            <p className="flex items-start gap-2">
              <MapPin
                size={13}
                strokeWidth={1.7}
                aria-hidden="true"
                className="mt-[2px] shrink-0 text-white/45"
              />
              GovCare Queue Hospital, 24 Wellness Avenue, North District
            </p>
            <p className="flex items-start gap-2">
              <Clock
                size={13}
                strokeWidth={1.7}
                aria-hidden="true"
                className="mt-[2px] shrink-0 text-white/45"
              />
              Outpatient services · Monday to Saturday, 07:00–20:00
            </p>
          </div>

          <a
            href="#find-your-way"
            className="mt-4 inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[#b8d6e9] transition-colors hover:text-white hover:underline hover:underline-offset-[3px]"
          >
            Visitor information & directions
            <ArrowUpRight size={13} strokeWidth={1.9} aria-hidden="true" />
          </a>
        </div>
      </div>

      <div className="border-t border-white/12">
        <div className="container-page flex flex-col gap-3 py-4 text-[10.5px] text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © 2026 GovCare Queue Government Hospital Network. All rights reserved.{" "}
            <span className="whitespace-nowrap">
              Made by Azaan Asif Chowdhary and Ayaan Choudhary
            </span>
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a href="#contact-desk" className="transition-colors hover:text-white">
              Privacy
            </a>
            <a href="#contact-desk" className="transition-colors hover:text-white">
              Terms of use
            </a>
            <a href="#accessibility" className="transition-colors hover:text-white">
              Accessibility statement
            </a>
            <a href="#top" className="transition-colors hover:text-white">
              Back to top ↑
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
