import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FlowTask | Modern Task Manager",
  description:
    "A modern, responsive task management dashboard for organizing work, personal, and study goals.",
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-[hsl(var(--background))]`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
