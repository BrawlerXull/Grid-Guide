import { kv } from "@/lib/store";
import {
  SEED_OUTAGES, describeOutage, json, last4, logEvent, normZip, pick, readInput, ref, unauthorized,
} from "@/lib/gridguide";

/** File an outage report. Avoids duplicate tickets when the outage is already known. */
async function handle(req: Request) {
  const denied = unauthorized(req);
  if (denied) return denied;
  const input = await readInput(req);
  const zip = normZip(pick(input, "zip", "zipCode", "wsZip"));
  const phone4 = last4(pick(input, "phoneLast4", "last4", "wsPhoneLast4", "phone"));
  const partial = /^(true|yes|partial|1)$/i.test(pick(input, "partial", "partialOutage", "wsPartial") || "");
  if (!zip) return json({ ok: false, status: "invalid_zip", message: "A valid 5-digit ZIP code is required to file a report." }, 400);
  if (!phone4) return json({ ok: false, status: "missing_phone", message: "The last 4 digits of the phone number on the account are required." }, 400);

  const seeded = SEED_OUTAGES[zip];
  if (seeded) {
    await logEvent("duplicate_avoided", `Duplicate report avoided for ${zip} (known outage ${seeded.outageId})`, { zip, phone: `***-${phone4}` });
    return json({ ok: true, ...describeOutage(seeded), status: "duplicate", ticketId: seeded.outageId,
      message: `Good news: we already know about this outage (${seeded.outageId}), so you don't need a new ticket. ` + describeOutage(seeded).message });
  }
  const existing = await kv().get<{ ticketId: string }>(`gg:report:${zip}`);
  if (existing && !partial) {
    await logEvent("duplicate_avoided", `Duplicate report avoided for ${zip} (ticket ${existing.ticketId})`, { zip, phone: `***-${phone4}` });
    return json({ ok: true, status: "duplicate", zip, ticketId: existing.ticketId,
      message: `This outage is already reported under ticket ${existing.ticketId}, so I've added you to that ticket instead of opening a new one.` });
  }

  const ticketId = ref("BV");
  await kv().set(`gg:report:${zip}`, { ticketId, at: new Date().toISOString() }, 60 * 60 * 24);
  await logEvent("report_filed", `${partial ? "Partial outage" : "Outage"} report ${ticketId} filed for ${zip}`, { zip, ticketId, partial, phone: `***-${phone4}` });
  return json({
    ok: true, status: "filed", zip, ticketId, partial,
    message: `Your ${partial ? "partial outage" : "outage"} report is filed. Your ticket number is ${ticketId}. A crew will be assigned to investigate.`,
  });
}

export const POST = handle;
export const GET = handle;
