import {
  Accessibility,
  Activity,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  MapPin,
  Search,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { searchItems, type SearchItem } from "../data";

type Scope = "All services" | SearchItem["type"];

const scopes: Scope[] = ["All services", "Department", "Service", "Accessibility"];

function ResultIcon({ type }: { type: SearchItem["type"] }) {
  if (type === "Accessibility") return <Accessibility size={16} strokeWidth={1.6} />;
  if (type === "Service") return <Activity size={16} strokeWidth={1.7} />;
  return <MapPin size={16} strokeWidth={1.7} />;
}

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<Scope>("All services");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    return searchItems
      .filter((item) => scope === "All services" || item.type === scope)
      .filter(
        (item) =>
          !term ||
          item.label.toLowerCase().includes(term) ||
          item.detail.toLowerCase().includes(term) ||
          item.type.toLowerCase().includes(term)
      )
      .slice(0, 6);
  }, [query, scope]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const choose = (item: SearchItem) => {
    setQuery(item.label);
    setOpen(false);
    inputRef.current?.blur();
    const target = document.querySelector(item.href);
    if (target) {
      window.requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (results[0]) choose(results[0]);
  };

  return (
    <div ref={wrapperRef} className="relative mx-auto w-full max-w-[920px]">
      <form
        role="search"
        aria-label="Search the hospital website"
        onSubmit={onSubmit}
        className={`flex h-[58px] items-center gap-2.5 rounded-full border bg-white pl-4 pr-[7px] shadow-[0_14px_38px_-16px_rgba(7,43,76,0.4)] transition-colors sm:gap-3 sm:pl-5 ${
          open ? "border-[#9ab9d1]" : "border-[#dce4eb]"
        }`}
      >
        <Search size={18} strokeWidth={1.9} className="shrink-0 text-brand" aria-hidden="true" />
        <label htmlFor="site-search" className="sr-only">
          Search departments, services or directions
        </label>
        <input
          ref={inputRef}
          id="site-search"
          name="q"
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search departments, services or directions"
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls="search-suggestions"
          aria-autocomplete="list"
          className="h-full min-w-0 flex-1 bg-transparent text-[14px] tracking-[-0.005em] text-ink outline-none placeholder:text-[#75818e] sm:text-[14.5px] [&::-webkit-search-cancel-button]:hidden"
        />

        <div className="relative hidden shrink-0 items-center border-l border-rule pl-3 md:flex">
          <select
            aria-label="Limit search to a category"
            value={scope}
            onChange={(event) => {
              setScope(event.target.value as Scope);
              setOpen(true);
            }}
            className="h-9 cursor-pointer appearance-none bg-transparent pl-0 pr-5 text-[12px] font-medium text-[#51606e] outline-none"
          >
            {scopes.map((option) => (
              <option key={option} value={option}>
                {option === "Department" ? "Departments" : option === "Service" ? "Services" : option}
              </option>
            ))}
          </select>
          <ChevronDown
            size={13}
            strokeWidth={1.8}
            className="pointer-events-none absolute right-0 text-[#64717e]"
            aria-hidden="true"
          />
        </div>

        <button
          type="submit"
          aria-label="Search"
          className="inline-flex h-[44px] shrink-0 items-center gap-2 rounded-full bg-brand px-3.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-brand-deep sm:px-5"
        >
          <span className="hidden sm:inline">Search</span>
          <ArrowRight size={15} strokeWidth={2} aria-hidden="true" />
        </button>
      </form>

      {open && (
        <div
          id="search-suggestions"
          className="absolute inset-x-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-[3px] border border-rule bg-white shadow-[0_24px_60px_-24px_rgba(7,43,76,0.4)]"
        >
          <div className="flex items-center justify-between border-b border-rule px-5 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-copy">
              {query.trim() ? "Matching destinations" : "Popular destinations"}
            </p>
            <p className="text-[11px] text-copy/80">
              {results.length} {results.length === 1 ? "result" : "results"}
            </p>
          </div>

          {results.length > 0 ? (
            <ul className="py-1" role="listbox" aria-label="Search suggestions">
              {results.map((item) => (
                <li key={item.label} role="option" aria-selected="false">
                  <button
                    type="button"
                    onClick={() => choose(item)}
                    className="group flex w-full items-center gap-3.5 px-5 py-2.5 text-left transition-colors hover:bg-mist"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand">
                      <ResultIcon type={item.type} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-medium text-ink">
                        {item.label}
                      </span>
                      <span className="mt-0.5 block truncate text-[11.5px] text-copy">
                        {item.detail}
                      </span>
                    </span>
                    <span className="hidden shrink-0 text-[10px] font-medium uppercase tracking-[0.08em] text-[#7b8794] sm:block">
                      {item.type}
                    </span>
                    <ArrowUpRight
                      size={15}
                      strokeWidth={1.7}
                      className="shrink-0 text-[#94a3b1] transition-colors group-hover:text-brand"
                      aria-hidden="true"
                    />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-5 py-7 text-center">
              <p className="text-[13.5px] text-ink">No matches for “{query}”.</p>
              <p className="mt-1.5 text-[12px] text-copy">
                Try a department name, or call the patient desk on{" "}
                <a href="tel:0800600100" className="font-semibold text-link hover:underline">
                  0800 600 100
                </a>
                .
              </p>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 border-t border-rule bg-[#fbfcfd] px-5 py-2.5">
            <p className="text-[11px] text-copy">Updated live · Main campus</p>
            <a
              href="#contact-desk"
              onClick={() => setOpen(false)}
              className="text-[11.5px] font-semibold text-link hover:underline"
            >
              Need help? Visit the desk
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
