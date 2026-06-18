import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/supabase/role'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AdminPostTable from '@/components/features/admin/AdminPostTable'

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

export default async function AdminPostsDashboard() {
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

  // 3. Query all posts from all authors
  const { data: posts, error: fetchError } = await supabase
    .from('posts')
    .select('id, title, slug, type, status, created_at, author:users(display_name)')
    .order('created_at', { ascending: false })

  if (fetchError) {
    console.error('Error fetching admin posts:', fetchError)
  }

  const allPosts = (posts as unknown as Post[]) || []

  return (
    <div className="w-full max-w-7xl mx-auto py-6 animate-fade-in text-left">
      
      {/* Header */}
      <div className="border-b border-border pb-6 mb-8">
        <h1 className="text-3xl font-black tracking-tight text-neutral-900">
          Committee Content Dashboard
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Moderate member submissions, edit any post, and direct-publish news or reviews.
        </p>
      </div>

      {/* Admin Sub-navigation Tabs */}
      <div className="flex border-b border-border mb-6 overflow-x-auto whitespace-nowrap">
        <Link
          href="/admin/posts"
          className="pb-3 px-4 text-xs uppercase tracking-wider font-extrabold border-b-2 transition-all border-accent text-accent"
        >
          Manage Posts
        </Link>
        <Link
          href="/admin/events"
          className="pb-3 px-4 text-xs uppercase tracking-wider font-extrabold border-b-2 transition-all border-transparent text-text-muted hover:text-neutral-700"
        >
          Manage Events
        </Link>
        <Link
          href="/admin/gallery"
          className="pb-3 px-4 text-xs uppercase tracking-wider font-extrabold border-b-2 transition-all border-transparent text-text-muted hover:text-neutral-700"
        >
          Manage Gallery
        </Link>
        {role === 'admin' && (
          <>
            <Link
              href="/admin/members"
              className="pb-3 px-4 text-xs uppercase tracking-wider font-extrabold border-b-2 transition-all border-transparent text-text-muted hover:text-neutral-700"
            >
              Manage Members
            </Link>
            <Link
              href="/admin/members/invites"
              className="pb-3 px-4 text-xs uppercase tracking-wider font-extrabold border-b-2 transition-all border-transparent text-text-muted hover:text-neutral-700"
            >
              Manage Invites
            </Link>
          </>
        )}
      </div>

      {/* Admin Post Table client component */}
      <AdminPostTable initialPosts={allPosts} />

    </div>
  )
}
