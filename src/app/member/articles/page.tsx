import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/supabase/role'
import { redirect } from 'next/navigation'
import Link from 'next/link'

interface Post {
  id: string;
  title: string;
  slug: string;
  type: string;
  status: 'draft' | 'pending_review' | 'published' | 'archived';
  created_at: string;
  published_at: string | null;
}

export default async function MemberArticlesPage() {
  const supabase = createClient()

  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/')
  }

  // 2. Enforce member role minimum
  const role = await getUserRole(supabase)
  if (!role || (role !== 'member' && role !== 'committee' && role !== 'admin')) {
    redirect('/')
  }

  // 3. Query all posts owned by this user
  const { data: posts, error: fetchError } = await supabase
    .from('posts')
    .select('id, title, slug, type, status, created_at, published_at')
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })

  if (fetchError) {
    console.error('Error fetching member articles:', fetchError)
  }

  const articles = posts as Post[] || []

  // Group by status
  const drafts = articles.filter(p => p.status === 'draft')
  const pending = articles.filter(p => p.status === 'pending_review')
  const published = articles.filter(p => p.status === 'published')
  const archived = articles.filter(p => p.status === 'archived')

  return (
    <div className="w-full max-w-7xl mx-auto py-6 animate-fade-in text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900">
            My Articles
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Write reviews, essays, or news, and submit them for committee approval.
          </p>
        </div>
        
        <Link
          href="/member/articles/new"
          className="px-5 py-2.5 bg-accent text-white font-bold text-xs uppercase tracking-wider hover:bg-accent-hover transition-colors shadow-sm active:scale-95"
        >
          + Write New Article
        </Link>
      </div>

      {/* Member Sub-navigation Tabs */}
      <div className="flex border-b border-border mb-6">
        <Link
          href="/member/articles"
          className="pb-3 px-4 text-xs uppercase tracking-wider font-extrabold border-b-2 transition-all border-accent text-accent bg-accent/[0.04]"
        >
          My Articles
        </Link>
        <Link
          href="/member/ratings"
          className="pb-3 px-4 text-xs uppercase tracking-wider font-extrabold border-b-2 transition-all border-transparent text-text-muted hover:text-accent hover:border-accent/30 hover:bg-accent/[0.02]"
        >
          My Ratings
        </Link>
        <Link
          href="/member/settings"
          className="pb-3 px-4 text-xs uppercase tracking-wider font-extrabold border-b-2 transition-all border-transparent text-text-muted hover:text-accent hover:border-accent/30 hover:bg-accent/[0.02]"
        >
          Settings
        </Link>
      </div>

      <div className="space-y-10">
        
        {/* SECTION 1: Drafts */}
        <div className="space-y-4">
          <h2 className="text-xs uppercase tracking-widest font-black text-neutral-400">
            Drafts ({drafts.length})
          </h2>
          {drafts.length === 0 ? (
            <div className="p-6 text-center = border border-dashed border-neutral-300 text-xs text-text-muted bg-neutral-50/50">
              No drafts. Click the button above to start writing.
            </div>
          ) : (
            <div className="overflow-hidden border border-border bg-surface shadow-sm">
              <div className="divide-y divide-border">
                {drafts.map(post => (
                  <div key={post.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-neutral-800 hover:text-accent transition-colors">
                        <Link href={`/member/articles/edit/${post.id}`}>{post.title}</Link>
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-text-muted mt-1.5 font-medium">
                        <span className="uppercase text-[10px] font-black text-accent bg-accent/10 px-2 py-0.5 border border-accent/20">{post.type}</span>
                        <span>&bull;</span>
                        <span>Saved {new Date(post.created_at).toLocaleDateString('en-SG')}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/member/articles/edit/${post.id}`}
                        className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider transition-colors border border-neutral-900"
                      >
                        Edit Draft
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: Pending Approval */}
        <div className="space-y-4">
          <h2 className="text-xs uppercase tracking-widest font-black text-neutral-400">
            Pending Review ({pending.length})
          </h2>
          {pending.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-neutral-200 text-xs text-text-muted bg-neutral-50/50">
              No articles currently pending review.
            </div>
          ) : (
            <div className="overflow-hidden border border-border bg-surface shadow-sm opacity-90">
              <div className="divide-y divide-border">
                {pending.map(post => (
                  <div key={post.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-neutral-700">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-text-muted mt-1.5 font-medium">
                        <span className="uppercase text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 border border-amber-200">{post.type}</span>
                        <span>&bull;</span>
                        <span>Submitted {new Date(post.created_at).toLocaleDateString('en-SG')}</span>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1">
                      Under Review
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: Published */}
        <div className="space-y-4">
          <h2 className="text-xs uppercase tracking-widest font-black text-neutral-400">
            Published Articles ({published.length})
          </h2>
          {published.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-neutral-200 text-xs text-text-muted bg-neutral-50/50">
              No published articles yet.
            </div>
          ) : (
            <div className="overflow-hidden border border-border bg-surface shadow-sm">
              <div className="divide-y divide-border">
                {published.map(post => {
                  const pDate = post.published_at ? new Date(post.published_at).toLocaleDateString('en-SG') : 'Unknown'
                  return (
                    <div key={post.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-neutral-800 hover:text-accent transition-colors">
                          <Link href={`/blog/${post.slug}`} target="_blank">{post.title}</Link>
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-text-muted mt-1.5 font-medium">
                          <span className="uppercase text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 border border-emerald-200">{post.type}</span>
                          <span>&bull;</span>
                          <span>Published {pDate}</span>
                        </div>
                      </div>
                      
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="px-4 py-2 bg-white hover:bg-neutral-50 text-neutral-800 border border-border font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1"
                      >
                        <span>View Live</span>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </Link>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 4: Archived (If any) */}
        {archived.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xs uppercase tracking-widest font-black text-neutral-400">
              Archived ({archived.length})
            </h2>
            <div className="overflow-hidden border border-border bg-neutral-50/50 shadow-sm opacity-60">
              <div className="divide-y divide-border">
                {archived.map(post => (
                  <div key={post.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-neutral-600">
                        {post.title}
                      </h3>
                      <p className="text-xs text-text-muted mt-1">Archived category: {post.type}</p>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-600 bg-neutral-100 border border-neutral-200 px-2 py-0.5">
                      Archived
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
