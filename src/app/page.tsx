"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin, Zap, Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, user } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  if (user) {
    router.push("/dashboard");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      if (err?.code === "auth/user-not-found") {
        setError("No account found with this email");
      } else if (err?.code === "auth/wrong-password") {
        setError("Incorrect password");
      } else if (err?.code === "auth/invalid-credential") {
        setError("Invalid email or password");
      } else {
        setError("Failed to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-background to-cyan-950" />
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-violet-600/20 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-cyan-500/20 blur-[80px]" />

        <div className="relative z-10 max-w-md px-8">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">LeadMap Pro</h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Zap className="h-3 w-3 text-amber-400" /> Maps-Based Lead Intelligence
              </p>
            </div>
          </div>

          <h2 className="text-3xl font-bold mb-4 leading-tight">
            Discover high-quality leads <br />
            <span className="gradient-text">from map data</span>
          </h2>
          <p className="text-muted-foreground mb-8">
            Scrape, filter, score, and export business leads with precision
            geo-filtering. Target any industry in any city with configurable
            radius search.
          </p>

          {/* Feature list */}
          <div className="space-y-3">
            {[
              "Grid-based search covers entire radius",
              "Strict geo-filtering — no location leakage",
              "Lead scoring with website, rating & reviews",
              "One-click XLSX/CSV export",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <div className="h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <svg className="h-3 w-3 text-emerald-400" viewBox="0 0 12 12" fill="none">
                    <path d="M3 6l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side — Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-md glass-card border-white/5">
          <CardHeader className="text-center">
            {/* Mobile logo */}
            <div className="flex items-center justify-center gap-2 mb-4 lg:hidden">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">LeadMap Pro</span>
            </div>
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 inline mr-1.5" />
                  Email
                </Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-muted-foreground">
                  <Lock className="h-3.5 w-3.5 inline mr-1.5" />
                  Password
                </Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                  {error}
                </div>
              )}

              <Button
                id="login-button"
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4 mr-2" />
                )}
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="text-violet-400 hover:text-violet-300 font-medium"
                >
                  Create one
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
