import { kv } from "@/lib/store";
import {
  ERROR_ZIP, SEED_OUTAGES, TIMEOUT_ZIP, describeOutage, json, logEvent, normZip, pick, readInput, sleep, unauthorized,
} from "@/lib/gridguide";

/** Check outage status for a ZIP code. GET /api/outages?zip=90001 (POST with {"zip": "..."} also works). */
async function handle(req: Request) {
  const denied = unauthorized(req);
  if (denied) return denied;
  const input = await readInput(req);
  const zip = normZip(pick(input, "zip", "zipCode", "wsZip", "postalCode"));
  if (!zip) {
    return json({ ok: false, status: "invalid_zip", message: "Please provide a valid 5-digit ZIP code." }, 400);
  }
  if (zip === ERROR_ZIP) {
    await logEvent("api_error", `Outage system error simulated for ZIP ${zip}`, { zip });
    return json({ ok: false, status: "error", message: "The outage system is temporarily unavailable." }, 500);
  }
  if (zip === TIMEOUT_ZIP) {
    await sleep(25_000);
  }

  const seeded = SEED_OUTAGES[zip];
  if (seeded) {
    await logEvent("outage_check", `Outage check for ${zip}: known outage ${seeded.outageId}`, { zip, outageId: seeded.outageId });
    return json({ ok: true, ...describeOutage(seeded) });
  }

  // An outage reported earlier through GridGuide for this ZIP
  const reported = await kv().get<{ ticketId: string; at: string }>(`gg:report:${zip}`);
  if (reported) {
    await logEvent("outage_check", `Outage check for ${zip}: already reported (${reported.ticketId})`, { zip });
    return json({
      ok: true,
      status: "reported",
      zip,
      ticketId: reported.ticketId,
      customersAffected: 1,
      etr: "Assessing (a crew is being assigned)",
      message: `An outage at ${zip} has already been reported (ticket ${reported.ticketId}) and a crew is being assigned. You don't need to report it again.`,
    });
  }

  await logEvent("outage_check", `Outage check for ${zip}: no known outage`, { zip });
  return json({
    ok: true,
    status: "none",
    zip,
    customersAffected: 0,
    etr: "",
    message:
      `We don't have a known outage in ${zip} yet. Please check your circuit breakers and whether your neighbors have power. ` +
      `If the power is still out, I can file an outage report with your ZIP code and the last 4 digits of the phone number on the account.`,
  });
}

export const GET = handle;
export const POST = handle;
