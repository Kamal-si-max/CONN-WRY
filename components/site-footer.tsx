import Link from "next/link";

const footerLinks = [
  { href: "/about",   label: "About Us" },
  { href: "/events",  label: "Events" },
  { href: "/careers", label: "Careers" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms",   label: "Terms & Conditions" },
  { href: "/contact", label: "Contact / Support" },
];

export default function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <span className="flex size-6 items-center justify-center rounded-md bg-accent text-xs font-bold text-accent-foreground">
              C
            </span>
            CONN-WRY
          </div>

          {/* Links */}
          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 sm:justify-end" aria-label="Footer navigation">
            {footerLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm text-slate-500 transition-colors hover:text-slate-800"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400 sm:text-right">
          © {new Date().getFullYear()} CONN-WRY. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
