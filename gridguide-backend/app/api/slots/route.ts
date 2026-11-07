import { fmtTime, json, unauthorized } from "@/lib/gridguide";

/** Next available callback times (fictional). */
export async function GET(req: Request) {
  const denied = unauthorized(req);
  if (denied) return denied;
  const base = Date.now() + 60 * 60_000;
  const slots = [0, 1, 2].map((i) => {
    const d = new Date(base + i * 45 * 60_000);
    d.setUTCMinutes(d.getUTCMinutes() < 30 ? 30 : 60, 0, 0);
    return { time: fmtTime(d) };
  });
  return json({ ok: true, slots, nextSlot: slots[0].time, message: `Next available callback times: ${slots.map((s) => s.time).join(", ")}.` });
}
