'use client'

import { useEffect, useState } from 'react'
import { members } from '@/features/team/data'

// Styled console output — Geist Mono to match the site's terminal aesthetic.
const ACCENT = 'color:#00C853;font-family:Geist Mono,monospace;font-size:13px;'
const MUTED = 'color:#9A9A93;font-family:Geist Mono,monospace;font-size:12px;'
const INK =
  'color:#0E0E0C;font-family:Geist Mono,monospace;font-size:13px;font-weight:600;'

const BANNER = String.raw`
  _   _ ___ ___ ___ ___ ___ ___ _____
 | | | / __| __| __| __| __/ __|_   _|
 | |_| \__ \ _|| _|| _|| _| (__  | |  .sh
  \___/|___/___|___|_| |___\___| |_|
`

// ↑ ↑ ↓ ↓ ← → ← → B A
const KONAMI = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
]

const isTypingTarget = (el: EventTarget | null) => {
  if (!(el instanceof HTMLElement)) return false
  return el.isContentEditable || /^(input|textarea|select)$/i.test(el.tagName)
}

export function Eggs() {
  const [debug, setDebug] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  // Drive the CSS overlay + continuous headline glitch off a root class.
  useEffect(() => {
    document.documentElement.classList.toggle('debug-mode', debug)
  }, [debug])

  useEffect(() => {
    let toastTimer = 0
    let burstTimer = 0

    const showToast = (msg: string) => {
      setToast(msg)
      window.clearTimeout(toastTimer)
      toastTimer = window.setTimeout(() => setToast(null), 1800)
    }

    // Force the hero "FUCK" to glitch for a beat, even without a hover.
    const glitchBurst = () => {
      const el = document.querySelector('.strike')
      if (!el) return
      el.classList.add('is-glitching')
      window.clearTimeout(burstTimer)
      burstTimer = window.setTimeout(
        () => el.classList.remove('is-glitching'),
        1200,
      )
    }

    const scrollTo = (id: string) =>
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

    // ---- console greeting ----
    console.log(`%c${BANNER}`, ACCENT)
    console.log("%c// assembled when your code doesn't.", ACCENT)
    console.log(
      "%cYou opened the console. You're our kind of people.\n" +
        '%ctype %cus.help()%c to see what we expose · careers@useffect.sh',
      MUTED,
      MUTED,
      ACCENT,
      MUTED,
    )

    // ---- window.us — a real, callable API ----
    const us = {
      help() {
        console.log(
          '%c// us — the effect you can run from the console:',
          ACCENT,
        )
        console.table({
          'us.unfuck()': 'patch the codebase (watch the hero)',
          'us.deps()': 'list the squad',
          'us.hire()': 'how to mount us',
          'us.effect()': 're-run the mount effect',
          'us.debug()': 'toggle debug mode (or ↑↑↓↓←→←→BA)',
        })
        return '// pick one. or just press ↑↑↓↓←→←→BA.'
      },
      unfuck() {
        console.log('%c> us.unfuck(yourCode)', ACCENT)
        console.log(
          '%c✓ crash-free 94.2% → 99.7%   ✓ cold start 4.1s → 1.2s   ✓ bundle 8.4MB → 2.1MB',
          MUTED,
        )
        glitchBurst()
        showToast('✓ code unfucked')
        return '// shipped clean. no debt, full docs.'
      },
      deps() {
        console.log('%c// the squad mounts together:', ACCENT)
        for (const m of members) {
          console.log(`%c  ${m.scope} %c— ${m.role}`, INK, MUTED)
        }
        return '// no juniors. no subcontractors. no bench.'
      },
      hire() {
        console.log(
          '%c// two slots open for Q3. if your app is on fire:',
          ACCENT,
        )
        console.log('%c   hello@useffect.sh', INK)
        scrollTo('contact')
        return '// avg. response < 6h, Mon–Fri'
      },
      effect() {
        console.log('%c// mounting elite squad…', MUTED)
        glitchBurst()
        return '// effect ran. cleanup scheduled on unmount.'
      },
      debug() {
        setDebug((d) => !d)
        return '// debug mode toggled.'
      },
    }
    ;(window as unknown as { us: typeof us }).us = us

    // ---- keyboard eggs: Konami + type "unfuck" ----
    let konamiIndex = 0
    let buffer = ''

    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return
      const key = e.key

      // Konami sequence → toggle debug mode
      if (key.toLowerCase() === KONAMI[konamiIndex]?.toLowerCase()) {
        konamiIndex += 1
        if (konamiIndex === KONAMI.length) {
          konamiIndex = 0
          setDebug((d) => !d)
        }
      } else {
        // allow a fresh start if this key is the first of the sequence
        konamiIndex = key === KONAMI[0] ? 1 : 0
      }

      // Esc leaves debug mode
      if (key === 'Escape') setDebug(false)

      // Rolling buffer → typing "unfuck" anywhere fires the glitch
      if (/^[a-zA-Z]$/.test(key)) {
        buffer = (buffer + key.toLowerCase()).slice(-6)
        if (buffer === 'unfuck') {
          buffer = ''
          glitchBurst()
          showToast('✓ code unfucked')
        }
      }
    }

    window.addEventListener('keydown', onKey)

    return () => {
      window.removeEventListener('keydown', onKey)
      window.clearTimeout(toastTimer)
      window.clearTimeout(burstTimer)
      delete (window as unknown as { us?: unknown }).us
    }
  }, [])

  return (
    <>
      {debug && <div className="debug-scanlines" aria-hidden />}
      {debug && (
        <div className="debug-hud" aria-hidden>
          ● DEBUG MODE — {'// press Esc to exit'}
        </div>
      )}
      {toast && (
        <output className="egg-toast" aria-live="polite">
          {toast}
        </output>
      )}
    </>
  )
}
