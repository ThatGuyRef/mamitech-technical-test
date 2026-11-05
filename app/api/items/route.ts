import { KOS, KOS_CITIES, KOS_TYPES, type KosCity, type KosType } from "@/data/kos";

// Reading request.url makes this run per request instead of being prerendered
// at build time, which Cache Components would otherwise do for a pure handler.
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const rawQ = params.get("q");
  const q = rawQ?.trim().toLowerCase() ?? "";
  const type = params.get("type") ?? "";
  const city = params.get("city") ?? "";

  // No `q` lists everything. A `q` sent blank means an empty search was submitted.
  if (rawQ !== null && !q) {
    return Response.json(
      { error: "Kolom pencarian wajib diisi." },
      { status: 400 },
    );
  }

  if (type && !KOS_TYPES.includes(type as KosType)) {
    return Response.json(
      { error: `Tipe kos tidak dikenal. Pilih salah satu: ${KOS_TYPES.join(", ")}.` },
      { status: 400 },
    );
  }

  if (city && !KOS_CITIES.includes(city as KosCity)) {
    return Response.json(
      { error: `Kota tidak dikenal. Pilih salah satu: ${KOS_CITIES.join(", ")}.` },
      { status: 400 },
    );
  }

  const items = KOS.filter(
    (kos) =>
      (!type || kos.type === type) &&
      (!city || kos.city === city) &&
      (!q || `${kos.name} ${kos.area} ${kos.city}`.toLowerCase().includes(q)),
  );

  return Response.json({ items, total: items.length });
}
