import { Link, useRouterState } from "@tanstack/react-router";
import { Gamepad2, LayoutDashboard, ListTodo, Timer } from "lucide-react";

const NAV_ITEMS = [
  { to: "/", icon: LayoutDashboard, label: "Home" },
  { to: "/focus", icon: Timer, label: "Focus" },
  { to: "/tasks", icon: ListTodo, label: "Tasks" },
  { to: "/games", icon: Gamepad2, label: "Games" },
] as const;

export function Layout({ children }: { children: React.ReactNode }) {
  const state = useRouterState();
  const pathname = state.location.pathname;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-subtle">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                className="text-primary-foreground"
                aria-label="Focus Guard logo"
                role="img"
              >
                <circle
                  cx="7"
                  cy="7"
                  r="5.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <circle cx="7" cy="7" r="2" fill="currentColor" />
              </svg>
            </div>
            <span className="font-display font-semibold text-foreground text-base tracking-tight">
              Focus Guard
            </span>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            Stay centered, stay focused.
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto pb-20">{children}</main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border shadow-elevated">
        <div className="flex items-stretch h-16 max-w-lg mx-auto">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
            const isActive =
              to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-smooth"
                data-ocid={`nav.${label.toLowerCase()}_link`}
              >
                <Icon
                  size={20}
                  className={
                    isActive ? "text-primary" : "text-muted-foreground"
                  }
                />
                <span
                  className={`text-[10px] font-body font-medium ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
