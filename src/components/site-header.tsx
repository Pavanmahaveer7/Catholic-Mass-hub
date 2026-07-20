"use client";

import Link from "next/link";
import { PanelLeftIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleToggle } from "@/components/locale-toggle";
import { VoiceSearchButton } from "@/components/voice/VoiceSearchButton";
import { AccountMenu } from "@/components/account-menu";
import { openCommandMenu } from "@/components/command-menu";

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="sticky top-0 z-50 flex w-full items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4">
        <Button
          className="h-9 w-9 md:hidden"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <PanelLeftIcon />
        </Button>
        <Link
          href="/"
          className="hidden font-heading text-lg font-semibold tracking-tight text-primary md:block"
        >
          Catholic Mass Hub
        </Link>
        <Separator orientation="vertical" className="mx-1 hidden h-4 md:block" />
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Button
            variant="outline"
            className="hidden h-9 gap-2 px-3 sm:flex"
            onClick={openCommandMenu}
            aria-label="Open search"
          >
            <SearchIcon className="h-4 w-4" />
            <span className="text-muted-foreground">Search…</span>
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 lg:inline-flex">
              Ctrl K
            </kbd>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 sm:hidden"
            onClick={openCommandMenu}
            aria-label="Open search"
          >
            <SearchIcon className="h-4 w-4" />
          </Button>
          <VoiceSearchButton className="h-9 w-9" />
          <LocaleToggle />
          <AccountMenu />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
