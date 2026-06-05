export interface FooterLink {
  /** Key used to look up the link label in messages.footer.columns.*.links. */
  key: string
  href: string
}

export interface FooterColumn {
  /** Identifier — also the messages.footer.columns.* namespace. */
  id: 'product' | 'company' | 'social' | 'legal'
  /** Header stays code-style English in every locale (`// product`, …). */
  heading: string
  links: readonly FooterLink[]
}

export const columns: readonly FooterColumn[] = [
  {
    id: 'product',
    heading: '// product',
    links: [
      { key: 'rescue', href: '#services' },
      { key: 'build', href: '#services' },
      { key: 'theUsEffect', href: '#effect' },
      { key: 'renders', href: '#work' },
    ],
  },
  {
    id: 'company',
    heading: '// company',
    links: [
      { key: 'team', href: '#team' },
      { key: 'writing', href: '#writing' },
      { key: 'process', href: '#process' },
      { key: 'contact', href: 'mailto:hello@useffect.sh' },
    ],
  },
  {
    id: 'social',
    heading: '// social',
    links: [
      { key: 'github', href: 'https://github.com/useffect-sh' },
      { key: 'x', href: 'https://x.com/useffect_sh' },
      { key: 'linkedin', href: 'https://www.linkedin.com/company/useffect-sh' },
    ],
  },
  {
    id: 'legal',
    heading: '// legal',
    links: [
      { key: 'nda', href: '/' },
      { key: 'msa', href: '/' },
      { key: 'privacy', href: '/' },
      { key: 'imprint', href: '/' },
    ],
  },
] as const
