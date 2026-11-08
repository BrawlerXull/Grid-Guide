import { kv, STATS } from "@/lib/store";
import { SEED_OUTAGES, describeOutage, guard, json, rateLimited } from "@/lib/gridguide";

/** Read-only feed for the dispatcher dashboard (fictional data, phone numbers masked). */
async function handle(req: Request) {
  const limited = await rateLimited(req, "events", 90);
  if (limited) return limited;
  const store = kv();
  const [events, stats] = await Promise.all([store.events(60), store.hgetall(STATS)]);
  const outages = Object.values(SEED_OUTAGES).map((o) => describeOutage(o));
  return json({
    events,
    stats,
    outages,
    storage: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL ? "redis" : "memory",
    environment: process.env.VERCEL_ENV || "local",
  });
}

export const GET = guard(handle);
