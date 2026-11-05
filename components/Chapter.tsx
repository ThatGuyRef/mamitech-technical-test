import Image from "next/image";
import type { ReactNode } from "react";

type HeadingProps = {
  number: string;
  label: string;
  eyebrow: string;
  title: string;
  titleItalic: string;
};

export function ChapterLabel({
  number,
  label,
}: Pick<HeadingProps, "number" | "label">) {
  return (
    <>
      <p className="display text-[clamp(36px,3.6vw,52px)] opacity-80">{number}</p>
      <p className="mt-1 text-[9px] uppercase tracking-[0.22em] opacity-80">{label}</p>
    </>
  );
}

export function ChapterHeading({
  number,
  label,
  eyebrow,
  title,
  titleItalic,
  singleLineItalic = false,
}: HeadingProps & { singleLineItalic?: boolean }) {
  return (
    <>
      <ChapterLabel number={number} label={label} />
      <p className="eyebrow mt-9 inline-block border-b border-current/40 pb-3">{eyebrow}</p>
      <h2 className="display mt-7 text-[clamp(46px,7vw,112px)]">
        {title}
        {/* The padding keeps descenders and italic overhang from being clipped. */}
        <em
          className={
            singleLineItalic
              ? "-mb-[0.2em] block truncate pr-[0.1em] pb-[0.2em]"
              : "block"
          }
        >
          {titleItalic}
        </em>
      </h2>
    </>
  );
}

type ChapterProps = HeadingProps & {
  id: string;
  image: string;
  body?: string;
  align?: "left" | "right";
  aside?: ReactNode;
  children?: ReactNode;
};

/** Full-screen photo section with white text, the core layout of the design. */
export function Chapter({
  id,
  image,
  body,
  align = "left",
  aside,
  children,
  ...heading
}: ChapterProps) {
  return (
    <section
      id={id}
      className="relative isolate flex min-h-svh flex-col justify-center bg-night px-[22px] pt-28 pb-16 text-white md:px-[6vw]"
    >
      <Image src={image} alt="" fill sizes="100vw" className="-z-20 object-cover" />
      <div
        aria-hidden
        className={`absolute inset-0 -z-10 from-black/75 to-black/60 md:to-black/25 ${
          align === "right" ? "bg-linear-to-l" : "bg-linear-to-r"
        }`}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-linear-to-t from-black/60 to-transparent"
      />

      <div
        className={
          aside
            ? "grid items-center gap-12 md:grid-cols-[minmax(0,1fr)_clamp(320px,30vw,420px)] md:gap-[4vw]"
            : ""
        }
      >
        <div className={align === "right" ? "ml-auto max-w-4xl text-right" : "max-w-4xl"}>
          <ChapterHeading {...heading} />
          {body && (
            <p
              className={`mt-8 max-w-[48ch] text-[15px] leading-relaxed md:text-[clamp(15px,1.15vw,17px)] ${
                align === "right" ? "ml-auto" : ""
              }`}
            >
              {body}
            </p>
          )}
        </div>
        {aside}
      </div>

      {children}

      <p className="pointer-events-none absolute right-[22px] bottom-5 text-[9px] uppercase tracking-[0.16em] text-white/60 md:right-[6vw]">
        Foto ilustrasi
      </p>
    </section>
  );
}
