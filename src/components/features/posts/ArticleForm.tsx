'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import dynamic from 'next/dynamic'
import Image from 'next/image'

const RichTextEditor = dynamic(
  () => import('./RichTextEditor'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full min-h-[400px] border border-border bg-surface animate-pulse flex flex-col">
        <div className="h-10 bg-neutral-100 border-b border-border w-full flex items-center px-4 gap-2">
          <div className="h-5 w-16 bg-neutral-200 animate-pulse" />
          <div className="h-5 w-24 bg-neutral-200 animate-pulse" />
        </div>
        <div className="p-6 flex-grow space-y-3">
          <div className="h-4 bg-neutral-200 w-1/3 animate-pulse" />
          <div className="h-4 bg-neutral-200 w-full animate-pulse" />
          <div className="h-4 bg-neutral-200 w-5/6 animate-pulse" />
        </div>
      </div>
    )
  }
)

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
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const [imageSource, setImageSource] = useState<'upload' | 'url'>(initialData?.cover_image_key ? 'url' : 'upload')
  const [urlInput, setUrlInput] = useState(initialData?.cover_image_key || '')

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadProgress('Compressing & uploading...')
    setError(null)

    try {
      // Compress file client-side using canvas WebP conversion
      const { compressImageClient } = await import('@/lib/image-client')
      const compressedFile = await compressImageClient(file)

      const formData = new FormData()
      formData.append('file', compressedFile)
      formData.append('folder', 'posts')

      const res = await fetch('/api/uploads/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload image')
      }

      setCoverImageKey(data.url)
      setUploadProgress(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload cover image')
      setUploadProgress(null)
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveCover = () => {
    setCoverImageKey('')
    setUrlInput('')
    setUploadProgress(null)
  }

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
        <div className="p-4 border border-red-200 bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wide">
          {error}
        </div>
      )}

      {/* Tabs Selector for mobile screen (Write vs Preview) */}
      <div className="flex lg:hidden items-center gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('write')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider ${
            activeTab === 'write' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-text-muted'
          }`}
        >
          Write
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider ${
            activeTab === 'preview' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-text-muted'
          }`}
        >
          Preview
        </button>
      </div>

      {/* Editor Split-pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start min-h-[500px]">
        
        {/* Left Column: Title & WYSIWYG Editor */}
        <div className={`flex flex-col space-y-4 ${activeTab === 'write' ? 'flex' : 'hidden lg:flex'}`}>
          
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
              className="w-full px-4 py-3 border border-border bg-surface text-sm focus:outline-none focus:border-accent font-bold text-neutral-800"
              required
            />
          </div>

          {/* Mobile-only Category & Cover Image Grid */}
          <div className="block lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Category (Mobile) */}
            <div>
              <label htmlFor="article-type-mobile" className="block text-xs font-black uppercase tracking-wider text-text-muted mb-2">
                Category
              </label>
              <select
                id="article-type-mobile"
                value={type}
                onChange={(e) => setType(e.target.value as 'news' | 'review' | 'essay' | 'interview')}
                className="w-full px-4 py-3 border border-border bg-surface text-sm focus:outline-none focus:border-accent font-bold text-neutral-700 appearance-none animate-none"
              >
                <option value="news">News</option>
                <option value="review">Review</option>
                <option value="essay">Essay</option>
                <option value="interview">Interview</option>
              </select>
            </div>

            {/* Cover Image (Mobile) */}
            <div className="flex flex-col space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-text-muted">
                Cover Image
              </label>
              {coverImageKey ? (
                <div className="relative h-28 w-full border border-border bg-neutral-100 overflow-hidden group">
                  <Image 
                    fill 
                    unoptimized 
                    src={coverImageKey} 
                    alt="Cover image preview" 
                    className="object-cover" 
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={handleRemoveCover}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] uppercase tracking-wider transition-colors shadow-sm"
                    >
                      Remove Cover
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col space-y-2">
                  <div className="flex bg-neutral-100 p-1 border border-border max-w-xs">
                    <button
                      type="button"
                      onClick={() => setImageSource('upload')}
                      className={`flex-1 py-1 text-[10px] font-black uppercase tracking-wider transition-all ${
                        imageSource === 'upload'
                          ? 'bg-white text-neutral-900 shadow-sm'
                          : 'text-neutral-500 hover:text-neutral-900'
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageSource('url')}
                      className={`flex-1 py-1 text-[10px] font-black uppercase tracking-wider transition-all ${
                        imageSource === 'url'
                          ? 'bg-white text-neutral-900 shadow-sm'
                          : 'text-neutral-500 hover:text-neutral-900'
                      }`}
                    >
                      Image URL
                    </button>
                  </div>

                  {imageSource === 'upload' ? (
                    <div className="border border-dashed border-border p-3 bg-surface flex flex-col items-center justify-center text-center hover:border-accent transition-colors relative min-h-[90px]">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      />
                      <svg className="w-5 h-5 text-neutral-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-[10px] font-semibold text-neutral-700">
                        {uploading ? uploadProgress : 'Click or drag image to upload'}
                      </p>
                      <p className="text-[8px] text-neutral-400 mt-0.5">
                        Supports JPEG, PNG, WEBP, GIF up to 10MB
                      </p>
                    </div>
                  ) : (
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => {
                        setUrlInput(e.target.value)
                        setCoverImageKey(e.target.value)
                      }}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 border border-border bg-surface text-xs focus:outline-none focus:border-accent text-neutral-700 font-bold"
                    />
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Rich Text Editor */}
          <div className="flex-grow flex flex-col">
            <label htmlFor="article-content" className="block text-xs font-black uppercase tracking-wider text-text-muted mb-2">
              Article Content (WYSIWYG Editor)
            </label>
            <RichTextEditor
              markdown={contentMdx}
              onChange={setContentMdx}
            />
          </div>

          {/* Action buttons on desktop (aligned left/down) */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-border/80">
            {/* Draft Action */}
            {(!initialData || initialData.status === 'draft') && (
              <button
                type="button"
                disabled={loading || uploading}
                onClick={() => handleSubmit('draft')}
                className="px-5 py-3 border border-border bg-white hover:bg-neutral-50 text-neutral-800 font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Draft'}
              </button>
            )}

            {/* Review Action */}
            {(!initialData || initialData.status === 'draft' || initialData.status === 'pending_review') && (
              <button
                type="button"
                disabled={loading || uploading}
                onClick={() => handleSubmit('pending_review')}
                className="px-5 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit for Review'}
              </button>
            )}

            {/* Direct Publish Option (Committee/Admin Only) */}
            {showPublishOption && (
              <button
                type="button"
                disabled={loading || uploading}
                onClick={() => handleSubmit('published')}
                className="px-5 py-3 bg-accent hover:bg-accent-hover text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95 disabled:opacity-50"
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
              className="px-5 py-3 text-text-muted hover:text-neutral-800 font-bold text-xs uppercase tracking-wider transition-colors ml-auto"
            >
              Cancel
            </button>
          </div>

        </div>

        {/* Right Column: Metadata & Live Preview */}
        <div className={`flex flex-col space-y-4 ${activeTab === 'preview' ? 'flex' : 'hidden lg:flex'}`}>
          
          {/* Desktop-only Category & Cover Image Grid */}
          <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Category (Desktop) */}
            <div>
              <label htmlFor="article-type-desktop" className="block text-xs font-black uppercase tracking-wider text-text-muted mb-2">
                Category
              </label>
              <select
                id="article-type-desktop"
                value={type}
                onChange={(e) => setType(e.target.value as 'news' | 'review' | 'essay' | 'interview')}
                className="w-full px-4 py-3 border border-border bg-surface text-sm focus:outline-none focus:border-accent font-bold text-neutral-700 appearance-none animate-none"
              >
                <option value="news">News</option>
                <option value="review">Review</option>
                <option value="essay">Essay</option>
                <option value="interview">Interview</option>
              </select>
            </div>

            {/* Cover Image (Desktop) */}
            <div className="flex flex-col space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-text-muted">
                Cover Image
              </label>
              {coverImageKey ? (
                <div className="relative h-28 w-full border border-border bg-neutral-100 overflow-hidden group">
                  <Image 
                    fill 
                    unoptimized 
                    src={coverImageKey} 
                    alt="Cover image preview" 
                    className="object-cover" 
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={handleRemoveCover}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] uppercase tracking-wider transition-colors shadow-sm"
                    >
                      Remove Cover
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col space-y-2">
                  <div className="flex bg-neutral-100 p-1 border border-border max-w-xs">
                    <button
                      type="button"
                      onClick={() => setImageSource('upload')}
                      className={`flex-1 py-1 text-[10px] font-black uppercase tracking-wider transition-all ${
                        imageSource === 'upload'
                          ? 'bg-white text-neutral-900 shadow-sm'
                          : 'text-neutral-500 hover:text-neutral-900'
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageSource('url')}
                      className={`flex-1 py-1 text-[10px] font-black uppercase tracking-wider transition-all ${
                        imageSource === 'url'
                          ? 'bg-white text-neutral-900 shadow-sm'
                          : 'text-neutral-500 hover:text-neutral-900'
                      }`}
                    >
                      Image URL
                    </button>
                  </div>

                  {imageSource === 'upload' ? (
                    <div className="border border-dashed border-border p-3 bg-surface flex flex-col items-center justify-center text-center hover:border-accent transition-colors relative min-h-[90px]">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      />
                      <svg className="w-5 h-5 text-neutral-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-[10px] font-semibold text-neutral-700">
                        {uploading ? uploadProgress : 'Click or drag image to upload'}
                      </p>
                      <p className="text-[8px] text-neutral-400 mt-0.5">
                        Supports JPEG, PNG, WEBP, GIF up to 10MB
                      </p>
                    </div>
                  ) : (
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => {
                        setUrlInput(e.target.value)
                        setCoverImageKey(e.target.value)
                      }}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 border border-border bg-surface text-xs focus:outline-none focus:border-accent text-neutral-700 font-bold"
                    />
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Live MDX Preview */}
          <div className="flex flex-col border border-border bg-neutral-50/60 p-6 overflow-y-auto max-h-[600px] flex-grow min-h-[400px]">
            <div className="border-b border-border/80 pb-3 mb-4 flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest font-black text-text-muted">Live Preview</span>
              <span className="text-[10px] bg-neutral-200 text-neutral-600 px-2 py-0.5 font-mono">MDX Mode</span>
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
    </div>
  )
}
