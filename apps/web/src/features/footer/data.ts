export interface FooterLink {
  label: string
  href: string
}

export interface FooterColumn {
  heading: string
  links: readonly FooterLink[]
}

export const columns: readonly FooterColumn[] = [
  {
    heading: '// product',
    links: [
      { label: 'Rescue', href: '#services' },
      { label: 'Build', href: '#services' },
      { label: 'The us effect', href: '#effect' },
      { label: 'Renders', href: '#work' },
    ],
  },
  {
    heading: '// company',
    links: [
      { label: 'Team', href: '#team' },
      { label: 'Writing', href: '#writing' },
      { label: 'Process', href: '#process' },
      { label: 'Contact', href: 'mailto:hello@useffect.sh' },
    ],
  },
  {
    heading: '// social',
    links: [
      { label: 'github.com/useffect', href: '/' },
      { label: '@useffect on X', href: '/' },
      { label: '@useffect.sh on bsky', href: '/' },
      { label: 'YouTube · talks', href: '/' },
    ],
  },
  {
    heading: '// legal',
    links: [
      { label: 'NDA template', href: '/' },
      { label: 'MSA template', href: '/' },
      { label: 'Privacy', href: '/' },
      { label: 'Imprint', href: '/' },
    ],
  },
] as const
