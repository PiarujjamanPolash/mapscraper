import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GeoLeads - Local Business Lead Intelligence",
  description: "Find high-quality local business leads.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-foreground`}>
        <nav className="border-b p-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link href="/" className="text-xl font-bold tracking-tight text-primary">
              GeoLeads
            </Link>
            <div className="space-x-4">
              <Link href="/search" className="text-sm font-medium hover:underline">
                Search Leads
              </Link>
              <Link href="/dashboard" className="text-sm font-medium hover:underline">
                Dashboard
              </Link>
            </div>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto p-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
