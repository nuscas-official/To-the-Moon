import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/supabase/role'
import { redirect } from 'next/navigation'
import AdminPostTable from '@/components/features/admin/AdminPostTable'
import PageHeader from '@/components/ui/PageHeader'

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
      <PageHeader
        eyebrow="Committee Console"
        title="Content Desk"
        description="Moderate member submissions, edit any post, and direct-publish news or reviews."
        divider
      />

      {/* Admin Post Table client component */}
      <AdminPostTable initialPosts={allPosts} />

    </div>
  )
}
