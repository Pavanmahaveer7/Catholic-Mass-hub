"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Church, HandHelping, MonitorPlay } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const COOKIE = "mass_welcome_seen";

const intents = [
  {
    href: "/find?locate=1",
    title: "Find Mass near me",
    description: "Parishes and worship times by location",
    icon: Church,
  },
  {
    href: "/readings",
    title: "Today's readings",
    description: "Official USCCB daily Scripture",
    icon: BookOpen,
  },
  {
    href: "/watch",
    title: "Watch Mass online",
    description: "When you cannot attend in person",
    icon: MonitorPlay,
  },
  {
    href: "/guides/confession",
    title: "Going to Confession",
    description: "Simple steps and examination of conscience",
    icon: HandHelping,
  },
] as const;

function hasSeenWelcome() {
  if (typeof document === "undefined") return true;
  return document.cookie.split("; ").some((c) => c.startsWith(`${COOKIE}=`));
}

function markSeen() {
  document.cookie = `${COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

export function WelcomeIntentDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!hasSeenWelcome()) {
      const t = window.setTimeout(() => setOpen(true), 400);
      return () => window.clearTimeout(t);
    }
  }, []);

  function choose(href: string) {
    markSeen();
    setOpen(false);
    router.push(href);
  }

  function dismiss() {
    markSeen();
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) dismiss();
        else setOpen(true);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl font-normal">
            Welcome — what do you need?
          </DialogTitle>
          <DialogDescription>
            Choose a path. You can always explore everything from the home page.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-2">
          {intents.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                type="button"
                onClick={() => choose(item.href)}
                className="flex items-start gap-3 rounded-lg border border-border/80 bg-card p-3 text-left transition hover:border-accent/50 hover:bg-accent/5"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <span>
                  <span className="block font-medium text-foreground">{item.title}</span>
                  <span className="text-sm text-muted-foreground">{item.description}</span>
                </span>
              </button>
            );
          })}
        </div>
        <Button variant="ghost" className="w-full" onClick={dismiss}>
          Browse on my own
        </Button>
      </DialogContent>
    </Dialog>
  );
}
