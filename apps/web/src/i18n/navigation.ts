import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

// Locale-aware drop-in replacements for next/link and next/navigation.
// Import from this module rather than 'next/link' / 'next/navigation'
// so the active locale prefix is preserved on every internal nav.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
