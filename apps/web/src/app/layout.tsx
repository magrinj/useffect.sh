import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ConsoleEgg } from '@/components/console-egg.client'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const title = 'useffect.sh — React Native Expert on Demand'
const description =
  'A senior React Native collective. Series A/B startups only.'

export const metadata: Metadata = {
  metadataBase: new URL('https://useffect.sh'),
  title,
  description,
  openGraph: {
    title,
    description,
    url: 'https://useffect.sh',
    siteName: 'useffect.sh',
    images: ['/og.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/og.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-bg text-ink`}
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-ink focus:px-4 focus:py-2 focus:font-mono focus:text-[13px] focus:text-bg focus:outline-none focus:ring-2 focus:ring-accent"
        >
          Skip to content
        </a>
        {children}
        <Analytics />
        <SpeedInsights />
        <ConsoleEgg />
      </body>
    </html>
  )
}
