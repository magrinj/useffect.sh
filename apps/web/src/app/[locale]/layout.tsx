import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Eggs } from '@/components/eggs.client'
import { members } from '@/features/team/data'
import { routing } from '@/i18n/routing'
import '../globals.css'

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

const OG_LOCALE: Record<(typeof routing.locales)[number], string> = {
  en: 'en_US',
  fr: 'fr_FR',
}
const LANG_TAG: Record<(typeof routing.locales)[number], string> = {
  en: 'en-US',
  fr: 'fr-FR',
}

// Generate static params for both locales so /en and /fr are both prerendered
// at build time (one shape per supported language).
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const safeLocale = hasLocale(routing.locales, locale)
    ? locale
    : routing.defaultLocale

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    keywords,
    authors: members.map((m) => ({ name: m.name, url: m.linkedin })),
    creator: 'useffect.sh',
    publisher: 'useffect.sh',
    alternates: {
      canonical: `${SITE_URL}/${safeLocale}`,
      languages: {
        en: `${SITE_URL}/en`,
        fr: `${SITE_URL}/fr`,
        // x-default tells crawlers which version to show when no language
        // preference matches — we point at the EN root.
        'x-default': `${SITE_URL}/en`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${safeLocale}`,
      siteName: 'useffect.sh',
      locale: OG_LOCALE[safeLocale],
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
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }
  // Opt this segment into static rendering — required for messages to be
  // available at build time rather than per-request.
  setRequestLocale(locale)

  const t = await getTranslations('layout')

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
        // sameAs is the canonical Knowledge-Graph signal that the
        // collective owns these social profiles — Google reads these
        // and treats them as verified identity links.
        sameAs: [
          'https://github.com/useffect-sh',
          'https://x.com/useffect_sh',
          'https://www.linkedin.com/company/useffect-sh',
        ],
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
          knowsAbout: [...m.specialties, ...m.notableCompanies],
          worksFor: { '@id': `${SITE_URL}#org` },
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
        inLanguage: LANG_TAG[locale],
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

  return (
    <html lang={LANG_TAG[locale]}>
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
          {t('skipToContent')}
        </a>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
        <Eggs />
      </body>
    </html>
  )
}
