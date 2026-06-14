'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

interface JoinFormProps {
  token: string
}

export default function JoinForm({ token }: JoinFormProps) {
  const supabase = createClient()
  const [displayName, setDisplayName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!displayName.trim()) {
      setError('Display name is required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Encode both token and chosen display name in the OAuth state param
      const stateParam = `${token}:${encodeURIComponent(displayName.trim())}`

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?state=${encodeURIComponent(stateParam)}`,
        }
      })

      if (oauthError) throw oauthError
    } catch (err) {
      console.error('Google OAuth redirection failed:', err)
      setError(err instanceof Error ? err.message : 'An error occurred during authentication setup.')
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-2xl border border-border bg-surface shadow-sm fanzine-dot-grid relative overflow-hidden text-left animate-fade-in">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-accent" />

      <h2 className="text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-accent animate-pulse" />
        Join NUSCAS
      </h2>
      <p className="text-xs text-text-muted mt-1">
        You have been invited to join the NUS Anime Club member portal!
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-600 font-medium leading-relaxed">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="displayName" className="block text-xs uppercase tracking-wider font-extrabold text-neutral-700 mb-1.5">
            Choose Your Display Name
          </label>
          <input
            id="displayName"
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. AnimeEnthusiast"
            disabled={isLoading}
            maxLength={50}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent disabled:opacity-50 transition-all"
          />
          <p className="text-[10px] text-text-muted mt-1.5 leading-relaxed">
            Other club members will see this name. Your email address and login credentials will be securely linked via Google OAuth.
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading || !displayName.trim()}
          className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-neutral-200 text-white disabled:text-neutral-500 font-bold text-sm uppercase tracking-wider py-3.5 transition-all shadow-sm active:scale-[0.98] disabled:scale-100 disabled:opacity-80"
        >
          {isLoading ? (
            <span className="flex items-center gap-1.5">
              <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Redirecting to Google...
            </span>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Register with Google
            </>
          )}
        </button>
      </form>
    </div>
  )
}
