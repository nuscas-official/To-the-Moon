'use client'

import { useState } from 'react'
import { generateInviteAction, revokeInviteAction } from '@/server/actions/invites'

interface InviteToken {
  id: string
  token: string
  generated_at: string
  expires_at: string
  used_at: string | null
  revoked_at: string | null
  generator?: { display_name: string }
  redeemer?: { display_name: string; email: string }
}

interface AdminInvitesClientProps {
  initialInvites: InviteToken[]
}

export default function AdminInvitesClient({ initialInvites }: AdminInvitesClientProps) {
  const [invites, setInvites] = useState<InviteToken[]>(initialInvites)
  const [newInviteUrl, setNewInviteUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerateInvite = async () => {
    setIsLoading(true)
    setError(null)
    setNewInviteUrl(null)
    setCopied(false)

    const result = await generateInviteAction()

    if (result.success && result.token) {
      const fullUrl = `${window.location.origin}/join?token=${result.token}`
      setNewInviteUrl(fullUrl)
      
      // Auto-copy to clipboard
      try {
        await navigator.clipboard.writeText(fullUrl)
        setCopied(true)
      } catch (err) {
        console.error('Clipboard copy failed:', err)
      }

      // Add to local state (optimistic or fetched)
      // Since it's a new invite, let's create a local item
      const newItem: InviteToken = {
        id: Math.random().toString(), // Temp ID for list rendering until refetch
        token: result.token,
        generated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
        used_at: null,
        revoked_at: null,
        generator: { display_name: 'You' }
      }
      setInvites((prev) => [newItem, ...prev])
    } else {
      setError(result.error || 'Failed to generate invite token.')
    }
    setIsLoading(false)
  }

  const handleRevokeInvite = async (id: string) => {
    setProcessingId(id)
    setError(null)

    const result = await revokeInviteAction(id)

    if (result.success) {
      setInvites((prev) =>
        prev.map((inv) => (inv.id === id ? { ...inv, revoked_at: new Date().toISOString() } : inv))
      )
    } else {
      setError(result.error || 'Failed to revoke invite token.')
    }
    setProcessingId(null)
  }

  const getStatus = (invite: InviteToken) => {
    if (invite.revoked_at) return { text: 'Revoked', style: 'bg-red-50 text-red-700 border-red-200' }
    if (invite.used_at) return { text: 'Used', style: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
    if (new Date(invite.expires_at) < new Date()) return { text: 'Expired', style: 'bg-amber-50 text-amber-700 border-amber-200' }
    return { text: 'Pending', style: 'bg-blue-50 text-blue-700 border-blue-200' }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 text-xs font-semibold text-red-600 animate-fade-in flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">×</button>
        </div>
      )}

      {/* Action panel to generate invites */}
      <div className="p-6 border border-border bg-surface shadow-sm fanzine-dot-grid relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-accent" />
        
        <h3 className="text-lg font-black text-neutral-900 tracking-tight">Generate Registration Invitation</h3>
        <p className="text-xs text-text-muted mt-1 max-w-xl">
          Invite links are single-use and automatically expire after 72 hours. Generating a link will create a unique cryptographically secure token.
        </p>

        <div className="mt-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          <button
            onClick={handleGenerateInvite}
            disabled={isLoading}
            className="rounded-none bg-accent hover:bg-accent-hover disabled:bg-neutral-200 text-white disabled:text-neutral-500 font-bold text-xs uppercase tracking-wider px-6 py-3.5 shadow-sm active:scale-95 disabled:scale-100 transition-all flex items-center justify-center gap-1.5"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating...
              </>
            ) : (
              'Generate Invite Link'
            )}
          </button>

          {newInviteUrl && (
            <div className="flex-1 flex gap-2 items-center rounded-none border border-emerald-200 bg-emerald-50/50 p-2 pl-4 animate-fade-in">
              <input
                type="text"
                readOnly
                value={newInviteUrl}
                className="flex-1 bg-transparent text-xs text-emerald-800 font-mono font-bold focus:outline-none overflow-hidden select-all"
              />
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(newInviteUrl)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                }}
                className="rounded-none bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-wider px-3.5 py-2 shadow-sm transition-all"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Invite Links Table */}
      <div className="border border-border bg-surface shadow-sm overflow-hidden fanzine-dot-grid">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-slate-50/50">
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-extrabold text-neutral-500">Token</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-extrabold text-neutral-500">Generated By</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-extrabold text-neutral-500">Status</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-extrabold text-neutral-500">Expires At</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-extrabold text-neutral-500">Redeemed By</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-extrabold text-neutral-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {invites.map((invite) => {
                const status = getStatus(invite)
                const isPending = status.text === 'Pending'
                const isProcessing = processingId === invite.id

                return (
                  <tr key={invite.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-neutral-900 font-bold max-w-[150px] truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate" title={invite.token}>{invite.token}</span>
                        <button
                          onClick={() => {
                            const url = `${window.location.origin}/join?token=${invite.token}`
                            navigator.clipboard.writeText(url)
                          }}
                          className="text-text-muted hover:text-neutral-900 transition-colors"
                          title="Copy Link"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-muted">
                      {invite.generator?.display_name || 'System'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-none px-2 py-0.5 text-xs font-semibold border ${status.style}`}>
                        {status.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-text-muted">
                      {new Date(invite.expires_at).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {invite.used_at && invite.redeemer ? (
                        <div>
                          <span className="font-bold text-neutral-800">{invite.redeemer.display_name}</span>
                          <span className="block text-[10px] text-text-muted">{invite.redeemer.email}</span>
                        </div>
                      ) : invite.used_at ? (
                        <span className="text-text-muted text-xs">Redeemed</span>
                      ) : (
                        <span className="text-text-muted/50 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isPending && (
                        <button
                          onClick={() => handleRevokeInvite(invite.id)}
                          disabled={isProcessing}
                          className="rounded-none bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold text-xs uppercase tracking-wider px-3 py-1.5 transition-all active:scale-95 disabled:scale-100 disabled:opacity-50"
                        >
                          {isProcessing ? 'Revoking...' : 'Revoke'}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
              {invites.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-text-muted">
                    No invite tokens found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
