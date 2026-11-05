"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { Kos } from "@/data/kos";

export function formatPrice(price: number) {
  return `Rp${price.toLocaleString("id-ID")}`;
}

export const KOS_GRID =
  "grid gap-x-6 gap-y-10 min-[30rem]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";

export function KosCard({ kos }: { kos: Kos }) {
  const cardRef = useRef<HTMLElement>(null);

  // Cards appear as they scroll into view. The list is React's, so this only flips a class.
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        card.classList.add("is-visible");
        observer.disconnect();
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  return (
    <article ref={cardRef} className="kos-card flex h-full flex-col border-b border-line pb-6">
      <div className="relative aspect-[4/3] overflow-hidden bg-line">
        <Image
          src={kos.image}
          alt=""
          fill
          sizes="(min-width: 75rem) 25vw, (min-width: 50.0625rem) 33vw, (min-width: 30rem) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out hover:scale-105 motion-reduce:transition-none"
        />
      </div>
      <p className="eyebrow mt-5 text-clay">{kos.type}</p>
      <h3 className="mt-3 font-serif text-2xl leading-[1.1] font-normal">{kos.name}</h3>
      <p className="mt-2 text-sm text-olive">
        {kos.area}, {kos.city}
      </p>
      <p className="mt-3 mb-5 text-xs leading-relaxed text-olive">
        {kos.facilities.join(" · ")}
      </p>
      <p className="mt-auto font-serif text-2xl">
        {formatPrice(kos.pricePerMonth)}
        <span className="ml-1 font-sans text-xs text-olive">/bulan</span>
      </p>
    </article>
  );
}

export function KosGridSkeleton() {
  return (
    <div className={KOS_GRID} aria-hidden>
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className="animate-pulse motion-reduce:animate-none">
          <div className="aspect-[4/3] bg-line" />
          <div className="mt-5 h-3 w-16 bg-line" />
          <div className="mt-4 h-6 w-4/5 bg-line" />
          <div className="mt-3 h-4 w-3/5 bg-line" />
          <div className="mt-6 h-6 w-2/5 bg-line" />
        </div>
      ))}
    </div>
  );
}
