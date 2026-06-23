"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, getSession, signOut } from "next-auth/react";
import { ShieldCheck, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InspectorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill email if rememberMe was previously set
  useEffect(() => {
    const savedEmail = localStorage.getItem("veltrik_inspector_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. NextAuth sign in
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Invalid credentials");
        setLoading(false);
        return;
      }

      // 2. Fetch the session to verify role
      const session = await getSession();
      const role = session?.user?.role;

      if (role !== "INSPECTOR") {
        // If not inspector, log out and show error
        await signOut({ redirect: false });
        setError("Account not authorized");
        setLoading(false);
        return;
      }

      // 3. Save email to localStorage if Remember me is checked
      if (rememberMe) {
        localStorage.setItem("veltrik_inspector_email", email);
      } else {
        localStorage.removeItem("veltrik_inspector_email");
      }

      // 4. Redirect to inspector dashboard
      router.push("/inspector");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-linear-to-b from-background to-secondary/20">
      <div className="w-full max-w-md bg-card border border-border/80 rounded-2xl p-8 shadow-xl space-y-6 relative overflow-hidden">
        
        {/* Soft background glow */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center border border-primary/20 shadow-xs">
            <ShieldCheck className="size-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Inspector Portal
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to access your inspection dashboard
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm leading-relaxed">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" suppressHydrationWarning>
          <div className="space-y-1.5" suppressHydrationWarning>
            <label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="inspector@veltrik.com"
              disabled={loading}
              suppressHydrationWarning
              className="w-full px-3.5 py-2 rounded-lg border border-border bg-background text-sm outline-none transition-all focus:border-ring focus:ring-2 focus:ring-ring/25 disabled:opacity-50"
            />
          </div>

          <div className="space-y-1.5" suppressHydrationWarning>
            <label htmlFor="current-password" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                id="current-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                suppressHydrationWarning
                className="w-full pl-3.5 pr-10 py-2 rounded-lg border border-border bg-background text-sm outline-none transition-all focus:border-ring focus:ring-2 focus:ring-ring/25 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
                className="rounded border-border text-primary focus:ring-ring/50 size-4 transition-colors cursor-pointer"
              />
              <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                Remember me
              </span>
            </label>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="border-t border-border pt-4 text-center">
          <p className="text-xs text-muted-foreground">
            Not an inspector?{" "}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium focus-visible:ring-2 focus-visible:ring-ring outline-none rounded-xs"
            >
              Go to main login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
