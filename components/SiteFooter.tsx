import { disclaimer, footer, nav } from "@/content/home";

export function SiteFooter() {
  return (
    <footer className="bg-night px-[22px] pt-16 pb-8 text-snow md:px-[6vw]">
      <div className="grid gap-12 border-t border-white/25 pt-12 md:grid-cols-[1fr_auto_auto] md:gap-[6vw]">
        <div>
          <a href="#top" className="font-serif text-[22px] uppercase tracking-[0.2em]">
            {nav.wordmark}
          </a>
          <p className="mt-5 max-w-[46ch] text-sm leading-relaxed text-white/80">
            {disclaimer}
          </p>
        </div>
        {footer.columns.map((column) => (
          <div key={column.title}>
            <h2 className="eyebrow text-white/70">{column.title}</h2>
            <ul className="mt-5 space-y-3 text-sm">
              {column.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline-offset-4 hover:underline"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-12 text-[11px] text-white/60">{footer.credit}</p>
    </footer>
  );
}
