"use client";

import { useSearchParams } from "next/navigation";
import { ChapterHeading, ChapterLabel } from "@/components/Chapter";
import { kosSection } from "@/content/home";
import { formatKosPlace } from "@/data/kos";

/** The section title follows the `q` keyword and disappears on a blank search. */
export function KosHeading() {
  const searchParams = useSearchParams();
  const keyword = searchParams.get("q")?.trim() ?? "";

  if (searchParams.has("q") && !keyword) {
    return <ChapterLabel number={kosSection.number} label={kosSection.label} />;
  }

  return (
    <ChapterHeading
      {...kosSection}
      titleItalic={keyword ? `di ${formatKosPlace(keyword)}.` : kosSection.titleItalic}
      singleLineItalic
    />
  );
}
