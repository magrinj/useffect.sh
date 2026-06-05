'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/cn'
import type { Member } from '../data'

interface HeroCardProps {
  member: Member
  isHovered: boolean
  /** `next/image` priority — pass true for above-the-fold cards. */
  priority: boolean
  /** True while a closed-fist gesture is pulling this card forward. */
  isGrabbed?: boolean
  /** Scale to apply during grab (1.0 = at rest, up to ~1.6 = fully pulled). */
  grabScale?: number
}

const TILT_MAX_DEG = 8

export function HeroCard({
  member,
  isHovered,
  priority,
  isGrabbed = false,
  grabScale = 1,
}: HeroCardProps) {
  // Local tilt state — driven by cursor position within the card. We don't
  // lift this up to HeroGrid because each card's tilt is independent and the
  // listeners scope cleanly to the card's own bounding rect.
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (isGrabbed) return // freeze tilt during a grab — the card is held still
    const rect = e.currentTarget.getBoundingClientRect()
    const dx = (e.clientX - rect.left) / rect.width - 0.5
    const dy = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ rx: -dy * TILT_MAX_DEG, ry: dx * TILT_MAX_DEG })
  }

  const handlePointerLeave = () => setTilt({ rx: 0, ry: 0 })

  // During a grab: lock the tilt to zero and use the grab scale. Otherwise
  // the normal cursor-driven tilt + hover-scale combo.
  const rx = isGrabbed ? 0 : tilt.rx
  const ry = isGrabbed ? 0 : tilt.ry
  const scale = isGrabbed ? grabScale : isHovered ? 1.03 : 1
  const transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale})`

  // Accessible label that condenses the most important SEO/SR-relevant data.
  // Image alt below carries the same information plus specialties.
  const linkLabel = `${member.name} — ${member.role}. Open LinkedIn profile.`
  const imageAlt = `${member.name}, ${member.role} at useffect.sh — specialties: ${member.specialties.join(', ')}`

  return (
    <a
      href={member.linkedin}
      target="_blank"
      rel="noopener noreferrer me"
      aria-label={linkLabel}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={cn(
        'group relative block aspect-[2/3] overflow-hidden rounded-lg border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-dark',
        isGrabbed
          ? 'border-accent shadow-[0_0_56px_rgba(0,200,83,0.7)]'
          : isHovered
            ? 'border-accent shadow-[0_0_32px_rgba(0,200,83,0.45)]'
            : 'border-dark-line shadow-none',
      )}
      style={{
        background:
          'linear-gradient(135deg, rgba(11,11,10,0.6) 0%, rgba(19,19,17,0.85) 100%)',
        transform,
        transformStyle: 'preserve-3d',
        // While being held, scale tracks the hand 1:1 (linear, fast). When
        // the user opens their hand (isGrabbed flips false), the longer
        // cubic-bezier transition produces the elastic snap-back. Tilts and
        // hover changes use the not-grabbed branch — they feel snappy.
        transition: isGrabbed
          ? 'transform 60ms linear, box-shadow 220ms ease-out, border-color 220ms ease-out'
          : 'transform 260ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 220ms ease-out, border-color 220ms ease-out',
        willChange: 'transform',
      }}
    >
      <Image
        src={member.image}
        alt={imageAlt}
        fill
        priority={priority}
        sizes="(max-width: 640px) 50vw, 33vw"
        className="object-cover"
      />

      {/* SR-only structured content. Since the visible text on each trading
          card is baked into the PNG, this block carries the same data in
          crawlable DOM text so Google + screen readers can still index and
          announce it. Also surfaces the LinkedIn URL for the entity. */}
      <span className="sr-only">
        <strong>{member.name}</strong> — {member.role} at useffect.sh.
        Specialties: {member.specialties.join(', ')}. Notable engagements:{' '}
        {member.notableCompanies.join(', ')}. npm scope: {member.scope}, version{' '}
        {member.version}.
      </span>
    </a>
  )
}
