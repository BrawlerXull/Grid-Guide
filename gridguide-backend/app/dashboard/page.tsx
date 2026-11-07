import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../components/site-header";
import { Console } from "./console";

export const metadata: Metadata = {
  title: "Dispatcher console",
  description: "Live feed of every action the GridGuide AI agent takes for Brightvale Electric customers (fictional data).",
};

export default function DashboardPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <Console />
      </main>
      <SiteFooter />
    </>
  );
}
