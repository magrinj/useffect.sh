import { getTranslations } from 'next-intl/server'
import type { FooterColumn as ColumnData } from '../data'

interface Props {
  column: ColumnData
}

export async function FooterColumn({ column }: Props) {
  const t = await getTranslations(`footer.columns.${column.id}.links`)
  return (
    <div className="flex flex-col gap-3">
      <h4 className="font-mono text-[12px] text-muted">{column.heading}</h4>
      <ul className="flex flex-col gap-2 font-mono text-[13px]">
        {column.links.map((link) => {
          // Internal anchors (#services, mailto:, /) stay in-tab; external
          // social profiles open in a new tab with the noopener noreferrer
          // pair, plus rel="me" so the link counts as an identity-link
          // signal for Knowledge Graph + Mastodon-style verification.
          const isExternal = link.href.startsWith('http')
          return (
            <li key={link.key}>
              <a
                href={link.href}
                {...(isExternal && {
                  target: '_blank',
                  rel: 'me noopener noreferrer',
                })}
                className="text-ink hover:text-accent transition-colors"
              >
                {t(link.key)}
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
