export interface CommunityEntry {
  /** Person attribution (first-name from team data). */
  person: string
  /** Project / activity title. */
  title: string
  /** One-line context — what it is, what role they played. */
  detail: string
  /** Optional measured stats (stars, downloads, attendees). */
  stats?: string
  /** Optional outbound URL. */
  href?: string
}

// All entries below are grounded in public, verifiable sources (GitHub API,
// npm, the projects' own pages, and team members' LinkedIn histories).
// Update specific numbers in place when they shift — the structure is stable.

export const community: readonly CommunityEntry[] = [
  {
    person: 'Jérémy',
    title: 'Twenty · YC S23',
    detail:
      'Early core contributor · 2 years freelance shaping foundational architecture · 224 commits',
    stats: '49k★ · 7k forks · 1.3M+ Docker pulls',
    href: 'https://github.com/twentyhq/twenty',
  },
  {
    person: 'Jérémy',
    title: '@magrinj/expo-quick-look',
    detail:
      'Expo module for native file previews — QuickLook on iOS, Intent chooser on Android',
    stats: 'MIT · npm',
    href: 'https://github.com/magrinj/expo-quick-look',
  },
  {
    person: 'David',
    title: 'Human Coders · React Native bootcamps',
    detail:
      '5+ years instructor · 450+ React Native engineers trained · 50+ conference talks',
    href: 'https://www.humancoders.com/formations/formation-react-native',
  },
  {
    person: 'Ludwig',
    title: 'React Native Connection · BordeauxJS · Dev With AI',
    detail:
      'Co-organizer · Paris RN meetup · Bordeaux dev meetups · sourcing speakers and sponsors',
    href: 'https://www.react-native-connection.io/',
  },
] as const
