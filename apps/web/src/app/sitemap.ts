import type { MetadataRoute } from 'next'
import { routing } from '@/i18n/routing'

const SITE_URL = 'https://useffect.sh'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  // One entry per locale, each carrying `alternates.languages` so Google
  // knows /en and /fr are the two variants of the same page (plus x-default
  // pointing at the default locale URL).
  return routing.locales.map((locale) => ({
    url: `${SITE_URL}/${locale}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: 1,
    alternates: {
      languages: {
        en: `${SITE_URL}/en`,
        fr: `${SITE_URL}/fr`,
        'x-default': `${SITE_URL}/${routing.defaultLocale}`,
      },
    },
  }))
}
