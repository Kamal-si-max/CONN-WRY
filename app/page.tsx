import Link from "next/link"
import Image from "next/image"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import {
  Megaphone,
  UserPlus,
  ListChecks,
  Wallet,
  ShieldCheck,
  Zap,
  Star,
} from "lucide-react"

const steps = [
  {
    icon: UserPlus,
    title: "Create a free account",
    body: "Sign up in seconds with just your email. No fees, no catch.",
  },
  {
    icon: ListChecks,
    title: "Complete simple tasks",
    body: "Share posts, try products, take surveys, and refer friends.",
  },
  {
    icon: Wallet,
    title: "Cash out your earnings",
    body: "Withdraw to PayPal, bank, or crypto once you reach $10.",
  },
]

const categories = [
  { label: "Social shares", reward: "$3.50" },
  { label: "App reviews", reward: "$5.00" },
  { label: "Quick surveys", reward: "$2.25" },
  { label: "Friend referrals", reward: "$7.00" },
  { label: "Partner offers", reward: "$9.00" },
  { label: "Testimonials", reward: "$6.50" },
]

const trust = [
  {
    icon: ShieldCheck,
    title: "Secure payouts",
    body: "Bank-grade encryption and verified withdrawals.",
  },
  {
    icon: Zap,
    title: "Instant balance",
    body: "Earnings hit your balance the moment a task is done.",
  },
  {
    icon: Star,
    title: "Real tasks",
    body: "Legitimate marketing tasks from real brands.",
  },
]

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect("/dashboard")

  return (
    <div className="flex min-h-svh flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold tracking-tight"
          >
            <span className="flex size-7 items-center justify-center rounded-md bg-accent text-accent-foreground">
              C
            </span>
            Conn-Wry
          </Link>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" render={<Link href="/sign-in">Sign in</Link>} />
            <Button render={<Link href="/sign-up">Get started</Link>} />
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 lg:grid-cols-2 lg:py-24">
          <div className="flex flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
              <Megaphone className="size-3.5 text-accent" />
              Get paid for everyday marketing tasks
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Turn a few spare minutes into real earnings.
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed text-pretty">
              Conn-Wry pays you to share, review, and refer for brands you already
              love. Complete quick tasks, watch your balance grow, and cash out
              from just $10.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                render={<Link href="/sign-up">Start earning free</Link>}
              />
              <Button
                size="lg"
                variant="outline"
                render={<Link href="/sign-in">I already have an account</Link>}
              />
            </div>
            <div className="flex items-center gap-6 pt-2 text-sm text-muted-foreground">
              <div>
                <span className="block text-xl font-semibold text-foreground">
                  120k+
                </span>
                members earning
              </div>
              <div>
                <span className="block text-xl font-semibold text-foreground">
                  $2.4M
                </span>
                paid out
              </div>
              <div>
                <span className="block text-xl font-semibold text-foreground">
                  4.8/5
                </span>
                member rating
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
              <Image
                src="/images/dashboard-preview.png"
                alt="Preview of the Conn-Wry dashboard showing balance and available tasks"
                width={720}
                height={540}
                className="h-auto w-full"
                priority
              />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-y bg-secondary/40">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <div className="mb-10 flex flex-col items-center gap-2 text-center">
              <h2 className="text-2xl font-semibold tracking-tight">
                Earning takes three steps
              </h2>
              <p className="max-w-md text-muted-foreground text-balance">
                No experience needed. If you can use a phone, you can earn with
                Conn-Wry.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {steps.map((step, i) => (
                <div
                  key={step.title}
                  className="flex flex-col gap-3 rounded-xl border bg-card p-6"
                >
                  <div className="flex size-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <step.icon className="size-5" />
                  </div>
                  <h3 className="font-medium">
                    {i + 1}. {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Task categories */}
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="mb-10 flex flex-col items-center gap-2 text-center">
            <h2 className="text-2xl font-semibold tracking-tight">
              Tasks for every kind of earner
            </h2>
            <p className="max-w-md text-muted-foreground text-balance">
              Pick what suits you. New tasks are added every week.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <div
                key={cat.label}
                className="flex items-center justify-between rounded-xl border bg-card p-5"
              >
                <span className="font-medium">{cat.label}</span>
                <span className="rounded-full bg-accent/10 px-3 py-1 text-sm font-semibold text-accent">
                  up to {cat.reward}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Trust */}
        <section className="border-t bg-secondary/40">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-16 md:grid-cols-3">
            {trust.map((item) => (
              <div key={item.title} className="flex flex-col gap-2">
                <item.icon className="size-6 text-accent" />
                <h3 className="font-medium">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-4 py-20">
          <div className="flex flex-col items-center gap-6 rounded-2xl border bg-primary px-6 py-14 text-center text-primary-foreground">
            <h2 className="text-3xl font-semibold tracking-tight text-balance">
              Your spare time is worth something.
            </h2>
            <p className="max-w-md text-primary-foreground/80 text-balance">
              Join over 120,000 members already earning with Conn-Wry. It&apos;s
              free to start.
            </p>
            <Button
              size="lg"
              variant="secondary"
              render={<Link href="/sign-up">Create your free account</Link>}
            />
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex size-5 items-center justify-center rounded bg-accent text-xs text-accent-foreground">
              C
            </span>
            <span>Conn-Wry</span>
          </div>
          <p>© {new Date().getFullYear()} Conn-Wry. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
