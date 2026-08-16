"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  /** Visual style — "link" renders as a nav-style text link, "icon" adds the LogOut icon */
  variant?: "link" | "icon-link";
  className?: string;
}

export function LogoutButton({ variant = "link", className }: LogoutButtonProps) {
  const router = useRouter();

  async function handleLogout() {
    try {
      await signOut();
      router.replace("/sign-in");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }

  if (variant === "icon-link") {
    return (
      <button
        type="button"
        onClick={handleLogout}
        className={
          className ??
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 w-full text-left"
        }
      >
        <LogOut className="size-4 shrink-0" aria-hidden="true" />
        Logout
      </button>
    );
  }

  // Default: plain nav-style button
  return (
    <button
      type="button"
      onClick={handleLogout}
      className={
        className ??
        "rounded-full px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
      }
    >
      Logout
    </button>
  );
}
