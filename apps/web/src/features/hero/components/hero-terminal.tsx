import { CodeBlock } from '@/components/ui/code-block'
import { Cursor } from '@/components/ui/cursor'

export function HeroTerminal() {
  return (
    <CodeBlock
      label="useEffect code block"
      title={
        <>
          ~/app/<b>src/effects/us.ts</b>
        </>
      }
      status={<span className="text-accent">● live</span>}
    >
      <span className="block">
        <span className="tok-c">
          {'// when your code mounts us, the effect runs.'}
        </span>
      </span>
      <span className="block">
        <span className="tok-k">import</span>{' '}
        <span className="tok-p">{'{'}</span> useEffect{' '}
        <span className="tok-p">{'}'}</span> <span className="tok-k">from</span>{' '}
        <span className="tok-s">"react"</span>
        <span className="tok-p">;</span>
      </span>
      <span className="block">
        <span className="tok-k">import</span>{' '}
        <span className="tok-p">{'{'}</span> <span className="tok-us">us</span>{' '}
        <span className="tok-p">{'}'}</span> <span className="tok-k">from</span>{' '}
        <span className="tok-s">"useffect.sh"</span>
        <span className="tok-p">;</span>
      </span>
      <span className="block">&nbsp;</span>
      <span className="block">
        <span className="tok-k">export function</span>{' '}
        <span className="tok-fn">App</span>
        <span className="tok-p">()</span> <span className="tok-p">{'{'}</span>
      </span>
      <span className="block pl-4">
        <span className="tok-fn">useEffect</span>
        <span className="tok-p">(()</span> <span className="tok-k">=&gt;</span>{' '}
        <span className="tok-p">{'{'}</span>
      </span>
      <span className="block pl-8">
        <span className="tok-c">{'// mounting elite squad…'}</span>
      </span>
      <span className="block pl-8">
        <span className="tok-k">const</span> ship{' '}
        <span className="tok-p">=</span> <span className="tok-us">us</span>
        <span className="tok-p">.</span>
        <span className="tok-fn">unfuck</span>
        <span className="tok-p">(</span>yourCode
        <span className="tok-p">);</span>
      </span>
      <span className="block pl-8">
        <span className="tok-k">return</span> <span className="tok-p">()</span>{' '}
        <span className="tok-k">=&gt;</span> ship
        <span className="tok-p">.</span>
        <span className="tok-fn">cleanly</span>
        <span className="tok-p">();</span>{' '}
        <span className="tok-c">{'// no debt, full docs'}</span>
      </span>
      <span className="block pl-4">
        <span className="tok-p">{'},'}</span> <span className="tok-p">[</span>
        <span className="tok-us">us</span>
        <span className="tok-p">]);</span>
      </span>
      <span className="block">
        <span className="tok-p">{'}'}</span>
        <Cursor />
      </span>
    </CodeBlock>
  )
}
