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

## Environment

| Variable | Production | Preview | Development | Purpose |
|---|---|---|---|---|
| `GRIDGUIDE_API_KEY` | required | set | set | Shared secret eGain sends as `x-api-key`. Production fails closed (503) without it. |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | set | set | set | Upstash Redis, from the Vercel Marketplace integration. In-memory fallback when absent. |
| `KV_URL`, `REDIS_URL`, `KV_REST_API_READ_ONLY_TOKEN` | set | set | set | Added by the integration; not used by the code. |

All three environments share one Upstash database. Preview and local runs store their data under their own key prefix (`preview:`, `development:`, `local:`), so test traffic never reaches the live console, and each environment's `/api/reset` clears only its own data. `GET /api/events` reports which environment and storage answered.

See [.env.example](.env.example). To run locally:

```bash
npm install
vercel env pull .env.local   # GRIDGUIDE_API_KEY + Upstash credentials
npm run dev
```

Pushing to `main` deploys production (the Vercel project is Git-connected with root directory `gridguide-backend`).
