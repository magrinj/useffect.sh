import { setRequestLocale } from 'next-intl/server'
import { Closer } from '@/features/closer/components/closer'
import { Community } from '@/features/community/components/community'
import { Effect } from '@/features/effect/components/effect'
import { Footer } from '@/features/footer/components/footer'
import { Hero } from '@/features/hero/components/hero'
import { Missions } from '@/features/missions/components/missions'
import { Nav } from '@/features/nav/components/nav'
import { Process } from '@/features/process/components/process'
import { Services } from '@/features/services/components/services'
import { Team } from '@/features/team/components/team'

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  // Opt this page into static rendering at the locale.
  setRequestLocale(locale)

  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <Services />
        <Effect />
        <Missions />
        <Team />
        <Process />
        <Community />
        <Closer />
      </main>
      <Footer />
    </>
  )
}
