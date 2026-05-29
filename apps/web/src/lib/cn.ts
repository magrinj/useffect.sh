/**
 * Joins truthy class name fragments.
 * Tiny, dependency-free. Sufficient for our utility-first styling.
 * No tailwind-merge — we don't have conflicting Tailwind classes
 * coming from multiple sources (no third-party UI lib).
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}
