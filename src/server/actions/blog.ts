'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUserRole } from '@/lib/supabase/role'
import { generateUniqueSlug } from '@/lib/utils/slug'
import { revalidatePath } from 'next/cache'

interface ArticleInput {
  title: string;
  type: 'news' | 'review' | 'essay' | 'interview';
  content_mdx: string;
  status: 'draft' | 'pending_review' | 'published';
  cover_image_key?: string | null;
}

/**
 * Server Action to create a new article.
 * Enforces server-side authentication and role-based validation.
 */
export async function createArticleAction(input: ArticleInput) {
  const supabase = createClient()
  
  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'You must be signed in to perform this action.' }
  }

  // 2. Validate user role
  const role = await getUserRole(supabase)
  if (!role || (role !== 'member' && role !== 'committee' && role !== 'admin')) {
    return { success: false, error: 'Unauthorized: Insufficient privileges.' }
  }

  // 3. Validate input
  if (!input.title.trim() || !input.content_mdx.trim()) {
    return { success: false, error: 'Title and content cannot be empty.' }
  }

  // 4. Force owner checks for members
  let targetStatus: 'draft' | 'pending_review' | 'published' = input.status
  if (role === 'member') {
    // Members cannot publish directly
    if (targetStatus === 'published') {
      targetStatus = 'pending_review'
    }
  }

  try {
    // 5. Generate unique slug
    const slug = await generateUniqueSlug(supabase, 'posts', input.title)

    // 6. Insert post
    const { data: post, error: insertError } = await supabase
      .from('posts')
      .insert({
        author_id: user.id,
        title: input.title.trim(),
        slug,
        content_mdx: input.content_mdx,
        type: input.type,
        status: targetStatus,
        cover_image_key: input.cover_image_key || null,
        published_at: targetStatus === 'published' ? new Date().toISOString() : null,
      })
      .select('id, slug')
      .single()

    if (insertError) {
      console.error('Error inserting post:', insertError)
      return { success: false, error: insertError.message }
    }

    revalidatePath('/blog')
    revalidatePath('/member/articles')
    if (role === 'committee' || role === 'admin') {
      revalidatePath('/admin/posts')
    }

    return { success: true, slug: post.slug, id: post.id }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'An unexpected error occurred.' }
  }
}

/**
 * Server Action to update an existing article.
 * Enforces RLS criteria and checks roles.
 */
export async function updateArticleAction(id: string, input: Partial<ArticleInput>) {
  const supabase = createClient()

  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'You must be signed in to perform this action.' }
  }

  // 2. Validate user role
  const role = await getUserRole(supabase)
  if (!role) {
    return { success: false, error: 'Unauthorized.' }
  }

  try {
    // Fetch original post details
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('author_id, status, slug, title')
      .eq('id', id)
      .single()

    if (fetchError || !post) {
      return { success: false, error: 'Article not found.' }
    }

    // Role check and status checks
    if (role === 'member') {
      // Members can only edit their own posts
      if (post.author_id !== user.id) {
        return { success: false, error: 'You are not authorized to edit this article.' }
      }
      // Members can only edit posts that are in 'draft' status
      if (post.status !== 'draft') {
        return { success: false, error: 'Only drafts can be edited.' }
      }
      // Members cannot change status to 'published'
      if (input.status === 'published') {
        input.status = 'pending_review'
      }
    }

    // Regenerate slug if title changes
    let slug = post.slug
    if (input.title && input.title !== post.title) {
      slug = await generateUniqueSlug(supabase, 'posts', input.title)
    }

    const updateData: Record<string, unknown> = {
      ...input,
      updated_at: new Date().toISOString(),
    }
    if (input.title) {
      updateData.slug = slug
    }

    // If publishing, record published_at timestamp
    if (input.status === 'published' && post.status !== 'published') {
      updateData.published_at = new Date().toISOString()
    }

    const { error: updateError } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', id)

    if (updateError) {
      console.error('Error updating post:', updateError)
      return { success: false, error: updateError.message }
    }

    revalidatePath('/blog')
    revalidatePath(`/blog/${slug}`)
    revalidatePath('/member/articles')
    revalidatePath('/admin/posts')

    return { success: true, slug }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'An unexpected error occurred.' }
  }
}

/**
 * Server Action for admin/committee moderation (Publish / Reject / Archive / Delete).
 */
export async function moderateArticleAction(
  id: string,
  action: 'publish' | 'reject' | 'archive' | 'delete',
  rejectReason?: string
) {
  const supabase = createClient()

  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'You must be signed in.' }
  }

  // 2. Enforce committee or admin role
  const role = await getUserRole(supabase)
  if (role !== 'committee' && role !== 'admin') {
    return { success: false, error: 'Unauthorized: Committee or admin access required.' }
  }

  try {
    // Fetch article details
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('title, status, slug')
      .eq('id', id)
      .single()

    if (fetchError || !post) {
      return { success: false, error: 'Article not found.' }
    }

    let nextStatus: 'draft' | 'pending_review' | 'published' | 'archived' = post.status
    let logAction = ''

    if (action === 'publish') {
      nextStatus = 'published'
      logAction = 'blog.publish'
    } else if (action === 'reject') {
      nextStatus = 'draft' // Reverts to draft so the author can edit and re-submit
      logAction = 'blog.reject'
    } else if (action === 'archive') {
      nextStatus = 'archived'
      logAction = 'blog.archive'
    }

    const adminSupabase = createAdminClient()

    if (action === 'delete') {
      const { error: deleteError } = await supabase
        .from('posts')
        .delete()
        .eq('id', id)

      if (deleteError) {
        return { success: false, error: deleteError.message }
      }
      logAction = 'blog.delete'
    } else {
      const updateData: Record<string, unknown> = {
        status: nextStatus,
        updated_at: new Date().toISOString(),
      }
      if (nextStatus === 'published' && post.status !== 'published') {
        updateData.published_at = new Date().toISOString()
      }

      const { error: updateError } = await supabase
        .from('posts')
        .update(updateData)
        .eq('id', id)

      if (updateError) {
        return { success: false, error: updateError.message }
      }
    }

    // Write audit log using the admin client (required due to insert RLS restrictions)
    const { error: logError } = await adminSupabase
      .from('audit_log')
      .insert({
        actor_id: user.id,
        action: logAction,
        target_id: id,
        metadata: {
          title: post.title,
          slug: post.slug,
          previous_status: post.status,
          ...(rejectReason ? { reject_reason: rejectReason } : {})
        }
      })

    if (logError) {
      console.error('Failed to write audit log:', logError)
    }

    revalidatePath('/blog')
    revalidatePath(`/blog/${post.slug}`)
    revalidatePath('/member/articles')
    revalidatePath('/admin/posts')
    revalidatePath('/admin/dashboard')

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'An unexpected error occurred.' }
  }
}
