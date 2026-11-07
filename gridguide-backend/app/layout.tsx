import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PwaRuntime } from "./components/pwa";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "GridGuide · AI storm support for Brightvale Electric",
    template: "%s · GridGuide",
  },
  description:
    "GridGuide is an eGain AI agent that helps customers of Brightvale Electric (a fictional utility) report outages, stay safe, get more time to pay, and reach a person.",
  metadataBase: new URL("https://gridguide.vercel.app"),
  applicationName: "Brightvale Electric · GridGuide",
  openGraph: {
    type: "website",
    siteName: "GridGuide",
    title: "GridGuide · AI storm support for Brightvale Electric",
    description: "An eGain AI agent that takes real actions for storm-hit customers and knows when a person or 911 must take over.",
  },
  twitter: { card: "summary_large_image" },
  appleWebApp: {
    capable: true,
    title: "Brightvale",
    statusBarStyle: "default",
  },
  formatDetection: { telephone: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b1f3a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-amber-400 focus:px-4 focus:py-2 focus:font-semibold focus:text-slate-950"
        >
          Skip to main content
        </a>
        {children}
        <PwaRuntime />
      </body>
    </html>
  );
}
