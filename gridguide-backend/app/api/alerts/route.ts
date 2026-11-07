import { kv } from "@/lib/store";
import { digits, json, logEvent, maskPhone, normZip, pick, readInput, unauthorized } from "@/lib/gridguide";

/** Enroll a mobile number in restoration text alerts. */
async function handle(req: Request) {
  const denied = unauthorized(req);
  if (denied) return denied;
  const input = await readInput(req);
  const phone = digits(pick(input, "phone", "mobile", "phoneNumber", "wsPhone"));
  const zip = normZip(pick(input, "zip", "zipCode", "wsZip"));
  if (phone.length < 7) return json({ ok: false, status: "invalid_phone", message: "Please provide a valid mobile number for text alerts." }, 400);
  if (!zip) return json({ ok: false, status: "invalid_zip", message: "Please provide the 5-digit ZIP code of the address without power." }, 400);
  const key = `gg:alert:${zip}:${phone.slice(-4)}`;
  const existing = await kv().get<{ at: string }>(key);
  if (existing && Date.now() - new Date(existing.at).getTime() < 30 * 60_000) {
    return json({
      ok: true, status: "already_subscribed", zip, phone: maskPhone(phone),
      message: `You're already signed up for restoration text alerts at ${maskPhone(phone)} for ZIP ${zip}. We'll text you when the estimate changes and when power is restored.`,
    });
  }
  await kv().set(key, { zip, at: new Date().toISOString() }, 60 * 60 * 24 * 7);
  await logEvent("alert_signup", `Restoration alerts enabled for ${maskPhone(phone)} in ${zip}`, { zip, phone: maskPhone(phone) });
  return json({
    ok: true, status: "subscribed", zip, phone: maskPhone(phone),
    message: `You're signed up for restoration text alerts at ${maskPhone(phone)} for ZIP ${zip}. We'll text you when the estimate changes and when power is restored. Reply STOP at any time to cancel.`,
  });
}

export const POST = handle;
export const GET = handle;
