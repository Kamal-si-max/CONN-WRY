"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { LogoutButton } from "@/components/logout-button";
import {
  LayoutDashboard,
  Settings,
  ChevronDown,
  ArrowRight,
} from "lucide-react";

interface ProfileDropdownProps {
  className?: string;
}

export default function ProfileDropdown({ className }: ProfileDropdownProps) {
  const [open, setOpen] = useState(false);
  const session = useSession();
  const containerRef = useRef<HTMLDivElement>(null);

  const toggle = () => setOpen((prev) => !prev);
  const close = () => setOpen(false);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    const id = setTimeout(() => document.addEventListener("mousedown", handler), 50);
    return () => {
      clearTimeout(id);
      document.removeEventListener("mousedown", handler);
    };
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const rawName = session?.data?.user?.name ?? "User";
  const firstName = rawName.split(" ")[0] || "User";
  const email = session?.data?.user?.email ?? "";

  return (
    <div
      ref={containerRef}
      className={`relative inline-block text-left ${className ?? ""}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={close}
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) close();
      }}
    >
      <div
        className={[
          "flex items-center rounded-full border shadow-sm transition-all duration-200",
          open
            ? "border-slate-900 bg-slate-900 text-white ring-2 ring-slate-900/10"
            : "border-slate-200 bg-white/90 text-slate-700 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900",
        ].join(" ")}
      >
        <Link
          href="/profile"
          aria-label="Open profile"
          className="flex items-center gap-2 rounded-l-full py-1.5 pl-3.5 pr-1 text-sm font-medium outline-none"
        >
          <span className="flex size-6 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
            {firstName.charAt(0).toUpperCase()}
          </span>
          <span>Profile</span>
        </Link>
        <button
          type="button"
          onClick={toggle}
          aria-label={open ? "Close profile menu" : "Open profile menu"}
          aria-haspopup="true"
          aria-expanded={open}
          aria-controls="profile-menu"
          className="flex h-9 items-center rounded-r-full px-2 outline-none"
        >
          <ChevronDown
            className={`size-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* ── Dropdown Panel with Dashboard & Setting ── */}
      {open && (
        <div
          role="menu"
          aria-label="Profile menu"
          id="profile-menu"
          className="absolute right-0 top-full z-50 w-64 origin-top-right pt-2 animate-dropdownIn"
        >
          <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-xl shadow-slate-900/10 backdrop-blur-xl">
            {/* User Profile Header */}
            <div className="px-3 py-2.5 border-b border-slate-100">
              <p className="text-xs font-semibold text-slate-900 truncate">{rawName}</p>
              {email && <p className="text-[11px] text-slate-500 truncate">{email}</p>}
            </div>

            {/* Menu Options: Dashboard & Setting */}
            <div className="py-1 space-y-0.5">
              {/* Dashboard Link (Opens separate dashboard page) */}
              <Link
                href="/dashboard/overview"
                onClick={close}
                role="menuitem"
                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-100/80 hover:text-slate-900 group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    <LayoutDashboard className="size-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-slate-900 block">Dashboard</span>
                    <span className="text-[10px] text-slate-500 block">Overview, stats &amp; tasks</span>
                  </div>
                </div>
                <ArrowRight className="size-3 text-slate-400 group-hover:text-slate-700 transition-colors" />
              </Link>

              {/* Setting Link (Opens edit profile page) */}
              <Link
                href="/profile/edit"
                onClick={close}
                role="menuitem"
                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-100/80 hover:text-slate-900 group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    <Settings className="size-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-slate-900 block">Setting</span>
                    <span className="text-[10px] text-slate-500 block">Edit profile details</span>
                  </div>
                </div>
                <ArrowRight className="size-3 text-slate-400 group-hover:text-slate-700 transition-colors" />
              </Link>
            </div>

            <div className="my-1 h-px bg-slate-100" />

            {/* Logout Option */}
            <div onClick={close}>
              <LogoutButton variant="icon-link" />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes dropdownIn {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(-4px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-dropdownIn {
          animation: dropdownIn 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
