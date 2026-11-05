import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/items/route";
import { findKosLocation, formatKosPlace, KOS, type Kos } from "@/data/kos";

describe("formatKosPlace", () => {
  it.each([
    ["JAKARTA utara", "Jakarta Utara"],
    ["bandung", "Bandung"],
    ["  kost seven melody ", "Kost Seven Melody"],
    ["UGM", "UGM"],
    ["123 abc", "123 Abc"],
  ])("writes %j as %j", (keyword, expected) => {
    expect(formatKosPlace(keyword)).toBe(expected);
  });
});

describe("findKosLocation", () => {
  it.each([
    ["gambir", "Gambir"],
    ["  JAKARTA utara ", "Jakarta Utara"],
    ["jakarta", "Jakarta"],
    ["grogol petamburan", "Grogol Petamburan"],
  ])("turns %j into its proper name", (keyword, expected) => {
    expect(findKosLocation(keyword)).toBe(expected);
  });

  it.each(["dahlia", "bandung", "gam", ""])("returns null for %j", (keyword) => {
    expect(findKosLocation(keyword)).toBeNull();
  });
});

async function get(query = "") {
  const response = await GET(new Request(`http://test/api/items${query}`));
  return { status: response.status, body: await response.json() };
}

describe("GET /api/items", () => {
  it("returns every listing without filters", async () => {
    const { status, body } = await get();
    expect(status).toBe(200);
    expect(body.total).toBe(KOS.length);
    expect(body.items).toHaveLength(KOS.length);
  });

  it("filters by type", async () => {
    const { status, body } = await get("?type=putra");
    expect(status).toBe(200);
    expect(body.total).toBeGreaterThan(0);
    expect(body.items.every((kos: Kos) => kos.type === "putra")).toBe(true);
  });

  it("filters by city", async () => {
    const { status, body } = await get("?city=Jakarta%20Selatan");
    expect(status).toBe(200);
    expect(body.total).toBeGreaterThan(0);
    expect(body.items.every((kos: Kos) => kos.city === "Jakarta Selatan")).toBe(true);
  });

  it("searches name, area, and city without case sensitivity", async () => {
    expect((await get("?q=DAHLIA")).body.total).toBe(1);
    expect((await get("?q=tebet")).body.total).toBeGreaterThan(0);
    expect((await get("?q=jakarta%20barat")).body.total).toBeGreaterThan(0);
  });

  it("combines filters and returns an empty list when nothing matches", async () => {
    const { status, body } = await get("?type=putra&city=Jakarta%20Utara");
    expect(status).toBe(200);
    expect(body).toEqual({ items: [], total: 0 });
  });

  it("treats empty type and city as no filter", async () => {
    const { body } = await get("?type=&city=");
    expect(body.total).toBe(KOS.length);
  });

  it.each(["?q=", "?q=%20%20", "?q=&type=putra"])(
    "rejects a blank search for %s",
    async (query) => {
      const { status, body } = await get(query);
      expect(status).toBe(400);
      expect(body.error).toBe("Kolom pencarian wajib diisi.");
    },
  );

  it("rejects an unknown type", async () => {
    const { status, body } = await get("?type=vip");
    expect(status).toBe(400);
    expect(body.error).toContain("Tipe kos");
  });

  it("rejects an unknown city", async () => {
    const { status, body } = await get("?city=Bandung");
    expect(status).toBe(400);
    expect(body.error).toContain("Kota");
  });
});
