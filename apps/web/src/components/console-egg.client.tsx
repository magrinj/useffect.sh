'use client'

import { useEffect } from 'react'

const GREEN =
  'color:#00C853; font-family: Geist Mono, monospace; font-size:13px;'
const MUTED =
  'color:#9A9A93; font-family: Geist Mono, monospace; font-size:12px;'

export function ConsoleEgg() {
  useEffect(() => {
    console.log("%c// useffect.sh — assembled when your code doesn't.", GREEN)
    console.log(
      "%c// You're inspecting. We like you. careers@useffect.sh",
      MUTED,
    )
  }, [])

  return null
}
