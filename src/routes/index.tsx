import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Mail,
  FileText,
  CalendarClock,
  Compass,
  MessageSquare,
  Plus,
  ArrowRight,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { useCounts, useGenerations } from "@/lib/generations-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Workly AI" },
      { name: "description", content: "Your AI-powered workplace productivity dashboard." },
    ],
  }),
  component: Dashboard,
});

const KPIS = [
  { label: "Emails Generated", key: "email" as const, icon: Mail, color: "text-primary" },
  { label: "Notes Summarized", key: "summary" as const, icon: FileText, color: "text-accent" },
  { label: "Tasks Planned", key: "plan" as const, icon: CalendarClock, color: "text-chart-3" },
  { label: "Research Queries", key: "research" as const, icon: Compass, color: "text-chart-4" },
];

const QUICK_ACTIONS = [
  { label: "New Email", to: "/email", icon: Mail },
  { label: "Summarize Notes", to: "/summarize", icon: FileText },
  { label: "Plan Tasks", to: "/planner", icon: CalendarClock },
  { label: "Research Topic", to: "/research", icon: Compass },
  { label: "Ask AI", to: "/chat", icon: MessageSquare },
] as const;

function Dashboard() {
  const counts = useCounts();
  const { items } = useGenerations();
  const recent = items.slice(0, 5);

  return (
    <>
      <PageHeader title="Dashboard" description="Your AI productivity overview" />
      <main className="flex-1 space-y-8 p-4 sm:p-6 lg:p-8">
        {/* Hero */}
        <section className="rounded-2xl bg-gradient-to-br from-primary to-accent p-6 text-primary-foreground shadow-card sm:p-8">
          <p className="text-xs font-medium uppercase tracking-wider opacity-80">
            Welcome back
          </p>
          <h2 className="mt-1 text-2xl font-bold sm:text-3xl">Let&apos;s get more done today.</h2>
          <p className="mt-2 max-w-xl text-sm opacity-90">
            Pick a tool, paste your context, and let AI draft, summarize, plan, or research in
            seconds.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              to="/email"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur transition hover:bg-white/25"
            >
              <Plus className="h-4 w-4" /> New email
            </Link>
            <Link
              to="/chat"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-medium text-primary transition hover:bg-white/90"
            >
              Open chat <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* KPI cards */}
        <section>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Activity</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {KPIS.map((k) => (
              <Card key={k.key} className="shadow-soft">
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{k.label}</p>
                    <p className="mt-1 text-3xl font-bold tracking-tight">{counts[k.key]}</p>
                  </div>
                  <div className={`rounded-lg bg-muted p-2.5 ${k.color}`}>
                    <k.icon className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Quick actions */}
        <section>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Quick actions</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {QUICK_ACTIONS.map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className="group flex items-center gap-3 rounded-xl border bg-card p-4 shadow-soft transition hover:border-primary/40 hover:shadow-card"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <a.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{a.label}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </section>

        {/* Recent */}
        <section>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Recent activity</h3>
          {recent.length === 0 ? (
            <Card className="shadow-soft">
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                No generations yet. Pick a tool above to get started.
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-hidden rounded-xl border bg-card shadow-soft">
              <ul className="divide-y">
                {recent.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-4 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{r.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {r.type} • {new Date(r.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
