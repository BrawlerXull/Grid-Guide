import { kv, EVENTS, STATS } from "@/lib/store";
import { guard, json, unauthorized } from "@/lib/gridguide";

/** Clear demo data (events, counters, reports, extensions, alerts). Requires the API key. */
async function handle(req: Request) {
  const denied = unauthorized(req);
  if (denied) return denied;
  const store = kv();
  const keys = await store.keys("gg:*");
  await Promise.all([...keys, EVENTS, STATS].map((k) => store.del(k)));
  return json({ ok: true, cleared: keys.length });
}

export const POST = guard(handle);
