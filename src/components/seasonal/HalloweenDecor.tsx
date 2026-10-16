import AutumnLeaves from './AutumnLeaves'

/**
 * Purely decorative overlay for the Halloween theme: maple leaves falling
 * across the viewport and a spider dangling from the top-right corner.
 * Pointer-events are off so nothing here can block the page, and all motion
 * stops under prefers-reduced-motion.
 */
export default function HalloweenDecor() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[55] overflow-hidden">
      <AutumnLeaves />

      {/* Spider on a thread, tucked under the header on the right */}
      <div className="halloween-spider absolute right-[6vw] top-0 hidden sm:flex flex-col items-center">
        <span className="block w-px h-40 bg-[var(--halloween-thread)] opacity-50" />
        <svg viewBox="0 0 32 28" width="28" height="24" fill="var(--halloween-ink)">
          <ellipse cx="16" cy="11" rx="5" ry="5.5" />
          <ellipse cx="16" cy="19" rx="7" ry="8" />
          <g stroke="var(--halloween-ink)" strokeWidth="1.6" fill="none" strokeLinecap="round">
            <path d="M11 14 L4 9 L1 14" />
            <path d="M10 17 L3 16 L0 22" />
            <path d="M10 20 L4 23 L3 28" />
            <path d="M21 14 L28 9 L31 14" />
            <path d="M22 17 L29 16 L32 22" />
            <path d="M22 20 L28 23 L29 28" />
          </g>
          <circle cx="14" cy="10" r="1.1" fill="var(--color-accent)" />
          <circle cx="18" cy="10" r="1.1" fill="var(--color-accent)" />
        </svg>
      </div>
    </div>
  )
}
