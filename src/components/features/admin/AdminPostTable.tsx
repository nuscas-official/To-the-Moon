'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { moderateArticleAction } from '@/server/actions/blog'

interface Post {
  id: string;
  title: string;
  slug: string;
  type: string;
  status: 'draft' | 'pending_review' | 'published' | 'archived';
  created_at: string;
  author?: {
    display_name: string;
  };
}

interface AdminPostTableProps {
  initialPosts: Post[]
}

export default function AdminPostTable({ initialPosts }: AdminPostTableProps) {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleAction = async (id: string, action: 'publish' | 'reject' | 'archive' | 'delete') => {
    setLoadingId(id)
    try {
      const result = await moderateArticleAction(id, action, action === 'reject' ? rejectReason : undefined)
      if (result.success) {
        // Optimistic state update or refresh page
        if (action === 'delete') {
          setPosts(prev => prev.filter(p => p.id !== id))
        } else {
          setPosts(prev => prev.map(p => {
            if (p.id === id) {
              const updatedStatusMap: Record<'publish' | 'reject' | 'archive', 'draft' | 'pending_review' | 'published' | 'archived'> = {
                publish: 'published',
                reject: 'draft',
                archive: 'archived',
              }
              return { ...p, status: updatedStatusMap[action] || p.status }
            }
            return p
          }))
        }
        setRejectId(null)
        setRejectReason('')
        router.refresh()
      } else {
        alert(result.error || 'Action failed.')
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setLoadingId(null)
    }
  }

  const filteredPosts = posts.filter(post => {
    if (filterStatus === 'all') return true
    return post.status === filterStatus
  })

  return (
    <div className="w-full space-y-6">
      
      {/* Filtering Actions and New Post Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-border pb-4">
        
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['all', 'draft', 'pending_review', 'published', 'archived'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-none text-xs font-bold uppercase tracking-wider transition-all ${
                filterStatus === status 
                  ? 'bg-neutral-900 text-white' 
                  : 'bg-neutral-100 hover:bg-neutral-200 text-text-muted'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>

        <Link
          href="/admin/posts/new"
          className="px-5 py-2.5 rounded-none bg-accent hover:bg-accent-hover text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm active:scale-95 text-center"
        >
          + Create New Post
        </Link>

      </div>

      {/* Reject Reason Dialog Modal Popup */}
      {rejectId && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] bg-neutral-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border p-6 max-w-md w-full space-y-4 shadow-xl rounded-none">
            <h3 className="text-lg font-black text-neutral-900">Reject Article Submission</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Provide a constructive reason for rejecting this draft. The article status will revert to &ldquo;Draft&rdquo; so the member can revise and re-submit.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Please revise your review format to separate visual novel descriptions from character ratings..."
              rows={4}
              className="w-full p-3 border border-border text-sm focus:outline-none focus:border-accent text-neutral-800 rounded-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectId(null)}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-text-muted hover:text-neutral-850"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleAction(rejectId, 'reject')}
                disabled={!rejectReason.trim()}
                className="px-4 py-2 rounded-none bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed"
              >
                Reject Draft
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Table */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-neutral-300 bg-neutral-50/50">
          <p className="text-sm text-text-muted font-medium">No posts found matching this status.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-border bg-surface shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 text-[10px] uppercase font-black tracking-widest text-text-muted border-b border-border">
                <th className="p-4 sm:p-5">Title</th>
                <th className="p-4 sm:p-5">Author</th>
                <th className="p-4 sm:p-5">Category</th>
                <th className="p-4 sm:p-5">Status</th>
                <th className="p-4 sm:p-5">Date</th>
                <th className="p-4 sm:p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPosts.map((post) => {
                const date = new Date(post.created_at).toLocaleDateString('en-SG', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
                
                const statusColors: Record<'draft' | 'pending_review' | 'published' | 'archived', string> = {
                  draft: 'bg-neutral-100 text-neutral-700 border-neutral-200',
                  pending_review: 'bg-amber-50 text-amber-700 border-amber-200',
                  published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  archived: 'bg-neutral-100 text-neutral-500 border-neutral-200 opacity-60',
                }

                const isPending = post.status === 'pending_review'
                const isPublished = post.status === 'published'
                const isActionLoading = loadingId === post.id

                return (
                  <tr key={post.id} className="hover:bg-neutral-50/50 transition-colors text-sm text-neutral-800">
                    <td className="p-4 sm:p-5 font-bold text-neutral-900 max-w-xs truncate">
                      <Link href={`/admin/posts/edit/${post.id}`} className="hover:text-accent">
                        {post.title}
                      </Link>
                    </td>
                    <td className="p-4 sm:p-5 text-neutral-600 font-medium">
                      {post.author?.display_name || 'Member'}
                    </td>
                    <td className="p-4 sm:p-5">
                      <span className="text-[10px] uppercase font-black tracking-wider text-accent bg-accent/5 px-2 py-0.5 rounded-none border border-accent/10">
                        {post.type}
                      </span>
                    </td>
                    <td className="p-4 sm:p-5">
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-none border ${statusColors[post.status] || ''}`}>
                        {post.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 sm:p-5 text-xs text-text-muted">
                      {date}
                    </td>
                    <td className="p-4 sm:p-5 text-right space-x-1.5 whitespace-nowrap">
                      {isPending && (
                        <>
                          <button
                            type="button"
                            disabled={isActionLoading}
                            onClick={() => handleAction(post.id, 'publish')}
                            className="px-2.5 py-1.5 rounded-none bg-emerald-600 hover:bg-emerald-505 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-wider disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={isActionLoading}
                            onClick={() => setRejectId(post.id)}
                            className="px-2.5 py-1.5 rounded-none bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] uppercase tracking-wider opacity-60 hover:opacity-100 transition-opacity disabled:opacity-50 disabled:pointer-events-none"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      
                      {isPublished && (
                        <button
                          type="button"
                          disabled={isActionLoading}
                          onClick={() => handleAction(post.id, 'archive')}
                          className="px-2.5 py-1.5 rounded-none bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-[10px] uppercase tracking-wider disabled:opacity-50"
                        >
                          Archive
                        </button>
                      )}

                      <Link
                        href={`/admin/posts/edit/${post.id}`}
                        className="inline-block px-2.5 py-1.5 rounded-none bg-white hover:bg-neutral-50 text-neutral-800 border border-border font-bold text-[10px] uppercase tracking-wider"
                      >
                        Edit
                      </Link>

                      <button
                        type="button"
                        disabled={isActionLoading}
                        onClick={() => {
                          if (confirm('Are you sure you want to permanently delete this article? This action cannot be undone.')) {
                            handleAction(post.id, 'delete')
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-none hover:bg-red-50 text-red-600 font-bold text-[10px] uppercase tracking-wider disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  )
}
