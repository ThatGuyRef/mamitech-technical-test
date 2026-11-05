"use client";

import { useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { KOS_GRID, KosCard, KosGridSkeleton } from "@/components/KosCard";
import { KosHeading } from "@/components/KosHeading";
import { kosSection } from "@/content/home";
import { KOS_TYPES, type Kos, type KosType } from "@/data/kos";

const SEARCH_DEBOUNCE_MS = 300;

type Result =
  | { key: string; status: "success"; items: Kos[]; total: number }
  | { key: string; status: "invalid" | "error"; message: string };

/** A 400 from the API: the user must change the input, so retrying cannot help. */
class InvalidRequestError extends Error {}

/**
 * Updates the URL without a navigation. useSearchParams still sees the change.
 * `null` removes a parameter, while `""` keeps it blank to mark an empty search.
 */
function setUrlParams(changes: Record<string, string | null>) {
  const params = new URLSearchParams(window.location.search);
  for (const [name, value] of Object.entries(changes)) {
    if (value === null) params.delete(name);
    else params.set(name, value);
  }
  const query = params.toString();
  const { pathname, hash } = window.location;
  window.history.replaceState(null, "", `${pathname}${query ? `?${query}` : ""}${hash}`);
}

async function fetchItems(query: string, signal: AbortSignal) {
  let response: Response;
  try {
    response = await fetch(`/api/items?${query}`, { signal });
  } catch (error) {
    if (signal.aborted) throw error;
    throw new Error("Tidak bisa terhubung ke server. Periksa koneksimu.");
  }

  const body = await response.json().catch(() => null);
  if (response.status === 400) {
    throw new InvalidRequestError(body?.error ?? kosSection.searchRequired);
  }
  if (!response.ok) {
    throw new Error(body?.error ?? `Server membalas dengan status ${response.status}.`);
  }
  if (!Array.isArray(body?.items)) {
    throw new Error("Respons server tidak sesuai format.");
  }
  return { items: body.items as Kos[], total: body.items.length as number };
}

export function KosSection() {
  const searchParams = useSearchParams();
  const keyword = searchParams.get("q")?.trim() ?? "";
  const isBlankSearch = searchParams.has("q") && !keyword;
  const rawType = searchParams.get("type") ?? "";
  const type = KOS_TYPES.includes(rawType as KosType) ? rawType : "";

  const [input, setInput] = useState(keyword);
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [lastSuccess, setLastSuccess] = useState<Extract<Result, { status: "success" }> | null>(
    null,
  );

  const query = new URLSearchParams({
    ...((keyword || isBlankSearch) && { q: keyword }),
    ...(type && { type }),
  }).toString();
  const requestKey = `${attempt}|${query}`;

  // Loading is derived: any result that does not match the current request is stale.
  const current = result?.key === requestKey ? result : null;

  // Erasing the text while typing lists everything. Only submitting blank is an error.
  useEffect(() => {
    const typed = input.trim();
    if (typed === keyword) return;
    const timer = setTimeout(
      () => setUrlParams({ q: typed || null }),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [input, keyword]);

  useEffect(() => {
    const controller = new AbortController();

    fetchItems(query, controller.signal)
      .then((data) => {
        const success = { key: requestKey, status: "success" as const, ...data };
        setResult(success);
        setLastSuccess(success);
      })
      .catch((error: Error) => {
        // An aborted request was replaced by a newer one, so it has nothing to report.
        if (controller.signal.aborted) return;
        setResult({
          key: requestKey,
          status: error instanceof InvalidRequestError ? "invalid" : "error",
          message: error.message,
        });
      });

    return () => controller.abort();
  }, [query, requestKey]);

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    setUrlParams({ q: input.trim() });
  }

  function clearFilters() {
    setInput("");
    setUrlParams({ q: null, type: null });
  }

  const shown = current?.status === "success" ? current : lastSuccess;
  const isLoading = !current;

  return (
    <>
      <KosHeading />

      <div className="mt-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <form role="search" onSubmit={submitSearch} className="w-full md:max-w-sm">
          <label htmlFor="kos-search" className="sr-only">
            Cari kos
          </label>
          <input
            id="kos-search"
            type="search"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={kosSection.searchPlaceholder}
            aria-invalid={current?.status === "invalid"}
            className="w-full border-b border-line bg-transparent py-2.5 text-[15px] outline-none placeholder:text-olive focus:border-clay aria-invalid:border-clay"
          />
        </form>

        <div role="group" aria-label="Filter tipe kos" className="flex flex-wrap gap-2">
          {kosSection.typeFilters.map((filter) => {
            const active = type === filter.value;
            return (
              <button
                key={filter.value}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  setUrlParams({ type: filter.value || null, q: keyword || null })
                }
                className={`cursor-pointer rounded-full border px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors ${
                  active
                    ? "border-ink bg-ink text-paper"
                    : "border-line hover:border-ink"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      <p aria-live="polite" className="mt-8 min-h-5 text-sm text-olive">
        {current?.status === "success" && current.total > 0 && `${current.total} kos ditemukan`}
        {isLoading && <span className="sr-only">Memuat daftar kos</span>}
      </p>

      <div className="mt-6" aria-busy={isLoading}>
        {current?.status === "invalid" ? (
          <div role="alert" className="border border-line px-6 py-16 text-center">
            <h2 className="font-serif text-3xl font-normal">{current.message}</h2>
            <p className="mt-3 text-sm text-olive">{kosSection.searchRequiredHint}</p>
            <button
              type="button"
              onClick={clearFilters}
              className="eyebrow mt-7 h-12 cursor-pointer rounded-full border border-ink px-8"
            >
              Tampilkan semua kos
            </button>
          </div>
        ) : current?.status === "error" ? (
          <div role="alert" className="border border-line px-6 py-16 text-center">
            <p className="font-serif text-3xl">Daftar kos gagal dimuat</p>
            <p className="mt-3 text-sm text-olive">{current.message}</p>
            <button
              type="button"
              onClick={() => setAttempt((value) => value + 1)}
              className="eyebrow mt-7 h-12 cursor-pointer rounded-full bg-ink px-8 text-paper"
            >
              Coba lagi
            </button>
          </div>
        ) : current?.status === "success" && current.total === 0 ? (
          <div className="border border-line px-6 py-16 text-center">
            <p className="font-serif text-3xl">Kos tidak ditemukan</p>
            <p className="mt-3 text-sm text-olive">
              Coba kata kunci atau tipe kos lain.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="eyebrow mt-7 h-12 cursor-pointer rounded-full border border-ink px-8"
            >
              Hapus filter
            </button>
          </div>
        ) : shown?.total ? (
          // While a new request runs, the previous list stays so the page does not jump.
          <ul className={`${KOS_GRID} transition-opacity ${isLoading ? "opacity-50" : ""}`}>
            {shown.items.map((kos) => (
              <li key={kos.id}>
                <KosCard kos={kos} />
              </li>
            ))}
          </ul>
        ) : (
          <KosGridSkeleton />
        )}
      </div>
    </>
  );
}
