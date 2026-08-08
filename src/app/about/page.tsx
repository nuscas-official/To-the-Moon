import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About',
  description: 'What the NUSCAS member portal is, what it does, and why it asks you to sign in with Google.',
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">

      {/* Header section */}
      <div className="mb-10 border-b border-border pb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-text tracking-tight uppercase">
          About This Site
        </h1>
        <p className="mt-2 text-xs uppercase tracking-widest text-text-muted">
          National University of Singapore Comics and Animation Society
        </p>
      </div>

      {/* Single Clean Rectangle Container (matches Privacy Policy styling) */}
      <div className="bg-surface border border-border shadow-sm divide-y divide-border text-sm leading-relaxed text-text">

        {/* Section 1 */}
        <section className="p-6 sm:p-8 space-y-3">
          <h2 className="text-base font-bold text-text uppercase tracking-wider">
            1. What Is the NUSCAS Member Portal?
          </h2>
          <p>
            This site is the official website and member portal of the <strong>NUS Comics and Animation Society
            (NUSCAS)</strong>, a registered student club at the National University of Singapore. Anyone can browse
            our <Link href="/events" className="text-accent hover:underline">events</Link>,{' '}
            <Link href="/blog" className="text-accent hover:underline">blog articles</Link>, and{' '}
            <Link href="/gallery" className="text-accent hover:underline">member art gallery</Link> without
            signing in.
          </p>
          <p className="text-text-muted">
            Members can additionally sign in to rate anime and manga titles, write and publish blog articles, and
            link their account to our NUSCAS Telegram bot.
          </p>
        </section>

        {/* Section 2 */}
        <section className="p-6 sm:p-8 space-y-3">
          <h2 className="text-base font-bold text-text uppercase tracking-wider">
            2. Why We Ask You to Sign In With Google
          </h2>
          <p>
            We use <strong>Google Sign-In</strong> purely to verify who you are &mdash; it lets members log in
            securely with one click, without us ever storing a password.
          </p>
          <p className="text-text-muted">
            When you sign in, we read your <strong className="text-text">email address and display name</strong> from
            your Google account to create and secure your member profile. We do not post to your Google account,
            read your other Google data, or share your information back to Google or any third party.
          </p>
        </section>

        {/* Section 3 */}
        <section className="p-6 sm:p-8 space-y-3">
          <h2 className="text-base font-bold text-text uppercase tracking-wider">
            3. Learn More
          </h2>
          <p className="text-text-muted">
            For the full list of personal data we collect, how long we keep it, and your rights to access or delete
            it, see our{' '}
            <Link href="/privacy" className="font-semibold text-accent hover:underline">
              Privacy Policy
            </Link>.
          </p>
        </section>
      </div>

      {/* Footer Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
        >
          &larr; Back to Home
        </Link>
        <a
          href="https://mail.google.com/mail/?view=cm&fs=1&to=nuscomicssoc@gmail.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-accent hover:underline transition-colors"
        >
          Contact Us
        </a>
      </div>

    </div>
  )
}
