import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/supabase/role'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ArticleForm from '@/components/features/ArticleForm'
import { createArticleAction } from '@/server/actions/blog'

export default async function AdminNewPostPage() {
  const supabase = createClient()

  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/')
  }

  // 2. Enforce committee or admin role
  const role = await getUserRole(supabase)
  if (role !== 'committee' && role !== 'admin') {
    redirect('/')
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-6 animate-fade-in text-left">
      
      {/* Back Link */}
      <Link 
        href="/admin/posts" 
        className="inline-flex items-center gap-1 text-xs uppercase tracking-wider font-extrabold text-accent hover:text-accent-hover mb-6 group"
      >
        <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Back to Committee Dashboard</span>
      </Link>

      {/* Header */}
      <div className="border-b border-border pb-6 mb-8">
        <h1 className="text-3xl font-black tracking-tight text-neutral-900">
          Create Direct Post
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Compose an article, review, or news. As a committee member, you can publish directly without moderation.
        </p>
      </div>

      {/* Editor Form */}
      <ArticleForm 
        showPublishOption={true}
        onSave={createArticleAction}
      />

    </div>
  )
}
