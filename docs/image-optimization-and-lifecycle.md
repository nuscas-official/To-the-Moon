# Image Optimization and Storage Lifecycle Documentation

This document outlines the architecture, pipeline, and clean-up mechanisms implemented for handling images in the NUSCAS website. 

To keep the platform performant, prevent bloated R2 cloud storage costs, and optimize mobile load times, the codebase uses a multi-tier image optimization pipeline.

---

## 1. Multi-Tier Image Optimization Pipeline

When a committee member or administrator uploads an image in the admin panel, the image undergoes both client-side and server-side optimization before it is saved to Cloudflare R2 storage.

```
[User Selects File] 
        │
        ▼
[Client-Side Canvas Compression] ──► Converts to WebP, resizes to <= 1600px
        │
        ▼
[API Route (/api/uploads/upload)]
        │
        ▼
[Server-Side Sharp Processing]  ──► Resizes to <= 2000px, sets WebP quality 80%
        │
        ▼
[Cloudflare R2 Bucket]          ──► Stored as CDN asset
```

### A. Client-Side Pre-Compression
* **Module**: `src/lib/image-client.ts`
* **Technology**: HTML5 Canvas API
* **Workflow**:
  1. Once a file is selected, the browser reads it using `FileReader` and loads it into an in-memory `HTMLImageElement`.
  2. If the image dimensions exceed $1600 \times 1600$ pixels, it is proportionally scaled down keeping its aspect ratio intact.
  3. The image is drawn onto an HTML5 `<canvas>` context.
  4. The canvas is exported via `canvas.toBlob()` as an `image/webp` file with `80%` quality.
* **Benefits**:
  * **Bandwidth Savings**: Prevents large, uncompressed camera files (e.g. $10\text{MB}$ JPEGs) from wasting server upload bandwidth.
  * **Responsive UI**: Pre-compressed uploads are significantly faster, providing a snappier admin experience.
  * **Fallback**: If the browser does not support canvas export or WebP conversion, the original file is passed through gracefully. GIFs are bypassed to preserve animation.

### B. Server-Side Polish & Formatting
* **Module**: `src/app/api/uploads/upload/route.ts`
* **Technology**: `sharp` Node.js library
* **Workflow**:
  1. Recovers the uploaded file buffer from multipart form data.
  2. Runs `sharp` to resize the image inside a bounding box of $2000 \times 2000$ pixels (using `fit: 'inside'`, without enlarging small files).
  3. Forces compression to WebP with an explicit `80%` quality metric.
  4. Saves to R2 storage with a random UUID name under the selected category folder (e.g. `gallery/`, `events/`, or `settings/`).
* **Benefits**:
  * **Standardization**: Ensures that all images in storage are uniformly WebP format, which has superior compression ratios.
  * **Resilience**: Protects storage from bad clients attempting to bypass client-side limits.

---

## 2. Storage Lifecycle & R2 Cleanups

To avoid orphaned images accumulating in R2 storage, automated cleanup logic is triggered whenever an image, event, or config is updated or removed. All deletion routines invoke the `deleteFromR2()` helper in `src/lib/r2.ts`.

### A. Automatic Cleanups Table
| Scenario | Trigger Area | Cleanup Target | Code Reference |
| :--- | :--- | :--- | :--- |
| **Gallery Takedown** | Art Gallery Curation | Removes the curated artwork asset from R2 | `src/server/actions/gallery.ts` |
| **Event Photo Removal** | Manage Event Photos | Deletes individual photo from event gallery | `src/server/actions/events.ts` |
| **Entire Event Deletion** | Admin Event List | Deletes event cover + all associated photos | `src/server/actions/events.ts` |
| **Event Cover Change** | Edit Event Form | Deletes the old cover image if replaced/cleared | `src/server/actions/events.ts` |
| **Seasonal Banner Change**| Admin Settings | Deletes the old seasonal pick banner image if replaced | `src/server/actions/settings.ts` |

### B. Cleanup Mechanics
* **Bypass on External URLs**: If a database record references an external image via URL (e.g., Unsplash or AniList), the system ignores it during R2 deletion, preventing illegal or failed requests to external domains.
* **Fail-Safe Execution**: Every S3 deletion is wrapped in a `try/catch` block. If storage is offline or credentials fail, database records are still modified and pages are updated normally, preventing storage outages from blocking site management.

---

## 3. Future Enhancements & Known Limitations

### A. Orphaned Uploads from Unsaved Forms
* **Issue**: In the current admin UI flow, files are uploaded to R2 immediately upon selection (`handleFileChange` in event cover image and seasonal banner forms) so that the user receives an instant visual preview. If the administrator closes the browser tab, navigates away, or loses connection *without* clicking "Save", the file remains in R2 storage but is never referenced by a database record (creating an "orphan").
* **Proposed Workarounds / Future Implementations**:
  1. **Upload-on-Submit**: Modify the forms to queue files in local component memory (e.g., as object URLs via `URL.createObjectURL(file)` for instant preview) and perform the R2 upload request *only* during the final form submit operation.
  2. **Periodic Garbage Collection Cron**: Implement a weekly GitHub Actions workflow or cron schedule that:
     * Lists all keys in the R2 bucket.
     * Queries the Supabase database to compile all active image references (e.g., `events.cover_image_key`, `event_photos.storage_key`, `gallery_artworks.storage_key`, and `site_config` values).
     * Compares the lists and purges any keys in R2 that are older than 24 hours and have no database references.
