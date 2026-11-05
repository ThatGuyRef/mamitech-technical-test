"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { nav } from "@/content/home";

function subscribeToScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

export function SiteHeader() {
  const scrolled = useSyncExternalStore(
    subscribeToScroll,
    () => window.scrollY > 40,
    () => false,
  );
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    const root = document.documentElement;
    root.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      root.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  const solid = scrolled && !menuOpen;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-30 flex items-center justify-between gap-6 px-[22px] transition-all duration-300 md:px-[3vw] ${
        solid
          ? "h-[68px] border-b border-line bg-paper/90 text-ink backdrop-blur-lg"
          : "h-[82px] border-b border-transparent text-white"
      }`}
    >
      <a
        href="#top"
        onClick={() => setMenuOpen(false)}
        className="relative z-10 font-serif text-[22px] uppercase tracking-[0.2em]"
      >
        {nav.wordmark}
      </a>

      <nav aria-label="Navigasi utama" className="hidden gap-8 lg:flex">
        {nav.links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="text-[11px] uppercase tracking-[0.15em] underline-offset-4 hover:underline"
          >
            {link.label}
          </a>
        ))}
      </nav>

      <div className="relative z-10 flex items-center gap-2.5">
        <a href={nav.secondaryCta.href} className="pill max-lg:hidden">
          <span>{nav.secondaryCta.label}</span>
        </a>
        <a href={nav.primaryCta.href} className="pill max-lg:hidden">
          <span>{nav.primaryCta.label}</span>
        </a>
        <ThemeToggle />
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
          className="grid size-11 cursor-pointer place-items-center lg:hidden"
        >
          <span className="grid gap-1.5" aria-hidden>
            <span
              className={`block h-px w-7 bg-current transition-transform ${
                menuOpen ? "translate-y-[3.5px] rotate-45" : ""
              }`}
            />
            <span
              className={`block h-px w-7 bg-current transition-transform ${
                menuOpen ? "-translate-y-[3.5px] -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </div>

      <nav
        id="mobile-menu"
        aria-label="Menu"
        hidden={!menuOpen}
        className="fixed inset-0 h-dvh overflow-y-auto bg-night px-[22px] pt-28 pb-10 text-snow lg:hidden"
      >
        <ul>
          {nav.links.map((link) => (
            <li key={link.href} className="border-b border-white/20">
              <a
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="display block py-4 text-[40px]"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap gap-2.5">
          <a
            href={nav.primaryCta.href}
            onClick={() => setMenuOpen(false)}
            className="pill"
          >
            <span>{nav.primaryCta.label}</span>
          </a>
          <a
            href={nav.secondaryCta.href}
            onClick={() => setMenuOpen(false)}
            className="pill"
          >
            <span>{nav.secondaryCta.label}</span>
          </a>
        </div>
      </nav>
    </header>
  );
}
