import { type ReactNode } from "react";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

interface DashboardShellProps {
  children: ReactNode;
}

/**
 * Server component shell for all authenticated pages.
 * Provides the sticky header, page background, and footer.
 * No client-side state needed here — ProfileDropdown manages its own open/close.
 */
export default function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex min-h-svh flex-col bg-secondary/40">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 lg:py-12">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
