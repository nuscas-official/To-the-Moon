import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/supabase/role'
import { uploadToR2 } from '@/lib/r2'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

/**
 * POST /api/uploads/upload
 * Authenticated API endpoint to upload and compress images.
 * Restricts access to committee and admin roles.
 */
export async function POST(request: Request) {
  const supabase = createClient()

  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 })
  }

  // 2. Verify role (committee or admin)
  const role = await getUserRole(supabase)
  if (role !== 'committee' && role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: Committee or Admin access required.' }, { status: 403 })
  }

  // 3. Verify user profile is active
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('is_active')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Internal Server Error: Account verification failed.' }, { status: 500 })
  }
  if (!profile.is_active) {
    return NextResponse.json({ error: 'Forbidden: Account is deactivated.' }, { status: 403 })
  }

  try {
    // 4. Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'uploads'

    if (!file) {
      return NextResponse.json({ error: 'Bad Request: No file provided.' }, { status: 400 })
    }

    // 5. Validate file type & size
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Bad Request: File type ${file.type} is not allowed. Only JPEG, PNG, WEBP, and GIF are supported.` },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Bad Request: File size exceeds the 10MB limit.' }, { status: 400 })
    }

    // 6. Process image with sharp (imported dynamically so a native-binary
    // load failure surfaces as a JSON 500 rather than crashing the module)
    const sharp = (await import('sharp')).default
    const fileBuffer = Buffer.from(await file.arrayBuffer())

    const processedBuffer = await sharp(fileBuffer)
      .resize({
        width: 2000,
        height: 2000,
        fit: 'inside', // preserves aspect ratio, ensures dimensions are <= 2000px
        withoutEnlargement: true, // don't upscale small images
      })
      .webp({ quality: 80 })
      .toBuffer()

    // 7. Upload to storage
    const crypto = await import('crypto')
    const fileUuid = crypto.randomUUID()
    const storageKey = `${folder}/${fileUuid}.webp`

    const publicUrl = await uploadToR2(storageKey, processedBuffer, 'image/webp')

    return NextResponse.json({
      key: storageKey,
      url: publicUrl,
    })
  } catch (err) {
    console.error('Error processing file upload:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'An unexpected error occurred during upload.' },
      { status: 500 }
    )
  }
}
