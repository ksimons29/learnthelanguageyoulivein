"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Plus, BookOpen, Notebook, BarChart3, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
}

const navItems: NavItem[] = [
  { href: "/", icon: Home, label: "Today" },
  { href: "/capture", icon: Plus, label: "Capture" },
  { href: "/review", icon: BookOpen, label: "Review" },
  { href: "/notebook", icon: Notebook, label: "Notebook" },
  { href: "/progress", icon: BarChart3, label: "Progress" },
];

export function BottomNav() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't show bottom nav on certain full-screen experiences
  const hideOnPaths = ["/review/session", "/onboarding", "/auth"];
  if (hideOnPaths.some((path) => pathname.startsWith(path))) {
    return null;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <nav
      id="tour-bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-50 border-t backdrop-blur-xl"
      style={{
        backgroundColor: "var(--surface-page)",
        borderColor: "var(--border)",
        boxShadow: "0 -1px 0 var(--border)",
      }}
    >
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary/70"
              )}
            >
              <Icon
                className={cn("h-5 w-5", isActive && "stroke-[2.5]")}
                aria-hidden="true"
              />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="flex flex-col items-center justify-center gap-1 py-2 px-3 transition-colors text-muted-foreground hover:text-primary/70"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {mounted ? (
            isDark ? (
              <Sun className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Moon className="h-5 w-5" aria-hidden="true" />
            )
          ) : (
            <Moon className="h-5 w-5" aria-hidden="true" />
          )}
          <span className="text-xs font-medium">Theme</span>
        </button>
      </div>
      {/* Safe area padding for iOS */}
      <div
        className="h-safe-area-inset-bottom"
        style={{ backgroundColor: "var(--surface-page)" }}
      />
    </nav>
  );
}
