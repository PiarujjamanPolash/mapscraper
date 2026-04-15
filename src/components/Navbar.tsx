"use client";

import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  LogOut,
  Zap,
} from "lucide-react";

export function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-background animate-pulse-glow" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold gradient-text">LeadMap</span>
              <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                <Zap className="h-3 w-3 text-amber-400" />
                Pro
              </span>
            </div>
          </div>

          {/* User info + Sign out */}
          {user && (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
                  {user.email?.[0]?.toUpperCase() || "U"}
                </div>
                <span className="text-sm text-muted-foreground">
                  {user.email}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
