"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin, Mail, Lock, Loader2, UserPlus } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp, user } = useAuth();
  const router = useRouter();

  if (user) {
    router.push("/dashboard");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      if (err?.code === "auth/email-already-in-use") {
        setError("An account with this email already exists");
      } else if (err?.code === "auth/weak-password") {
        setError("Password is too weak. Use at least 6 characters.");
      } else {
        setError("Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      {/* Background effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-violet-950/50 via-background to-cyan-950/50 -z-10" />
      <div className="fixed top-1/3 left-1/3 h-64 w-64 rounded-full bg-violet-600/10 blur-[120px] -z-10" />

      <Card className="w-full max-w-md glass-card border-white/5 animate-in">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">LeadMap Pro</span>
          </div>
          <CardTitle className="text-xl">Create an account</CardTitle>
          <CardDescription>Get started with lead scraping today</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-email" className="text-muted-foreground">
                <Mail className="h-3.5 w-3.5 inline mr-1.5" />
                Email
              </Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-password" className="text-muted-foreground">
                <Lock className="h-3.5 w-3.5 inline mr-1.5" />
                Password
              </Label>
              <Input
                id="signup-password"
                type="password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-confirm" className="text-muted-foreground">
                <Lock className="h-3.5 w-3.5 inline mr-1.5" />
                Confirm Password
              </Label>
              <Input
                id="signup-confirm"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                {error}
              </div>
            )}

            <Button
              id="signup-button"
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4 mr-2" />
              )}
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/"
                className="text-violet-400 hover:text-violet-300 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
