import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { meta } from "@/content/home";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  robots: { index: false, follow: false },
};

// Runs before paint so a saved or system dark theme never flashes light.
const themeScript = `(function(){
  var root = document.documentElement;
  var query = window.matchMedia("(prefers-color-scheme: dark)");
  function saved(){ try { return localStorage.getItem("theme"); } catch (e) { return null; } }
  function apply(){ root.setAttribute("data-theme", saved() || (query.matches ? "dark" : "light")); }
  apply();
  query.addEventListener("change", apply);
})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      data-theme="light"
      className={`${cormorant.variable} ${dmSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
