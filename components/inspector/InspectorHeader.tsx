"use client";

import { signOut } from "next-auth/react";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InspectorHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function InspectorHeader({ user }: InspectorHeaderProps) {
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/inspector-login" });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        {/* Placeholder / Status description */}
        <span className="hidden md:inline-block text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium tracking-wide uppercase">
          Workshop Access
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* User Info & Avatar */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right hidden sm:block">
            <span className="text-sm font-semibold text-foreground leading-tight">
              {user.name || "Inspector"}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              Veltrik Inspector
            </span>
          </div>

          <div className="size-9 rounded-full bg-secondary text-secondary-foreground border border-border flex items-center justify-center font-bold text-xs select-none">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name || "Avatar"}
                className="size-full rounded-full object-cover"
              />
            ) : user.name ? (
              getInitials(user.name)
            ) : (
              <User className="size-4" />
            )}
          </div>
        </div>

        <div className="h-8 w-px bg-border" />

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive flex items-center gap-2 cursor-pointer"
        >
          <LogOut className="size-4" />
          <span className="hidden md:inline">Sign Out</span>
        </Button>
      </div>
    </header>
  );
}
