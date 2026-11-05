// Homepage copy, taken from mamikos.com on 2026-11-05.
// Section headings follow the two-line pattern of the Loam House design:
// `title` is the roman line and `titleItalic` the italic line.

export const meta = {
  title: "Mamikos - Cari, Bayar, & Sewa Kost Impianmu Secara Online",
  description:
    "Cari Kos di mana ? Temukan pilihan kost terlengkap di kota tujuan. Dapatkan beragam potongan serta cashback dengan berbagai pilihan metode pembayaran. #EnaknyaNgekos bareng Mamikos",
};

export const disclaimer =
  "Proyek tes teknis, tidak berafiliasi dengan Mamikos. Jangan masukkan data pribadi asli.";

export const nav = {
  wordmark: "Mamikos",
  links: [
    { label: "Tentang", href: "#tentang" },
    { label: "Cari Kos", href: "#kos" },
    { label: "Survei", href: "#survei" },
    { label: "Kota", href: "#kota" },
    { label: "Info", href: "#info" },
  ],
  primaryCta: { label: "Cari kos", href: "#kos" },
  secondaryCta: { label: "Dapatkan info", href: "#info" },
};

export const hero = {
  eyebrow: "#EnaknyaNgekos",
  title: "Mau cari kos?",
  titleItalic: "Langsung sewa di Mamikos.",
  body: "Temukan pilihan kost terlengkap di kota tujuan. Dapatkan beragam potongan serta cashback dengan berbagai pilihan metode pembayaran.",
  cta: { label: "Cari kos", href: "#kos" },
  image: "/images/hero.jpg",
};

export const tentang = {
  id: "tentang",
  number: "01",
  label: "Tentang",
  eyebrow: "Aplikasi Anak Kos No. 1 di Indonesia",
  title: "Cari, bayar, & sewa",
  titleItalic: "kost impianmu.",
  body: "Mamikos memanfaatkan teknologi untuk berkembang dari aplikasi cari kos menjadi aplikasi yang memudahkan calon anak kos untuk booking properti kos dan juga melakukan pembayaran kos.",
  image: "/images/tentang.jpg",
  stats: [
    { value: "2 juta+", label: "Kamar kos" },
    { value: "140+", label: "Kota di Indonesia" },
    { value: "2", label: "Layanan properti: Singgahsini & Apik" },
  ],
};

export const kosSection = {
  id: "kos",
  number: "02",
  label: "Cari kos",
  eyebrow: "Paling direkomendasikan",
  title: "Pilihan kos",
  titleItalic: "di Jakarta.",
  searchPlaceholder: "Masukan nama lokasi/area/alamat",
  typeFilters: [
    { label: "Semua Tipe Kos", value: "" },
    { label: "Putra", value: "putra" },
    { label: "Putri", value: "putri" },
    { label: "Campur", value: "campur" },
  ],
  note: "Foto hanya ilustrasi. Harga normal per bulan dari Mamikos, 5 November 2026.",
};

export const survei = {
  id: "survei",
  number: "03",
  label: "Survei",
  eyebrow: "Survei Kos",
  title: "Survei kos idaman",
  titleItalic: "kamu sekarang!",
  body: "Untungnya ada fitur Survei Kos di Mamikos. Cari, pilih, survei, hingga sewa kos idaman dijamin aman dan GRATIS.",
  image: "/images/survei.jpg",
};

export const dikelola = {
  id: "dikelola",
  number: "04",
  label: "Dikelola",
  eyebrow: "Dikelola Mamikos",
  title: "Kos dikelola Mamikos,",
  titleItalic: "terjamin nyaman.",
  body: "Disurvey langsung oleh Mamikos. Lokasi terverifikasi, bangunan kos lolos seleksi.",
  image: "/images/dikelola.jpg",
  tags: ["K. Mandi Dalam", "WiFi", "AC", "Kloset Duduk", "Kasur", "Akses 24 Jam"],
};

export const kota = {
  id: "kota",
  number: "05",
  label: "Kota",
  eyebrow: "Area Kos Terpopuler",
  title: "Dari kota favorit",
  titleItalic: "sampai sekitar kampus.",
  areasTitle: "Area Kos Terpopuler",
  areas: [
    "Kos Yogyakarta",
    "Kos Jakarta",
    "Kos Bandung",
    "Kos Surabaya",
    "Kos Malang",
    "Kos Semarang",
    "Kos Medan",
  ],
  campusTitle: "Kos Sekitar Kampus",
  campuses: [
    { name: "UGM", city: "Jogja" },
    { name: "UNDIP", city: "Semarang" },
    { name: "UI", city: "Depok" },
    { name: "UNPAD", city: "Jatinangor" },
    { name: "STAN", city: "Jakarta" },
    { name: "UB", city: "Malang" },
    { name: "UNAIR", city: "Surabaya" },
  ],
};

export const info = {
  id: "info",
  number: "06",
  label: "Info",
  eyebrow: "Mau dapat notifikasi promo dan info terbaru dari Mamikos?",
  title: "Dapatkan info",
  titleItalic: "kost murah.",
  image: "/images/form.jpg",
};

export const footer = {
  columns: [
    {
      title: "MAMIKOS",
      links: [
        { label: "Tentang Kami", href: "https://mamikos.com/" },
        { label: "Pusat Bantuan", href: "https://help.mamikos.com/" },
        { label: "Blog Mamikos", href: "https://mamikos.com/info/" },
      ],
    },
    {
      title: "SITUS ASLI",
      links: [{ label: "mamikos.com", href: "https://mamikos.com/" }],
    },
  ],
  credit: "Konten © Mamikos.com. Desain mengikuti Loam House.",
};
