"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { Button } from "./ui/button";

export function Navbar() {
  const { user, logout, loading } = useAuth();

  return (
    <nav className="border-b p-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight text-primary">
          GeoLeads
        </Link>
        <div className="space-x-4 flex items-center">
          {user && (
            <>
              <Link href="/search" className="text-sm font-medium hover:underline">
                Search Leads
              </Link>
              <Link href="/dashboard" className="text-sm font-medium hover:underline">
                Dashboard
              </Link>
              <Button variant="ghost" size="sm" onClick={logout}>
                Logout
              </Button>
            </>
          )}
          {!user && !loading && (
            <>
              <Link href="/login" className="text-sm font-medium hover:underline">
                Login
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
