import { beforeEach, describe, expect, it, vi } from "vitest";

const valid = {
  name: "Budi Santoso",
  email: "budi@example.com",
  phone: "081234567890",
  contactMethod: "email",
  city: "Jakarta Selatan",
  type: "campur",
  message: "Cari kos dekat stasiun.",
};

// A fresh module per test gives each test an empty in-memory store.
let POST: (request: Request) => Promise<Response>;

beforeEach(async () => {
  vi.resetModules();
  ({ POST } = await import("@/app/api/subscribe/route"));
});

async function post(body: unknown) {
  const raw = typeof body === "string" ? body : JSON.stringify(body);
  const response = await POST(
    new Request("http://test/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: raw,
    }),
  );
  return { status: response.status, body: await response.json() };
}

describe("POST /api/subscribe", () => {
  it("accepts valid input", async () => {
    const { status, body } = await post(valid);
    expect(status).toBe(201);
    expect(body.message).toBeTruthy();
  });

  it("accepts a missing message because it is optional", async () => {
    expect((await post({ ...valid, message: undefined })).status).toBe(201);
  });

  it("accepts a phone number with spaces and dashes", async () => {
    expect((await post({ ...valid, phone: "0812-3456 7890" })).status).toBe(201);
  });

  it("reports every required field when the body is empty", async () => {
    const { status, body } = await post({});
    expect(status).toBe(400);
    expect(Object.keys(body.fields).sort()).toEqual(
      ["city", "contactMethod", "email", "name", "phone", "type"].sort(),
    );
  });

  it("treats whitespace-only values as empty", async () => {
    const { status, body } = await post({ ...valid, name: "   " });
    expect(status).toBe(400);
    expect(body.fields.name).toBeTruthy();
  });

  it.each([
    ["email", "bukan-email"],
    ["phone", "12345"],
    ["contactMethod", "merpati"],
    ["city", "Bandung"],
    ["type", "vip"],
    ["message", "x".repeat(501)],
    ["name", "x".repeat(101)],
  ])("rejects an invalid %s", async (field, value) => {
    const { status, body } = await post({ ...valid, [field]: value });
    expect(status).toBe(400);
    expect(Object.keys(body.fields)).toEqual([field]);
  });

  it("rejects non-string values", async () => {
    const { status, body } = await post({ ...valid, email: 123 });
    expect(status).toBe(400);
    expect(body.fields.email).toBeTruthy();
  });

  it.each([
    ["malformed JSON", "{nama:"],
    ["an array", "[]"],
    ["null", "null"],
  ])("rejects %s as the body", async (_label, raw) => {
    const { status, body } = await post(raw);
    expect(status).toBe(400);
    expect(body.error).toContain("JSON");
  });

  it("rejects a duplicate email regardless of case", async () => {
    expect((await post(valid)).status).toBe(201);
    const { status, body } = await post({ ...valid, email: "BUDI@example.com" });
    expect(status).toBe(409);
    expect(body.error).toContain("sudah terdaftar");
  });

  it("does not store rejected input", async () => {
    expect((await post({ ...valid, phone: "12345" })).status).toBe(400);
    expect((await post(valid)).status).toBe(201);
  });
});
