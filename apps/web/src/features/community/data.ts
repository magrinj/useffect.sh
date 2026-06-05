export interface CommunityEntry {
  /** Identifier — also messages.community.entries.* key for the detail line. */
  id:
    | 'twenty'
    | 'expoQuickLook'
    | 'dataDetector'
    | 'humanCoders'
    | 'rnConnection'
  /** Person attribution (first-name from team data). Stays universal. */
  person: string
  /** Project / activity title. Stays universal (project names, scoped npm
   *  packages, scope handles). */
  title: string
  /** Optional measured stats (stars, downloads, attendees). Stays universal. */
  stats?: string
  /** Optional outbound URL. */
  href?: string
}

// All entries below are grounded in public, verifiable sources (GitHub API,
// npm, the projects' own pages, and team members' LinkedIn histories).
// The descriptive `detail` line lives in messages/{en,fr}.json under
// community.entries.<id>.

export const community: readonly CommunityEntry[] = [
  {
    id: 'twenty',
    person: 'Jérémy',
    title: 'Twenty · YC S23',
    stats: '49k★ · 7k forks · 1.3M+ Docker pulls',
    href: 'https://github.com/twentyhq/twenty',
  },
  {
    id: 'expoQuickLook',
    person: 'Jérémy',
    title: '@magrinj/expo-quick-look',
    stats: 'MIT · npm',
    href: 'https://github.com/magrinj/expo-quick-look',
  },
  {
    id: 'dataDetector',
    person: 'Pablo',
    title: 'react-native-data-detector',
    stats: 'MIT · npm',
    href: 'https://github.com/pablogdcr/react-native-data-detector',
  },
  {
    id: 'humanCoders',
    person: 'David',
    title: 'Human Coders · React Native bootcamps',
    href: 'https://www.humancoders.com/formations/formation-react-native',
  },
  {
    id: 'rnConnection',
    person: 'Ludwig',
    title: 'React Native Connection · BordeauxJS · Dev With AI',
    href: 'https://www.react-native-connection.io/',
  },
] as const
