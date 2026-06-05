import { CodeBlock } from '@/components/ui/code-block'
import { members } from '../data'

// Render deps alphabetically by scope — that's how every package.json reads
// after `npm install` (and what pnpm/yarn emit too). The truthful order is
// the joke; an animated shuffle would just be visual noise.
const SORTED_MEMBERS = [...members].sort((a, b) =>
  a.scope.localeCompare(b.scope),
)

export function PackageBlock() {
  const summary = `Six dependencies: ${SORTED_MEMBERS.map((m) => m.shortName).join(', ')}.`

  return (
    <>
      <span className="sr-only">{summary}</span>
      <CodeBlock
        variant="dark"
        title={<>~/your-app/package.json</>}
        status={'// 6 deps · 0 vulnerabilities'}
      >
        <span className="block">
          <span className="tok-c">{'// the squad mounts together.'}</span>
        </span>
        <span className="block">
          <span className="tok-p">"</span>
          <span className="tok-k">dependencies</span>
          <span className="tok-p">"</span>
          <span className="tok-p">: {'{'}</span>
        </span>
        {SORTED_MEMBERS.map((m) => (
          <span key={m.id} data-member-id={m.id} className="block pl-4">
            <span className="tok-p">"</span>
            <span className="tok-k">{m.scope}</span>
            <span className="tok-p">"</span>
            <span className="tok-p">: </span>
            <span className="tok-p">"</span>
            <span className="tok-s">{m.version}</span>
            <span className="tok-p">",</span>{' '}
            <span className="tok-c">{`// ${m.specialties.join(' · ')}`}</span>
          </span>
        ))}
        <span className="block">
          <span className="tok-p">{'}'}</span>
        </span>
      </CodeBlock>
    </>
  )
}
