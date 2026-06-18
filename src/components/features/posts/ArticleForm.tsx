'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'

interface ArticleFormInput {
  title: string;
  type: 'news' | 'review' | 'essay' | 'interview';
  content_mdx: string;
  status: 'draft' | 'pending_review' | 'published';
  cover_image_key?: string | null;
}

interface ArticleFormProps {
  initialData?: {
    id?: string;
    title: string;
    type: 'news' | 'review' | 'essay' | 'interview';
    content_mdx: string;
    status: 'draft' | 'pending_review' | 'published';
    cover_image_key?: string | null;
  };
  showPublishOption: boolean;
  onSave: (data: ArticleFormInput) => Promise<{ success: boolean; error?: string; slug?: string; id?: string }>;
}

export default function ArticleForm({ initialData, showPublishOption, onSave }: ArticleFormProps) {
  const router = useRouter()
  
  const [title, setTitle] = useState(initialData?.title || '')
  const [type, setType] = useState<'news' | 'review' | 'essay' | 'interview'>(initialData?.type || 'news')
  const [contentMdx, setContentMdx] = useState(initialData?.content_mdx || '')
  const [coverImageKey, setCoverImageKey] = useState(initialData?.cover_image_key || '')
  
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (targetStatus: 'draft' | 'pending_review' | 'published') => {
    if (!title.trim()) {
      setError('Title is required.')
      return
    }
    if (!contentMdx.trim()) {
      setError('Content is required.')
      return
    }

    setError(null)
    setLoading(true)

    try {
      const result = await onSave({
        title,
        type,
        content_mdx: contentMdx,
        status: targetStatus,
        cover_image_key: coverImageKey || null,
      })

      if (result.success) {
        if (showPublishOption) {
          router.push('/admin/posts')
        } else {
          router.push('/member/articles')
        }
        router.refresh()
      } else {
        setError(result.error || 'Failed to save article.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      
      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wide">
          {error}
        </div>
      )}

      {/* Editor Split-pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch min-h-[500px]">
        
        {/* Left Pane: Editor Inputs */}
        <div className="flex flex-col space-y-4">
          
          {/* Tabs for mobile screen (Write vs Preview) */}
          <div className="flex lg:hidden items-center gap-2 border-b border-border pb-3">
            <button
              type="button"
              onClick={() => setActiveTab('write')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider ${
                activeTab === 'write' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-text-muted'
              }`}
            >
              Write
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider ${
                activeTab === 'preview' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-text-muted'
              }`}
            >
              Preview
            </button>
          </div>

          <div className={`space-y-4 ${activeTab === 'write' ? 'block' : 'hidden lg:block'}`}>
            
            {/* Title */}
            <div>
              <label htmlFor="article-title" className="block text-xs font-black uppercase tracking-wider text-text-muted mb-2">
                Article Title
              </label>
              <input
                id="article-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a catchy title..."
                className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-accent font-bold text-neutral-800"
                required
              />
            </div>

            {/* Grid for Category Type & Cover Image */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Category */}
              <div>
                <label htmlFor="article-type" className="block text-xs font-black uppercase tracking-wider text-text-muted mb-2">
                  Category
                </label>
                <select
                  id="article-type"
                  value={type}
                  onChange={(e) => setType(e.target.value as 'news' | 'review' | 'essay' | 'interview')}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-accent font-bold text-neutral-700 appearance-none"
                >
                  <option value="news">News</option>
                  <option value="review">Review</option>
                  <option value="essay">Essay</option>
                  <option value="interview">Interview</option>
                </select>
              </div>

              {/* Cover Image Key/URL */}
              <div>
                <label htmlFor="article-cover" className="block text-xs font-black uppercase tracking-wider text-text-muted mb-2">
                  Cover Image URL (Optional)
                </label>
                <input
                  id="article-cover"
                  type="url"
                  value={coverImageKey}
                  onChange={(e) => setCoverImageKey(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-accent text-neutral-700"
                />
              </div>

            </div>

            {/* Raw MDX Body Textarea */}
            <div className="flex-grow flex flex-col">
              <label htmlFor="article-content" className="block text-xs font-black uppercase tracking-wider text-text-muted mb-2">
                Article Content (Supports Markdown / MDX)
              </label>
              <textarea
                id="article-content"
                value={contentMdx}
                onChange={(e) => setContentMdx(e.target.value)}
                placeholder="# Write your article here..."
                rows={15}
                className="w-full flex-grow p-4 rounded-xl border border-border bg-surface text-sm font-mono focus:outline-none focus:border-accent text-neutral-800 leading-relaxed resize-y min-h-[300px]"
                required
              />
            </div>

          </div>

          {/* Action buttons on desktop (aligned left/down) */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-border/80">
            {/* Draft Action */}
            {(!initialData || initialData.status === 'draft') && (
              <button
                type="button"
                disabled={loading}
                onClick={() => handleSubmit('draft')}
                className="px-5 py-3 rounded-xl border border-border bg-white hover:bg-neutral-50 text-neutral-800 font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Draft'}
              </button>
            )}

            {/* Review Action */}
            {(!initialData || initialData.status === 'draft' || initialData.status === 'pending_review') && (
              <button
                type="button"
                disabled={loading}
                onClick={() => handleSubmit('pending_review')}
                className="px-5 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit for Review'}
              </button>
            )}

            {/* Direct Publish Option (Committee/Admin Only) */}
            {showPublishOption && (
              <button
                type="button"
                disabled={loading}
                onClick={() => handleSubmit('published')}
                className="px-5 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Publishing...' : 'Publish Now'}
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (showPublishOption) {
                  router.push('/admin/posts')
                } else {
                  router.push('/member/articles')
                }
              }}
              className="px-5 py-3 rounded-xl text-text-muted hover:text-neutral-800 font-bold text-xs uppercase tracking-wider transition-colors ml-auto"
            >
              Cancel
            </button>
          </div>

        </div>

        {/* Right Pane: Live MDX Preview */}
        <div className={`flex flex-col border border-border bg-neutral-50/60 rounded-2xl p-6 overflow-y-auto max-h-[600px] ${activeTab === 'preview' ? 'block' : 'hidden lg:block'}`}>
          <div className="border-b border-border/80 pb-3 mb-4 flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest font-black text-text-muted">Live Preview</span>
            <span className="text-[10px] bg-neutral-200 text-neutral-600 px-2 py-0.5 rounded font-mono">MDX Mode</span>
          </div>

          <div className="markdown-body w-full flex-grow text-left">
            {contentMdx.trim() ? (
              <ReactMarkdown>{contentMdx}</ReactMarkdown>
            ) : (
              <p className="text-neutral-400 italic text-xs">Start writing on the left to see the rendered preview here...</p>
            )}
          </div>
        </div>

      </div>

    </div>
  )
}
