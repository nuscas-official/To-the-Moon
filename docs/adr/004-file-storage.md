# ADR-004: Use Cloudflare R2 for File Storage (Not Supabase Storage)

**Date:** June 2026  
**Status:** Accepted

## Decision
We will use Cloudflare R2 as our object storage service for storing images (event cover banners, event photo galleries, and member artworks), rather than Supabase Storage or AWS S3. 

All upload files are validated, compressed, and resized server-side using the `sharp` library (converted to WebP, resized to a maximum of 2000px on the longest edge, and compressed to 80% quality) before being sent to R2. We also implement an offline local filesystem fallback (`public/uploads/...`) for developer environments when R2 credentials are set to placeholders.

## Reason
1. **Zero Egress Fees**: Cloudflare R2 does not charge for egress bandwidth. This guarantees that serving high-resolution member artworks or photo galleries to site visitors will never generate surprise bills if traffic spikes, which is a major risk with AWS S3.
2. **Quota limits**: Cloudflare R2's free tier offers 10GB of storage and unlimited egress. Supabase Storage's free tier has a lower total storage quota (1GB) and a strict 2GB/month bandwidth limit, which a photo-heavy art gallery would easily exceed.
3. **S3-Compatible API**: Using R2's S3-compatible client (`@aws-sdk/client-s3`) keeps our storage client implementation highly portable and standardized.
4. **Offline Dev Experience**: Storing files locally in `public/uploads` in mock mode lets developers test and run the full upload/delete pipeline offline without needing a Cloudflare account.

## Alternatives Considered
- **Supabase Storage**: Rejected due to strict 1GB storage and 2GB egress bandwidth limits on the free tier.
- **AWS S3**: Rejected due to high egress bandwidth pricing after the initial 1-year free tier.
- **Direct Client Uploads via Presigned URLs**: Rejected for this milestone to guarantee that server-side Sharp optimization is enforced, preventing users from uploading raw multi-megabyte files that would bloat storage.

## Consequences
- File uploads are routed through our Next.js API, meaning they are bound by Vercel's serverless function execution limits (10 seconds on Hobby tier). We mitigate this by enforcing a 10MB file size limit.
- The Cloudflare R2 public URL domain must be registered under Next.js `remotePatterns` inside `next.config.mjs` to enable Next.js `<Image>` component features.
