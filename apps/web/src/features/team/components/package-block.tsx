import { CodeBlock } from '@/components/ui/code-block'

export function PackageBlock() {
  return (
    <CodeBlock
      variant="dark"
      title={<>~/your-app/package.json</>}
      status="// 7 deps · 0 vulnerabilities"
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
      <span className="block pl-4">
        <span className="tok-p">"</span>
        <span className="tok-k">@useffect/jeremy</span>
        <span className="tok-p">"</span>
        <span className="tok-p">: "</span>
        <span className="tok-s">^4.9.0</span>
        <span className="tok-p">",</span>{' '}
        <span className="tok-c">{'// native modules architect'}</span>
      </span>
      <span className="block pl-4">
        <span className="tok-p">"</span>
        <span className="tok-k">@useffect/david</span>
        <span className="tok-p">"</span>
        <span className="tok-p">: "</span>
        <span className="tok-s">^7.3.0</span>
        <span className="tok-p">",</span>{' '}
        <span className="tok-c">{'// native modules & bridges'}</span>
      </span>
      <span className="block pl-4">
        <span className="tok-p">"</span>
        <span className="tok-k">@useffect/pablo</span>
        <span className="tok-p">"</span>
        <span className="tok-p">: "</span>
        <span className="tok-s">^6.1.4</span>
        <span className="tok-p">",</span>{' '}
        <span className="tok-c">{'// architecture & new arch'}</span>
      </span>
      <span className="block pl-4">
        <span className="tok-p">"</span>
        <span className="tok-k">@useffect/matthys</span>
        <span className="tok-p">"</span>
        <span className="tok-p">: "</span>
        <span className="tok-s">^5.8.2</span>
        <span className="tok-p">",</span>{' '}
        <span className="tok-c">{'// native + perf'}</span>
      </span>
      <span className="block pl-4">
        <span className="tok-p">"</span>
        <span className="tok-k">@useffect/ludwig</span>
        <span className="tok-p">"</span>
        <span className="tok-p">: "</span>
        <span className="tok-s">^8.0.1</span>
        <span className="tok-p">",</span>{' '}
        <span className="tok-c">{'// product & strategy'}</span>
      </span>
      <span className="block pl-4">
        <span className="tok-p">"</span>
        <span className="tok-k">@useffect/gabriel</span>
        <span className="tok-p">"</span>
        <span className="tok-p">: "</span>
        <span className="tok-s">^3.4.0</span>
        <span className="tok-p">",</span>{' '}
        <span className="tok-c">{'// analytics & data'}</span>
      </span>
      <span className="block pl-4">
        <span className="tok-p">"</span>
        <span className="tok-k">@useffect/robots</span>
        <span className="tok-p">"</span>
        <span className="tok-p">: "</span>
        <span className="tok-s">^1.0.0</span>
        <span className="tok-p">"</span>
        {'  '}
        <span className="tok-c">{'// the bench'}</span>
      </span>
      <span className="block">
        <span className="tok-p">{'}'}</span>
      </span>
    </CodeBlock>
  )
}
