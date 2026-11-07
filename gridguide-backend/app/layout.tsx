import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
      </body>
    </html>
  );
}
