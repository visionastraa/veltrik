"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { ShieldAlert, LogOut, ArrowLeft } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function UnauthorizedContent() {
  const searchParams = useSearchParams();
  const fromPath = searchParams.get("from");
  
  // Decide where to redirect the user to log in based on where they came from
  const loginUrl = fromPath?.startsWith("/inspector") 
    ? "/inspector-login" 
    : "/login";

  const handleLogout = async () => {
    await signOut({ callbackUrl: loginUrl });
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-linear-to-b from-background to-secondary/20">
      <div className="relative w-full max-w-md bg-card/60 backdrop-blur-md border border-border/80 rounded-2xl p-8 shadow-xl text-center space-y-6 animate-in fade-in zoom-in duration-300">
        
        {/* Decorative background glow */}
        <div className="absolute -top-12 -left-12 w-24 h-24 bg-destructive/10 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-primary/10 rounded-full blur-xl pointer-events-none" />

        <div className="mx-auto w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center border border-destructive/20 shadow-xs">
          <ShieldAlert className="size-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Access Denied
          </h1>
          <p className="text-sm text-muted-foreground">
            You do not have the required permissions to view this resource. Please log in with an authorized account or contact your system administrator.
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Button
            onClick={handleLogout}
            variant="destructive"
            size="lg"
            className="w-full flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="size-4" />
            Log Out & Switch Account
          </Button>

          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "ghost", size: "lg" }),
              "w-full flex items-center justify-center gap-2 cursor-pointer"
            )}
          >
            <ArrowLeft className="size-4" />
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function UnauthorizedPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading...</div>
      </div>
    }>
      <UnauthorizedContent />
    </Suspense>
  );
}
