import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'useffect.sh — Senior React Native engineering on demand'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Edge-runtime dynamic OG image. Rendered once per deploy and cached by
// Vercel's CDN. Uses system mono fallback so no font fetch round-trip.
const MONO =
  'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace'

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#0a0a0a',
        color: '#e5e5e5',
        display: 'flex',
        flexDirection: 'column',
        padding: '64px 72px',
        fontFamily: MONO,
        position: 'relative',
      }}
    >
      {/* terminal chrome */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: '#FF5F57',
          }}
        />
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: '#FEBC2E',
          }}
        />
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: '#28C840',
          }}
        />
        <div style={{ marginLeft: 16, color: '#6b7280', fontSize: 22 }}>
          ~/your-app/package.json
        </div>
      </div>

      {/* dep list */}
      <div style={{ display: 'flex', flexDirection: 'column', marginTop: 56 }}>
        <div style={{ color: '#6b7280', fontSize: 24, marginBottom: 10 }}>
          {'// the squad mounts together.'}
        </div>
        <div style={{ color: '#e5e5e5', fontSize: 26 }}>
          <span style={{ color: '#6b7280' }}>{'"'}</span>
          <span style={{ color: '#00C853' }}>dependencies</span>
          <span style={{ color: '#6b7280' }}>{'": {'}</span>
        </div>
        <div
          style={{
            color: '#e5e5e5',
            fontSize: 26,
            paddingLeft: 28,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <div>
            <span style={{ color: '#00C853' }}>{'"@useffect/david"'}</span>
            <span style={{ color: '#6b7280' }}>: </span>
            <span style={{ color: '#cfcfcf' }}>{'"^9.2.0"'}</span>
            <span style={{ color: '#6b7280' }}>,</span>
          </div>
          <div>
            <span style={{ color: '#00C853' }}>{'"@useffect/gabriel"'}</span>
            <span style={{ color: '#6b7280' }}>: </span>
            <span style={{ color: '#cfcfcf' }}>{'"^4.0.0"'}</span>
            <span style={{ color: '#6b7280' }}>,</span>
          </div>
          <div>
            <span style={{ color: '#00C853' }}>{'"@useffect/jeremy"'}</span>
            <span style={{ color: '#6b7280' }}>: </span>
            <span style={{ color: '#cfcfcf' }}>{'"^5.3.0"'}</span>
            <span style={{ color: '#6b7280' }}>,</span>
          </div>
          <div>
            <span style={{ color: '#00C853' }}>{'"@useffect/ludwig"'}</span>
            <span style={{ color: '#6b7280' }}>: </span>
            <span style={{ color: '#cfcfcf' }}>{'"^7.5.0"'}</span>
            <span style={{ color: '#6b7280' }}>,</span>
          </div>
          <div>
            <span style={{ color: '#00C853' }}>{'"@useffect/matthys"'}</span>
            <span style={{ color: '#6b7280' }}>: </span>
            <span style={{ color: '#cfcfcf' }}>{'"^6.1.0"'}</span>
            <span style={{ color: '#6b7280' }}>,</span>
          </div>
          <div>
            <span style={{ color: '#00C853' }}>{'"@useffect/pablo"'}</span>
            <span style={{ color: '#6b7280' }}>: </span>
            <span style={{ color: '#cfcfcf' }}>{'"^8.4.0"'}</span>
          </div>
        </div>
        <div style={{ color: '#6b7280', fontSize: 26 }}>{'}'}</div>
      </div>

      {/* wordmark + tagline pinned to bottom-right */}
      <div
        style={{
          position: 'absolute',
          right: 72,
          bottom: 56,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 600,
            color: '#e5e5e5',
            letterSpacing: '-0.02em',
          }}
        >
          us<span style={{ color: '#00C853' }}>e</span>ffect
          <span style={{ color: '#6b7280' }}>.sh</span>
        </div>
        <div
          style={{
            fontSize: 22,
            color: '#9ca3af',
            marginTop: 8,
            fontFamily: MONO,
          }}
        >
          {'// senior react native, on demand.'}
        </div>
      </div>
    </div>,
    { ...size },
  )
}
