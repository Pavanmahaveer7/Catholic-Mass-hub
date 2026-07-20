"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Church,
  Compass,
  MonitorPlay,
  Search,
  Store,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { mainNav } from "@/lib/navigation";

const iconMap = {
  "/find": Church,
  "/readings": BookOpen,
  "/watch": MonitorPlay,
  "/pilgrimages": Compass,
  "/teachings": BookOpen,
  "/places": Store,
};

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-command-menu", handler);
    return () => window.removeEventListener("open-command-menu", handler);
  }, []);

  const navigate = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Search" description="Jump to any section">
      <CommandInput placeholder="Find Mass, readings, pilgrimages..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigate">
          {mainNav.map((item) => {
            const Icon = iconMap[item.href as keyof typeof iconMap] ?? Search;
            return (
              <CommandItem
                key={item.href}
                onSelect={() => navigate(item.href)}
              >
                <Icon className="mr-2 h-4 w-4" />
                <span>{item.title}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Quick actions">
          <CommandItem onSelect={() => navigate("/find?locate=1")}>
            <Church className="mr-2 h-4 w-4" />
            Find Mass near me
          </CommandItem>
          <CommandItem onSelect={() => navigate("/readings")}>
            <BookOpen className="mr-2 h-4 w-4" />
            Today&apos;s Gospel
          </CommandItem>
          <CommandItem onSelect={() => navigate("/places/submit")}>
            <Store className="mr-2 h-4 w-4" />
            List my business
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export function openCommandMenu() {
  window.dispatchEvent(new Event("open-command-menu"));
}
