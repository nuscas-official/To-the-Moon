'use client'

import { useState, useEffect } from 'react'
import { generateTelegramLinkCode, unlinkTelegramAccount } from '@/server/actions/telegram'

interface MemberSettingsClientProps {
  initialTelegramId: number | null
  botUsername: string
}

export default function MemberSettingsClient({
  initialTelegramId,
  botUsername,
}: MemberSettingsClientProps) {
  const [telegramId, setTelegramId] = useState<number | null>(initialTelegramId)
  const [linkCode, setLinkCode] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isUnlinking, setIsUnlinking] = useState(false)
  const [expiresIn, setExpiresIn] = useState<number>(0) // seconds remaining
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Countdown timer for pairing code expiration
  useEffect(() => {
    if (expiresIn <= 0) {
      if (linkCode) {
        setLinkCode(null)
        showFeedback('error', 'The linking code has expired. Please generate a new one.')
      }
      return
    }

    const timer = setInterval(() => {
      setExpiresIn((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [expiresIn, linkCode])

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback(null), 5000)
  }

  const handleGenerateCode = async () => {
    setIsGenerating(true)
    setLinkCode(null)
    setCopied(false)
    try {
      const res = await generateTelegramLinkCode()
      if (res.success && res.code) {
        setLinkCode(res.code)
        setExpiresIn(600) // 10 minutes = 600 seconds
        showFeedback('success', 'Linking code generated successfully!')
      } else {
        showFeedback('error', res.error || 'Failed to generate linking code.')
      }
    } catch {
      showFeedback('error', 'An unexpected error occurred.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleUnlink = async () => {
    if (!confirm('Are you sure you want to unlink your Telegram account? You will no longer be able to submit ratings via the bot.')) {
      return
    }
    setIsUnlinking(true)
    try {
      const res = await unlinkTelegramAccount()
      if (res.success) {
        setTelegramId(null)
        setLinkCode(null)
        setExpiresIn(0)
        showFeedback('success', 'Telegram account unlinked successfully!')
      } else {
        showFeedback('error', res.error || 'Failed to unlink Telegram account.')
      }
    } catch {
      showFeedback('error', 'An unexpected error occurred.')
    } finally {
      setIsUnlinking(false)
    }
  }

  const handleCopyCode = () => {
    if (!linkCode) return
    navigator.clipboard.writeText(linkCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-xl overflow-hidden p-6 sm:p-8 relative transition-all duration-300 hover:shadow-2xl">
      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`absolute top-4 right-4 z-50 p-4 rounded-xl shadow-lg border text-sm font-bold animate-fade-in flex items-center gap-2 transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-800/30 dark:text-emerald-400'
              : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-800/30 dark:text-red-400'
          }`}
        >
          {feedback.type === 'success' ? '✨' : '⚠️'} {feedback.message}
        </div>
      )}

      <div className="flex flex-col gap-6 text-left">
        <div>
          <h2 className="text-xl font-black text-neutral-800 tracking-tight">Telegram Account Integration</h2>
          <p className="text-sm text-text-muted mt-1.5">
            Link your Telegram account to rate visual novels, anime, and manga directly via chat messages.
          </p>
        </div>

        {/* Current status display */}
        {telegramId ? (
          <div className="p-6 rounded-2xl border border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500" />
            <div className="flex items-center gap-4 z-10">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <div>
                <p className="font-extrabold text-neutral-800 text-sm">Linked to Telegram</p>
                <p className="text-xs text-text-muted mt-0.5">ID: <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-700 font-mono text-[10px]">{telegramId}</code></p>
              </div>
            </div>
            <button
              onClick={handleUnlink}
              disabled={isUnlinking}
              className="z-10 px-4 py-2 border border-red-200 text-red-600 font-extrabold text-xs uppercase tracking-wider rounded-xl bg-surface hover:bg-red-50 hover:border-red-300 transition-all active:scale-95 disabled:opacity-50"
            >
              {isUnlinking ? 'Unlinking...' : 'Unlink Account'}
            </button>
          </div>
        ) : (
          <div className="p-6 rounded-2xl border border-dashed border-border bg-neutral-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <span className="relative flex h-3 w-3">
                <span className="relative inline-flex rounded-full h-3 w-3 bg-neutral-400"></span>
              </span>
              <div>
                <p className="font-extrabold text-neutral-700 text-sm">Not Connected</p>
                <p className="text-xs text-text-muted mt-0.5">No Telegram profile linked to your member portal.</p>
              </div>
            </div>
            <button
              onClick={handleGenerateCode}
              disabled={isGenerating}
              className="px-5 py-2.5 bg-gradient-to-r from-accent to-accent-hover text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
            >
              {isGenerating ? 'Generating...' : 'Link Telegram'}
            </button>
          </div>
        )}

        {/* Pairing Code & Directions Section */}
        {linkCode && (
          <div className="border border-border rounded-2xl p-6 bg-surface shadow-md animate-slide-up space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xs uppercase tracking-widest font-black text-neutral-400">Your Pairing Code</h3>
              <span className="text-xs font-black text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full flex items-center gap-1 font-mono">
                ⏱️ {formatTime(expiresIn)}
              </span>
            </div>

            {/* Displaying code */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div
                onClick={handleCopyCode}
                className="flex-grow w-full text-center py-4 bg-neutral-50 hover:bg-neutral-100 active:bg-neutral-200 border border-border rounded-xl cursor-pointer transition-all relative group font-mono text-3xl font-black tracking-[0.2em] text-neutral-800 shadow-inner"
                title="Click to copy pairing code"
              >
                {linkCode}
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                  {copied ? 'Copied!' : 'Copy'}
                </span>
              </div>

              <a
                href={`https://t.me/${botUsername}?start=${linkCode}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-4 bg-[#0088cc] hover:bg-[#0077b5] text-white text-xs uppercase tracking-wider font-extrabold rounded-xl transition-all hover:shadow-lg active:scale-95 text-center flex items-center justify-center gap-2"
              >
                Send to Bot 🚀
              </a>
            </div>

            {/* Instructions */}
            <div className="border-t border-border pt-4 text-xs text-text-muted space-y-2">
              <p className="font-extrabold text-neutral-700">How to pair:</p>
              <ol className="list-decimal list-inside space-y-1.5 font-medium">
                <li>Click the <strong className="text-[#0088cc]">Send to Bot</strong> button above to open Telegram and start the pairing flow.</li>
                <li>Alternatively, open Telegram, search for <code className="bg-neutral-100 px-1 rounded">@{botUsername}</code>, and send the message: <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono">/link {linkCode}</code></li>
                <li>The bot will reply verifying your display name, and your portal settings status will automatically reflect the change.</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
