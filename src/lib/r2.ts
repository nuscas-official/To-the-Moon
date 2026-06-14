import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID || ''
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || ''
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || ''
const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || ''
const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL || ''

// Mock mode helper
export const isR2Mock = !accountId || accountId.includes('placeholder')

export const s3Client = isR2Mock ? null : new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
})

/**
 * Uploads a file buffer to R2 or writes it to public/uploads/ local directory in mock mode.
 * Returns the browser-accessible URL.
 */
export async function uploadToR2(key: string, body: Buffer, contentType: string): Promise<string> {
  // Ensure we don't have leading slash for R2 storage path
  const cleanKey = key.startsWith('/') ? key.slice(1) : key

  if (isR2Mock) {
    const fs = await import('fs/promises')
    const path = await import('path')
    
    // Save locally inside public/uploads/...
    // We expect cleanKey to be like "uploads/events/uuid.webp"
    const filePath = path.join(process.cwd(), 'public', cleanKey)
    const dirPath = path.dirname(filePath)
    
    await fs.mkdir(dirPath, { recursive: true })
    await fs.writeFile(filePath, body)
    
    return `/${cleanKey}`
  }

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: cleanKey,
    Body: body,
    ContentType: contentType,
  })

  if (!s3Client) {
    throw new Error('S3 client not initialized')
  }

  await s3Client.send(command)
  return getPublicUrl(cleanKey)
}

/**
 * Deletes a file from R2 or deletes local mock file.
 */
export async function deleteFromR2(key: string): Promise<void> {
  if (!key) return

  // Extract key path if full URL is passed
  const cleanKey = extractKeyFromUrl(key)

  if (isR2Mock) {
    const fs = await import('fs/promises')
    const path = await import('path')
    const filePath = path.join(process.cwd(), 'public', cleanKey)
    
    try {
      await fs.unlink(filePath)
    } catch (err) {
      console.warn(`Mock delete: file not found or could not delete ${filePath}`, err)
    }
    return
  }

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: cleanKey,
  })

  if (!s3Client) {
    throw new Error('S3 client not initialized')
  }

  await s3Client.send(command)
}

/**
 * Returns the public CDN URL for a key.
 */
export function getPublicUrl(key: string): string {
  const cleanKey = key.startsWith('/') ? key.slice(1) : key

  if (isR2Mock) {
    return `/${cleanKey}`
  }

  const baseUrl = publicUrl.endsWith('/') ? publicUrl.slice(0, -1) : publicUrl
  return `${baseUrl}/${cleanKey}`
}

/**
 * Helper to extract key path from a full URL.
 * e.g., "https://pub-xxx.r2.dev/events/some-id.webp" -> "events/some-id.webp"
 * e.g., "/uploads/events/some-id.webp" -> "uploads/events/some-id.webp"
 */
function extractKeyFromUrl(url: string): string {
  try {
    if (url.startsWith('/')) {
      return url.slice(1)
    }
    const parsedUrl = new URL(url)
    // The path contains the key (excluding leading slash)
    return parsedUrl.pathname.slice(1)
  } catch {
    return url
  }
}
