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
  metadataBase: new URL('https://www.zipcode.finance'),
  title: {
    default: 'Zipcode Finance — Permissionless GPU loans, 10% fixed.',
    template: '%s · Zipcode',
  },
  description:
    'Borrowers fund half of the hardware, lenders fund the other half at a 10% fixed APR over 36 months. GPUs held in custody until repaid.',
  openGraph: {
    siteName: 'Zipcode',
    type: 'website',
    title: 'Zipcode Finance — Permissionless GPU loans, 10% fixed.',
    description:
      'Borrowers fund half of the hardware, lenders fund the other half at a 10% fixed APR over 36 months. GPUs held in custody until repaid.',
  },
  twitter: {
    card: 'summary',
    title: 'Zipcode Finance — Permissionless GPU loans, 10% fixed.',
    description:
      'Borrowers fund half of the hardware, lenders fund the other half at a 10% fixed APR over 36 months. GPUs held in custody until repaid.',
  },
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
