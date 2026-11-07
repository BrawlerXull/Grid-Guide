# GridGuide backend

Next.js app deployed on Vercel at https://gridguide.vercel.app. It serves two things:

1. **The agent-facing API** that eGain Custom Actions and workflow API nodes call. Every route needs the `x-api-key` header.

   | Route | Purpose |
   |---|---|
   | `GET /api/outages?zip=` | Live outage status for a ZIP. `90009` simulates a system error; `90003` simulates a timeout. |
   | `POST /api/reports` | File an outage ticket. Skips the ticket when the outage is already known. |
   | `POST /api/alerts` | Sign a phone number up for restoration texts (idempotent for 30 minutes). |
   | `POST /api/extensions` | Bill extension policy: ≤14 days auto-approved once every 12 months; otherwise review; >30 days not available. |
   | `POST /api/callbacks` | Book a callback, a Medical Priority callback, or an email handoff to Customer Care. |
   | `POST /api/safety` | Log a downed-line or electrical hazard for dispatch. |
   | `GET /api/slots` | Next available callback times. |
   | `GET /api/events` | Read-only feed for the dispatcher console (phone numbers masked). |
   | `POST /api/reset` | Clear demo data. |

2. **The web pages:**
   - `/`: project overview and test scenarios
   - `/dashboard`: live dispatcher console
   - `/brightvale`: the fictional utility's homepage

Storage is Upstash Redis (`KV_REST_API_URL` / `KV_REST_API_TOKEN`), with an in-memory fallback for local development.

```bash
npm install
vercel env pull   # GRIDGUIDE_API_KEY + Upstash credentials
npm run dev
```
