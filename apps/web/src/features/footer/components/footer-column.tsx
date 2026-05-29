import type { FooterColumn as ColumnData } from '../data'

interface Props {
  column: ColumnData
}

export function FooterColumn({ column }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <h4 className="font-mono text-[12px] text-muted">{column.heading}</h4>
      <ul className="flex flex-col gap-2 font-mono text-[13px]">
        {column.links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="text-ink hover:text-accent transition-colors"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
