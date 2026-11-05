"use client";

import { useSearchParams } from "next/navigation";
import { ChapterHeading } from "@/components/Chapter";
import { kosSection } from "@/content/home";
import { findKosLocation } from "@/data/kos";

const MAX_KEYWORD_LENGTH = 40;

/** The section title follows the `q` keyword in the URL. */
export function KosHeading() {
  const keyword = useSearchParams().get("q")?.trim() ?? "";

  if (!keyword) return <ChapterHeading {...kosSection} />;

  const location = findKosLocation(keyword);
  if (location) {
    return <ChapterHeading {...kosSection} titleItalic={`di ${location}.`} />;
  }

  const shown =
    keyword.length > MAX_KEYWORD_LENGTH
      ? `${keyword.slice(0, MAX_KEYWORD_LENGTH)}…`
      : keyword;

  return (
    <ChapterHeading
      {...kosSection}
      title={kosSection.searchTitle}
      titleItalic={`“${shown}”`}
    />
  );
}
