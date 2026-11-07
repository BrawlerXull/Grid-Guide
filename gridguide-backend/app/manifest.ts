import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/brightvale",
    name: "Brightvale Electric · GridGuide",
    short_name: "Brightvale",
    description:
      "Check outages, get restoration alerts, find safety steps and emergency numbers, get more time to pay, or chat with GridGuide, the Brightvale Electric AI assistant. (Fictional utility, eGain AI Agent Hackathon.)",
    start_url: "/brightvale?source=pwa",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "any",
    background_color: "#0b1f3a",
    theme_color: "#0b1f3a",
    lang: "en-US",
    dir: "ltr",
    categories: ["utilities", "lifestyle", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Current outages", short_name: "Outages", url: "/brightvale?source=shortcut#outages", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Downed line safety", short_name: "Safety", url: "/brightvale?source=shortcut#safety", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "More time to pay", short_name: "Billing", url: "/brightvale?source=shortcut#billing", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Dispatcher console", short_name: "Console", url: "/dashboard?source=shortcut", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
    screenshots: [
      { src: "/screenshots/mobile-brightvale.png", sizes: "390x844", type: "image/png", form_factor: "narrow", label: "Brightvale Electric storm response on a phone" },
      { src: "/screenshots/mobile-dashboard.png", sizes: "390x844", type: "image/png", form_factor: "narrow", label: "Dispatcher console on a phone" },
      { src: "/screenshots/desktop-brightvale.png", sizes: "1280x800", type: "image/png", form_factor: "wide", label: "Brightvale Electric storm response on desktop" },
    ],
  };
}
