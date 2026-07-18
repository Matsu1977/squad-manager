import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, CalendarDays, Home, Shield, Users } from "lucide-react";

const items = [
  { title: "Home", url: "/", icon: Home },
  { title: "Giocatori", url: "/players", icon: Users },
  { title: "Partite", url: "/matches", icon: Shield },
  { title: "Allenamenti", url: "/trainings", icon: CalendarDays },
  { title: "Stats", url: "/stats", icon: BarChart3 },
];

export function MobileNav() {
  const currentPath = useRouterState({
    select: (router) => router.location.pathname,
  });

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <div className="flex h-16 items-center justify-around">
        {items.map((item) => {
          const active = currentPath === item.url;
          return (
            <Link
              key={item.title}
              to={item.url}
              className={`flex h-full flex-1 flex-col items-center justify-center gap-1 ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
