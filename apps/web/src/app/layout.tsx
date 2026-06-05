import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Eggs } from '@/components/eggs.client'
import { members } from '@/features/team/data'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const SITE_URL = 'https://useffect.sh'
const title = 'useffect.sh — Senior React Native Engineers on Demand'
const description =
  'Senior React Native on demand. Six architects shipping at Mistral AI, Sephora, Luko, Chelsea FC, Red Bull. Native modules, Expo, iOS bridges, monorepos.'
const keywords = [
  'React Native',
  'React Native consulting',
  'React Native experts',
  'React Native freelance',
  'Expo',
  'EAS',
  'native modules',
  'iOS bridge',
  'Android',
  'New Architecture',
  'monorepo',
  'mobile engineering',
  'React Native collective',
  'senior React Native developer',
  'React Native CTO',
  'Mistral AI',
  'Sephora',
  'Luko',
  'Red Bull',
  'Chelsea FC',
]

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  keywords,
  authors: members.map((m) => ({ name: m.name, url: m.linkedin })),
  creator: 'useffect.sh',
  publisher: 'useffect.sh',
  alternates: { canonical: SITE_URL },
  openGraph: {
    title,
    description,
    url: SITE_URL,
    siteName: 'useffect.sh',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'useffect.sh — Senior React Native engineering on demand',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  category: 'technology',
}

// JSON-LD structured data — Organization (with team), WebSite, ProfessionalService.
// Inlined in <head> so crawlers see it on first paint. The member array gives
// each team member a Knowledge-Graph-ready Person entity.
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}#org`,
      name: 'useffect.sh',
      url: SITE_URL,
      logo: `${SITE_URL}/icon.svg`,
      image: `${SITE_URL}/opengraph-image`,
      description,
      foundingDate: '2024',
      knowsAbout: [
        'React Native',
        'Expo',
        'Native modules',
        'iOS development',
        'Android development',
        'Mobile architecture',
        'New Architecture (Fabric / TurboModules)',
      ],
      member: members.map((m) => ({
        '@type': 'Person',
        name: m.name,
        jobTitle: m.role,
        image: `${SITE_URL}${m.image}`,
        // `knowsAbout` mixes tech specialties with notable companies so Google
        // sees both kinds of entity association on a single Person record.
        knowsAbout: [...m.specialties, ...m.notableCompanies],
        worksFor: { '@id': `${SITE_URL}#org` },
        // `sameAs` to LinkedIn is the strongest single signal for the Knowledge
        // Graph — it directly links our Person entity to the canonical one.
        sameAs: [m.linkedin],
      })),
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}#website`,
      name: 'useffect.sh',
      url: SITE_URL,
      description,
      publisher: { '@id': `${SITE_URL}#org` },
      inLanguage: 'en-US',
    },
    {
      '@type': 'ProfessionalService',
      '@id': `${SITE_URL}#service`,
      name: 'useffect.sh',
      url: SITE_URL,
      description,
      areaServed: 'Worldwide',
      serviceType: 'React Native engineering consulting',
      provider: { '@id': `${SITE_URL}#org` },
      audience: {
        '@type': 'Audience',
        audienceType: 'Series A and Series B startups',
      },
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is static, generated from controlled data
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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
        <Eggs />
      </body>
    </html>
  )
}
