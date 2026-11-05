import { Suspense } from "react";
import { Chapter, ChapterHeading } from "@/components/Chapter";
import { Hero } from "@/components/Hero";
import { KosGridSkeleton } from "@/components/KosCard";
import { KosSection } from "@/components/KosSection";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import {
  dikelola,
  disclaimer,
  info,
  kosSection,
  kota,
  survei,
  tentang,
} from "@/content/home";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />

        <Chapter {...tentang}>
          <dl className="mt-9 flex flex-wrap justify-between gap-x-14 gap-y-6 border-t border-white/30 pt-6">
            {tentang.stats.map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse gap-2">
                <dt className="text-[10px] uppercase tracking-[0.16em] text-white/80">
                  {stat.label}
                </dt>
                <dd className="display text-[clamp(40px,4.4vw,64px)]">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </Chapter>

        <section id={kosSection.id} className="px-[22px] py-24 md:px-[6vw] md:py-32">
          {/* Reading the URL needs a boundary; this fallback shows until it resolves. */}
          <Suspense
            fallback={
              <>
                <ChapterHeading {...kosSection} />
                <div className="mt-28">
                  <KosGridSkeleton />
                </div>
              </>
            }
          >
            <KosSection />
          </Suspense>
          <p className="mt-10 text-xs text-olive">{kosSection.note}</p>
        </section>

        <Chapter {...survei} align="right" />

        <Chapter {...dikelola}>
          <ul className="mt-9 flex flex-wrap gap-2.5 border-t border-white/30 pt-6">
            {dikelola.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-white/50 px-4 py-2 text-[10px] uppercase tracking-[0.14em]"
              >
                {tag}
              </li>
            ))}
          </ul>
        </Chapter>

        <section
          id={kota.id}
          className="bg-night px-[22px] py-24 text-snow md:px-[6vw] md:py-32"
        >
          <ChapterHeading {...kota} />
          <div className="mt-16 grid gap-14 md:grid-cols-2 md:gap-[6vw]">
            <div>
              <h3 className="eyebrow border-b border-white/25 pb-4">{kota.areasTitle}</h3>
              <ul>
                {kota.areas.map((area) => (
                  <li
                    key={area}
                    className="display border-b border-white/25 py-3 text-[clamp(26px,2.6vw,38px)]"
                  >
                    {area}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="eyebrow border-b border-white/25 pb-4">{kota.campusTitle}</h3>
              <ul>
                {kota.campuses.map((campus) => (
                  <li
                    key={campus.name}
                    className="flex items-baseline justify-between gap-4 border-b border-white/25 py-3"
                  >
                    <span className="display text-[clamp(26px,2.6vw,38px)]">{campus.name}</span>
                    <span className="text-[10px] uppercase tracking-[0.16em] text-white/70">
                      {campus.city}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <Chapter
          {...info}
          aside={
            <div className="bg-night/90 p-8 text-snow">
              {/* The multi-step form replaces this block. */}
              <p className="eyebrow border-b border-white/25 pb-3">Form info kos</p>
              <p className="mt-6 min-h-40 text-sm text-white/70">Form multi-step</p>
              <p className="mt-6 text-[11px] leading-relaxed text-white/70">{disclaimer}</p>
            </div>
          }
        />
      </main>
      <SiteFooter />
    </>
  );
}
