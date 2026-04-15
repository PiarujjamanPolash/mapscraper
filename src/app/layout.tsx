import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LeadMap Pro — Maps-Based Lead Scraping Platform",
  description:
    "Scrape and export high-quality business leads from Google Maps with precision geo-filtering, lead scoring, and one-click XLSX export.",
  keywords: ["lead generation", "maps scraping", "business leads", "Google Maps"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
