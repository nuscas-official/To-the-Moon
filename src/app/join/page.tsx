import { createAdminClient } from '@/lib/supabase/admin'
import JoinForm from '@/components/features/join/JoinForm'
import Link from 'next/link'
import type { Metadata } from 'next'

// Invite-only portal registration, always reached via a one-off token link.
// Nothing here should be indexed, and the token must never leak into a
// search engine's URL index.
export const metadata: Metadata = {
  title: 'Member Registration',
  robots: { index: false, follow: false, nocache: true },
}

interface JoinPageProps {
  searchParams: {
    token?: string
  }
}

export const revalidate = 0 // Run dynamically on every request

export default async function JoinPage({ searchParams }: JoinPageProps) {
  const token = searchParams.token

  if (!token) {
    return (
      <div className="w-full max-w-md mx-auto py-12 px-4">
        <div className="p-6 sm:p-8 rounded-2xl border border-red-200 bg-red-50/50 shadow-sm relative overflow-hidden text-center animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 text-red-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-black text-red-800 tracking-tight">Invite Token Required</h2>
          <p className="text-sm text-red-700/80 mt-2 leading-relaxed">
            Registration to the NUS Anime Club member portal is strictly invite-only. You cannot sign up without a valid invitation link.
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-block rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 shadow-sm active:scale-95 transition-all"
            >
              Go to Home Page
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const adminClient = createAdminClient()

  // Fetch token details
  const { data: inviteToken, error } = await adminClient
    .from('invite_tokens')
    .select('*')
    .eq('token', token)
    .single()

  const now = new Date()
  const isValid =
    !error &&
    inviteToken &&
    !inviteToken.used_at &&
    !inviteToken.revoked_at &&
    new Date(inviteToken.expires_at) > now

  let errorTitle = 'Invalid Invite Link'
  let errorMsg = 'This invite link is invalid, has expired, or has already been used.'

  if (inviteToken) {
    if (inviteToken.revoked_at) {
      errorTitle = 'Invite Revoked'
      errorMsg = 'This invitation link has been revoked by the club administrator.'
    } else if (inviteToken.used_at) {
      errorTitle = 'Link Already Used'
      errorMsg = 'This invitation link has already been redeemed and cannot be reused.'
    } else if (new Date(inviteToken.expires_at) <= now) {
      errorTitle = 'Invite Expired'
      errorMsg = 'This invitation link has expired. Invitation links are only valid for 72 hours.'
    }
  }

  if (!isValid) {
    return (
      <div className="w-full max-w-md mx-auto py-12 px-4">
        <div className="p-6 sm:p-8 rounded-2xl border border-red-200 bg-red-50/50 shadow-sm relative overflow-hidden text-center animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 text-red-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-black text-red-800 tracking-tight">{errorTitle}</h2>
          <p className="text-sm text-red-700/80 mt-2 leading-relaxed">
            {errorMsg}
          </p>
          <p className="text-xs text-red-600/60 mt-4 leading-relaxed">
            Please ask an administrator for a new invite link if you need access.
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-block rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 shadow-sm active:scale-95 transition-all"
            >
              Go to Home Page
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Token is valid! Render the signup form
  return (
    <div className="w-full py-12 px-4">
      <JoinForm token={token} />
    </div>
  )
}
