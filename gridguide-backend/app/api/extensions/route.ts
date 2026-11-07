import { kv } from "@/lib/store";
import { digits, fmtDate, json, last4, logEvent, normZip, pick, readInput, ref, unauthorized, guard, rateLimited } from "@/lib/gridguide";

/**
 * Payment extension policy (matches knowledge doc 07):
 *  - up to 14 days: auto-approved if no extension in the last 12 months
 *  - 15-30 days, or a second extension within 12 months: Customer Care review (no promise of approval)
 *  - over 30 days: not available, offer a payment plan
 */
async function handle(req: Request) {
  const denied = unauthorized(req);
  if (denied) return denied;
  const limited = await rateLimited(req, "extensions", 120);
  if (limited) return limited;
  const input = await readInput(req);
  const days = parseInt(digits(pick(input, "days", "extensionDays", "wsDays", "daysNeeded")) || "0", 10);
  const phone4 = last4(pick(input, "phoneLast4", "last4", "wsPhoneLast4", "phone"));
  const zip = normZip(pick(input, "zip", "wsZip"));
  if (!days || days < 1) return json({ ok: false, status: "invalid_days", message: "Please provide how many days of extension are needed (1 to 30)." }, 400);
  if (!phone4) return json({ ok: false, status: "missing_phone", message: "The last 4 digits of the phone number on the account are required." }, 400);

  if (days > 30) {
    await logEvent("extension_declined", `Extension of ${days} days not available (***-${phone4}); payment plan offered`, { days, phone: `***-${phone4}` });
    return json({
      ok: true, decision: "not_available", days,
      message: "Extensions longer than 30 days aren't available, but Customer Care can set up a payment plan that spreads your balance over 3 to 12 monthly payments. I can connect you with them.",
    });
  }

  const key = `gg:ext:${phone4}`;
  const prior = await kv().get<{ at: string; days: number }>(key);
  if (days <= 14 && !prior) {
    const due = new Date(Date.now() + days * 86400_000);
    await kv().set(key, { at: new Date().toISOString(), days }, 60 * 60 * 24 * 365);
    const confirmation = ref("EXT");
    await logEvent("extension_approved", `${days}-day extension auto-approved (***-${phone4}), new due date ${fmtDate(due)}`, { days, phone: `***-${phone4}`, zip, confirmation });
    return json({
      ok: true, decision: "approved", days, confirmation, newDueDate: fmtDate(due),
      message: `Your ${days}-day payment extension is approved. Confirmation number ${confirmation}. Your new due date is ${fmtDate(due)}. There's no fee, and no late charge if you pay by then.`,
    });
  }

  const caseId = ref("CC");
  const reason = prior ? "a previous extension was granted in the last 12 months" : "requests over 14 days need Customer Care review";
  await logEvent("extension_review", `${days}-day extension sent to Customer Care review (${caseId}, ***-${phone4})`, { days, phone: `***-${phone4}`, caseId, reason });
  return json({
    ok: true, decision: "needs_review", days, caseId, reason,
    message: `I can't approve this one automatically because ${reason}, so I've sent it to our Customer Care team for review (case ${caseId}). They'll contact you within 2 business days. Approval isn't guaranteed.`,
  });
}

export const POST = guard(handle);
export const GET = guard(handle);
