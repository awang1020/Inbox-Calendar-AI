"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

import { ThemeProvider } from "@/components/theme/ThemeProvider";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
