# ADR-004: Events Listing and Drag-and-Drop Photo Gallery Reordering

**Date:** June 2026  
**Status:** Accepted  

## Context

For the events module of the NUSCAS portal, we required:
1. Public listing of activities separated by chronological relevance (Upcoming vs Past).
2. A photo gallery associated with each event to archive activities.
3. An administrative interface for creating/editing events and managing the photo gallery.
4. The ability to reorder photos in the gallery to control their display order on the public event details page.

## Decision

1. **Chronological Sorting**: We query and display events in separate tabs to prioritize relevance:
   - **Upcoming**: Sorted ascending (`starts_at` closest to now first) where `status = 'upcoming'`.
   - **Past**: Sorted descending (most recent past events first) where `status = 'past'`.
2. **Workaround for File Uploads**: Since Cloudflare R2 file uploads are scheduled for Milestone 6, we implement `cover_image_key` and `storage_key` as text columns storing raw image URL strings (e.g. Unsplash images) as a temporary workaround. A `TODO` is added to track R2 migration.
3. **HTML5 Drag-and-Drop for Gallery Reordering**: We implement the photo gallery drag reordering using the native HTML5 Drag and Drop API on the client, rather than installing external drag-and-drop packages (such as `react-beautiful-dnd` or `@dnd-kit/core`). This avoids bloating the client bundle and allows clean, lightweight code.
4. **Optimistic Rendering**: During a drag-over event, the React state is updated to swap the cards instantly, providing smooth visual feedback. On drag-end, a single Server Action (`reorderEventPhotosAction`) is called to sequentially update the `display_order` column of each modified photo ID.

## Alternatives Considered

- **Third-Party Drag Libraries**: We considered installing libraries like `@dnd-kit` to handle drag events. However, native HTML5 drag handlers satisfy our requirements perfectly with minimal code and no extra package overhead.
- **Client-Side Sorting only**: We considered sorting all events client-side in a single query. But executing separate database queries utilizing PG-level sorting (`starts_at ASC` vs `starts_at DESC`) is more database-efficient and integrates cleanly with Next.js Server Components.

## Consequences

- No external npm packages are added for drag-and-drop capabilities.
- Managing photo lists and updating display orders is handled via Server Actions.
- Event images are stored as full URL strings; standard R2 key migration will occur in Milestone 6.
