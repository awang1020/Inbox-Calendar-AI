"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { MoonStar, SunMedium } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AppHeaderProps {
  onCreate: () => void;
}

const navigation = [
  { label: "Board", href: "/", value: "board" },
  { label: "Today", href: "/today", value: "today" },
  { label: "Calendar", href: "/calendar", value: "calendar" }
];

const STORAGE_KEY = "flowtask-active-tab";

export function AppHeader({ onCreate }: AppHeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeValue = useMemo(() => {
    const currentPath = pathname ?? "/";
    const match = navigation.find((item) =>
      item.href === "/" ? currentPath === "/" : currentPath.startsWith(item.href)
    );
    return match?.value ?? "board";
  }, [pathname]);

  useEffect(() => {
    if (!mounted || hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    if (typeof window === "undefined") return;

    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    if (!storedValue) return;

    const storedTab = navigation.find((item) => item.value === storedValue);
    if (storedTab && storedTab.href !== pathname) {
      router.replace(storedTab.href);
    }
  }, [mounted, pathname, router]);

  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;
    if (!activeValue) return;
    window.localStorage.setItem(STORAGE_KEY, activeValue);
  }, [activeValue, mounted]);

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  function handleTabChange(value: string) {
    const target = navigation.find((item) => item.value === value);
    if (!target) return;

    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, value);
    }

    if (pathname !== target.href) {
      router.push(target.href);
    }
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

          <Tabs value={activeValue} onValueChange={handleTabChange} className="w-full md:w-auto">
            <TabsList className="flex w-full flex-wrap gap-2 overflow-visible md:flex-nowrap">
              {navigation.map((item) => (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  className="flex-1 min-w-[140px] whitespace-nowrap px-6 py-2 text-base md:min-w-[160px] md:px-8"
                >
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
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
