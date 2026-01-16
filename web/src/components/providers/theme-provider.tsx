"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * ThemeProvider
 *
 * Wraps the app with next-themes provider for dark mode support.
 * Persists theme preference to localStorage and respects system preference.
 *
 * Theme options:
 * - "light" - Cream notebook aesthetic
 * - "dark" - Leather Moleskine at night
 * - "system" - Follow OS preference
 */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
