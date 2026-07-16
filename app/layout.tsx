import type { Metadata } from 'next'
import { Head } from 'nextra/components'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Platypi } from 'next/font/google'
import 'nextra-theme-docs/style.css'
import './globals.css'
import { Providers } from './theme-provider'

// Headline face — matched to the portal exactly: Platypi 400–700 plus italic
// (the portal's display renders at 400, with an italic-mint accent). Loading
// 300 here is what made the docs headlines read thinner/lighter than the app.
const platypi = Platypi({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-platypi',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Zipcode — a network for real-world credit',
    template: '%s · Zipcode',
  },
  description:
    'Asset-Backed Credit for HELOC Originators, and their secondary markets.',
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
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
