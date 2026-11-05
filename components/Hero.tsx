import Image from "next/image";
import { hero, kosSection } from "@/content/home";

export function Hero() {
  return (
    <section
      id="top"
      className="relative isolate grid min-h-svh bg-night px-[22px] pb-10 text-white md:grid-cols-[minmax(0,1fr)_clamp(320px,28vw,400px)] md:items-center md:gap-[4vw] md:px-[6vw] md:pb-0"
    >
      <Image src={hero.image} alt="" fill preload sizes="100vw" className="-z-20 object-cover" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(14,17,13,0.75),rgba(14,17,13,0.6)),linear-gradient(0deg,rgba(14,17,13,0.55),transparent_45%)] md:bg-[linear-gradient(90deg,rgba(14,17,13,0.7),rgba(14,17,13,0.15)_70%),linear-gradient(0deg,rgba(14,17,13,0.55),transparent_45%)]"
      />

      <div className="flex min-h-[88svh] flex-col pt-[16vh] pb-10 md:min-h-svh md:pb-[5vh]">
        <p className="eyebrow">{hero.eyebrow}</p>
        <h1 className="display my-auto py-8 text-[clamp(56px,7.4vw,120px)]">
          {hero.title}
          <em className="block text-gold">{hero.titleItalic}</em>
        </h1>
        <p className="max-w-[44ch] text-[15px] leading-relaxed">{hero.body}</p>
      </div>

      {/* Native GET keeps the search working without JS: /?q=...#kos */}
      <form action="/#kos" className="bg-night/90 p-8 text-snow">
        <p className="eyebrow border-b border-white/25 pb-3">{hero.searchTitle}</p>
        <p className="mt-5 text-sm leading-relaxed">{hero.searchBody}</p>
        <label className="mt-8 block">
          <span className="eyebrow text-white/70">Lokasi</span>
          <input
            type="search"
            name="q"
            placeholder={kosSection.searchPlaceholder}
            className="field-line mt-1"
          />
        </label>
        <button
          type="submit"
          className="eyebrow mt-7 h-12 w-full cursor-pointer rounded-full bg-snow text-night transition-colors hover:bg-gold"
        >
          {hero.searchCta}
        </button>
      </form>

      <p className="pointer-events-none absolute right-[22px] bottom-3 text-[9px] uppercase tracking-[0.16em] text-white/60 md:right-[6vw] md:bottom-5">
        Foto ilustrasi
      </p>
    </section>
  );
}
