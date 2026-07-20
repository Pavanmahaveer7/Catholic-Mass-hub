"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, LogOut, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Me = {
  id: string;
  name: string;
  email: string;
  role: string;
  locale: string;
} | null;

export function AccountMenu() {
  const router = useRouter();
  const [user, setUser] = useState<Me>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d) => setUser(d.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoaded(true));
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    toast.message("Signed out");
    router.refresh();
  }

  if (!loaded) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Account" disabled>
        <User className="h-4 w-4" />
      </Button>
    );
  }

  if (!user) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="h-9 gap-1.5"
        onClick={() => router.push("/login")}
      >
        <LogIn className="h-4 w-4" />
        <span className="hidden sm:inline">Sign in</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" className="h-9 max-w-[10rem] gap-1.5" />
        }
      >
        <User className="h-4 w-4 shrink-0" />
        <span className="hidden truncate sm:inline">{user.name}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuLabel>
          <div className="truncate font-medium text-foreground">{user.name}</div>
          <div className="truncate text-xs font-normal">{user.email}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/me")}>
          My parishes
        </DropdownMenuItem>
        {user.role === "admin" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/admin/streams")}>
              Admin · Streams
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/admin/pilgrimages")}>
              Admin · Pilgrimages
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/admin/places")}>
              Admin · Places
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/places/submit")}>
          List a business
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/about")}>
          About & sources
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void logout()}>
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
