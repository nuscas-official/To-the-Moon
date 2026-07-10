'use client'

import { useState } from 'react'
import { moderateArticleAction } from '@/server/actions/blog'

export interface PendingPost {
  id: string
  title: string
  slug: string
  type: string
  created_at: string
  author?: {
    display_name: string
  } | null
}

interface PendingModerationFeedProps {
  initialPosts: PendingPost[]
}

export default function PendingModerationFeed({ initialPosts }: PendingModerationFeedProps) {
  const [posts, setPosts] = useState<PendingPost[]>(initialPosts)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback(null), 5000)
  }

  const handleApprove = async (id: string) => {
    setLoadingId(id)
    try {
      const res = await moderateArticleAction(id, 'publish')
      if (res.success) {
        setPosts(posts.filter(p => p.id !== id))
        showFeedback('success', 'Article successfully published!')
      } else {
        showFeedback('error', res.error || 'Failed to approve article.')
      }
    } catch {
      showFeedback('error', 'An unexpected error occurred.')
    } finally {
      setLoadingId(null)
    }
  }

  const handleRejectSubmit = async (id: string) => {
    setLoadingId(id)
    try {
      const res = await moderateArticleAction(id, 'reject', rejectReason.trim() || undefined)
      if (res.success) {
        setPosts(posts.filter(p => p.id !== id))
        setRejectId(null)
        setRejectReason('')
        showFeedback('success', 'Article rejected and reverted to draft.')
      } else {
        showFeedback('error', res.error || 'Failed to reject article.')
      }
    } catch {
      showFeedback('error', 'An unexpected error occurred.')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Toast Feedback */}
      {feedback && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border text-sm font-bold animate-fade-in flex items-center gap-2 ${
          feedback.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <span>
            {feedback.type === 'success' ? (
              <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </span>
          <span>{feedback.message}</span>
        </div>
      )}

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-border rounded-2xl bg-surface text-center">
          <svg className="w-10 h-10 text-neutral-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-sm font-black text-neutral-800">All caught up!</h3>
          <p className="text-xs text-text-muted mt-1">There are no articles pending review.</p>
        </div>
      ) : (
        <div className="divide-y divide-border border border-border bg-surface rounded-2xl overflow-hidden shadow-sm">
          {posts.map((post) => (
            <div key={post.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/50 transition-colors">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase bg-accent/15 text-accent border border-accent/10">
                    {post.type}
                  </span>
                  <span className="text-xs text-text-muted">
                    Submitted by <strong className="text-neutral-700">{post.author?.display_name || 'Member'}</strong>
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-neutral-900 truncate pr-4" title={post.title}>
                  {post.title}
                </h4>
                <p className="text-[10px] text-text-muted">
                  {new Date(post.created_at).toLocaleDateString('en-SG', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              <div className="flex flex-col items-stretch sm:items-end gap-2 flex-shrink-0">
                {rejectId !== post.id ? (
                  <div className="flex gap-2">
                    <button
                      disabled={loadingId !== null}
                      onClick={() => handleApprove(post.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-sm active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      {loadingId === post.id ? (
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      <span>Approve</span>
                    </button>
                    <button
                      disabled={loadingId !== null}
                      onClick={() => {
                        setRejectId(post.id)
                        setRejectReason('')
                      }}
                      className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 disabled:opacity-50 text-neutral-700 text-xs font-black uppercase tracking-wider rounded-xl border border-neutral-200 active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>Reject</span>
                    </button>
                  </div>
                ) : (
                  <div className="w-full sm:w-80 flex flex-col gap-2 p-3 bg-neutral-50 rounded-xl border border-neutral-200 animate-fade-in text-left">
                    <label className="text-[10px] uppercase font-extrabold text-neutral-500">Rejection Reason</label>
                    <input
                      type="text"
                      placeholder="e.g. Please add a cover image..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-accent font-medium text-neutral-800"
                    />
                    <div className="flex gap-2 justify-end mt-1">
                      <button
                        onClick={() => setRejectId(null)}
                        className="px-2.5 py-1.5 text-neutral-500 hover:bg-neutral-200/50 rounded-lg text-xs font-bold transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={loadingId !== null || !rejectReason.trim()}
                        onClick={() => handleRejectSubmit(post.id)}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-sm active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed"
                      >
                        {loadingId === post.id && (
                          <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        )}
                        <span>Confirm Reject</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
