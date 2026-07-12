import type { Metadata } from 'next'
import { Head } from 'nextra/components'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Platypi } from 'next/font/google'
import 'nextra-theme-docs/style.css'
import './globals.css'

// Headline face — matches the portal (Platypi, light-weight serif display).
const platypi = Platypi({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  variable: '--font-platypi',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Zipcode — a venue-neutral credit rail',
    template: '%s · Zipcode',
  },
  description:
    'Zipcode is infrastructure that routes stablecoin capital into on-chain credit lines. A rail, not a fund.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} ${platypi.variable}`}
    >
      <Head />
      <body>{children}</body>
    </html>
  )
}
