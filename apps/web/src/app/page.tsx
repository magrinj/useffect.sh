import { Closer } from '@/features/closer/components/closer'
import { Effect } from '@/features/effect/components/effect'
import { Footer } from '@/features/footer/components/footer'
import { Hero } from '@/features/hero/components/hero'
import { Missions } from '@/features/missions/components/missions'
import { Nav } from '@/features/nav/components/nav'
import { Process } from '@/features/process/components/process'
import { Services } from '@/features/services/components/services'
import { Team } from '@/features/team/components/team'

export default function Home() {
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
        <Closer />
      </main>
      <Footer />
    </>
  )
}
