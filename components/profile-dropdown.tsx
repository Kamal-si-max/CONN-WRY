"use client";

import { useState, useRef, useEffect, forwardRef } from "react";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import {
  Home,
  User,
  Settings,
  Calendar,
  Briefcase,
  Info,
  LogOut,
  ChevronDown,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileDropdownProps {
  /** Optional: forwarded ref if the parent needs to detect outside-clicks */
  className?: string;
}

// ─── Menu definition ──────────────────────────────────────────────────────────

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/profile",   label: "Profile",   icon: User },
  { href: "/settings",  label: "Settings",  icon: Settings },
  { href: "/events",    label: "Events",    icon: Calendar },
  { href: "/careers",   label: "Careers",   icon: Briefcase },
  { href: "/about",     label: "About Us",  icon: Info },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProfileDropdown({ className }: ProfileDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggle = () => setOpen((p) => !p);
  const close  = () => setOpen(false);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    // tiny delay so the opening click doesn't immediately close
    const id = setTimeout(() => document.addEventListener("mousedown", handler), 50);
    return () => {
      clearTimeout(id);
      document.removeEventListener("mousedown", handler);
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="true"
        aria-expanded={open}
        className={[
          "flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium",
          "transition-all duration-150 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
          open
            ? "border-slate-900/20 bg-slate-900 text-white shadow-sm"
            : "border-slate-200 bg-white/90 text-slate-700 hover:bg-slate-100 hover:border-slate-300",
        ].join(" ")}
      >
        Profile
        <ChevronDown
          className={`size-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          role="menu"
          aria-label="Profile menu"
          className="absolute right-0 top-full z-50 mt-2 w-52 origin-top-right"
          style={{ animation: "dropdownIn 0.15s cubic-bezier(0.16,1,0.3,1) forwards" }}
        >
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="p-1.5">
              {menuItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  role="menuitem"
                  onClick={close}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  <Icon className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
                  {label}
                </Link>
              ))}

              <div className="my-1.5 h-px bg-slate-100" role="separator" />

              <LogoutButton variant="icon-link" />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes dropdownIn {
          from { opacity: 0; transform: scale(0.96) translateY(-4px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
      `}</style>
    </div>
  );
}
