export interface Member {
  id: string
  name: string
  /** Hero-card label and package-block dep name. */
  shortName: string
  /** Real position the member holds elsewhere — used in image alt, aria-label,
   *  and JSON-LD jobTitle. Not visually displayed on the card. */
  role: string
  /** Public-folder path. */
  image: string
  /** npm scope handle for the package.json pseudo-snippet. */
  scope: string
  /** Loosely encodes years shipping React Native; appears as the dep version. */
  version: string
  /** 3-5 entries; first is the lead specialty. */
  specialties: readonly string[]
  /** Real brands/companies the member has shipped React Native for. First 3
   *  render on the hero card; full list informs JSON-LD knowsAbout context. */
  notableCompanies: readonly string[]
  /** LinkedIn profile URL. Used as `sameAs` in JSON-LD Person — the strongest
   *  Knowledge-Graph signal linking the person entity to LinkedIn. */
  linkedin: string
}

export const members: readonly Member[] = [
  {
    id: '001',
    name: 'David Leuliette',
    shortName: 'David',
    role: 'Senior Mobile Engineer',
    image: '/david.png',
    scope: '@useffect/david',
    version: '^10.2.0',
    specialties: ['React Native', 'Expo', 'iOS', 'EAS', 'BLE'],
    notableCompanies: [
      'Sunday',
      'Red Bull',
      'AXA',
      'NACON',
      'Mahalo Banking',
      'Smart Pension',
    ],
    linkedin: 'https://www.linkedin.com/in/david-leuliette/',
  },
  {
    id: '002',
    name: 'Jérémy Magrin',
    shortName: 'Jérémy',
    role: 'Senior React Native Engineer · CTO',
    image: '/jeremy.png',
    scope: '@useffect/jeremy',
    version: '^11.0.0',
    specialties: ['React Native', 'TypeScript', 'Nest.js', 'Swift', 'Next.js'],
    notableCompanies: [
      'Mistral AI',
      'Twenty',
      'Betclic',
      'Cookomix',
      'Snoop Media',
    ],
    linkedin: 'https://www.linkedin.com/in/jeremy-magrin/',
  },
  {
    id: '003',
    name: 'Pablo Giraud-Carrier',
    shortName: 'Pablo',
    role: 'Head of Mobile · Founding Engineer',
    image: '/pablo.png',
    scope: '@useffect/pablo',
    version: '^8.0.0',
    specialties: [
      'React Native',
      'Swift',
      'Kotlin',
      'native modules',
      'AI integration',
    ],
    notableCompanies: [
      'The Mobile-First Company',
      'Follow',
      'YEGO',
      'Privalia',
      'vente-privee',
    ],
    linkedin: 'https://www.linkedin.com/in/pablo-giraud-carrier/',
  },
  {
    id: '004',
    name: 'Matthys Ducrocq',
    shortName: 'Matthys',
    role: 'Head of Mobile · Co-Founder',
    image: '/matthys.png',
    scope: '@useffect/matthys',
    version: '^6.0.0',
    specialties: [
      'React Native',
      'Expo',
      'EAS',
      'TypeScript migrations',
      'Twilio video',
    ],
    notableCompanies: [
      'Ekklo',
      'weshipit.today',
      'Filteroff',
      'Karnott',
      'Shoootin',
    ],
    linkedin: 'https://www.linkedin.com/in/matthys-ducrocq/',
  },
  {
    id: '005',
    name: 'Ludwig Vantours',
    shortName: 'Ludwig',
    role: 'Lead React Native Engineer',
    image: '/ludwig.png',
    scope: '@useffect/ludwig',
    version: '^9.0.0',
    specialties: [
      'React Native',
      'Android',
      'Redux',
      'design systems',
      'sport apps',
    ],
    notableCompanies: [
      'Chelsea FC',
      'Liverpool FC',
      'Newcastle United',
      'Luko',
      'Cdiscount',
      'Typology',
    ],
    linkedin: 'https://www.linkedin.com/in/ludwig-vantours/',
  },
  {
    id: '006',
    name: 'Gabriel Hofman',
    shortName: 'Gabriel',
    role: 'Senior Mobile Engineer',
    image: '/gabriel.png',
    scope: '@useffect/gabriel',
    version: '^10.0.0',
    specialties: ['React Native', 'Expo', 'monorepos', 'design systems', 'BLE'],
    notableCompanies: [
      'Sephora',
      'Luko',
      'TheFork',
      'Meetic',
      'Upstream (YC)',
      'Revyze',
    ],
    linkedin: 'https://www.linkedin.com/in/gabrielhofman/',
  },
] as const
