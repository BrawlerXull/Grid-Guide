import { ImageResponse } from "next/og";

export const alt = "GridGuide: an eGain AI agent that helps storm-hit Brightvale Electric customers without the hold line";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0b1f3a",
          color: "white",
          padding: "64px 72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "#fbbf24",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="44" height="44" viewBox="0 0 24 24" fill="#0b1f3a" stroke="#0b1f3a" strokeWidth="1.6" strokeLinejoin="round">
              <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <div style={{ fontSize: 40, fontWeight: 700 }}>GridGuide</div>
          <div style={{ fontSize: 24, color: "#fcd34d", marginLeft: 12 }}>eGain AI Agent Hackathon</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.1 }}>Power out? Skip the hold line.</div>
          <div style={{ fontSize: 30, color: "#cbd5e1", lineHeight: 1.35 }}>
            An AI support agent that checks outages, files tickets, sends restoration alerts, approves extensions within policy, and
            knows when a person or 911 must take over.
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 24, color: "#0b1f3a" }}>
          {["Real actions", "Safety stops", "Medical Priority", "Works offline"].map((t) => (
            <div key={t} style={{ background: "#fcd34d", borderRadius: 999, padding: "8px 20px", fontWeight: 600 }}>
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
