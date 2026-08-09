import type { ReactNode } from 'react'

interface PageHeaderProps {
  /** Small display-font kicker sitting above the title. */
  eyebrow: string
  title: string
  description?: string
  /** Draws the rule under the header, as the homepage section headers do. */
  divider?: boolean
  /** Right-aligned actions (buttons, links) shown beside the title block. */
  children?: ReactNode
  /** Spacing override. Defaults to the standard `mb-8` page rhythm. */
  className?: string
}

/**
 * The page title block shared by every subpage. It mirrors the section headers
 * on the homepage (eyebrow / serif title / muted description) so a subpage and
 * its homepage preview read as the same thing.
 */
export default function PageHeader({
  eyebrow,
  title,
  description,
  divider = false,
  children,
  className = 'mb-8',
}: PageHeaderProps) {
  const wrapperClasses = [
    'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
    divider ? 'border-b border-border pb-4' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={wrapperClasses}>
      <div>
        <span className="text-xl font-display tracking-widest text-accent">
          {eyebrow}
        </span>
        <p className="text-4xl md:text-5xl font-serif tracking-tight text-foreground py-2">
          {title}
        </p>
        {description && (
          <p className="text-sm text-text-muted mt-2 max-w-2xl font-sans leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  )
}
