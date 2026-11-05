"use client";

// Both icons always render and CSS picks one from data-theme, so the server
// HTML matches whatever theme the script in layout.tsx chose before paint.
export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Storage can be blocked. The theme still changes for this page view.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Ganti tema terang atau gelap"
      className="grid size-11 cursor-pointer place-items-center rounded-full border border-current/55"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className="size-4 fill-none stroke-current stroke-[1.5] dark:hidden"
      >
        <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
      </svg>
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className="hidden size-4 fill-none stroke-current stroke-[1.5] dark:block"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" />
      </svg>
    </button>
  );
}
