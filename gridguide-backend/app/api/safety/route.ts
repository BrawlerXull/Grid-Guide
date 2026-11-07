import { json, logEvent, normZip, pick, readInput, unauthorized, guard, rateLimited } from "@/lib/gridguide";

/** Log a life-safety report (downed line, sparks, fire) so dispatch sees it. The customer is always told to call 911. */
async function handle(req: Request) {
  const denied = unauthorized(req);
  if (denied) return denied;
  const limited = await rateLimited(req, "safety", 120);
  if (limited) return limited;
  const input = await readInput(req);
  const zip = normZip(pick(input, "zip", "wsZip"));
  const hazard = pick(input, "hazard", "description", "userQuery") || "Downed line or electrical hazard";
  await logEvent("safety_stop", `SAFETY: ${hazard}${zip ? ` near ${zip}` : ""}. Customer told to call 911 and the Emergency Line.`, { zip, hazard });
  return json({
    ok: true, status: "dispatch_alerted",
    message: "I've alerted our emergency dispatch team. Please stay at least 35 feet away, keep others away, and call 911 and our Emergency Line at (800) 555-0111 right now. Downed lines can't be handled through chat.",
  });
}

export const POST = guard(handle);
export const GET = guard(handle);
