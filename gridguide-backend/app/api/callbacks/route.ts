import { digits, fmtTime, json, logEvent, maskPhone, pick, readInput, ref, unauthorized } from "@/lib/gridguide";

/**
 * Human handoff: book a callback (standard or Medical Priority) or route a request to Customer Care by email.
 * Body: { phone, date?, time?, reason?, priority?/medical?, channel?: "callback" | "email", email? }
 */
async function handle(req: Request) {
  const denied = unauthorized(req);
  if (denied) return denied;
  const input = await readInput(req);
  const channel = (pick(input, "channel", "contactMethod", "wsContact") || "callback").toLowerCase();
  const reason = pick(input, "reason", "topic", "summary", "wsTopic", "userQuery") || "General inquiry";
  const phone = digits(pick(input, "phone", "phoneNumber", "wsPhone", "mobile"));
  const email = pick(input, "email", "wsEmail");
  const priority = /^(true|yes|1|medical|priority)/i.test(pick(input, "priority", "medical", "wsMedical", "medicalPriority") || "");

  if (channel.startsWith("email") || (email && phone.length < 7)) {
    if (!email) return json({ ok: false, status: "missing_email", message: "Please provide an email address." }, 400);
    const caseId = ref("CC");
    await logEvent("email_handoff", `Request routed to Customer Care by email (${caseId})`, { caseId, reason });
    return json({
      ok: true, status: "email_sent", caseId,
      message: `I've sent your request to Customer Care with a summary of our conversation (case ${caseId}). They'll reply by email within 1 business day.`,
    });
  }

  if (phone.length < 7) return json({ ok: false, status: "missing_phone", message: "Please provide a phone number for the callback." }, 400);
  const callbackId = ref("CB");

  if (priority) {
    await logEvent("priority_callback", `MEDICAL PRIORITY callback requested for ${maskPhone(phone)} (${callbackId})`, { callbackId, phone: maskPhone(phone), reason });
    return json({
      ok: true, status: "priority_booked", callbackId, priority: true, window: "within 15 minutes",
      message: `I've requested a Medical Priority callback (${callbackId}). Our Medical Priority team will call ${maskPhone(phone)} within about 15 minutes. If anyone is in danger or the equipment has stopped and a life is at risk, call 911 now. Medical Priority line: (800) 555-0155.`,
    });
  }

  const date = pick(input, "date", "wsDate", "callbackDate");
  const time = pick(input, "time", "wsTime", "callbackTime");
  const dayWord = /\b(today|tonight|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|asap|as soon as possible|next available)\b/i;
  const slot = date && time
    ? `${date} at ${time}`
    : time
      ? (dayWord.test(time) ? time : `today at ${time}`)
      : date
        ? `${date} at the next available time`
        : `today at ${fmtTime(new Date(Date.now() + 2 * 3600_000))}`;
  await logEvent("callback_booked", `Callback ${callbackId} booked for ${maskPhone(phone)}: ${slot}`, { callbackId, phone: maskPhone(phone), slot, reason });
  return json({
    ok: true, status: "booked", callbackId, slot, priority: false,
    message: `Your callback is booked for ${slot} (reference ${callbackId}). A Customer Care specialist will call ${maskPhone(phone)} and will already have our conversation, so you won't need to repeat yourself.`,
  });
}

export const POST = handle;
export const GET = handle;
