"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { MoonStar, SunMedium } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  onCreate: () => void;
}

const navigation = [
  { label: "Board", href: "/" },
  { label: "Today", href: "/today" },
  { label: "Calendar", href: "/calendar" }
];

export function AppHeader({ onCreate }: AppHeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeHref = useMemo(() => pathname ?? "/", [pathname]);

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  function isActive(href: string) {
    if (!activeHref) return false;
    if (href === "/") {
      return activeHref === "/";
    }
    return activeHref.startsWith(href);
  }

  return (
    <header className="border-b border-white/10 bg-white/40 backdrop-blur supports-[backdrop-filter]:bg-white/40 dark:bg-slate-900/60">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">FlowTask</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Organize, prioritize, and visualize your work in one place.
            </p>
          </div>

          <nav className="flex items-center gap-2 overflow-x-auto rounded-full bg-white/60 p-1 text-sm shadow-inner ring-1 ring-black/5 backdrop-blur-sm dark:bg-slate-900/50 dark:ring-white/5">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "whitespace-nowrap rounded-full px-4 py-2 font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))]",
                    active
                      ? "bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            aria-label="Toggle theme"
          >
            {mounted ? (
              theme === "dark" ? <SunMedium className="h-5 w-5" /> : <MoonStar className="h-5 w-5" />
            ) : (
              <SunMedium className="h-5 w-5" />
            )}
          </button>

          <button
            onClick={onCreate}
            className="hidden items-center gap-2 rounded-full bg-[hsl(var(--accent))] px-5 py-2 text-sm font-medium text-white shadow-card transition hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--accent))] md:inline-flex"
          >
            New Task
          </button>
        </div>
      </div>
    </header>
  );
}
