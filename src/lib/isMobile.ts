/** Returns true if running on a mobile/touch device with a small screen. Safe to call during SSR (returns false). */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768 || navigator.maxTouchPoints > 0
}
