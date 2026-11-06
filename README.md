# Mamikos Homepage Clone

Frontend technical test, built with AI assistance.

- **Live site:** https://mamitech-technical-test.vercel.app/
- **Screen recording:** https://drive.google.com/drive/folders/1ST3TcPzLUOZHda2A0AGUGpTqpXvBuo4m?usp=sharing

> A technical test only. Not affiliated with Mamikos. The form is a demo, so please do not enter real personal data.

## What was cloned

| Part | Source |
| --- | --- |
| Layout, typography, and animation | [Loam House Residences](https://residences.loamhouse.com.au/) |
| Copy and listings, in Indonesian | [Mamikos](https://mamikos.com/) |

Combining the two sites is deliberate: the Loam House design system presents real Mamikos content. Photos are not from either site.

## Stack and tools

- Next.js 16 (App Router, route handlers), React 19, TypeScript, Tailwind CSS 4
- GSAP (ScrollSmoother, ScrollTrigger, SplitText) for animation
- Vitest for API tests
- Claude Code (Claude Opus 5.5) as the AI coding agent
- Vercel for hosting

## Approach

The work was split into small steps: scaffold, content, API, layout, wiring and states, animation, then deploy. The AI agent implemented one step at a time, and each step was reviewed and tested by hand before being committed.

That review changed the result. For example, it led to:

- a listing title that follows the search keyword in one consistent format
- a form progress indicator that shows position only, after error colors hid it
- a mobile bottom sheet for form choices, after the native dropdown popup proved too small

Output was checked with `curl`, Vitest, the browser Network tab, server logs, and scripted runs in headless Chrome.

## Key decisions

- **Listings are a snapshot, not live scraped.** The Mamikos homepage renders on the client and some of its pages rate limit requests, so a live dependency would be fragile during review. `data/kos.ts` holds 20 listings taken from Mamikos on 5 November 2026, and each one's district was assigned from its subdistrict.
- **The URL holds the search state.** `?q=` and `?type=` drive the title, the list, and the request, so a result can be shared or reloaded.
- **Only two endpoints.** Search and filtering are parameters on `GET /api/items`.
- **Validation lives on the server.** The form uses `noValidate`, so every validation message comes from the API handler.
- **Form choices open in a `<dialog>` modal.** A native `select` popup cannot be sized, and a top-layer dialog stays correct inside the transformed smooth-scroll content.
- **Animation respects the device.** Touch screens keep native scrolling and skip the blur, and `prefers-reduced-motion` turns the curtain and scroll effects off.

## API

### `GET /api/items`

Returns the listings. All parameters are optional.

| Parameter | Values |
| --- | --- |
| `q` | Keyword matched against name, area, and city. Sent blank, it returns `400`. |
| `type` | `putra`, `putri`, `campur` |
| `city` | `Jakarta Pusat`, `Jakarta Utara`, `Jakarta Barat`, `Jakarta Selatan`, `Jakarta Timur` |

```bash
curl "http://localhost:3000/api/items?q=gambir&type=putra"
```

`200 OK`

```json
{
  "items": [
    {
      "id": "kost-rodiah-tipe-b",
      "name": "Kost Rodiah Tipe B",
      "area": "Gambir",
      "city": "Jakarta Pusat",
      "type": "putra",
      "pricePerMonth": 1695000,
      "facilities": ["WiFi", "AC", "Kloset Duduk", "Kasur"],
      "image": "/images/kos/kamar-05.jpg"
    }
  ],
  "total": 1
}
```

`400 Bad Request` for `?type=vip`

```json
{ "error": "Tipe kos tidak dikenal. Pilih salah satu: putra, putri, campur." }
```

### `POST /api/subscribe`

Validates the input, then stores it. `message` is optional and every other field is required.

```bash
curl -X POST http://localhost:3000/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"name":"Budi Santoso","email":"budi@example.com","phone":"081234567890","contactMethod":"email","city":"Jakarta Selatan","type":"campur","message":"Dekat stasiun"}'
```

`201 Created`

```json
{ "message": "Terima kasih! Pendaftaranmu sudah kami terima." }
```

`400 Bad Request` for an invalid email

```json
{
  "error": "Data belum valid. Periksa kembali isianmu.",
  "fields": { "email": "Format email tidak valid." }
}
```

`409 Conflict` for an email that is already registered

```json
{ "error": "Email ini sudah terdaftar." }
```

### When data resets

Subscribers are kept in server memory, so they are lost on every restart, serverless cold start, or redeploy. An email rejected as a duplicate can then register again. Listings do not change, because they live in the code.

## Run locally

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # API tests
npm run lint
npm run build
```

## Frontend states

| Feature | States |
| --- | --- |
| Listings | Loading skeleton, error with retry, blank search prompt, no results, success |
| Form | Submitting, success, per-field validation errors, duplicate email, network error with input kept |

To see the error states, use **Offline** or **Block request URL** in the browser's Network tab. A blocked request never reaches the server log, while a `400` from the API does, which shows whether a failure is in the frontend or the API.

## Credits and limits

- Photos come from Unsplash and are illustrative only, not photos of the listed properties. Sources are in [`content/image-sources.md`](content/image-sources.md).
- Copy and listing data belong to Mamikos. Prices are the normal monthly price on the snapshot date and may have changed.
- GSAP is used under its [standard no-charge license](https://gsap.com/standard-license), which is free but not open source.
- Not tested yet on Safari or on physical phones.
