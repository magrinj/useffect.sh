'use client'

import { useEffect, useState } from 'react'

const THRESHOLD_PX = 8

/** Returns true once the page has scrolled past the threshold. */
export function useNavScrollState(): boolean {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > THRESHOLD_PX)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return scrolled
}
