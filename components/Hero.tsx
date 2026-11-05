import Image from "next/image";
import { hero } from "@/content/home";

export function Hero() {
  return (
    <section
      id="top"
      className="relative isolate flex min-h-svh flex-col bg-night px-[22px] pt-[16vh] pb-12 text-white md:px-[6vw] md:pb-[5vh]"
    >
      <Image src={hero.image} alt="" fill preload sizes="100vw" className="-z-20 object-cover" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(14,17,13,0.75),rgba(14,17,13,0.6)),linear-gradient(0deg,rgba(14,17,13,0.55),transparent_45%)] md:bg-[linear-gradient(90deg,rgba(14,17,13,0.78),rgba(14,17,13,0.58)_75%,rgba(14,17,13,0.25)),linear-gradient(0deg,rgba(14,17,13,0.55),transparent_45%)]"
      />

      <p className="eyebrow">{hero.eyebrow}</p>
      <h1 className="display my-auto py-8 text-[clamp(56px,7.4vw,120px)]">
        {hero.title}
        <em className="block text-gold">{hero.titleItalic}</em>
      </h1>

      <div className="flex flex-col items-start gap-7 md:flex-row md:items-end md:justify-between md:pb-8">
        <p className="max-w-[44ch] text-[15px] leading-relaxed">{hero.body}</p>
        <a
          href={hero.cta.href}
          className="eyebrow flex h-13 shrink-0 items-center gap-3 rounded-full bg-snow px-8 text-night transition-colors hover:bg-gold"
        >
          {hero.cta.label}
          <span aria-hidden className="text-sm">
            ↗
          </span>
        </a>
      </div>

      <p className="pointer-events-none absolute right-[22px] bottom-4 text-[9px] uppercase tracking-[0.16em] text-white/60 md:right-[6vw] md:bottom-5">
        Foto ilustrasi
      </p>
    </section>
  );
}
