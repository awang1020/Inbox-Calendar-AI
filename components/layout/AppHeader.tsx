"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { MoonStar, SunMedium } from "lucide-react";

interface AppHeaderProps {
  onCreate: () => void;
}

export function AppHeader({ onCreate }: AppHeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  return (
    <header className="border-b border-white/10 bg-white/40 backdrop-blur supports-[backdrop-filter]:bg-white/40 dark:bg-slate-900/60">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">FlowTask</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Organize, prioritize, and visualize your work in one place.
          </p>
        </div>

        <div className="flex items-center gap-3">
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
