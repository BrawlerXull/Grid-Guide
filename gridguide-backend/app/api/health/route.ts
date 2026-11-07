import { json } from "@/lib/gridguide";
export async function GET() {
  return json({ ok: true, service: "gridguide-backend", time: new Date().toISOString() });
}
