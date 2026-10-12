import type { Metadata } from 'next'
import Image from 'next/image'
import PageHeader from '@/components/ui/PageHeader'
import { getOpenForms } from '@/lib/forms'

export const metadata: Metadata = {
  title: 'Forms',
  description:
    'Open NUSCAS forms — share feedback on our sessions or donate merch to the club donation drive.',
  alternates: { canonical: '/forms' },
}

// Re-check end dates hourly so expired forms drop off without a redeploy.
export const revalidate = 3600

export default function FormsPage() {
  const forms = getOpenForms()

  return (
    <div className="mx-auto w-full max-w-5xl py-10 sm:py-14 animate-fade-in">
      <PageHeader
        eyebrow="Have your say"
        title="Forms"
        description="Feedback and drives we keep open all semester. Each one opens a Google Form in a new tab."
        divider
      />

      {forms.length === 0 ? (
        <p className="border border-border bg-surface px-6 py-10 text-center text-sm text-text-muted">
          No forms are open right now — check back soon.
        </p>
      ) : (
        <ul className="grid gap-6 md:grid-cols-2">
          {forms.map((form, i) => (
            <li key={form.id}>
              <a
                href={form.href}
                target="_blank"
                rel="noopener noreferrer"
                className="angle-frame clip-cut cut-lg group block h-full shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-accent/10 hover:[--frame-color:var(--color-accent)]"
              >
                <div className="clip-cut cut-lg flex h-full flex-col bg-surface">
                  <div className="relative aspect-[16/9] overflow-hidden border-b border-border bg-surface-hover">
                    {form.image ? (
                      <Image
                        src={form.image.src}
                        alt={form.image.alt}
                        fill
                        sizes="(min-width: 768px) 480px, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 flex items-center justify-center"
                        style={{
                          backgroundImage:
                            'repeating-linear-gradient(-55deg, var(--color-border) 0 1px, transparent 1px 14px)',
                        }}
                      >
                        <span className="bg-surface-hover px-3 font-display text-3xl text-text-muted">
                          {form.tag}
                        </span>
                      </div>
                    )}
                    <span
                      aria-hidden="true"
                      className="clip-cut cut-xs absolute right-4 top-4 bg-surface/90 px-2 py-0.5 font-mono text-xs tabular-nums text-text-muted"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-6 sm:p-8">

                  <span className="clip-cut cut-xs self-start bg-accent-gold px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-background-dark">
                    {form.tag}
                  </span>

                  <h2 className="mt-4 font-serif text-3xl tracking-tight text-foreground">
                    {form.title}
                  </h2>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-text-muted">
                    {form.description}
                  </p>

                  <span className="clip-cut cut-sm mt-6 inline-flex items-center gap-2 self-start bg-accent px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white transition-colors group-hover:bg-accent-hover">
                    {form.cta}
                    <svg
                      className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={3}
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                  <span className="sr-only">(opens Google Form in a new tab)</span>
                  </div>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
