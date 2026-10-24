import Image from "next/image";
import Link from "next/link";
import ProfileDropdown from "@/components/profile-dropdown";
import { LogoutButton } from "@/components/logout-button";

/**
 * Shared authenticated header for all app pages.
 * Profile renders the interactive ProfileDropdown with Dashboard overview & Settings.
 * Logout uses the Better Auth signOut() client function via LogoutButton.
 */
export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="CONN-WRY" width={38} height={38} priority />
          <span className="hidden text-xl font-bold tracking-tight sm:block">CONN-WRY</span>
        </Link>

        {/* Right: Nav links */}
        <nav className="flex items-center gap-1.5 sm:gap-2.5" aria-label="Main navigation">
          {/* Profile Dropdown */}
          <ProfileDropdown />

          <Link
            href="/events"
            className="rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            Events
          </Link>
          <Link
            href="/careers"
            className="rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            Careers
          </Link>
          <Link
            href="/about"
            className="hidden rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:inline-flex"
          >
            About Us
          </Link>

          {/* Logout button */}
          <LogoutButton />
        </nav>
      </div>
    </header>
  );
}
