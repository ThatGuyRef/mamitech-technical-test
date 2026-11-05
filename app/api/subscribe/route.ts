import { KOS_CITIES, KOS_TYPES, type KosCity, type KosType } from "@/data/kos";

const CONTACT_METHODS = ["telepon", "email"];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^(\+62|62|0)8\d{7,12}$/;
const MAX_NAME_LENGTH = 100;
const MAX_MESSAGE_LENGTH = 500;

type Subscriber = {
  name: string;
  email: string;
  phone: string;
  contactMethod: string;
  city: string;
  type: string;
  message: string;
};

// Lives in server memory, so it resets on every cold start or redeploy.
const subscribers = new Map<string, Subscriber>();

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function validate(body: Record<string, unknown>) {
  const subscriber: Subscriber = {
    name: text(body.name),
    email: text(body.email).toLowerCase(),
    phone: text(body.phone).replace(/[\s-]/g, ""),
    contactMethod: text(body.contactMethod),
    city: text(body.city),
    type: text(body.type),
    message: text(body.message),
  };

  const fields: Record<string, string> = {};

  if (!subscriber.name) fields.name = "Nama wajib diisi.";
  else if (subscriber.name.length > MAX_NAME_LENGTH)
    fields.name = `Nama maksimal ${MAX_NAME_LENGTH} karakter.`;

  if (!subscriber.email) fields.email = "Email wajib diisi.";
  else if (!EMAIL_PATTERN.test(subscriber.email))
    fields.email = "Format email tidak valid.";

  if (!subscriber.phone) fields.phone = "Nomor telepon wajib diisi.";
  else if (!PHONE_PATTERN.test(subscriber.phone))
    fields.phone = "Format nomor tidak valid. Contoh: 081234567890.";

  if (!CONTACT_METHODS.includes(subscriber.contactMethod))
    fields.contactMethod = "Pilih metode kontak.";

  if (!KOS_CITIES.includes(subscriber.city as KosCity))
    fields.city = "Pilih kota.";

  if (!KOS_TYPES.includes(subscriber.type as KosType))
    fields.type = "Pilih tipe kos.";

  if (subscriber.message.length > MAX_MESSAGE_LENGTH)
    fields.message = `Pesan maksimal ${MAX_MESSAGE_LENGTH} karakter.`;

  return { subscriber, fields };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Body request harus berupa JSON yang valid.", fields: {} },
      { status: 400 },
    );
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return Response.json(
      { error: "Body request harus berupa objek JSON.", fields: {} },
      { status: 400 },
    );
  }

  const { subscriber, fields } = validate(body as Record<string, unknown>);

  if (Object.keys(fields).length > 0) {
    return Response.json(
      { error: "Data belum valid. Periksa kembali isianmu.", fields },
      { status: 400 },
    );
  }

  if (subscribers.has(subscriber.email)) {
    return Response.json(
      { error: "Email ini sudah terdaftar." },
      { status: 409 },
    );
  }

  subscribers.set(subscriber.email, subscriber);

  return Response.json(
    { message: "Terima kasih! Pendaftaranmu sudah kami terima." },
    { status: 201 },
  );
}
