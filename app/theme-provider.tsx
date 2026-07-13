'use client'

import { ThemeProvider } from 'next-themes'

// Shared theme context for routes OUTSIDE the Nextra docs group (i.e. the
// marketing landing at `/`). It uses the SAME attribute + storageKey as the
// Nextra <Layout> theme provider, so a choice made in the docs chrome and one
// made on the landing stay in lockstep across the whole site.
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      storageKey="theme"
    >
      {children}
    </ThemeProvider>
  )
}
