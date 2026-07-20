"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { CommandMenu } from "@/components/command-menu";
import { MobileNav } from "@/components/layout/mobile-nav";
import { WelcomeIntentDialog } from "@/components/welcome-intent-dialog";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to main content
      </a>
      <SidebarProvider className="flex min-h-svh flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar className="hidden md:flex" />
          <SidebarInset>
            <main
              id="main-content"
              className="flex-1 pb-20 md:pb-4"
              tabIndex={-1}
            >
              {children}
            </main>
          </SidebarInset>
        </div>
        <MobileNav />
        <CommandMenu />
        <WelcomeIntentDialog />
      </SidebarProvider>
    </div>
  );
}
