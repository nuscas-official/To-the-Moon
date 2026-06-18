import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/supabase/role'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ArticleForm from '@/components/features/posts/ArticleForm'
import { updateArticleAction } from '@/server/actions/blog'

interface EditArticlePageProps {
  params: {
    id: string;
  }
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const supabase = createClient()

  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/')
  }

  // 2. Enforce member role
  const role = await getUserRole(supabase)
  if (!role || (role !== 'member' && role !== 'committee' && role !== 'admin')) {
    redirect('/')
  }

  // 3. Fetch article to edit
  const { data: post, error: fetchError } = await supabase
    .from('posts')
    .select('*')
    .eq('id', params.id)
    .single()

  if (fetchError || !post) {
    redirect('/member/articles')
  }

  // 4. Enforce member edits criteria: must be owner, and status must be 'draft'
  if (post.author_id !== user.id) {
    redirect('/member/articles')
  }

  if (post.status !== 'draft') {
    redirect('/member/articles')
  }

  // Bind the post ID to the update action
  const boundUpdateAction = updateArticleAction.bind(null, params.id)

  const initialData = {
    id: post.id,
    title: post.title,
    type: post.type as 'news' | 'review' | 'essay' | 'interview',
    content_mdx: post.content_mdx,
    status: post.status as 'draft' | 'pending_review' | 'published',
    cover_image_key: post.cover_image_key,
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-6 animate-fade-in text-left">
      
      {/* Back to Dashboard Link */}
      <Link 
        href="/member/articles" 
        className="inline-flex items-center gap-1 text-xs uppercase tracking-wider font-extrabold text-accent hover:text-accent-hover mb-6 group"
      >
        <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Back to Articles</span>
      </Link>

      {/* Header */}
      <div className="border-b border-border pb-6 mb-8">
        <h1 className="text-3xl font-black tracking-tight text-neutral-900">
          Edit Article Draft
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Modify your article draft. Submitting will send it to the committee for review.
        </p>
      </div>

      {/* Editor Form */}
      <ArticleForm 
        initialData={initialData}
        showPublishOption={false}
        onSave={boundUpdateAction}
      />

    </div>
  )
}
