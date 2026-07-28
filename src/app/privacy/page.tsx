import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | NUS Comics and Animation Society',
  description: 'Privacy policy and personal data protection practices of the NUS Comics and Animation Society (NUSCAS).',
}

export default function PrivacyPage() {
  const lastUpdated = 'July 2026'

  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      
      {/* Header section */}
      <div className="mb-10 border-b border-border pb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-text tracking-tight uppercase">
          Privacy Policy
        </h1>
        <p className="mt-2 text-xs uppercase tracking-widest text-text-muted">
          Last updated: {lastUpdated} &bull; National University of Singapore Comics and Animation Society
        </p>
      </div>

      {/* Single Clean Rectangle Container (Jane Street Style) */}
      <div className="bg-surface border border-border shadow-sm divide-y divide-border text-sm leading-relaxed text-text">
        
        {/* Section 1 */}
        <section className="p-6 sm:p-8 space-y-3">
          <h2 className="text-base font-bold text-text uppercase tracking-wider">
            1. Overview & Compliance
          </h2>
          <p>
            The National University of Singapore Comics and Animation Society (NUSCAS) is a self-governing student organisation registered with the Registry of Societies of Singapore. As a student organisation handling personal data of members and site visitors, NUSCAS complies with the Singapore <strong>Personal Data Protection Act 2012 (PDPA)</strong>.
          </p>
          <p className="text-text-muted">
            This Privacy Policy explains what personal data we collect, why we collect it, how it is secured, and your rights regarding your personal information when using our website and services.
          </p>
        </section>

        {/* Section 2 */}
        <section className="p-6 sm:p-8 space-y-4">
          <h2 className="text-base font-bold text-text uppercase tracking-wider">
            2. Personal Data We Collect & Purpose
          </h2>
          <p>
            We collect only the minimum necessary information required to operate our member portal, publish content, and manage club activities:
          </p>
          
          <div className="overflow-x-auto border border-border/80 my-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-background border-b border-border text-text font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Data Collected</th>
                  <th className="py-3 px-4">Target Group</th>
                  <th className="py-3 px-4">Purpose</th>
                  <th className="py-3 px-4">Retention Period</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-text-muted">
                <tr className="hover:bg-background/40 transition-colors">
                  <td className="py-3 px-4 font-medium text-text">Email Address</td>
                  <td className="py-3 px-4">Members</td>
                  <td className="py-3 px-4">Account authentication & transactional notices</td>
                  <td className="py-3 px-4">Until account deletion</td>
                </tr>
                <tr className="hover:bg-background/40 transition-colors">
                  <td className="py-3 px-4 font-medium text-text">Display Name</td>
                  <td className="py-3 px-4">Members</td>
                  <td className="py-3 px-4">Attribution on public articles & member profile</td>
                  <td className="py-3 px-4">Until account deletion</td>
                </tr>
                <tr className="hover:bg-background/40 transition-colors">
                  <td className="py-3 px-4 font-medium text-text">Telegram User ID</td>
                  <td className="py-3 px-4">Members (Optional)</td>
                  <td className="py-3 px-4">Account linking with NUSCAS Telegram bot</td>
                  <td className="py-3 px-4">Until member unlinks account</td>
                </tr>
                <tr className="hover:bg-background/40 transition-colors">
                  <td className="py-3 px-4 font-medium text-text">Rating Scores & Notes</td>
                  <td className="py-3 px-4">Members</td>
                  <td className="py-3 px-4">Computing public aggregates & personal score log</td>
                  <td className="py-3 px-4">Until member deletes rating</td>
                </tr>
                <tr className="hover:bg-background/40 transition-colors">
                  <td className="py-3 px-4 font-medium text-text">Article Drafts</td>
                  <td className="py-3 px-4">Members</td>
                  <td className="py-3 px-4">Article submission & publishing workflow</td>
                  <td className="py-3 px-4">Until published or rejected</td>
                </tr>
                <tr className="hover:bg-background/40 transition-colors">
                  <td className="py-3 px-4 font-medium text-text">IP Address & Access Logs</td>
                  <td className="py-3 px-4">All Visitors</td>
                  <td className="py-3 px-4">Security, rate limiting & server analytics</td>
                  <td className="py-3 px-4">30 days (Vercel standard log retention)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-background border-l-2 border-accent text-xs text-text-muted">
            <strong className="text-text">Data Not Collected:</strong> NUSCAS does <u>not</u> collect real names, student matriculation numbers (student IDs), phone numbers, or physical addresses.
          </div>
        </section>

        {/* Section 3 */}
        <section className="p-6 sm:p-8 space-y-3">
          <h2 className="text-base font-bold text-text uppercase tracking-wider">
            3. Authentication & Identity Verification
          </h2>
          <p>
            We use <strong>Google OAuth</strong> as our primary sign-in method to provide secure, single-click login without storing passwords.
          </p>
          <p className="text-text-muted">
            Google acts solely as an identity verifier to confirm ownership of your Google account and share your email address and display name. Personal data stored on our platform is housed securely within our database infrastructure (Supabase) and is not shared back to Google or sold to third parties.
          </p>
        </section>

        {/* Section 4 */}
        <section className="p-6 sm:p-8 space-y-3">
          <h2 className="text-base font-bold text-text uppercase tracking-wider">
            4. Ratings Privacy & Aggregation Safeguards
          </h2>
          <p>
            Member privacy in the rating system is strictly guarded:
          </p>
          <ul className="list-disc list-inside space-y-2 text-text-muted pl-2">
            <li><strong>No Public Individual Scores:</strong> Individual scores and rating notes are private to your account and never exposed on public API endpoints or pages.</li>
            <li><strong>Three-Rater Minimum:</strong> A title must be rated by at least three (3) distinct members before an aggregate score is displayed publicly. This prevents reverse-engineering of individual member scores on sparse titles.</li>
            <li><strong>Database Enforced Security:</strong> Row-Level Security (RLS) is enforced directly at the database level to ensure member data isolation.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="p-6 sm:p-8 space-y-3">
          <h2 className="text-base font-bold text-text uppercase tracking-wider">
            5. Artwork & Content Consent
          </h2>
          <p>
            All member-created artwork showcased in the NUSCAS Art Gallery is uploaded with recorded artist consent. Artists are credited using their chosen display name.
          </p>
          <p className="text-text-muted">
            <strong>Takedown Policy:</strong> Artists may request removal of their artwork from the gallery at any time, for any reason. Takedown requests are processed by the committee within seven (7) days, upon which the image files are permanently deleted from storage.
          </p>
        </section>

        {/* Section 6 */}
        <section className="p-6 sm:p-8 space-y-3">
          <h2 className="text-base font-bold text-text uppercase tracking-wider">
            6. Your Data Protection Rights
          </h2>
          <p>
            Under the Singapore PDPA, members have the right to request access to or deletion of their personal data stored by NUSCAS:
          </p>
          <ul className="list-disc list-inside space-y-2 text-text-muted pl-2">
            <li><strong>Account Deletion:</strong> You may request full account deletion at any time by contacting an administrator. Deletion requests will be fulfilled within thirty (30) days.</li>
            <li><strong>Public Article Attribution:</strong> Upon account deletion, published articles attributed to your display name will have author attribution updated to <em>&quot;Former Member&quot;</em> to preserve public contributions while disassociating your identity.</li>
            <li><strong>Telegram Unlinking:</strong> You can disconnect your Telegram user ID at any time via the account settings page or by sending <code>/unlink</code> to the NUSCAS Telegram bot.</li>
          </ul>
        </section>

        {/* Section 7 */}
        <section className="p-6 sm:p-8 space-y-3">
          <h2 className="text-base font-bold text-text uppercase tracking-wider">
            7. Contact Information
          </h2>
          <p>
            If you have questions regarding this Privacy Policy or wish to submit a data protection / deletion request, please reach out to the NUSCAS Executive Committee:
          </p>
          <p className="font-semibold text-accent">
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=nuscomicssoc@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline transition-colors"
            >
              nuscomicssoc@gmail.com
            </a>
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
